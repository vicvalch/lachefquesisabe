import type { SupabaseClient } from "@supabase/supabase-js";
import type { Database } from "@/types/database";
import type { CreateDemoEventInput } from "@/lib/validations/demo-event";
import { generateDemoSlug } from "@/lib/demos/slug";

export type CreateDemoEventResult =
  | { ok: true; id: string; slug: string }
  | { ok: false; error: string };

const UNIQUE_VIOLATION_CODE = "23505";

/**
 * Crea una demostración. created_by sale de la sesión autenticada, nunca
 * del formulario. El slug se genera en el servidor a partir del título;
 * el sufijo aleatorio hace la colisión (y el reintento) extremadamente
 * improbable, pero igual se maneja por si acaso.
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
      slug: generateDemoSlug(input.title),
      description: input.description || null,
      public_notes: input.public_notes || null,
      mode: input.mode,
      location_name: input.location_name || null,
      location_address: input.location_address || null,
      meeting_url: input.meeting_url || null,
      starts_at: input.starts_at,
      ends_at: input.ends_at || null,
      capacity: input.capacity,
      internal_notes: input.internal_notes || null,
    })
    .select("id, slug")
    .single();

  if (error || !data) {
    if (error?.code === UNIQUE_VIOLATION_CODE) {
      return {
        ok: false,
        error: "Ya existe una demo con ese identificador. Intenta de nuevo.",
      };
    }
    return { ok: false, error: error?.message ?? "No se pudo crear la demo." };
  }

  return { ok: true, id: data.id, slug: data.slug };
}
