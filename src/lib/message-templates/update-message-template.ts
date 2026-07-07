import type { SupabaseClient } from "@supabase/supabase-js";
import type { Database } from "@/types/database";
import type { UpdateMessageTemplateInput } from "@/lib/validations/message-template";

export type UpdateMessageTemplateResult =
  | { ok: true }
  | { ok: false; error: string };

/**
 * Actualiza únicamente lo que el admin puede editar de una plantilla:
 * label, body y is_active. `key` es el identificador estable que usa el
 * código (sugerencias de seguimiento, triggers de creación automática) y
 * nunca se acepta desde este formulario.
 */
export async function updateMessageTemplate(
  supabase: SupabaseClient<Database>,
  templateId: string,
  input: UpdateMessageTemplateInput,
): Promise<UpdateMessageTemplateResult> {
  const { error } = await supabase
    .from("message_templates")
    .update({
      label: input.label,
      body: input.body,
      is_active: input.is_active,
    })
    .eq("id", templateId);

  if (error) {
    return { ok: false, error: error.message };
  }

  return { ok: true };
}
