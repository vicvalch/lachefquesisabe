import { describe, expect, it } from "vitest";
import { recipeVideoSchema } from "./recipe-video";

const validPayload = {
  title: "Arroz con pollo en Thermomix",
  description: "Receta rápida para el almuerzo de la semana",
  youtube_url: "https://www.youtube.com/watch?v=dQw4w9WgXcQ",
  thumbnail_url: "",
  category: "",
  difficulty: "" as const,
  duration_minutes: "20",
  ingredients: "2 tazas de arroz\n1 pechuga de pollo",
  tags: "pollo, rápido",
  status: "draft" as const,
};

describe("recipeVideoSchema", () => {
  it("acepta un video válido y normaliza defaults", () => {
    const result = recipeVideoSchema.safeParse(validPayload);
    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.data.category).toBe("recetas");
      expect(result.data.difficulty).toBeNull();
      expect(result.data.duration_minutes).toBe(20);
      expect(result.data.ingredients).toEqual([
        "2 tazas de arroz",
        "1 pechuga de pollo",
      ]);
      expect(result.data.tags).toEqual(["pollo", "rápido"]);
    }
  });

  it("rechaza un link que no es de YouTube", () => {
    const result = recipeVideoSchema.safeParse({
      ...validPayload,
      youtube_url: "https://example.com/video",
    });
    expect(result.success).toBe(false);
  });

  it("acepta links youtu.be y de shorts", () => {
    expect(
      recipeVideoSchema.safeParse({
        ...validPayload,
        youtube_url: "https://youtu.be/dQw4w9WgXcQ",
      }).success,
    ).toBe(true);
    expect(
      recipeVideoSchema.safeParse({
        ...validPayload,
        youtube_url: "https://www.youtube.com/shorts/dQw4w9WgXcQ",
      }).success,
    ).toBe(true);
  });

  it("rechaza un título demasiado corto", () => {
    const result = recipeVideoSchema.safeParse({ ...validPayload, title: "A" });
    expect(result.success).toBe(false);
  });

  it("rechaza una duración fuera de rango", () => {
    const result = recipeVideoSchema.safeParse({
      ...validPayload,
      duration_minutes: "9999",
    });
    expect(result.success).toBe(false);
  });

  it("rechaza un estado fuera del enum", () => {
    const result = recipeVideoSchema.safeParse({
      ...validPayload,
      status: "no-existe",
    });
    expect(result.success).toBe(false);
  });
});
