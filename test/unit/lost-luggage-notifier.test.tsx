import { render } from "@testing-library/react";
import { afterEach, describe, expect, it, vi } from "vitest";

import { LostLuggageNotifier } from "../../app/components/LostLuggageNotifier";

afterEach(() => {
  vi.restoreAllMocks();
});

describe("LostLuggageNotifier", () => {
  it("fires a beacon to the notify endpoint on mount with locale and referrer", async () => {
    const fetchMock = vi.fn().mockResolvedValue({ ok: true } as Response);
    global.fetch = fetchMock as unknown as typeof fetch;
    Object.defineProperty(document, "referrer", {
      value: "https://example.com/qr",
      configurable: true,
    });

    render(<LostLuggageNotifier locale="es" />);

    await vi.waitFor(() => expect(fetchMock).toHaveBeenCalledTimes(1));

    const [url, init] = fetchMock.mock.calls[0];
    expect(url).toBe("/api/lost-luggage-notify");
    expect(init).toMatchObject({ method: "POST", keepalive: true });
    const body = JSON.parse((init as { body: string }).body);
    expect(body).toEqual({
      locale: "es",
      referrer: "https://example.com/qr",
    });
  });

  it("omits referrer when none is present", async () => {
    const fetchMock = vi.fn().mockResolvedValue({ ok: true } as Response);
    global.fetch = fetchMock as unknown as typeof fetch;
    Object.defineProperty(document, "referrer", {
      value: "",
      configurable: true,
    });

    render(<LostLuggageNotifier locale="en" />);

    await vi.waitFor(() => expect(fetchMock).toHaveBeenCalledTimes(1));

    const [, init] = fetchMock.mock.calls[0];
    const body = JSON.parse((init as { body: string }).body);
    expect(body.referrer).toBeUndefined();
  });

  it("swallows a failed notify without throwing", async () => {
    const fetchMock = vi.fn().mockRejectedValue(new Error("network down"));
    global.fetch = fetchMock as unknown as typeof fetch;

    expect(() => render(<LostLuggageNotifier locale="en" />)).not.toThrow();
    await vi.waitFor(() => expect(fetchMock).toHaveBeenCalledTimes(1));
  });

  it("renders nothing", () => {
    const fetchMock = vi.fn().mockResolvedValue({ ok: true } as Response);
    global.fetch = fetchMock as unknown as typeof fetch;

    const { container } = render(<LostLuggageNotifier locale="en" />);
    expect(container).toBeEmptyDOMElement();
  });
});
