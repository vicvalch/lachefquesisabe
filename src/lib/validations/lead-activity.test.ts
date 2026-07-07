import { describe, expect, it } from "vitest";
import { addLeadActivitySchema } from "./lead-activity";

describe("addLeadActivitySchema", () => {
  it("acepta una nota sin canal", () => {
    const result = addLeadActivitySchema.safeParse({
      type: "note",
      content: "Seguimiento pendiente",
    });

    expect(result.success).toBe(true);
  });

  it("acepta un contacto con canal", () => {
    const result = addLeadActivitySchema.safeParse({
      type: "contact",
      channel: "llamada",
      content: "Se contactó por teléfono",
    });

    expect(result.success).toBe(true);
  });

  it("rechaza un contacto sin canal", () => {
    const result = addLeadActivitySchema.safeParse({
      type: "contact",
      content: "Sin canal",
    });

    expect(result.success).toBe(false);
  });

  it("rechaza contenido vacío", () => {
    const result = addLeadActivitySchema.safeParse({
      type: "note",
      content: "   ",
    });

    expect(result.success).toBe(false);
  });

  it("rechaza contenido demasiado largo", () => {
    const result = addLeadActivitySchema.safeParse({
      type: "note",
      content: "a".repeat(1001),
    });

    expect(result.success).toBe(false);
  });
});
