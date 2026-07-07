import { notFound } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { getPublicDemoEventBySlug } from "@/lib/demos/queries";
import { Header } from "@/components/landing/Header";
import { Footer } from "@/components/landing/Footer";
import { PublicDemoRegistrationForm } from "@/components/demos/PublicDemoRegistrationForm";
import { DEMO_MODE_LABELS } from "@/lib/validations/demo-event";
import { formatDemoDate, formatDemoTime } from "@/lib/demos/format";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const supabase = await createClient();
  const demo = await getPublicDemoEventBySlug(supabase, slug);

  return {
    title: demo
      ? `${demo.title} | La Chef que Sí Sabe`
      : "Demostración | La Chef que Sí Sabe",
  };
}

export default async function PublicDemoDetailPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const supabase = await createClient();
  const demo = await getPublicDemoEventBySlug(supabase, slug);

  if (!demo) {
    notFound();
  }

  const location = [demo.location_name, demo.location_address]
    .filter(Boolean)
    .join(", ");

  return (
    <>
      <Header />
      <main className="flex-1">
        <section className="mx-auto max-w-3xl px-6 py-16">
          <div className="flex flex-wrap items-center gap-2">
            <span className="inline-block rounded-full bg-brand-50 px-4 py-1.5 text-sm font-semibold text-brand-700">
              {DEMO_MODE_LABELS[demo.mode]}
            </span>
            <span className="inline-block rounded-full bg-olive-500/20 px-4 py-1.5 text-sm font-semibold text-olive-600">
              Cupos limitados
            </span>
          </div>
          <h1 className="mt-4 font-display text-3xl font-semibold text-emerald-900 sm:text-4xl">
            {demo.title}
          </h1>
          <div className="mt-3 flex flex-col gap-1 text-ink-soft">
            <p className="font-semibold text-ink">
              {formatDemoDate(demo.starts_at)} · {formatDemoTime(demo.starts_at)}
            </p>
            {demo.mode === "in_person" ? (
              location && <p>{location}</p>
            ) : (
              <p>Te compartimos el link para conectarte al confirmar tu registro.</p>
            )}
          </div>

          {demo.description && (
            <p className="mt-6 whitespace-pre-wrap text-ink-soft">
              {demo.description}
            </p>
          )}
          {demo.public_notes && (
            <p className="mt-4 whitespace-pre-wrap text-sm text-ink-soft">
              {demo.public_notes}
            </p>
          )}

          <p className="mt-8 text-sm font-semibold text-brand-700">
            Demos personalizadas, simples y sin compromiso.
          </p>

          <div className="mt-4 rounded-3xl border border-border-soft bg-white-soft p-8 shadow-sm">
            <h2 className="font-display text-xl font-semibold text-emerald-900">
              Reserva tu lugar
            </h2>
            <div className="mt-6">
              <PublicDemoRegistrationForm slug={demo.slug} mode={demo.mode} />
            </div>
          </div>
        </section>
      </main>
      <Footer />
    </>
  );
}
