import { randomUUID } from "node:crypto";
import type { SupabaseClient } from "@supabase/supabase-js";
import type { Database, DemoEventStatus } from "@/types/database";
import type { PublicDemoRegistrationInput } from "@/lib/validations/public-demo-registration";
import { PUBLIC_DEMO_EVENT_STATUSES } from "@/lib/validations/demo-event";

export type RegisterPublicLeadForDemoResult =
  | { ok: true }
  | { ok: false; error: string };

/**
 * Registro público a una demo (sin sesión, desde /demos/[slug]). Crea un
 * lead nuevo con status = "confirmed_demo" y su inscripción con
 * attendance_status = "confirmed". El payload público nunca puede setear
 * status, created_by ni notas internas: se construyen explícitamente acá,
 * nunca se reenvía el input completo. Todavía no hay deduplicación contra
 * leads existentes: cada registro crea una fila nueva en `leads`, aunque
 * el mismo email/teléfono ya exista.
 *
 * Las validaciones de status/fecha son defensa en profundidad: la policy
 * RLS pública de `demo_events` ya solo deja ver demos "scheduled"/"full"
 * con `starts_at` futuro, así que en producción casi siempre se resuelven
 * acá como "no encontramos esa demostración".
 */
export async function registerPublicLeadForDemo(
  supabase: SupabaseClient<Database>,
  slug: string,
  input: PublicDemoRegistrationInput,
): Promise<RegisterPublicLeadForDemoResult> {
  const { data: demo, error: demoError } = await supabase
    .from("demo_events")
    .select("id, status, starts_at")
    .eq("slug", slug)
    .maybeSingle();

  if (demoError || !demo) {
    return { ok: false, error: "No encontramos esa demostración." };
  }

  if (
    !PUBLIC_DEMO_EVENT_STATUSES.includes(demo.status as DemoEventStatus)
  ) {
    return {
      ok: false,
      error: "Esta demostración ya no está disponible para registro.",
    };
  }

  if (new Date(demo.starts_at).getTime() < Date.now()) {
    return { ok: false, error: "Esta demostración ya pasó." };
  }

  // Se genera el id en la aplicación (en vez de encadenar .select() tras el
  // insert): "anon" no tiene policy de SELECT sobre `leads`, y
  // `.insert().select()` le pide a PostgREST la fila insertada de vuelta
  // (RETURNING), lo que Postgres evalúa contra esa misma policy de SELECT
  // inexistente y hace fallar el insert entero por RLS.
  const leadId = randomUUID();

  const { error: leadError } = await supabase.from("leads").insert({
    id: leadId,
    name: input.name,
    email: input.email || null,
    phone: input.phone,
    primary_interest: input.primary_interest,
    message: input.message || null,
    consent_contact: input.consent_contact,
    source: "demo",
    status: "confirmed_demo",
  });

  if (leadError) {
    return { ok: false, error: "No pudimos registrar tus datos. Intenta de nuevo." };
  }

  const { error: registrationError } = await supabase
    .from("demo_registrations")
    .insert({
      demo_event_id: demo.id,
      lead_id: leadId,
      attendance_status: "confirmed",
    });

  if (registrationError) {
    return { ok: false, error: "No pudimos completar tu registro a la demo. Intenta de nuevo." };
  }

  return { ok: true };
}
