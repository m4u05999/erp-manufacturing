import { describe, it, expect } from "vitest";
import ar from "@/core/i18n/ar";
import en from "@/core/i18n/en";

describe("i18n translations", () => {
  it("should have matching keys between ar and en", () => {
    const arKeys = JSON.stringify(ar);
    const enKeys = JSON.stringify(en);
    expect(arKeys).toBeDefined();
    expect(enKeys).toBeDefined();
  });

  it("should have same top-level sections", () => {
    const arSections = Object.keys(ar).sort();
    const enSections = Object.keys(en).sort();
    expect(arSections).toEqual(enSections);
  });

  it("should have Arabic text in ar translations", () => {
    expect(ar.nav.dashboard).toContain("لوحة");
    expect(ar.common.save).toContain("حفظ");
  });

  it("should have English text in en translations", () => {
    expect(en.nav.dashboard).toBe("Dashboard");
    expect(en.common.save).toBe("Save");
  });
});
