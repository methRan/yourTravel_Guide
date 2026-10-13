import { describe, it, expect } from "vitest";
import { packages } from "../src/data/packages";
import { guides } from "../src/data/guides";
import { destinations } from "../src/data/destinations";
import { sampleReviews } from "../src/data/reviews";
import { validatePhotos } from "../src/lib/backend";
describe("Content and upload contracts", () => {
  it("provides exactly three tours with a complete day-by-day itinerary", () => {
    expect(packages.map((p) => p.days)).toEqual([3, 7, 12]);
    for (const p of packages) {
      expect(p.itinerary).toHaveLength(p.days);
      expect(p.included.length).toBeGreaterThan(0);
      expect(p.excluded.length).toBeGreaterThan(0);
    }
  });
  it("provides four guides and six destinations with valid sample review associations", () => {
    expect(guides).toHaveLength(4);
    expect(destinations).toHaveLength(6);
    for (const r of sampleReviews) {
      expect(r.sample).toBe(true);
      expect(guides.some((g) => g.id === r.guide_id)).toBe(true);
    }
  });
  it("rejects oversized, unsupported, and excessive uploads", () => {
    expect(() =>
      validatePhotos([{ type: "image/jpeg", size: 6 * 1024 * 1024 } as File]),
    ).toThrow("under 5 MB");
    expect(() =>
      validatePhotos([{ type: "image/svg+xml", size: 100 } as File]),
    ).toThrow();
    expect(() =>
      validatePhotos(
        Array.from(
          { length: 6 },
          () => ({ type: "image/jpeg", size: 100 }) as File,
        ),
      ),
    ).toThrow("up to 5");
    expect(() =>
      validatePhotos([{ type: "image/webp", size: 100 } as File]),
    ).not.toThrow();
  });
});
