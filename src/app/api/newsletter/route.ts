import { NextResponse } from "next/server";
import {
  newsletterSubscribeInputSchema,
  newsletterSubscribeSchema,
} from "@/lib/validations/newsletter";
import { subscribeNewsletterLead } from "@/lib/leads/subscribe-newsletter";
import { createClient } from "@/lib/supabase/server";

export async function POST(request: Request) {
  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json(
      { ok: false, error: "Cuerpo de la solicitud inválido." },
      { status: 400 },
    );
  }

  const parsed = newsletterSubscribeSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json(
      {
        ok: false,
        error: "Revisa los datos del formulario.",
        fieldErrors: parsed.error.flatten().fieldErrors,
      },
      { status: 422 },
    );
  }

  // Honeypot: si el campo trampa viene con contenido, es un bot.
  // Respondemos éxito sin escribir en la base para no delatar el filtro.
  if (parsed.data.website) {
    return NextResponse.json({ ok: true });
  }

  const input = newsletterSubscribeInputSchema.parse(parsed.data);

  const supabase = await createClient();
  const result = await subscribeNewsletterLead(supabase, input);

  if (!result.ok) {
    console.error("Error al guardar suscripción a recetas:", result.error);
    return NextResponse.json(
      { ok: false, error: "No pudimos guardar tu suscripción. Intenta de nuevo." },
      { status: 500 },
    );
  }

  return NextResponse.json({ ok: true });
}
