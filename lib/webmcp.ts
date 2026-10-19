/**
 * Loads the WebMCP polyfill (@mcp-b/global) as a self-hosted, code-split
 * chunk. Browsers with native WebMCP (`document.modelContext`, or the older
 * `navigator.modelContext`) never call this.
 *
 * zod v4 (used inside the polyfill) probes `new Function("")` to decide
 * whether to JIT-compile object parsers. Our CSP forbids eval, so that probe
 * surfaces as a CSP violation on every page. Interpreted parsing is plenty
 * fast for a handful of tool schemas, so turn the JIT off before the
 * polyfill builds any schemas. zod keeps this config on `globalThis`, so it
 * reaches the polyfill's copy of zod too.
 */
export async function loadWebMcpPolyfill(): Promise<void> {
  const { config } = await import("zod/v4/core");
  config({ jitless: true });
  // Side-effect import: the polyfill installs document.modelContext.
  await import("@mcp-b/global");
}
