import fs from "fs";
import { afterEach, describe, expect, it, vi } from "vitest";

import { loadCv, splitCvLabel } from "../../lib/cv";

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

  it("rejects an empty handsOn line", () => {
    const valid = JSON.parse(fs.readFileSync("content/en/cv.json", "utf8")) as {
      work: Array<{ positions: Array<{ handsOn?: string }> }>;
    };
    valid.work[0].positions[0].handsOn = "";
    vi.spyOn(fs, "readFileSync").mockReturnValue(JSON.stringify(valid));

    expect(() => loadCv("en")).toThrow(
      /work\.0\.positions\.0\.handsOn — must not be empty/,
    );
  });

  it("gives the same roles a Hands-on line in the EN and ES CVs", () => {
    const handsOnRoles = (locale: "en" | "es") =>
      loadCv(locale).work.flatMap((company, ci) => [
        ...(company.handsOn ? [`${ci}`] : []),
        ...company.positions.flatMap((position, pi) =>
          position.handsOn ? [`${ci}.${pi}`] : [],
        ),
      ]);

    expect(handsOnRoles("en").length).toBeGreaterThan(0);
    expect(handsOnRoles("es")).toEqual(handsOnRoles("en"));
  });
});

describe("splitCvLabel", () => {
  it("splits off the final sentence as the tail", () => {
    expect(
      splitCvLabel(
        "Frontend Architect. Design Systems & DevEx. 15+ years delivering products.",
      ),
    ).toEqual({
      lead: "Frontend Architect. Design Systems & DevEx.",
      tail: "15+ years delivering products.",
    });
  });

  it("returns no tail for a single-sentence label", () => {
    expect(splitCvLabel("Engineering leader")).toEqual({
      lead: "Engineering leader",
      tail: "",
    });
    expect(splitCvLabel("Engineering leader.")).toEqual({
      lead: "Engineering leader.",
      tail: "",
    });
  });

  it.each(["en", "es"] as const)(
    "puts the tenure line in the tail for the %s CV",
    (locale) => {
      const { tail } = splitCvLabel(loadCv(locale).basics.label);
      expect(tail).toMatch(/15/);
    },
  );
});
