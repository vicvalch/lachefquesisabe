import { CheckCircleIcon } from "@/components/icons";

const REASONS = [
  "Acompañamiento cercano y personalizado.",
  "Recetas prácticas para el día a día.",
  "Enfoque en cocina real, simple y consciente.",
  "Tips antes, durante y después de tu demo.",
  "Ideas para aprovechar mejor tu Thermomix.",
];

export function About() {
  return (
    <section id="thermomix" className="py-20">
      <div className="mx-auto grid max-w-6xl gap-10 px-6 md:grid-cols-2 md:items-center">
        <div>
          <p className="text-sm font-semibold uppercase tracking-wide text-brand-700">
            Demos y acompañamiento Thermomix
          </p>
          <h2 className="mt-2 font-display text-3xl font-semibold text-emerald-900 sm:text-4xl">
            ¿Por qué cocinar conmigo?
          </h2>
          <p className="mt-4 text-ink-soft">
            Llevo años enseñando a cocinar con Thermomix de forma simple y
            cercana, sin tecnicismos ni presión. Conocé cómo Thermomix puede
            simplificar tu cocina con un acompañamiento pensado para tu día a
            día.
          </p>
        </div>
        <div className="rounded-3xl bg-gradient-to-br from-emerald-900 to-emerald-700 p-8 sm:p-10">
          <p className="font-display text-xl italic text-white/90">
            &ldquo;Cocina rico, fácil y sin complicarte.&rdquo;
          </p>
          <ul className="mt-6 flex flex-col gap-3">
            {REASONS.map((reason) => (
              <li key={reason} className="flex items-start gap-3 text-cream/90">
                <CheckCircleIcon className="mt-0.5 h-5 w-5 shrink-0 text-olive-500" />
                <span>{reason}</span>
              </li>
            ))}
          </ul>
        </div>
      </div>
    </section>
  );
}
