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
    interest: input.interest,
    message: input.message || null,
    consent: input.consent,
    source: "landing",
  });

  if (error) {
    return { ok: false, error: error.message };
  }

  return { ok: true };
}
