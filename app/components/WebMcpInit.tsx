"use client";

import { useEffect } from "react";

import { CONTENT_SLUGS } from "@/lib/content-slugs";
import { logError } from "@/lib/error-logging";
import { loadWebMcpPolyfill } from "@/lib/webmcp";

type ToolInputSchema = {
  type: "object";
  properties?: Record<string, { type: string; description?: string }>;
  required?: string[];
  additionalProperties?: boolean;
};

type ToolRegistration = {
  name: string;
  description: string;
  inputSchema: ToolInputSchema;
  execute: (input: unknown) => Promise<unknown> | unknown;
};

type ModelContext = {
  registerTool: (tool: ToolRegistration) => void;
};

type ModelContextNavigator = Navigator & { modelContext?: unknown };

const MCP_REGISTRATION_FLAG = "__opaWebMcpRegistered";

function getModelContext(): ModelContext | null {
  if (typeof navigator === "undefined") {
    return null;
  }

  const modelContext = (navigator as ModelContextNavigator).modelContext;
  if (!modelContext || typeof modelContext !== "object") {
    return null;
  }

  const context = modelContext as ModelContext;
  if (typeof context.registerTool !== "function") {
    return null;
  }

  return context;
}

function registerTools(modelContext: ModelContext) {
  const fetchText = async (path: string) => {
    try {
      const response = await fetch(path);
      const text = await response.text();
      return { ok: response.ok, status: response.status, text };
    } catch (error) {
      const message =
        error instanceof Error ? error.message : "Unknown network error.";
      return {
        ok: false,
        status: null,
        text: `Error fetching ${path}: ${message}`,
      };
    }
  };

  const fetchJson = async (path: string) => {
    try {
      const response = await fetch(path);

      try {
        const data = await response.json();
        return { ok: response.ok, status: response.status, data };
      } catch (parseError) {
        let rawText = "";
        try {
          rawText = await response.text();
        } catch {
          rawText = "";
        }

        return {
          ok: false,
          status: response.status,
          data: {
            error: "Invalid JSON response.",
            rawText,
            parseError:
              parseError instanceof Error
                ? parseError.message
                : "Unknown parse error.",
          },
        };
      }
    } catch (error) {
      const message =
        error instanceof Error ? error.message : "Unknown network error.";
      return {
        ok: false,
        status: null,
        data: { error: "Network error.", message },
      };
    }
  };

  modelContext.registerTool({
    name: "get_site_overview",
    description: "Return the short AI overview for this site (/llms.txt).",
    inputSchema: { type: "object", additionalProperties: false },
    execute: async () => {
      const result = await fetchText("/llms.txt");
      return {
        content: [{ type: "text", text: result.text }],
        isError: !result.ok,
      };
    },
  });

  modelContext.registerTool({
    name: "get_site_context",
    description: "Return the full AI context for this site (/llms-full.txt).",
    inputSchema: { type: "object", additionalProperties: false },
    execute: async () => {
      const result = await fetchText("/llms-full.txt");
      return {
        content: [{ type: "text", text: result.text }],
        isError: !result.ok,
      };
    },
  });

  modelContext.registerTool({
    name: "get_content",
    description:
      "Fetch localized markdown content from /api/content/{lang}/{slug}.",
    inputSchema: {
      type: "object",
      properties: {
        lang: { type: "string", description: "Locale code (en or es)." },
        slug: {
          type: "string",
          description: `Allowed slugs: ${CONTENT_SLUGS.join(", ")}.`,
        },
      },
      required: ["lang", "slug"],
      additionalProperties: false,
    },
    execute: async (input) => {
      if (!input || typeof input !== "object") {
        return {
          content: [{ type: "text", text: "Error: invalid input." }],
          isError: true,
        };
      }

      const { lang, slug } = input as { lang?: string; slug?: string };
      if (!lang || !slug) {
        return {
          content: [
            { type: "text", text: "Error: lang and slug are required." },
          ],
          isError: true,
        };
      }

      const result = await fetchJson(`/api/content/${lang}/${slug}`);
      return {
        content: [
          {
            type: "text",
            text: JSON.stringify(
              { ok: result.ok, status: result.status, data: result.data },
              null,
              2,
            ),
          },
        ],
        isError: !result.ok,
      };
    },
  });

  modelContext.registerTool({
    name: "get_profile",
    description:
      "Fetch the canonical localized JSON profile from /api/profile/{lang}.",
    inputSchema: {
      type: "object",
      properties: {
        lang: { type: "string", description: "Locale code (en or es)." },
      },
      required: ["lang"],
      additionalProperties: false,
    },
    execute: async (input) => {
      if (!input || typeof input !== "object") {
        return {
          content: [{ type: "text", text: "Error: invalid input." }],
          isError: true,
        };
      }

      const { lang } = input as { lang?: string };
      if (!lang) {
        return {
          content: [{ type: "text", text: "Error: lang is required." }],
          isError: true,
        };
      }

      const result = await fetchJson(`/api/profile/${lang}`);
      return {
        content: [
          {
            type: "text",
            text: JSON.stringify(
              { ok: result.ok, status: result.status, data: result.data },
              null,
              2,
            ),
          },
        ],
        isError: !result.ok,
      };
    },
  });

  modelContext.registerTool({
    name: "list_content_slugs",
    description: "List available markdown content slugs for this site.",
    inputSchema: { type: "object", additionalProperties: false },
    execute: () => ({
      content: [{ type: "text", text: CONTENT_SLUGS.join(", ") }],
    }),
  });
}

/**
 * The polyfill only serves desktop agent extensions (e.g. MCP-B), which phones
 * don't run. On a mid-range Android its ~330 KB of JS cost ~140 ms of
 * main-thread blocking for no consumer, so phones skip it.
 */
function isMobileDevice(): boolean {
  const userAgentData = (
    navigator as Navigator & { userAgentData?: { mobile?: unknown } }
  ).userAgentData;
  if (typeof userAgentData?.mobile === "boolean") {
    return userAgentData.mobile;
  }
  return (
    typeof globalThis.matchMedia === "function" &&
    globalThis.matchMedia("(hover: none) and (pointer: coarse)").matches
  );
}

/** Runs `callback` once the main thread is idle, keeping it off the load path. */
function whenIdle(callback: () => void): () => void {
  const scope = globalThis as typeof globalThis &
    Partial<Pick<Window, "requestIdleCallback" | "cancelIdleCallback">>;
  if (
    typeof scope.requestIdleCallback === "function" &&
    typeof scope.cancelIdleCallback === "function"
  ) {
    const id = scope.requestIdleCallback(callback, { timeout: 5000 });
    return () => scope.cancelIdleCallback?.(id);
  }
  const id = scope.setTimeout(callback, 1);
  return () => scope.clearTimeout(id);
}

export function WebMcpInit() {
  useEffect(() => {
    const globalScope = globalThis as typeof globalThis & {
      window?: Window;
    };
    const browserWindow = globalScope.window;

    if (!browserWindow) {
      return;
    }

    const globalWindow = browserWindow as Window & {
      [MCP_REGISTRATION_FLAG]?: boolean;
    };

    if (globalWindow[MCP_REGISTRATION_FLAG]) {
      return;
    }

    let cancelled = false;

    const tryRegister = () => {
      const modelContext = getModelContext();
      if (!modelContext) {
        return false;
      }
      registerTools(modelContext);
      globalWindow[MCP_REGISTRATION_FLAG] = true;
      return true;
    };

    // Native WebMCP: register straight away.
    if (tryRegister()) {
      return;
    }

    if (isMobileDevice()) {
      return;
    }

    // No native support: load the polyfill once the page is idle, then register.
    const cancelIdle = whenIdle(() => {
      loadWebMcpPolyfill()
        .then(() => {
          if (!cancelled && !globalWindow[MCP_REGISTRATION_FLAG]) {
            tryRegister();
          }
        })
        .catch((error: unknown) => {
          logError(error, {
            component: "WebMcpInit",
            action: "loadWebMcpPolyfill",
          });
        });
    });

    return () => {
      cancelled = true;
      cancelIdle();
    };
  }, []);

  return null;
}
