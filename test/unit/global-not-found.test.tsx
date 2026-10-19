import { renderToStaticMarkup } from "react-dom/server";
import { describe, expect, it } from "vitest";

import GlobalNotFound, { metadata } from "../../app/global-not-found";

describe("GlobalNotFound", () => {
  it("renders a standalone, non-indexable 404 document linking home", () => {
    const html = renderToStaticMarkup(<GlobalNotFound />);

    expect(html).toContain('<html lang="en">');
    expect(html).toContain("404");
    expect(html).toContain('href="/en"');
    expect(metadata.robots).toEqual({ index: false, follow: false });
  });
});
