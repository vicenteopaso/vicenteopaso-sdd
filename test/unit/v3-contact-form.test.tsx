import { act, fireEvent, render, screen } from "@testing-library/react";
import type { Mock } from "vitest";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

const { loadTurnstile, logError } = vi.hoisted(() => ({
  loadTurnstile: vi.fn<() => Promise<void>>(),
  logError: vi.fn(),
}));

vi.mock("next/navigation", () => ({
  useParams: () => ({ lang: "en" }),
}));
vi.mock("../../lib/turnstile", () => ({ loadTurnstile }));
vi.mock("../../lib/error-logging", () => ({ logError }));

import { V3ContactForm } from "../../app/components/V3ContactForm";

const SITE_KEY = "1x00000000000000000000AA";

function nameInput() {
  return screen.getByRole("textbox", { name: /name/i });
}

describe("V3ContactForm Turnstile loading", () => {
  const originalSiteKey = process.env.NEXT_PUBLIC_TURNSTILE_SITE_KEY;
  let renderWidget: Mock<NonNullable<Window["turnstile"]>["render"]>;

  beforeEach(() => {
    process.env.NEXT_PUBLIC_TURNSTILE_SITE_KEY = SITE_KEY;
    renderWidget = vi.fn();
    loadTurnstile.mockReset();
    loadTurnstile.mockImplementation(async () => {
      window.turnstile = { render: renderWidget, reset: vi.fn() };
    });
    logError.mockReset();
  });

  afterEach(() => {
    process.env.NEXT_PUBLIC_TURNSTILE_SITE_KEY = originalSiteKey;
    delete window.turnstile;
  });

  it("does not load Turnstile until the form is interacted with", () => {
    render(<V3ContactForm />);

    expect(loadTurnstile).not.toHaveBeenCalled();
  });

  it("loads and renders Turnstile on first focus, then enables submit once solved", async () => {
    render(<V3ContactForm />);
    const submit = screen.getByRole("button", { name: /send/i });
    expect(submit).toBeDisabled();

    await act(async () => {
      fireEvent.focus(nameInput());
    });

    expect(loadTurnstile).toHaveBeenCalledTimes(1);
    expect(renderWidget).toHaveBeenCalledWith(
      expect.any(HTMLElement),
      expect.objectContaining({ sitekey: SITE_KEY, size: "flexible" }),
    );

    const options = renderWidget.mock.calls[0]?.[1];
    act(() => options?.callback("token-123"));
    expect(submit).toBeEnabled();

    // Further focus events don't load or render it again.
    await act(async () => {
      fireEvent.focus(screen.getByRole("textbox", { name: /subject/i }));
    });
    expect(loadTurnstile).toHaveBeenCalledTimes(1);
    expect(renderWidget).toHaveBeenCalledTimes(1);
  });

  it("skips Turnstile entirely when no site key is configured", async () => {
    delete process.env.NEXT_PUBLIC_TURNSTILE_SITE_KEY;
    render(<V3ContactForm />);

    await act(async () => {
      fireEvent.focus(nameInput());
    });
    expect(loadTurnstile).not.toHaveBeenCalled();
  });

  it("logs a failed load and retries on the next focus", async () => {
    const failure = new Error("offline");
    loadTurnstile.mockRejectedValueOnce(failure);
    render(<V3ContactForm />);

    await act(async () => {
      fireEvent.focus(nameInput());
    });
    expect(logError).toHaveBeenCalledWith(failure, {
      component: "V3ContactForm",
      action: "loadTurnstile",
    });

    await act(async () => {
      fireEvent.focus(nameInput());
    });
    expect(loadTurnstile).toHaveBeenCalledTimes(2);
    expect(renderWidget).toHaveBeenCalledTimes(1);
  });
});

describe("V3ContactForm submission", () => {
  const originalSiteKey = process.env.NEXT_PUBLIC_TURNSTILE_SITE_KEY;
  const originalFetch = globalThis.fetch;
  let fetchMock: Mock<typeof fetch>;
  let resetWidget: Mock<() => void>;

  beforeEach(() => {
    process.env.NEXT_PUBLIC_TURNSTILE_SITE_KEY = SITE_KEY;
    resetWidget = vi.fn();
    loadTurnstile.mockReset();
    loadTurnstile.mockImplementation(async () => {
      window.turnstile = {
        render: (_container, options) => options.callback("token-abc"),
        reset: resetWidget,
      };
    });
    fetchMock = vi.fn<typeof fetch>();
    globalThis.fetch = fetchMock;
  });

  afterEach(() => {
    process.env.NEXT_PUBLIC_TURNSTILE_SITE_KEY = originalSiteKey;
    globalThis.fetch = originalFetch;
    delete window.turnstile;
  });

  async function renderVerifiedForm() {
    const view = render(<V3ContactForm />);
    await act(async () => {
      fireEvent.focus(nameInput());
    });
    return view;
  }

  function fill(label: RegExp, value: string) {
    fireEvent.change(screen.getByRole("textbox", { name: label }), {
      target: { value },
    });
  }

  async function submit() {
    await act(async () => {
      fireEvent.submit(screen.getByRole("button", { name: /send/i }));
    });
  }

  it("asks for verification when submitted before Turnstile is solved", async () => {
    render(<V3ContactForm />);
    fill(/email/i, "ada@example.com");
    fill(/message/i, "Hello there");

    await submit();
    expect(screen.getByRole("status")).toHaveTextContent(
      "Please complete the verification.",
    );
    expect(fetchMock).not.toHaveBeenCalled();
  });

  it("flags a missing email and message without sending", async () => {
    await renderVerifiedForm();

    await submit();
    expect(screen.getByText(/Email is required\./)).toBeInTheDocument();
    expect(screen.getByRole("alert")).toHaveTextContent("Message is required.");
    expect(screen.getByRole("status")).toHaveTextContent(
      "Please fix the errors above.",
    );
    expect(fetchMock).not.toHaveBeenCalled();
  });

  it("flags an invalid email and an over-long message", async () => {
    await renderVerifiedForm();
    fill(/email/i, "not-an-email");
    fill(/message/i, "x".repeat(2001));

    await submit();
    expect(
      screen.getByText(/Please enter a valid email\./),
    ).toBeInTheDocument();
    expect(screen.getByRole("alert")).toHaveTextContent(
      "Message is too long (max 2000 characters).",
    );
    expect(fetchMock).not.toHaveBeenCalled();
  });

  it("sends the message and shows the success state, which can be reset", async () => {
    fetchMock.mockResolvedValue(new Response("{}", { status: 200 }));
    await renderVerifiedForm();
    fill(/name/i, "Ada");
    fill(/email/i, " ada@example.com ");
    fill(/subject/i, "Hi");
    fill(/message/i, "Hello there");

    await submit();
    expect(fetchMock).toHaveBeenCalledWith(
      "/api/contact",
      expect.objectContaining({ method: "POST" }),
    );
    const body = JSON.parse(String(fetchMock.mock.calls[0]?.[1]?.body)) as {
      email: string;
      message: string;
      turnstileToken: string;
    };
    expect(body).toMatchObject({
      email: "ada@example.com",
      message: "NAME: Ada\n\nSUBJECT: Hi\n\nHello there",
      turnstileToken: "token-abc",
    });
    expect(screen.getByText("✓ MESSAGE SENT")).toBeInTheDocument();

    fireEvent.click(screen.getByRole("button", { name: "SEND ANOTHER" }));
    expect(nameInput()).toHaveValue("");
    expect(resetWidget).toHaveBeenCalled();
  });

  it("shows the server's error and resets verification when sending fails", async () => {
    fetchMock.mockResolvedValue(
      new Response(JSON.stringify({ error: "Rate limited" }), { status: 429 }),
    );
    await renderVerifiedForm();
    fill(/email/i, "ada@example.com");
    fill(/message/i, "Hello there");

    await submit();
    expect(screen.getByRole("status")).toHaveTextContent("Rate limited");
    expect(resetWidget).toHaveBeenCalled();
    expect(screen.getByRole("button", { name: /send/i })).toBeDisabled();
  });

  it("falls back to a generic error when the failure has no usable body", async () => {
    fetchMock.mockResolvedValue(new Response("not json", { status: 500 }));
    await renderVerifiedForm();
    fill(/email/i, "ada@example.com");
    fill(/message/i, "Hello there");

    await submit();
    expect(screen.getByRole("status")).toHaveTextContent(
      "Something went wrong. Please try again.",
    );
  });

  it("uses the generic error when fetch rejects with a non-Error", async () => {
    fetchMock.mockRejectedValue("offline");
    await renderVerifiedForm();
    fill(/email/i, "ada@example.com");
    fill(/message/i, "Hello there");

    await submit();
    expect(screen.getByRole("status")).toHaveTextContent(
      "Something went wrong. Please try again.",
    );
  });
});
