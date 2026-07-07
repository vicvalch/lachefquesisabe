import { describe, expect, it } from "vitest";
import { createRecipeSchema, updateRecipeSchema } from "./recipe";

const validInput = {
  title: "Arroz con pollo en 20 minutos",
  content_type: "recipe",
  summary: "",
  cover_image_url: "",
  prep_minutes: "20",
  servings: "4",
  ingredients: "",
  content: "1. Sofríe el pollo.\n2. Agrega el arroz.",
  cta_message: "",
};

describe("createRecipeSchema", () => {
  it("acepta una receta válida y coacciona los números opcionales", () => {
    const result = createRecipeSchema.safeParse(validInput);
    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.data.prep_minutes).toBe(20);
      expect(result.data.servings).toBe(4);
    }
  });

  it("acepta campos numéricos opcionales vacíos como null", () => {
    const result = createRecipeSchema.safeParse({
      ...validInput,
      prep_minutes: "",
      servings: "",
    });
    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.data.prep_minutes).toBeNull();
      expect(result.data.servings).toBeNull();
    }
  });

  it("rechaza un título demasiado corto", () => {
    const result = createRecipeSchema.safeParse({ ...validInput, title: "A" });
    expect(result.success).toBe(false);
  });

  it("rechaza un tipo de contenido que no existe en el enum", () => {
    const result = createRecipeSchema.safeParse({
      ...validInput,
      content_type: "article",
    });
    expect(result.success).toBe(false);
  });

  it("rechaza un contenido vacío", () => {
    const result = createRecipeSchema.safeParse({ ...validInput, content: "" });
    expect(result.success).toBe(false);
  });

  it("rechaza un tiempo de preparación fuera de rango", () => {
    const result = createRecipeSchema.safeParse({
      ...validInput,
      prep_minutes: "0",
    });
    expect(result.success).toBe(false);
  });

  it("rechaza porciones fuera de rango", () => {
    const result = createRecipeSchema.safeParse({
      ...validInput,
      servings: "500",
    });
    expect(result.success).toBe(false);
  });
});

describe("updateRecipeSchema", () => {
  it("acepta un estado válido", () => {
    const result = updateRecipeSchema.safeParse({
      ...validInput,
      status: "published",
    });
    expect(result.success).toBe(true);
  });

  it("rechaza un estado que no existe en el enum", () => {
    const result = updateRecipeSchema.safeParse({
      ...validInput,
      status: "archived",
    });
    expect(result.success).toBe(false);
  });
});
