import { describe, expect, it } from "vitest";
import {
  createDemoEventSchema,
  updateDemoEventStatusSchema,
} from "./demo-event";

const validInput = {
  title: "Demo de recetas rápidas",
  description: "",
  demo_type: "in_person",
  location: "Casa, Heredia",
  scheduled_at: "2026-08-01T18:00",
  capacity: "8",
  notes: "",
};

describe("createDemoEventSchema", () => {
  it("acepta una demo válida y coacciona el cupo a número", () => {
    const result = createDemoEventSchema.safeParse(validInput);
    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.data.capacity).toBe(8);
    }
  });

  it("rechaza un título demasiado corto", () => {
    const result = createDemoEventSchema.safeParse({
      ...validInput,
      title: "A",
    });
    expect(result.success).toBe(false);
  });

  it("rechaza un tipo de demo que no existe en el enum", () => {
    const result = createDemoEventSchema.safeParse({
      ...validInput,
      demo_type: "hibrida",
    });
    expect(result.success).toBe(false);
  });

  it("rechaza una fecha inválida", () => {
    const result = createDemoEventSchema.safeParse({
      ...validInput,
      scheduled_at: "no-es-una-fecha",
    });
    expect(result.success).toBe(false);
  });

  it("rechaza un cupo menor a 1", () => {
    const result = createDemoEventSchema.safeParse({
      ...validInput,
      capacity: "0",
    });
    expect(result.success).toBe(false);
  });

  it("rechaza un cupo mayor a 200", () => {
    const result = createDemoEventSchema.safeParse({
      ...validInput,
      capacity: "500",
    });
    expect(result.success).toBe(false);
  });

  it("acepta descripción, ubicación y notas vacías", () => {
    const result = createDemoEventSchema.safeParse({
      title: "Demo rápida",
      demo_type: "virtual",
      scheduled_at: "2026-08-01T18:00",
      capacity: "5",
    });
    expect(result.success).toBe(true);
  });
});

describe("updateDemoEventStatusSchema", () => {
  it("acepta un estado válido sin notas", () => {
    const result = updateDemoEventStatusSchema.safeParse({
      status: "completed",
    });
    expect(result.success).toBe(true);
  });

  it("rechaza un estado que no existe en el enum", () => {
    const result = updateDemoEventStatusSchema.safeParse({
      status: "pendiente",
    });
    expect(result.success).toBe(false);
  });
});
