import { describe, expect, it, vi } from "vitest";
import { updateMessageTemplate } from "./update-message-template";
import type { UpdateMessageTemplateInput } from "@/lib/validations/message-template";

function buildSupabaseMock(updateResult: { error: { message: string } | null }) {
  const eq = vi.fn().mockResolvedValue(updateResult);
  const update = vi.fn().mockReturnValue({ eq });
  const from = vi.fn().mockReturnValue({ update });
  return { client: { from } as never, from, update, eq };
}

const baseInput: UpdateMessageTemplateInput = {
  label: "Primer contacto",
  body: "Hola {{name}}!",
  is_active: true,
};

describe("updateMessageTemplate", () => {
  it("actualiza label, body e is_active", async () => {
    const { client, from, update, eq } = buildSupabaseMock({ error: null });

    const result = await updateMessageTemplate(client, "template-1", baseInput);

    expect(result).toEqual({ ok: true });
    expect(from).toHaveBeenCalledWith("message_templates");
    expect(update).toHaveBeenCalledWith({
      label: "Primer contacto",
      body: "Hola {{name}}!",
      is_active: true,
    });
    expect(eq).toHaveBeenCalledWith("id", "template-1");
  });

  it("devuelve el error cuando Supabase falla", async () => {
    const { client } = buildSupabaseMock({ error: { message: "db down" } });

    const result = await updateMessageTemplate(client, "template-1", baseInput);

    expect(result).toEqual({ ok: false, error: "db down" });
  });
});
