import { describe, expect, it, vi } from "vitest";
import { createMessageTemplate } from "./create-message-template";
import type { CreateMessageTemplateInput } from "@/lib/validations/message-template";

function buildSupabaseMock(result: {
  data: { id: string } | null;
  error: { message: string; code?: string } | null;
}) {
  const single = vi.fn().mockResolvedValue(result);
  const select = vi.fn().mockReturnValue({ single });
  const insert = vi.fn().mockReturnValue({ select });
  const from = vi.fn().mockReturnValue({ insert });
  return { client: { from } as never, from, insert };
}

const baseInput: CreateMessageTemplateInput = {
  key: "seguimiento-compra",
  label: "Seguimiento post-compra",
  body: "Hola {{name}}!",
  is_active: true,
};

describe("createMessageTemplate", () => {
  it("crea la plantilla con el key indicado", async () => {
    const { client, from, insert } = buildSupabaseMock({
      data: { id: "template-1" },
      error: null,
    });

    const result = await createMessageTemplate(client, baseInput);

    expect(result).toEqual({ ok: true, id: "template-1" });
    expect(from).toHaveBeenCalledWith("message_templates");
    expect(insert).toHaveBeenCalledWith({
      key: "seguimiento-compra",
      label: "Seguimiento post-compra",
      body: "Hola {{name}}!",
      is_active: true,
    });
  });

  it("devuelve un mensaje amigable cuando el key ya existe", async () => {
    const { client } = buildSupabaseMock({
      data: null,
      error: { message: "duplicate key", code: "23505" },
    });

    const result = await createMessageTemplate(client, baseInput);

    expect(result).toEqual({
      ok: false,
      error: "Ya existe una plantilla con esa clave.",
    });
  });

  it("devuelve el error genérico cuando Supabase falla por otra razón", async () => {
    const { client } = buildSupabaseMock({
      data: null,
      error: { message: "db down" },
    });

    const result = await createMessageTemplate(client, baseInput);

    expect(result).toEqual({ ok: false, error: "db down" });
  });
});
