import type { SupabaseClient } from "@supabase/supabase-js";
import type { Database } from "@/types/database";
import type { CreateLeadInput } from "@/lib/validations/lead";

export type CreateLeadResult =
  | { ok: true }
  | { ok: false; error: string };

/**
 * Inserta un lead validado. Recibe el cliente de Supabase por parámetro
 * para poder inyectar un mock en tests sin tocar la red.
 */
export async function createLead(
  supabase: SupabaseClient<Database>,
  input: CreateLeadInput,
): Promise<CreateLeadResult> {
  const { error } = await supabase.from("leads").insert({
    name: input.name,
    email: input.email,
    phone: input.phone || null,
    primary_interest: input.primary_interest,
    message: input.message || null,
    consent_contact: input.consent_contact,
    source: "landing",
  });

  if (error) {
    return { ok: false, error: "No pudimos guardar tu información. Intenta de nuevo." };
  }

  return { ok: true };
}
