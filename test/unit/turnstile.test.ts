import { afterEach, beforeEach, describe, expect, it } from "vitest";

import {
  loadTurnstile,
  resetTurnstileLoaderForTests,
  TURNSTILE_SCRIPT_SRC,
} from "../../lib/turnstile";

function injectedScripts() {
  return document.head.querySelectorAll<HTMLScriptElement>(
    `script[src="${TURNSTILE_SCRIPT_SRC}"]`,
  );
}

describe("loadTurnstile", () => {
  beforeEach(() => {
    resetTurnstileLoaderForTests();
    delete window.turnstile;
    document.head.innerHTML = "";
  });

  afterEach(() => {
    delete window.turnstile;
  });

  it("injects the explicit-render script once, however often it is called", async () => {
    const first = loadTurnstile();
    const second = loadTurnstile();

    expect(second).toBe(first);
    expect(injectedScripts()).toHaveLength(1);
    expect(injectedScripts()[0]?.async).toBe(true);

    injectedScripts()[0]?.dispatchEvent(new Event("load"));
    await expect(first).resolves.toBeUndefined();
  });

  it("resolves immediately without a script when Turnstile is already present", async () => {
    window.turnstile = { render: () => {}, reset: () => {} };

    await expect(loadTurnstile()).resolves.toBeUndefined();
    expect(injectedScripts()).toHaveLength(0);
  });

  it("rejects on a network failure and lets a later call retry", async () => {
    const failed = loadTurnstile();
    injectedScripts()[0]?.dispatchEvent(new Event("error"));

    await expect(failed).rejects.toThrow("Failed to load Cloudflare Turnstile");
    expect(injectedScripts()).toHaveLength(0);

    const retry = loadTurnstile();
    expect(retry).not.toBe(failed);
    expect(injectedScripts()).toHaveLength(1);
  });
});
