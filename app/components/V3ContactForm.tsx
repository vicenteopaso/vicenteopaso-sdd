"use client";

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

const mono: React.CSSProperties = { fontFamily: "var(--f-mono)" };

type FormState = "idle" | "submitting" | "success" | "error";

const inputStyle: React.CSSProperties = {
  background: "transparent",
  border: "none",
  borderLeft: "1px solid var(--v3-rule)",
  padding: 14,
  fontSize: 14,
  fontFamily: "inherit",
  color: "var(--v3-fg)",
  outline: "none",
  width: "100%",
  boxSizing: "border-box" as const,
};

const labelRowStyle: React.CSSProperties = {
  display: "grid",
  gridTemplateColumns: "110px 1fr",
  borderBottom: "1px solid var(--v3-rule)",
  alignItems: "center",
};

const labelKeyStyle: React.CSSProperties = {
  ...mono,
  paddingLeft: 16,
  fontSize: 10,
  color: "var(--v3-muted)",
  letterSpacing: "0.14em",
};

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

  if (formState === "success") {
    return (
      <div
        style={{
          border: "1px solid var(--v3-rule)",
          display: "flex",
          flexDirection: "column" as const,
          alignItems: "center",
          justifyContent: "center",
          gap: 16,
          padding: "48px 32px",
          textAlign: "center" as const,
        }}
      >
        <div
          style={{
            ...mono,
            fontSize: 11,
            color: "var(--v3-accent-text)",
            letterSpacing: "0.18em",
          }}
        >
          {t("form.successLabel")}
        </div>
        <div
          style={{ fontSize: 22, fontWeight: 700, letterSpacing: "-0.01em" }}
        >
          {t("form.successMessage")}
        </div>
        <button
          onClick={reset}
          style={{
            ...mono,
            fontSize: 10,
            color: "var(--v3-muted)",
            background: "none",
            border: "1px solid var(--v3-rule)",
            padding: "8px 16px",
            cursor: "pointer",
            letterSpacing: "0.1em",
          }}
        >
          {t("form.sendAnother")}
        </button>
      </div>
    );
  }

  return (
    <form
      onSubmit={handleSubmit}
      noValidate
      style={{ display: "grid", gap: 0, border: "1px solid var(--v3-rule)" }}
    >
      {/* Honeypot — hidden from users, filled only by bots */}
      <input
        type="text"
        name="website"
        value={honeypot}
        onChange={(e) => setHoneypot(e.target.value)}
        tabIndex={-1}
        autoComplete="off"
        style={{ display: "none" }}
        aria-hidden="true"
      />
      {/* NAME */}
      <label style={labelRowStyle}>
        <span style={labelKeyStyle}>{t("form.name")}</span>
        <input
          name="name"
          value={name}
          onChange={(e) => setName(e.target.value)}
          disabled={disabled}
          style={inputStyle}
          autoComplete="name"
        />
      </label>

      {/* EMAIL */}
      <label
        style={{
          ...labelRowStyle,
          ...(emailError ? { borderColor: "var(--v3-accent)" } : {}),
        }}
      >
        <span
          style={{
            ...labelKeyStyle,
            ...(emailError ? { color: "var(--v3-accent-text)" } : {}),
          }}
        >
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
          style={{
            ...inputStyle,
            ...(emailError ? { color: "var(--v3-accent-text)" } : {}),
          }}
          autoComplete="email"
        />
      </label>

      {/* SUBJECT */}
      <label style={labelRowStyle}>
        <span style={labelKeyStyle}>{t("form.subject")}</span>
        <input
          name="subject"
          value={subject}
          onChange={(e) => setSubject(e.target.value)}
          disabled={disabled}
          style={inputStyle}
        />
      </label>

      {/* MESSAGE */}
      <label
        style={{
          ...labelRowStyle,
          alignItems: "start",
          ...(msgError ? { borderColor: "var(--v3-accent)" } : {}),
        }}
      >
        <span
          style={{
            ...labelKeyStyle,
            paddingTop: 14,
            paddingBottom: 14,
            ...(msgError ? { color: "var(--v3-accent-text)" } : {}),
          }}
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
          style={{
            ...inputStyle,
            borderLeft: "1px solid var(--v3-rule)",
            resize: "none",
            paddingTop: 14,
          }}
        />
        {msgError && (
          <span id="v3-contact-message-error" role="alert" className="sr-only">
            {msgError}
          </span>
        )}
      </label>

      {/* Turnstile */}
      <div
        style={{
          borderBottom: "1px solid var(--v3-rule)",
          padding: "12px 16px",
        }}
      >
        <div ref={turnstileRef} style={{ minHeight: 65 }} />
      </div>

      {/* Footer: error + submit */}
      <div
        style={{
          padding: "12px 16px",
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          gap: 12,
        }}
      >
        <span
          role="status"
          aria-live="polite"
          style={{
            ...mono,
            fontSize: 10,
            color: errorMsg ? "var(--v3-accent-text)" : "var(--v3-muted)",
            letterSpacing: "0.1em",
            flex: 1,
          }}
        >
          {errorMsg ?? t("form.footer")}
        </span>
        <button
          type="submit"
          disabled={disabled || !turnstileToken}
          style={{
            background:
              disabled || !turnstileToken
                ? "var(--v3-muted)"
                : "var(--v3-accent)",
            color: "var(--v3-bg)",
            border: "none",
            padding: "10px 18px",
            fontSize: 12,
            fontWeight: 600,
            fontFamily: "var(--f-mono)",
            letterSpacing: "0.08em",
            cursor: disabled || !turnstileToken ? "not-allowed" : "pointer",
            transition: "background 0.15s ease",
            whiteSpace: "nowrap" as const,
          }}
        >
          {formState === "submitting" ? t("form.sending") : t("form.send")}
        </button>
      </div>
    </form>
  );
}
