import fs from "fs";
import { afterEach, describe, expect, it, vi } from "vitest";

import { loadCv } from "../../lib/cv";

afterEach(() => {
  vi.restoreAllMocks();
});

describe("loadCv", () => {
  it.each(["en", "es"] as const)(
    "loads and validates content/%s/cv.json",
    (locale) => {
      const cv = loadCv(locale);

      expect(cv.basics.name).toBe("Vicente Opaso");
      expect(cv.work.length).toBeGreaterThan(0);
      expect(cv.references.length).toBeGreaterThan(0);
    },
  );

  it("stores references as plain data with no HTML", () => {
    for (const locale of ["en", "es"] as const) {
      for (const ref of loadCv(locale).references) {
        expect(ref.url).toMatch(/^https:\/\//);
        for (const text of [ref.name, ref.role, ...ref.paragraphs]) {
          expect(text).not.toMatch(/<[a-z/][^>]*>/i);
        }
      }
    }
  });

  it("throws a repo-relative error when the file cannot be read", () => {
    vi.spyOn(fs, "readFileSync").mockImplementation(() => {
      throw new Error("ENOENT: /abs/path/cv.json");
    });

    expect(() => loadCv("en")).toThrow("Failed to read content/en/cv.json");
  });

  it("lists the failing fields when the data is invalid", () => {
    vi.spyOn(fs, "readFileSync").mockReturnValue(
      JSON.stringify({ name: "x", title: "x", slug: "cv", basics: {} }),
    );

    expect(() => loadCv("es")).toThrow(
      /Invalid CV data in content\/es\/cv\.json: .*basics\.name/,
    );
  });

  it("rejects non-https reference links", () => {
    const valid = JSON.parse(fs.readFileSync("content/en/cv.json", "utf8")) as {
      references: Array<{ url?: string }>;
    };
    valid.references[0].url = "javascript:alert(1)";
    vi.spyOn(fs, "readFileSync").mockReturnValue(JSON.stringify(valid));

    expect(() => loadCv("en")).toThrow(/references\.0\.url/);
  });
});
