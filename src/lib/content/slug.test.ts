import { describe, expect, it } from "vitest";
import { generateUniqueSlug, slugify } from "./slug";

describe("slugify", () => {
  it("genera el slug en minúsculas", () => {
    expect(slugify("Arroz Con Pollo")).toBe("arroz-con-pollo");
  });

  it("remueve acentos", () => {
    expect(slugify("Receta rápida de sofrito jalapeño")).toBe(
      "receta-rapida-de-sofrito-jalapeno",
    );
  });

  it("reemplaza espacios por guiones", () => {
    expect(slugify("Tip de cocina fácil")).toBe("tip-de-cocina-facil");
  });

  it("elimina caracteres raros", () => {
    expect(slugify("¿Cómo hacer arroz? ¡Fácil!")).toBe("como-hacer-arroz-facil");
  });

  it("colapsa guiones múltiples en uno solo", () => {
    expect(slugify("arroz   --  con -- pollo")).toBe("arroz-con-pollo");
  });

  it("no deja guiones al inicio ni al final", () => {
    expect(slugify("  -Arroz con pollo- ")).toBe("arroz-con-pollo");
  });
});

describe("generateUniqueSlug", () => {
  it("devuelve el slug base si no existe todavía", async () => {
    const slug = await generateUniqueSlug(
      "Arroz con pollo",
      async () => false,
    );

    expect(slug).toBe("arroz-con-pollo");
  });

  it("agrega -2 si el slug base ya existe", async () => {
    const existing = new Set(["arroz-con-pollo"]);
    const slug = await generateUniqueSlug("Arroz con pollo", async (candidate) =>
      existing.has(candidate),
    );

    expect(slug).toBe("arroz-con-pollo-2");
  });

  it("agrega -3 si el slug base y el -2 ya existen", async () => {
    const existing = new Set(["arroz-con-pollo", "arroz-con-pollo-2"]);
    const slug = await generateUniqueSlug("Arroz con pollo", async (candidate) =>
      existing.has(candidate),
    );

    expect(slug).toBe("arroz-con-pollo-3");
  });
});
