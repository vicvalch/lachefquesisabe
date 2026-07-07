import type { SupabaseClient } from "@supabase/supabase-js";
import type { Database } from "@/types/database";
import type { CreateMessageTemplateInput } from "@/lib/validations/message-template";

export type CreateMessageTemplateResult =
  | { ok: true; id: string }
  | { ok: false; error: string };

const UNIQUE_VIOLATION_CODE = "23505";

/**
 * Crea una plantilla de mensaje nueva desde /admin/plantillas/new. A
 * diferencia de updateMessageTemplate, acá sí se acepta `key`: es la única
 * vez que se define, porque es el identificador estable que después usan
 * las sugerencias automáticas y no se vuelve a editar.
 */
export async function createMessageTemplate(
  supabase: SupabaseClient<Database>,
  input: CreateMessageTemplateInput,
): Promise<CreateMessageTemplateResult> {
  const { data, error } = await supabase
    .from("message_templates")
    .insert({
      key: input.key,
      label: input.label,
      body: input.body,
      is_active: input.is_active,
    })
    .select("id")
    .single();

  if (error || !data) {
    if (error?.code === UNIQUE_VIOLATION_CODE) {
      return { ok: false, error: "Ya existe una plantilla con esa clave." };
    }
    return { ok: false, error: "No se pudo crear la plantilla. Intenta de nuevo." };
  }

  return { ok: true, id: data.id };
}
