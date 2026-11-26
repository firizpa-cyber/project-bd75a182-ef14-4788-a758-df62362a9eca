import { beforeEach, describe, expect, it, vi } from "vitest";
import { PRODUCT_IMAGES, resolveProductImage } from "@/lib/product-images";
import { createSeed } from "@/lib/seed";
import type { State } from "@/lib/types";

const oldImages = import.meta.glob<{ default: { url: string } }>("../assets/products/*.jpg.asset.json", { eager: true });

describe("product images", () => {
  beforeEach(() => {
    localStorage.clear();
    vi.resetModules();
  });

  it("resolves every original image to its bundled photo", () => {
    expect(PRODUCT_IMAGES).toHaveLength(25);
    for (let i = 1; i <= 25; i++) {
      const oldImage = oldImages[`../assets/products/p${i}.jpg.asset.json`];
      expect(oldImage).toBeDefined();
      expect(resolveProductImage(oldImage!.default.url)).toBe(PRODUCT_IMAGES[i - 1]);
    }
  });

  it("keeps custom image URLs and resolves older bundled URLs", () => {
    const custom = "https://example.com/assets/p1-custom.jpg";
    expect(resolveProductImage(custom)).toBe(custom);
    expect(resolveProductImage("/src/assets/products/p1.jpg")).toBe(PRODUCT_IMAGES[0]);
    expect(resolveProductImage("/assets/p25-oldhash.jpg")).toBe(PRODUCT_IMAGES[24]);
    expect(resolveProductImage("/assets/p26-oldhash.jpg")).toBe("/assets/p26-oldhash.jpg");
  });

  it("migrates saved products without losing edits, sales, or custom photos", async () => {
    const saved = createSeed();
    saved.products[0]!.image = oldImages["../assets/products/p1.jpg.asset.json"]!.default.url;
    saved.products[0]!.price = 1234;
    saved.products[1]!.image = "https://example.com/custom.jpg";
    localStorage.setItem("moysklad:data:v2", JSON.stringify(saved));

    const { actions } = await import("@/lib/store");
    actions.repriceBy([], 0);
    const migrated = JSON.parse(localStorage.getItem("moysklad:data:v3")!) as State;

    expect(migrated.products[0]!.image).toBe(PRODUCT_IMAGES[0]);
    expect(migrated.products[0]!.price).toBe(1234);
    expect(migrated.products[1]!.image).toBe("https://example.com/custom.jpg");
    expect(migrated.sales).toEqual(saved.sales);
    expect(migrated.movements).toEqual(saved.movements);
    expect(migrated.customers).toEqual(saved.customers);
    expect(JSON.parse(localStorage.getItem("moysklad:data:v2")!)).toEqual(saved);
  });

  it("prefers newer saved data over the previous version", async () => {
    const previous = createSeed();
    const current = createSeed();
    previous.products[0]!.price = 100;
    current.products[0]!.price = 200;
    current.products[0]!.image = "/assets/p1-oldhash.jpg";
    localStorage.setItem("moysklad:data:v2", JSON.stringify(previous));
    localStorage.setItem("moysklad:data:v3", JSON.stringify(current));

    const { actions } = await import("@/lib/store");
    actions.repriceBy([], 0);
    const restored = JSON.parse(localStorage.getItem("moysklad:data:v3")!) as State;
    expect(restored.products[0]!.price).toBe(200);
    expect(restored.products[0]!.image).toBe(PRODUCT_IMAGES[0]);
  });
});
