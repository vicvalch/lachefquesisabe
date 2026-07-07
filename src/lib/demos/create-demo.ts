import type { SupabaseClient } from "@supabase/supabase-js";
import type { Database } from "@/types/database";
import type { CreateDemoEventInput } from "@/lib/validations/demo-event";

export type CreateDemoEventResult =
  | { ok: true; id: string }
  | { ok: false; error: string };

/**
 * Crea una demostración. created_by sale de la sesión autenticada, nunca
 * del formulario.
 */
export async function createDemoEvent(
  supabase: SupabaseClient<Database>,
  createdBy: string | null,
  input: CreateDemoEventInput,
): Promise<CreateDemoEventResult> {
  const { data, error } = await supabase
    .from("demo_events")
    .insert({
      created_by: createdBy,
      title: input.title,
      description: input.description || null,
      demo_type: input.demo_type,
      location: input.location || null,
      scheduled_at: input.scheduled_at,
      capacity: input.capacity,
      notes: input.notes || null,
    })
    .select("id")
    .single();

  if (error || !data) {
    return { ok: false, error: error?.message ?? "No se pudo crear la demo." };
  }

  return { ok: true, id: data.id };
}
