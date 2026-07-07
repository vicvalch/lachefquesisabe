import { describe, expect, it } from "vitest";
import {
  createDemoEventSchema,
  updateDemoEventStatusSchema,
} from "./demo-event";

const validInput = {
  title: "Demo de recetas rápidas",
  description: "",
  public_notes: "",
  mode: "in_person",
  location_name: "Casa de la chef",
  location_address: "Heredia, Costa Rica",
  meeting_url: "",
  starts_at: "2026-08-01T18:00",
  ends_at: "",
  capacity: "8",
  internal_notes: "",
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

  it("rechaza una modalidad que no existe en el enum", () => {
    const result = createDemoEventSchema.safeParse({
      ...validInput,
      mode: "hibrida",
    });
    expect(result.success).toBe(false);
  });

  it("rechaza una fecha de inicio inválida", () => {
    const result = createDemoEventSchema.safeParse({
      ...validInput,
      starts_at: "no-es-una-fecha",
    });
    expect(result.success).toBe(false);
  });

  it("rechaza una fecha de fin inválida", () => {
    const result = createDemoEventSchema.safeParse({
      ...validInput,
      ends_at: "no-es-una-fecha",
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

  it("acepta campos opcionales vacíos", () => {
    const result = createDemoEventSchema.safeParse({
      title: "Demo rápida",
      mode: "virtual",
      starts_at: "2026-08-01T18:00",
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

  it("acepta el estado 'full'", () => {
    const result = updateDemoEventStatusSchema.safeParse({ status: "full" });
    expect(result.success).toBe(true);
  });

  it("rechaza un estado que no existe en el enum", () => {
    const result = updateDemoEventStatusSchema.safeParse({
      status: "pendiente",
    });
    expect(result.success).toBe(false);
  });
});
