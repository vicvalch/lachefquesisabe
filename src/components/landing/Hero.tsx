import { buttonClasses } from "@/components/ui/Button";

export function Hero() {
  return (
    <section className="relative overflow-hidden bg-cream">
      <div className="mx-auto flex max-w-6xl flex-col items-start gap-6 px-6 py-20 sm:py-28">
        <p className="rounded-full bg-brand-100 px-4 py-1.5 text-sm font-semibold text-brand-700">
          Recetas · Demostraciones · Thermomix
        </p>
        <h1 className="font-display text-4xl font-semibold leading-tight text-ink sm:text-5xl md:text-6xl">
          Cocina rico, fácil
          <br className="hidden sm:block" /> y sin complicarte.
        </h1>
        <p className="max-w-xl text-lg text-ink-soft">
          Soy la chef que sí sabe: te acompaño paso a paso con recetas
          prácticas, tips de cocina y demostraciones en vivo con Thermomix,
          para que disfrutes cocinar sin estrés.
        </p>
        <div className="flex flex-wrap gap-4 pt-2">
          <a href="#contacto" className={buttonClasses("primary")}>
            Quiero mis recetas gratis
          </a>
          <a href="#thermomix" className={buttonClasses("ghost")}>
            Ver demostraciones
          </a>
        </div>
      </div>
    </section>
  );
}
