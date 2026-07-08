import Link from "next/link";
import { buttonClasses } from "@/components/ui/Button";
import { ClockIcon, ChefHatIcon, LeafIcon, ScreenIcon } from "@/components/icons";

const QUICK_HIGHLIGHTS = [
  { icon: ClockIcon, label: "Ahorra tiempo en la cocina" },
  { icon: ChefHatIcon, label: "Demos guiadas paso a paso" },
  { icon: LeafIcon, label: "Recetas naturales y simples" },
];

export function Hero() {
  return (
    <section className="relative overflow-hidden bg-gradient-to-b from-emerald-900 to-emerald-700">
      <div className="mx-auto grid max-w-6xl gap-10 px-6 pb-28 pt-16 sm:pb-32 sm:pt-24 lg:grid-cols-[1.1fr_0.9fr] lg:items-center lg:gap-12">
        <div className="flex flex-col items-start gap-6">
          <span className="inline-flex items-center rounded-full border border-white/15 bg-white/10 px-4 py-1.5 text-sm font-semibold text-white/90">
            María Checa Arias-Schreiber · Agente autorizada Thermomix · Costa Rica
          </span>
          <h1 className="font-display text-4xl font-semibold leading-tight text-white sm:text-5xl md:text-6xl">
            Cocina rico, fácil
            <br className="hidden sm:block" /> y{" "}
            <em className="italic">sin complicarte</em>.
          </h1>
          <p className="max-w-xl text-lg text-cream/85">
            Soy María, la chef que sí sabe. Suscríbete y recibe mis recetas,
            mira mis videos de cocina y descubre cómo la Thermomix puede
            transformar tu día a día.
          </p>
          <div className="flex flex-wrap gap-3 pt-2">
            <a href="#recetas-newsletter" className={buttonClasses("primary")}>
              Quiero mis recetas
            </a>
            <a href="#videos" className={buttonClasses("outline", "gap-2")}>
              <ScreenIcon className="h-4 w-4" />
              Ver recetas en video
            </a>
            <Link href="/demos" className={buttonClasses("outline")}>
              Quiero una demo de Thermomix
            </Link>
          </div>
        </div>

        <div className="relative w-full">
          <div className="overflow-hidden rounded-3xl border border-white/15 bg-white/5 p-2 shadow-xl backdrop-blur-sm sm:p-3">
            <div className="relative overflow-hidden rounded-2xl">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src="/assets/thermomix.jpeg"
                alt="Thermomix en una cocina, lista para preparar tus recetas favoritas"
                loading="eager"
                fetchPriority="high"
                className="aspect-[4/3] w-full object-cover"
              />
              <span className="absolute bottom-3 left-3 inline-flex items-center rounded-full bg-white/95 px-3 py-1.5 text-xs font-semibold text-emerald-900 shadow-md sm:bottom-4 sm:left-4 sm:text-sm">
                Demo personalizada de Thermomix
              </span>
            </div>
          </div>
        </div>
      </div>

      <div className="relative mx-auto -mt-16 max-w-6xl px-6 sm:-mt-20">
        <div className="grid gap-4 sm:grid-cols-3">
          {QUICK_HIGHLIGHTS.map(({ icon: Icon, label }) => (
            <div
              key={label}
              className="flex items-center gap-3 rounded-2xl border border-border-soft bg-white-soft p-5 shadow-md"
            >
              <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-brand-50 text-brand-700">
                <Icon className="h-5 w-5" />
              </span>
              <p className="text-sm font-semibold text-ink">{label}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
