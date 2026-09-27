"use client";

import clsx from "clsx";
import { useCallback, useEffect, useRef, useState } from "react";

import { useTranslations } from "@/lib/i18n";

declare global {
  interface Window {
    turnstile?: {
      render: (
        container: HTMLElement,
        options: {
          sitekey: string;
          callback: (token: string) => void;
          size?: string;
        },
      ) => void;
      reset: () => void;
    };
  }
}

type FormState = "idle" | "submitting" | "success" | "error";

export function V3ContactForm() {
  const t = useTranslations();
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [subject, setSubject] = useState("");
  const [message, setMessage] = useState("");
  const [honeypot, setHoneypot] = useState("");
  const [turnstileToken, setTurnstileToken] = useState<string | null>(null);
  const [formState, setFormState] = useState<FormState>("idle");
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [emailError, setEmailError] = useState<string | null>(null);
  const [msgError, setMsgError] = useState<string | null>(null);
  const turnstileRef = useRef<HTMLDivElement>(null);
  const emailRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    const siteKey = process.env.NEXT_PUBLIC_TURNSTILE_SITE_KEY;
    if (!siteKey || !turnstileRef.current) return;

    const tryRender = () => {
      if (!turnstileRef.current || !window.turnstile?.render) return false;
      window.turnstile.render(turnstileRef.current, {
        sitekey: siteKey,
        callback: (token) => setTurnstileToken(token),
        size: "flexible",
      });
      return true;
    };

    if (tryRender()) return;
    const id = window.setInterval(() => {
      if (tryRender()) window.clearInterval(id);
    }, 200);
    return () => window.clearInterval(id);
  }, []);

  const reset = useCallback(() => {
    setName("");
    setEmail("");
    setSubject("");
    setMessage("");
    setErrorMsg(null);
    setEmailError(null);
    setMsgError(null);
    setFormState("idle");
    window.turnstile?.reset();
    setTurnstileToken(null);
  }, []);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setErrorMsg(null);
    setEmailError(null);
    setMsgError(null);

    const trimEmail = email.trim();
    const trimMsg = message.trim();
    let valid = true;

    if (!trimEmail) {
      setEmailError(t("form.emailRequired"));
      valid = false;
    } else if (!emailRef.current?.validity.valid) {
      setEmailError(t("form.emailInvalid"));
      valid = false;
    }
    if (!trimMsg || trimMsg.length < 5) {
      setMsgError(t("form.messageRequired"));
      valid = false;
    } else if (trimMsg.length > 2000) {
      setMsgError(t("form.messageTooLong"));
      valid = false;
    }
    if (!valid) {
      setErrorMsg(t("form.errorsAbove"));
      return;
    }
    if (!turnstileToken) {
      setErrorMsg(t("form.verificationRequired"));
      return;
    }

    setFormState("submitting");
    try {
      const res = await fetch("/api/contact", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          email: trimEmail,
          message: [
            name.trim() && `${t("form.name")}: ${name.trim()}`,
            subject.trim() && `${t("form.subject")}: ${subject.trim()}`,
            trimMsg,
          ]
            .filter(Boolean)
            .join("\n\n"),
          honeypot,
          turnstileToken,
        }),
      });

      if (!res.ok) {
        const data = (await res.json().catch(() => null)) as {
          error?: string;
        } | null;
        throw new Error(data?.error ?? t("contact.submitError"));
      }

      setFormState("success");
    } catch (err) {
      window.turnstile?.reset();
      setTurnstileToken(null);
      setErrorMsg(
        err instanceof Error ? err.message : t("contact.submitError"),
      );
      setFormState("error");
    }
  }

  const disabled = formState === "submitting" || formState === "success";
  const submitDisabled = disabled || !turnstileToken;

  if (formState === "success") {
    return (
      <div className="v3-form-success">
        <div className="v3-form-success-label">{t("form.successLabel")}</div>
        <div className="v3-form-success-msg">{t("form.successMessage")}</div>
        <button onClick={reset} className="v3-form-reset">
          {t("form.sendAnother")}
        </button>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} noValidate className="v3-form">
      {/* Honeypot — hidden from users, filled only by bots */}
      <input
        type="text"
        name="website"
        value={honeypot}
        onChange={(e) => setHoneypot(e.target.value)}
        tabIndex={-1}
        autoComplete="off"
        className="v3-form-honeypot"
        aria-hidden="true"
      />
      {/* NAME */}
      <label className="v3-form-row">
        <span className="v3-form-key">{t("form.name")}</span>
        <input
          name="name"
          value={name}
          onChange={(e) => setName(e.target.value)}
          disabled={disabled}
          className="v3-form-input"
          autoComplete="name"
        />
      </label>

      {/* EMAIL */}
      <label className={clsx("v3-form-row", emailError && "has-error")}>
        <span className={clsx("v3-form-key", emailError && "has-error")}>
          {t("form.email")} {emailError ? `— ${emailError}` : "*"}
        </span>
        <input
          ref={emailRef}
          type="email"
          name="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          disabled={disabled}
          required
          className={clsx("v3-form-input", emailError && "has-error")}
          autoComplete="email"
        />
      </label>

      {/* SUBJECT */}
      <label className="v3-form-row">
        <span className="v3-form-key">{t("form.subject")}</span>
        <input
          name="subject"
          value={subject}
          onChange={(e) => setSubject(e.target.value)}
          disabled={disabled}
          className="v3-form-input"
        />
      </label>

      {/* MESSAGE */}
      <label
        className={clsx(
          "v3-form-row",
          "v3-form-row-start",
          msgError && "has-error",
        )}
      >
        <span
          className={clsx(
            "v3-form-key",
            "v3-form-key-multiline",
            msgError && "has-error",
          )}
        >
          {t("form.message")} {msgError ? `— ${msgError}` : "*"}
        </span>
        <textarea
          id="v3-contact-message"
          name="message"
          value={message}
          onChange={(e) => setMessage(e.target.value)}
          disabled={disabled}
          required
          aria-required="true"
          aria-invalid={!!msgError}
          aria-describedby={msgError ? "v3-contact-message-error" : undefined}
          rows={5}
          className="v3-form-input v3-form-textarea"
        />
        {msgError && (
          <span id="v3-contact-message-error" role="alert" className="sr-only">
            {msgError}
          </span>
        )}
      </label>

      {/* Turnstile */}
      <div className="v3-form-turnstile-row">
        <div ref={turnstileRef} className="v3-form-turnstile" />
      </div>

      {/* Footer: error + submit */}
      <div className="v3-form-footer">
        <span
          role="status"
          aria-live="polite"
          className={clsx("v3-form-status", errorMsg && "has-error")}
        >
          {errorMsg ?? t("form.footer")}
        </span>
        <button
          type="submit"
          disabled={submitDisabled}
          className="v3-form-submit"
        >
          {formState === "submitting" ? t("form.sending") : t("form.send")}
        </button>
      </div>
    </form>
  );
}
