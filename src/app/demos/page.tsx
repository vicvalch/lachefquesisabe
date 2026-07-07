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
        <section className="mx-auto max-w-5xl px-6 py-16">
          <div className="text-center">
            <h1 className="font-display text-3xl font-semibold text-ink sm:text-4xl">
              Próximas demostraciones
            </h1>
            <p className="mt-3 text-ink-soft">
              Reserva tu lugar en la próxima demo presencial o virtual.
            </p>
          </div>

          <div className="mt-12">
            {demos.length === 0 ? (
              <p className="rounded-3xl border border-dashed border-ink/20 p-10 text-center text-ink-soft">
                Pronto tendremos nuevas demostraciones. Dejá tus datos en la
                página principal y te avisamos.
              </p>
            ) : (
              <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
                {demos.map((demo) => (
                  <DemoCard key={demo.id} demo={demo} />
                ))}
              </div>
            )}
          </div>
        </section>
      </main>
      <Footer />
    </>
  );
}
