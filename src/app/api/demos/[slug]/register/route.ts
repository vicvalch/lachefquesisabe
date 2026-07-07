import { NextResponse } from "next/server";
import {
  publicDemoRegistrationFormSchema,
  publicDemoRegistrationInputSchema,
} from "@/lib/validations/public-demo-registration";
import { registerPublicLeadForDemo } from "@/lib/demos/public-register";
import { createClient } from "@/lib/supabase/server";

export async function POST(
  request: Request,
  { params }: { params: Promise<{ slug: string }> },
) {
  const { slug } = await params;

  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json(
      { ok: false, error: "Cuerpo de la solicitud inválido." },
      { status: 400 },
    );
  }

  const parsed = publicDemoRegistrationFormSchema.safeParse(body);
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

  const input = publicDemoRegistrationInputSchema.parse(parsed.data);

  const supabase = await createClient();
  const result = await registerPublicLeadForDemo(supabase, slug, input);

  if (!result.ok) {
    console.error("Error al registrar a la demo:", result.error);
    return NextResponse.json({ ok: false, error: result.error }, { status: 400 });
  }

  return NextResponse.json({ ok: true });
}
