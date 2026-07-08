import Link from "next/link";
import { buttonClasses } from "@/components/ui/Button";
import { CheckCircleIcon } from "@/components/icons";

const HIGHLIGHTS = [
  "Postres peruanos y recetas con historia",
  "Cocina saludable, sin gluten y consciente del azúcar",
  "Diseño funcional de cocinas y áreas de trabajo",
  "Sabor real: nunca “comida de dieta”",
  "Recetas afinadas y perfeccionadas con su Thermomix",
];

export function HeroMariaSlide() {
  return (
    <div className="mx-auto grid max-w-6xl gap-10 px-6 py-16 sm:py-24 lg:grid-cols-[1.1fr_0.9fr] lg:items-center lg:gap-12">
      <div className="flex flex-col items-start gap-6">
        <span className="inline-flex items-center rounded-full border border-white/15 bg-white/10 px-4 py-1.5 text-sm font-semibold uppercase tracking-wide text-white/90">
          Sobre María
        </span>
        <h2 className="font-display text-4xl font-semibold leading-tight text-white sm:text-5xl md:text-6xl">
          La historia detrás de{" "}
          <em className="italic">La Chef que Sí Sabe</em>
        </h2>
        <p className="max-w-xl text-lg text-cream/85">
          María Checa Arias-Schreiber lleva toda una vida cocinando,
          enseñando y perfeccionando recetas con cariño y sentido práctico.
          Peruana de nacimiento, conserva un amor especial por los sabores de
          su tierra, en especial por los postres peruanos. Antes de
          dedicarse de lleno a la cocina, estudió diseño del espacio interno
          y acompañó a restaurantes y cocinas industriales a organizar sus
          áreas de trabajo de forma más funcional.
        </p>
        <p className="max-w-xl text-lg text-cream/85">
          Hoy sigue preparando las recetas de toda su vida, con una mirada
          más saludable: sin gluten, atenta a las alergias y con menos
          azúcar — siempre deliciosa, nunca aburrida. Desde que incorporó su
          Thermomix y se convirtió en agente autorizada, no ha dejado de
          descubrir y perfeccionar cada receta con esta poderosa
          herramienta.
        </p>
        <div className="flex flex-wrap gap-3 pt-2">
          <a href="#recetas-newsletter" className={buttonClasses("primary")}>
            Quiero mis recetas
          </a>
          <Link href="/demos" className={buttonClasses("outline")}>
            Quiero una demo de Thermomix
          </Link>
        </div>
      </div>

      <div className="relative w-full">
        <div className="rounded-3xl border border-white/15 bg-white/10 p-8 shadow-xl backdrop-blur-sm sm:p-10">
          <p className="font-display text-xl italic text-white/90">
            &ldquo;Aprendí que cocinar sabroso y cocinar sano pueden ser lo
            mismo.&rdquo;
          </p>
          <p className="mt-2 text-sm font-semibold text-cream/70">
            — María Checa Arias-Schreiber
          </p>
          <ul className="mt-6 flex flex-col gap-3 border-t border-white/10 pt-6">
            {HIGHLIGHTS.map((highlight) => (
              <li
                key={highlight}
                className="flex items-start gap-3 text-cream/90"
              >
                <CheckCircleIcon className="mt-0.5 h-5 w-5 shrink-0 text-olive-500" />
                <span>{highlight}</span>
              </li>
            ))}
          </ul>
        </div>
      </div>
    </div>
  );
}
