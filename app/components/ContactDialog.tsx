"use client";

import * as Dialog from "@radix-ui/react-dialog";
import type { FormEvent, ReactNode } from "react";
import React from "react";
import { useCallback, useEffect, useRef, useState } from "react";

import { logError } from "@/lib/error-logging";
import { useTranslations } from "@/lib/i18n";
import { loadTurnstile } from "@/lib/turnstile";

import { ContactInfo } from "./ContactInfo";
import { Modal } from "./Modal";

declare global {
  interface Window {
    onTurnstileSuccess?: (token: string) => void;
    turnstile?: {
      render: (
        container: HTMLElement,
        options: {
          sitekey: string;
          callback: (token: string) => void;
          size?: "normal" | "flexible" | "compact" | string;
        },
      ) => void;
      reset: () => void;
    };
  }
}

interface ContactDialogProps {
  triggerLabel?: string;
  triggerClassName?: string;
  trigger?: ReactNode;
  children?: ReactNode;
}

/** Countdown duration in seconds after successful form submission. */
const COUNTDOWN_SECONDS = 10;

/**
 * Delay before transitioning from success state to countdown state.
 * This gives users time to read the success message before the countdown begins.
 */
const SUCCESS_TO_COUNTDOWN_DELAY_MS = 1000;

/** Form state machine: idle → submitting → success → countdown → closed */
type FormState = "idle" | "submitting" | "success" | "countdown";

export function ContactDialog({
  triggerLabel = "Contact me",
  triggerClassName,
  trigger,
  children,
}: ContactDialogProps) {
  const t = useTranslations();
  const [email, setEmail] = useState("");
  const [message, setMessage] = useState("");
  const [phone, setPhone] = useState("");
  const [turnstileToken, setTurnstileToken] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [emailError, setEmailError] = useState<string | null>(null);
  const [messageError, setMessageError] = useState<string | null>(null);
  const [isChallengeVisible, setIsChallengeVisible] = useState(false);
  const turnstileContainerRef = useRef<HTMLDivElement | null>(null);

  // Form field refs for Enter key navigation
  const emailInputRef = useRef<HTMLInputElement | null>(null);
  const phoneInputRef = useRef<HTMLInputElement | null>(null);
  const messageInputRef = useRef<HTMLTextAreaElement | null>(null);

  // Modal open state (controlled)
  const [isOpen, setIsOpen] = useState(false);

  // Form state machine
  const [formState, setFormState] = useState<FormState>("idle");

  // Countdown timer
  const [countdownSeconds, setCountdownSeconds] = useState(COUNTDOWN_SECONDS);

  // Derive success message from formState instead of maintaining separate state
  const successMessage =
    formState === "success" || formState === "countdown"
      ? t("contact.successMessage")
      : null;

  // Reset the form to its initial state
  const resetForm = useCallback(() => {
    setEmail("");
    setPhone("");
    setMessage("");
    setError(null);
    setEmailError(null);
    setMessageError(null);
    setFormState("idle");
    setCountdownSeconds(COUNTDOWN_SECONDS);
    // Reset Turnstile token, widget, and visibility state
    window.turnstile?.reset();
    setTurnstileToken(null);
    setIsChallengeVisible(false);
  }, []);

  // Handle modal open/close state changes
  const handleOpenChange = useCallback(
    (open: boolean) => {
      setIsOpen(open);
      // Only reset the form on open if previous state was "countdown" (after success)
      if (open && formState === "countdown") {
        resetForm();
      }
    },
    [resetForm, formState],
  );

  useEffect(() => {
    // In automated browser runs, skip rendering Turnstile and set a fake token.
    const isAutomatedBrowser =
      typeof window !== "undefined" &&
      ((window.navigator as Navigator & { webdriver?: boolean }).webdriver ===
        true ||
        (window as Window & { __PLAYWRIGHT__?: boolean }).__PLAYWRIGHT__ ===
          true ||
        /HeadlessChrome/.test(window.navigator.userAgent));

    if (isAutomatedBrowser) {
      setTurnstileToken("test-token");
      setIsChallengeVisible(false);
      return;
    }

    const siteKey = process.env.NEXT_PUBLIC_TURNSTILE_SITE_KEY;

    if (!siteKey) {
      // eslint-disable-next-line no-console
      console.error(
        "Turnstile site key is not configured. Set NEXT_PUBLIC_TURNSTILE_SITE_KEY.",
      );
      return;
    }

    // The Turnstile script is no longer loaded globally (see lib/turnstile.ts);
    // the polling below picks up window.turnstile once this resolves.
    loadTurnstile().catch((error: unknown) => {
      logError(error, { component: "ContactDialog", action: "loadTurnstile" });
    });

    const tryRenderTurnstile = () => {
      if (!turnstileContainerRef.current || !window.turnstile?.render) {
        return false;
      }

      window.turnstile.render(turnstileContainerRef.current, {
        sitekey: siteKey,
        callback: (token: string) => {
          setTurnstileToken(token);
          setIsChallengeVisible(true);
        },
        // Let Turnstile auto-size responsively to the container width
        size: "flexible",
      });

      return true;
    };

    if (tryRenderTurnstile()) {
      return;
    }

    const intervalId = window.setInterval(() => {
      if (tryRenderTurnstile()) {
        window.clearInterval(intervalId);
      }
    }, 200);

    return () => {
      window.clearInterval(intervalId);
    };
  }, []);

  // Countdown effect: when in countdown state, decrement every second
  useEffect(() => {
    if (formState !== "countdown") {
      return;
    }

    if (countdownSeconds <= 0) {
      // Auto-close the modal when countdown reaches zero
      // Use handleOpenChange to ensure proper state cleanup
      handleOpenChange(false);
      return;
    }

    const timerId = window.setTimeout(() => {
      setCountdownSeconds((prev) => prev - 1);
    }, 1000);

    return () => {
      window.clearTimeout(timerId);
    };
  }, [formState, countdownSeconds, handleOpenChange]);

  // Transition from success to countdown state
  useEffect(() => {
    if (formState === "success") {
      // Minimal delay to ensure success message renders before state transition
      const timerId = window.setTimeout(() => {
        setFormState("countdown");
      }, SUCCESS_TO_COUNTDOWN_DELAY_MS);

      return () => {
        window.clearTimeout(timerId);
      };
    }
  }, [formState]);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError(null);
    setEmailError(null);
    setMessageError(null);

    const trimmedEmail = email.trim();
    const trimmedMessage = message.trim();
    const trimmedPhone = phone.trim();

    // Check for empty required fields
    const hasEmptyEmail = !trimmedEmail;
    const hasEmptyMessage = !trimmedMessage;
    // Check HTML5 email format validation
    const hasInvalidEmail =
      trimmedEmail && !(emailInputRef.current?.validity.valid ?? false);

    if (hasEmptyEmail || hasEmptyMessage || hasInvalidEmail) {
      if (hasEmptyEmail) {
        setEmailError(t("contact.emailRequired"));
      } else if (hasInvalidEmail) {
        setEmailError(t("contact.emailInvalid"));
      }
      if (hasEmptyMessage) {
        setMessageError(t("contact.messageRequired"));
      }
      setError(t("contact.formError"));
      return;
    }

    if (!turnstileToken) {
      setError(t("contact.verificationRequired"));
      return;
    }

    const formData = new FormData(event.currentTarget);
    const honeypot = (formData.get("website") ?? "").toString().trim();

    setFormState("submitting");
    try {
      const response = await fetch("/api/contact", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          email: trimmedEmail,
          phone: trimmedPhone || undefined,
          message: trimmedMessage,
          turnstileToken,
          honeypot: honeypot || undefined,
        }),
      });

      if (!response.ok) {
        const data = (await response.json().catch(() => null)) as {
          error?: string;
        } | null;
        const message = data?.error || t("contact.submitError");
        throw new Error(message);
      }

      // Success: reset form fields and transition to success state
      // Success message is derived from formState
      setEmail("");
      setPhone("");
      setMessage("");
      setEmailError(null);
      setMessageError(null);
      setFormState("success");
    } catch (err) {
      // Reset Turnstile so the user can try again after an error.
      window.turnstile?.reset();
      setTurnstileToken(null);
      const message =
        err instanceof Error ? err.message : t("contact.submitError");
      setError(message);
      // On error, keep form in idle state so user can retry
      setFormState("idle");
    }
  }

  // Determine if form inputs should be disabled (during submit or after success)
  const isFormDisabled =
    formState === "submitting" ||
    formState === "success" ||
    formState === "countdown";

  // Determine if the submit button should be disabled
  const isSubmitDisabled = isFormDisabled || !turnstileToken;

  // Handle Enter key navigation between fields
  const handleKeyDown = (
    event: React.KeyboardEvent<HTMLInputElement | HTMLTextAreaElement>,
    currentField: "email" | "phone" | "message",
  ) => {
    if (event.key === "Enter" && !event.shiftKey) {
      event.preventDefault();

      // Navigate to next field based on current field
      if (currentField === "email" && phoneInputRef.current) {
        phoneInputRef.current.focus();
      } else if (currentField === "phone" && messageInputRef.current) {
        messageInputRef.current.focus();
      } else if (currentField === "message") {
        // From message field, check if form is valid before submitting
        const trimmedEmail = email.trim();
        const trimmedMessage = message.trim();
        // Check HTML5 email validation in addition to non-empty checks
        const isEmailValid = emailInputRef.current?.validity.valid ?? false;
        const isFormValid =
          trimmedEmail && trimmedMessage && isEmailValid && turnstileToken;

        if (isFormValid && !isFormDisabled) {
          // Trigger form submission
          const form = event.currentTarget.closest("form");
          if (form) {
            form.requestSubmit();
          }
        }
      }
    }
  };

  const triggerNode = trigger ?? (
    <button
      type="button"
      className={
        triggerClassName ??
        "btn-outline px-3.5 py-1.5 text-xs font-medium bg-[color:var(--bg-surface)]/90 shadow-black/5 hover:border-[color:var(--accent)]/50 hover:text-[color:var(--link-hover)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[color:var(--accent)] focus-visible:ring-offset-2 focus-visible:ring-offset-slate-950"
      }
    >
      {triggerLabel}
    </button>
  );

  return (
    <Modal
      trigger={triggerNode}
      size="md"
      analyticsEventName="contact_open"
      analyticsMetadata={{ component: "ContactDialog" }}
      open={isOpen}
      onOpenChange={handleOpenChange}
      testId="contact-dialog"
    >
      <Dialog.Title className="flex items-center gap-2 text-base font-semibold tracking-tight text-[color:var(--text-primary)]">
        {t("contact.title")}
      </Dialog.Title>
      <Dialog.Description className="mt-1 text-sm text-[color:var(--text-muted)]">
        {t("contact.description")}
      </Dialog.Description>
      <form
        className="mt-4 space-y-3 text-sm"
        onSubmit={handleSubmit}
        noValidate
        aria-describedby="contact-status"
      >
        <label className="flex flex-col gap-1.5">
          <span className="text-[color:var(--text-primary)]">
            {t("contact.emailLabel")}
          </span>
          <input
            ref={emailInputRef}
            type="email"
            name="email"
            className="rounded-md border border-[color:var(--border-subtle)] bg-[color:var(--bg-app)] px-3 py-2 text-sm text-[color:var(--text-primary)] shadow-sm transition focus-visible:border-[color:var(--accent)]/80 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[color:var(--accent)]/60 disabled:cursor-not-allowed disabled:opacity-60"
            placeholder={t("contact.emailPlaceholder")}
            value={email}
            onChange={(event) => setEmail(event.target.value)}
            onKeyDown={(event) => handleKeyDown(event, "email")}
            required
            disabled={isFormDisabled}
            aria-required="true"
            aria-invalid={emailError ? "true" : "false"}
            aria-describedby={
              emailError
                ? "contact-email-error contact-status"
                : "contact-status"
            }
          />
          {emailError ? (
            <p id="contact-email-error" className="text-[11px] text-red-400">
              {emailError}
            </p>
          ) : null}
        </label>
        <label className="flex flex-col gap-1.5">
          <span className="text-[color:var(--text-primary)]">
            {t("contact.phoneLabel")}
          </span>
          <input
            ref={phoneInputRef}
            type="tel"
            name="phone"
            className="rounded-md border border-[color:var(--border-subtle)] bg-[color:var(--bg-app)] px-3 py-2 text-sm text-[color:var(--text-primary)] shadow-sm transition focus-visible:border-[color:var(--accent)]/80 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[color:var(--accent)]/60 disabled:cursor-not-allowed disabled:opacity-60"
            placeholder={t("contact.phonePlaceholder")}
            value={phone}
            onChange={(event) => setPhone(event.target.value)}
            onKeyDown={(event) => handleKeyDown(event, "phone")}
            disabled={isFormDisabled}
          />
        </label>
        <label className="flex flex-col gap-1.5">
          <span className="text-[color:var(--text-primary)]">
            {t("contact.messageLabel")}
          </span>
          <textarea
            ref={messageInputRef}
            name="message"
            className="min-h-[96px] rounded-md border border-[color:var(--border-subtle)] bg-[color:var(--bg-app)] px-3 py-2 text-sm text-[color:var(--text-primary)] shadow-sm transition focus-visible:border-[color:var(--accent)]/80 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[color:var(--accent)]/60 disabled:cursor-not-allowed disabled:opacity-60"
            placeholder={t("contact.messagePlaceholder")}
            value={message}
            onChange={(event) => setMessage(event.target.value)}
            onKeyDown={(event) => handleKeyDown(event, "message")}
            required
            disabled={isFormDisabled}
            aria-required="true"
            aria-invalid={messageError ? "true" : "false"}
            aria-describedby={
              messageError
                ? "contact-message-error contact-status"
                : "contact-status"
            }
          />
          {messageError ? (
            <p id="contact-message-error" className="text-[11px] text-red-400">
              {messageError}
            </p>
          ) : null}
        </label>
        {/* Honeypot field: hidden from users, traps bots */}
        <input
          type="text"
          name="website"
          className="hidden"
          tabIndex={-1}
          autoComplete="off"
          aria-hidden="true"
        />
        <div
          className="pt-1"
          aria-describedby={
            isChallengeVisible
              ? "contact-verification-help contact-status"
              : "contact-status"
          }
        >
          <div
            ref={turnstileContainerRef}
            className="cf-turnstile min-h-[49px] sm:min-h-[70px]"
          />
        </div>
        {isChallengeVisible ? (
          <p
            id="contact-verification-help"
            className="mt-1 text-sm text-[color:var(--text-muted)]"
          >
            {t("contact.verificationHelp")}
          </p>
        ) : null}

        {/* Status messages with aria-live for accessibility */}
        <div
          id="contact-status"
          role="status"
          aria-live="polite"
          aria-atomic="true"
          className="text-[11px]"
        >
          {error ? <span className="text-red-400">{error}</span> : null}
          {!error && successMessage ? (
            <span className="text-emerald-400">{successMessage}</span>
          ) : null}
        </div>

        {/* Countdown message shown after successful submission */}
        {formState === "countdown" ? (
          <div
            role="status"
            aria-live="polite"
            aria-atomic="true"
            className="rounded-md bg-emerald-500/10 px-3 py-2 text-center text-sm text-emerald-400"
          >
            {t("contact.countdownMessage", {
              seconds: countdownSeconds,
              secondsLabel:
                countdownSeconds === 1
                  ? t("contact.secondSingular")
                  : t("contact.secondPlural"),
            })}
          </div>
        ) : null}

        {children}

        <ContactInfo variant="dialog" />

        <div className="mt-4 flex justify-end gap-2 border-t border-[color:var(--border-subtle)] pt-3 text-sm">
          <Dialog.Close
            className="btn-outline px-4 py-1.5 bg-[color:var(--bg-app)]/60 text-[color:var(--text-primary)] disabled:cursor-not-allowed disabled:opacity-60"
            disabled={formState === "submitting"}
          >
            {t("contact.closeButton")}
          </Dialog.Close>
          <button
            type="submit"
            className="btn-primary px-4 py-1.5 font-semibold disabled:cursor-not-allowed disabled:opacity-60"
            disabled={isSubmitDisabled}
          >
            {formState === "submitting"
              ? t("contact.sendingButton")
              : t("contact.sendButton")}
          </button>
        </div>
      </form>
    </Modal>
  );
}
