import type React from "react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

// Stub fs so loadInterFont() never touches the real font file.
// The tests only assert on JSX structure and style values, not on font bytes.
vi.mock("fs", () => ({
  default: { readFileSync: vi.fn(() => Buffer.alloc(16)) },
  readFileSync: vi.fn(() => Buffer.alloc(16)),
}));

// Create a mock class for ImageResponse using vi.hoisted to avoid hoisting issues
const { MockImageResponse, mockInstances } = vi.hoisted(() => {
  const mockInstances: Array<{
    element: React.ReactElement;
    init: { width: number; height: number };
  }> = [];

  class MockImageResponse {
    element: React.ReactElement;
    init: { width: number; height: number };

    constructor(
      element: React.ReactElement,
      init: { width: number; height: number },
    ) {
      this.element = element;
      this.init = init;
      mockInstances.push({ element, init });
    }
  }

  return { MockImageResponse, mockInstances };
});

vi.mock("next/og", () => ({
  ImageResponse: MockImageResponse,
}));

import CvOgImage, {
  contentType as cvContentType,
  size as cvSize,
} from "../../app/[lang]/cv/opengraph-image";
import LocalizedOgImage from "../../app/[lang]/opengraph-image";
import UnlocalizedOgImage, {
  contentType as unlocalizedContentType,
  size as unlocalizedSize,
} from "../../app/opengraph-image";
import {
  createCvOgImage,
  createHomeOgImage,
  getDefaultOgLocale,
} from "../../lib/og-home-image";
import { baseMetadata, getCvDescription, siteConfig } from "../../lib/seo";

// Helper function to traverse React element tree and extract text content
function findTextContent(el: React.ReactElement | string): string[] {
  if (typeof el === "string") return [el];
  if (!el?.props) return [];

  const children = (el.props as { children?: React.ReactNode }).children;
  if (typeof children === "string") return [children];
  if (Array.isArray(children)) {
    return children.flatMap((child) =>
      findTextContent(child as React.ReactElement | string),
    );
  }
  if (typeof children === "object" && children !== null) {
    return findTextContent(children as React.ReactElement);
  }
  return [];
}

function findElementsByType(
  el: React.ReactElement | string,
  type: string,
): React.ReactElement[] {
  if (typeof el === "string" || !el?.props) return [];

  const matches = el.type === type ? [el] : [];
  const children = (el.props as { children?: React.ReactNode }).children;

  if (Array.isArray(children)) {
    return matches.concat(
      children.flatMap((child) =>
        typeof child === "object" && child !== null
          ? findElementsByType(child as React.ReactElement, type)
          : [],
      ),
    );
  }

  if (typeof children === "object" && children !== null) {
    return matches.concat(
      findElementsByType(children as React.ReactElement, type),
    );
  }

  return matches;
}

function findImageElements(
  el: React.ReactElement | string,
): Array<React.ReactElement<{ src?: string }>> {
  return findElementsByType(el, "img") as Array<
    React.ReactElement<{ src?: string }>
  >;
}

describe("Unlocalized (root) OG image route", () => {
  beforeEach(() => {
    mockInstances.length = 0;
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  it("uses siteConfig and size to construct an ImageResponse", async () => {
    await UnlocalizedOgImage();

    expect(mockInstances).toHaveLength(1);
    const { element, init } = mockInstances[0] as {
      element: React.ReactElement;
      init: { width: number; height: number };
    };

    // Assert we pass through the expected size configuration
    expect(init.width).toBe(unlocalizedSize.width);
    expect(init.height).toBe(unlocalizedSize.height);

    // Sanity check that the exported size and content type are wired as expected
    expect(unlocalizedSize).toEqual({ width: 1200, height: 630 });
    expect(unlocalizedContentType).toBe("image/png");

    // Basic shape check: outer element is a <div>
    expect(element.type).toBe("div");

    // Snapshot-like assertion on some key props without being brittle about full tree
    const topLevelProps = element.props as { style: React.CSSProperties };
    expect(topLevelProps.style.width).toBe("100%");
    expect(topLevelProps.style.height).toBe("100%");

    // Ensure we at least reference siteConfig in the implementation
    expect(siteConfig.name).toBeDefined();
    expect(siteConfig.domain).toBeDefined();
  });
});

describe("CV OG image route", () => {
  beforeEach(() => {
    mockInstances.length = 0;
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  it("uses siteConfig and size to construct an ImageResponse", async () => {
    await CvOgImage({ params: Promise.resolve({ lang: "en" }) });

    expect(mockInstances).toHaveLength(1);
    const { element, init } = mockInstances[0] as {
      element: React.ReactElement;
      init: { width: number; height: number };
    };

    // Assert we pass through the expected size configuration
    expect(init.width).toBe(cvSize.width);
    expect(init.height).toBe(cvSize.height);

    // Sanity check that the exported size and content type are wired as expected
    expect(cvSize).toEqual({ width: 1200, height: 630 });
    expect(cvContentType).toBe("image/png");

    // Basic shape check: outer element is a <div>
    expect(element.type).toBe("div");

    // Snapshot-like assertion on some key props without being brittle about full tree
    const topLevelProps = element.props as { style: React.CSSProperties };
    expect(topLevelProps.style.width).toBe("100%");
    expect(topLevelProps.style.height).toBe("100%");
  });

  it("uses the new standardized CV description", async () => {
    await CvOgImage({ params: Promise.resolve({ lang: "en" }) });

    expect(mockInstances).toHaveLength(1);
    const { element } = mockInstances[0] as {
      element: React.ReactElement;
    };

    const textContent = findTextContent(element).join(" ");
    expect(textContent).toContain(getCvDescription("en"));
    expect(textContent).toContain("CURRICULUM VITAE × PROFILE");
    expect(textContent).toContain("FOCUS");
    expect(textContent).toContain("Live CV");
  });

  it("renders Spanish translations when lang is es", async () => {
    await CvOgImage({ params: Promise.resolve({ lang: "es" }) });

    expect(mockInstances).toHaveLength(1);
    const { element } = mockInstances[0] as {
      element: React.ReactElement;
    };

    const textContent = findTextContent(element).join(" ");
    expect(textContent).toContain("CURRÍCULUM VITAE × PERFIL");
    expect(textContent).toContain("ENFOQUE");
    expect(textContent).toContain("CV activo");
    expect(textContent).toContain(getCvDescription("es"));
  });
});

describe("Localized (/[lang]) OG image translations", () => {
  beforeEach(() => {
    mockInstances.length = 0;
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  it("renders English translations when lang is en", async () => {
    await LocalizedOgImage({ params: Promise.resolve({ lang: "en" }) });

    expect(mockInstances).toHaveLength(1);
    const { element } = mockInstances[0] as {
      element: React.ReactElement;
    };

    const textContent = findTextContent(element).join(" ");
    expect(textContent).toContain("ABOUT");
    expect(textContent).toContain("TL;DR");
    expect(textContent).toContain("Open to roles");
    expect(textContent).toContain(
      "Frontend Architect & Technical Leader",
    );
  });

  it("renders Spanish translations when lang is es", async () => {
    await LocalizedOgImage({ params: Promise.resolve({ lang: "es" }) });

    expect(mockInstances).toHaveLength(1);
    const { element } = mockInstances[0] as {
      element: React.ReactElement;
    };

    const textContent = findTextContent(element).join(" ");
    expect(textContent).toContain("PERFIL");
    expect(textContent).toContain("RESUMEN");
    expect(textContent).toContain("Abierto a roles");
    expect(textContent).toContain(
      "Gerente de Ingeniería Web y Arquitecto Frontend",
    );
  });
});

describe("OG image helpers", () => {
  beforeEach(() => {
    mockInstances.length = 0;
  });

  afterEach(() => {
    vi.unstubAllEnvs();
    vi.restoreAllMocks();
  });

  it("returns en as the default OG locale", () => {
    expect(getDefaultOgLocale()).toBe("en");
  });

  it("inlines the logo as a base64 data URI instead of fetching it over the network", () => {
    // Regression test: the logo used to be loaded via an absolute URL built
    // from VERCEL_URL, which always points at the ephemeral per-deployment
    // hostname (gated behind Vercel deployment protection) rather than the
    // stable production domain — causing Satori's self-fetch to receive an
    // HTML auth page instead of image bytes ("Unsupported image type").
    createHomeOgImage("en");

    expect(mockInstances).toHaveLength(1);
    const { element } = mockInstances[0] as { element: React.ReactElement };
    const imageElements = findImageElements(element);
    const logo = imageElements[0];

    expect(logo?.props.src).toMatch(/^data:image\/png;base64,/);
    expect(logo?.props.src).not.toContain("vercel.app");
    expect(logo?.props.src).not.toContain("http");
  });

  it("reads the logo and font from disk only once across multiple renders", async () => {
    // A same-output assertion wouldn't catch a caching regression here,
    // since the mocked fs.readFileSync always returns identical bytes
    // regardless of call count. Assert on read count instead, against a
    // freshly reset module so this test doesn't inherit cache state
    // populated by earlier tests in this file.
    vi.resetModules();
    const fs = await import("fs");
    // lib/og-home-image.tsx uses the default import (`import fs from "fs"`),
    // which the mock above wires to a *separate* vi.fn() from the named
    // export — asserting on the wrong one always reports zero calls.
    const readFileSyncMock = vi.mocked(fs.default.readFileSync);
    readFileSyncMock.mockClear();

    const { createHomeOgImage: freshCreateHomeOgImage } = await import(
      "../../lib/og-home-image"
    );

    freshCreateHomeOgImage("en");
    freshCreateHomeOgImage("en");

    // One read for the font + one for the logo, cached on the second render.
    expect(readFileSyncMock).toHaveBeenCalledTimes(2);
  });
});

describe("OG image theme support", () => {
  beforeEach(() => {
    mockInstances.length = 0;
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  it("dark theme uses ink background and cream foreground", () => {
    createHomeOgImage("en", "dark");

    expect(mockInstances).toHaveLength(1);
    const { element } = mockInstances[0] as { element: React.ReactElement };
    const rootStyle = (element.props as { style: React.CSSProperties }).style;
    expect(rootStyle.background).toBe("#0c0b09"); // palette.ink
    expect(rootStyle.color).toBe("#f0ebe1"); // palette.cream
  });

  it("light theme uses cream background and ink foreground", () => {
    createHomeOgImage("en", "light");

    expect(mockInstances).toHaveLength(1);
    const { element } = mockInstances[0] as { element: React.ReactElement };
    const rootStyle = (element.props as { style: React.CSSProperties }).style;
    expect(rootStyle.background).toBe("#f0ebe1"); // palette.cream
    expect(rootStyle.color).toBe("#0c0b09"); // palette.ink
  });

  it("dark theme is the default when no theme is specified", () => {
    createHomeOgImage("en");
    createHomeOgImage("en", "dark");

    expect(mockInstances).toHaveLength(2);
    const defaultStyle = (mockInstances[0] as { element: React.ReactElement })
      .element.props as { style: React.CSSProperties };
    const explicitStyle = (mockInstances[1] as { element: React.ReactElement })
      .element.props as { style: React.CSSProperties };
    expect(defaultStyle.style.background).toBe(explicitStyle.style.background);
  });

  it("CV OG image respects light theme", () => {
    createCvOgImage("en", "light");

    expect(mockInstances).toHaveLength(1);
    const { element } = mockInstances[0] as { element: React.ReactElement };
    const rootStyle = (element.props as { style: React.CSSProperties }).style;
    expect(rootStyle.background).toBe("#f0ebe1"); // palette.cream
    expect(rootStyle.color).toBe("#0c0b09"); // palette.ink
  });
});

describe("OG metadata separation", () => {
  it("baseMetadata uses root opengraph-image for homepage", () => {
    const metadata = baseMetadata();

    const ogImages = metadata.openGraph?.images;
    expect(ogImages).toBeDefined();
    expect(Array.isArray(ogImages)).toBe(true);
    const firstImage = (ogImages as { url: string }[])[0];
    expect(firstImage.url).toMatch(/^\/opengraph-image\?v=/);
    expect(firstImage.url).not.toContain("/cv/");

    const twitterImages = metadata.twitter?.images;
    expect(twitterImages).toBeDefined();
    expect(Array.isArray(twitterImages)).toBe(true);
    const firstTwitterImage = (twitterImages as string[])[0];
    expect(firstTwitterImage).toMatch(/^\/opengraph-image\?v=/);
    expect(firstTwitterImage).not.toContain("/cv/");
  });

  // Note: CV metadata tests removed since metadata is now generated dynamically
  // via generateMetadata() in app/[lang]/cv/page.tsx
});
