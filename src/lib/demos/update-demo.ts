import type { SupabaseClient } from "@supabase/supabase-js";
import type { Database } from "@/types/database";
import type { UpdateDemoEventStatusInput } from "@/lib/validations/demo-event";

export type UpdateDemoEventStatusResult =
  | { ok: true }
  | { ok: false; error: string };

/**
 * Actualiza únicamente el estado y las notas internas de la demo (marcar
 * como realizada o cancelada). El resto de los campos se definen al crear
 * la demo y no se editan desde este formulario.
 */
export async function updateDemoEventStatus(
  supabase: SupabaseClient<Database>,
  demoEventId: string,
  input: UpdateDemoEventStatusInput,
): Promise<UpdateDemoEventStatusResult> {
  const { error } = await supabase
    .from("demo_events")
    .update({
      status: input.status,
      internal_notes: input.internal_notes || null,
    })
    .eq("id", demoEventId);

  if (error) {
    return { ok: false, error: error.message };
  }

  return { ok: true };
}
