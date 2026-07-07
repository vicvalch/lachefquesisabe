import { createClient } from "@/lib/supabase/server";
import { listPublicUpcomingDemoEvents } from "@/lib/demos/queries";
import { Header } from "@/components/landing/Header";
import { Footer } from "@/components/landing/Footer";
import { DemoCard } from "@/components/demos/DemoCard";

export const metadata = {
  title: "Demostraciones | La Chef que Sí Sabe",
};

export default async function PublicDemosPage() {
  const supabase = await createClient();
  const demos = await listPublicUpcomingDemoEvents(supabase);

  return (
    <>
      <Header />
      <main className="flex-1">
        <section className="bg-gradient-to-b from-emerald-900 to-emerald-700 px-6 py-16 text-center">
          <h1 className="font-display text-3xl font-semibold text-white sm:text-4xl">
            Próximas demostraciones
          </h1>
          <p className="mx-auto mt-3 max-w-xl text-cream/85">
            Demos personalizadas, simples y sin compromiso. Reserva tu lugar
            en la próxima demo presencial o virtual.
          </p>
        </section>

        <section className="mx-auto max-w-5xl px-6 py-16">
          {demos.length === 0 ? (
            <p className="rounded-3xl border border-dashed border-border p-10 text-center text-ink-soft">
              Todavía no hay demos programadas. Pronto publicaremos nuevas
              fechas. También podés escribirnos por WhatsApp para coordinar
              una demo personalizada.
            </p>
          ) : (
            <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
              {demos.map((demo) => (
                <DemoCard key={demo.id} demo={demo} />
              ))}
            </div>
          )}
        </section>
      </main>
      <Footer />
    </>
  );
}
