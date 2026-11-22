import { describe, expect, it } from "vitest";

import { brl, cleanText } from "@/data/menu";

describe("menu sanitization", () => {
  it("removes control chars and angle brackets", () => {
    expect(cleanText("a\u0000b<c>d", 100)).toBe("abcd");
  });

  it("collapses whitespace and trims", () => {
    expect(cleanText("  hello   world  ", 100)).toBe("hello world");
  });

  it("returns null for empty or non-string", () => {
    expect(cleanText("   ", 100)).toBeNull();
    expect(cleanText(123, 100)).toBeNull();
  });

  it("slices to max length", () => {
    expect(cleanText("abcdef", 3)).toBe("abc");
  });

  it("normalizes line breaks and strips invisible/bidi characters", () => {
    expect(cleanText("Feijoada\ncom farofa", 100)).toBe("Feijoada com farofa");
    expect(cleanText("a\u202Eb\u200Bc", 100)).toBe("abc");
  });
});

describe("price formatting", () => {
  it("formats valid numbers in BRL", () => {
    expect(brl(38)).toBe("38,00");
  });

  it("returns dash for invalid or negative values", () => {
    expect(brl(-1)).toBe("—");
    expect(brl(NaN)).toBe("—");
    expect(brl("<script>")).toBe("—");
    expect(brl(null)).toBe("—");
  });

  it("accepts numeric strings from the database", () => {
    expect(brl("38.5")).toBe("38,50");
  });
});
