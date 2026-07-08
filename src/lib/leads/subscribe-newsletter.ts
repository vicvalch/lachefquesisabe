import type { SupabaseClient } from "@supabase/supabase-js";
import type { Database } from "@/types/database";
import type { NewsletterSubscribeInput } from "@/lib/validations/newsletter";

export type SubscribeNewsletterResult = { ok: true } | { ok: false; error: string };

/**
 * Inserta un lead desde el formulario de suscripción a recetas ("Quiero mis
 * recetas"). Reutiliza la tabla leads (no hay tabla aparte de
 * newsletter_subscribers): primary_interest se fija a "easy_recipes" (el
 * valor del enum existente más cercano a "recetas") y tags identifica el
 * origen para poder segmentarlo después en el admin.
 */
export async function subscribeNewsletterLead(
  supabase: SupabaseClient<Database>,
  input: NewsletterSubscribeInput,
): Promise<SubscribeNewsletterResult> {
  const { error } = await supabase.from("leads").insert({
    name: input.full_name,
    email: input.email,
    phone: input.phone || null,
    primary_interest: "easy_recipes",
    message: null,
    consent_contact: input.consent_contact,
    source: "landing",
    tags: ["recipes", "newsletter"],
  });

  if (error) {
    return { ok: false, error: "No pudimos guardar tu suscripción. Intenta de nuevo." };
  }

  return { ok: true };
}
