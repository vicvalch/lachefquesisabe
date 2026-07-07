import { LeadForm } from "@/components/landing/LeadForm";

export function LeadFormSection() {
  return (
    <section id="contacto" className="bg-cream-dark/60 py-20">
      <div className="mx-auto max-w-3xl px-6">
        <div className="text-center">
          <h2 className="font-display text-3xl font-semibold text-emerald-900 sm:text-4xl">
            Recibe recetas y entérate de la próxima demostración
          </h2>
          <p className="mt-3 text-ink-soft">
            Déjame tus datos y te contacto para contarte más.
          </p>
        </div>
        <div className="mt-10 rounded-3xl border border-border-soft bg-white-soft p-8 shadow-sm">
          <LeadForm />
        </div>
      </div>
    </section>
  );
}
