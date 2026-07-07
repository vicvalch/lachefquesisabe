import { describe, expect, it } from "vitest";
import {
  createMessageTemplateSchema,
  updateMessageTemplateSchema,
} from "./message-template";

describe("createMessageTemplateSchema", () => {
  it("acepta una clave kebab-case válida", () => {
    const result = createMessageTemplateSchema.safeParse({
      key: "seguimiento-compra",
      label: "Seguimiento post-compra",
      body: "Hola {{name}}!",
      is_active: true,
    });
    expect(result.success).toBe(true);
  });

  it("rechaza una clave con guion bajo", () => {
    const result = createMessageTemplateSchema.safeParse({
      key: "seguimiento_compra",
      label: "Seguimiento",
      body: "Hola",
      is_active: true,
    });
    expect(result.success).toBe(false);
  });

  it("normaliza una clave con mayúsculas a minúsculas", () => {
    const result = createMessageTemplateSchema.safeParse({
      key: "Seguimiento-Compra",
      label: "Seguimiento",
      body: "Hola",
      is_active: true,
    });
    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.data.key).toBe("seguimiento-compra");
    }
  });

  it("rechaza una clave demasiado corta", () => {
    const result = createMessageTemplateSchema.safeParse({
      key: "a",
      label: "Seguimiento",
      body: "Hola",
      is_active: true,
    });
    expect(result.success).toBe(false);
  });
});

describe("updateMessageTemplateSchema", () => {
  it("acepta label, body e is_active sin key", () => {
    const result = updateMessageTemplateSchema.safeParse({
      label: "Seguimiento post-compra",
      body: "Hola {{name}}!",
      is_active: false,
    });
    expect(result.success).toBe(true);
  });

  it("rechaza un body vacío", () => {
    const result = updateMessageTemplateSchema.safeParse({
      label: "Seguimiento",
      body: "",
      is_active: true,
    });
    expect(result.success).toBe(false);
  });
});
