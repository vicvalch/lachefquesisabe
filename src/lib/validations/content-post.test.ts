import { describe, expect, it } from "vitest";
import { contentPostSchema } from "./content-post";

const validPublishedRecipe = {
  title: "Arroz con pollo en 20 minutos",
  content_type: "recipe",
  status: "published",
  category_id: "",
  excerpt: "Una receta rápida para el día a día.",
  body: "Sofríe el pollo y agrega el arroz con el caldo.",
  ingredients: "2 tazas de arroz\n1 pechuga de pollo",
  instructions: "1. Sofríe el pollo.\n2. Agrega el arroz.",
  prep_time_minutes: "20",
  cook_time_minutes: "25",
  servings: "4",
  difficulty: "easy",
  image_url: "https://example.com/arroz.jpg",
  seo_title: "",
  seo_description: "",
  featured: "on",
};

describe("contentPostSchema", () => {
  it("acepta una receta publicada válida", () => {
    const result = contentPostSchema.safeParse(validPublishedRecipe);
    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.data.prep_time_minutes).toBe(20);
      expect(result.data.cook_time_minutes).toBe(25);
      expect(result.data.servings).toBe(4);
      expect(result.data.featured).toBe(true);
      expect(result.data.category_id).toBeNull();
    }
  });

  it("acepta un borrador incompleto (solo título, tipo, estado y body mínimo)", () => {
    const result = contentPostSchema.safeParse({
      title: "Idea para un tip",
      content_type: "tip",
      status: "draft",
      category_id: "",
      excerpt: "",
      body: "Un tip cortito.",
      ingredients: "",
      instructions: "",
      prep_time_minutes: "",
      cook_time_minutes: "",
      servings: "",
      difficulty: "",
      image_url: "",
      seo_title: "",
      seo_description: "",
      featured: "",
    });

    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.data.prep_time_minutes).toBeNull();
      expect(result.data.difficulty).toBeNull();
      expect(result.data.featured).toBe(false);
    }
  });

  it("rechaza un título vacío", () => {
    const result = contentPostSchema.safeParse({
      ...validPublishedRecipe,
      title: "",
    });
    expect(result.success).toBe(false);
  });

  it("rechaza un body demasiado corto", () => {
    const result = contentPostSchema.safeParse({
      ...validPublishedRecipe,
      body: "corto",
    });
    expect(result.success).toBe(false);
  });

  it("rechaza un status que no existe en el enum", () => {
    const result = contentPostSchema.safeParse({
      ...validPublishedRecipe,
      status: "pending",
    });
    expect(result.success).toBe(false);
  });

  it("rechaza un content_type que no existe en el enum", () => {
    const result = contentPostSchema.safeParse({
      ...validPublishedRecipe,
      content_type: "article",
    });
    expect(result.success).toBe(false);
  });

  it("rechaza un difficulty que no existe en el enum", () => {
    const result = contentPostSchema.safeParse({
      ...validPublishedRecipe,
      difficulty: "expert",
    });
    expect(result.success).toBe(false);
  });

  it("rechaza un image_url inválido", () => {
    const result = contentPostSchema.safeParse({
      ...validPublishedRecipe,
      image_url: "not-a-url",
    });
    expect(result.success).toBe(false);
  });

  it("rechaza servings <= 0", () => {
    const result = contentPostSchema.safeParse({
      ...validPublishedRecipe,
      servings: "0",
    });
    expect(result.success).toBe(false);
  });
});
