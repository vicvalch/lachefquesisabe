import { describe, expect, it } from "vitest";
import { createContentCategorySchema } from "./content-category";

const validInput = {
  name: "Recetas fáciles",
  slug: "recetas-faciles",
  description: "",
  sort_order: "1",
  is_active: true,
};

describe("createContentCategorySchema", () => {
  it("acepta una categoría válida", () => {
    const result = createContentCategorySchema.safeParse(validInput);
    expect(result.success).toBe(true);
  });

  it("rechaza un nombre vacío", () => {
    const result = createContentCategorySchema.safeParse({
      ...validInput,
      name: "",
    });
    expect(result.success).toBe(false);
  });

  it("rechaza un slug inválido (mayúsculas o espacios)", () => {
    const result = createContentCategorySchema.safeParse({
      ...validInput,
      slug: "Recetas Fáciles",
    });
    expect(result.success).toBe(false);
  });

  it("rechaza una descripción demasiado larga", () => {
    const result = createContentCategorySchema.safeParse({
      ...validInput,
      description: "a".repeat(301),
    });
    expect(result.success).toBe(false);
  });
});
