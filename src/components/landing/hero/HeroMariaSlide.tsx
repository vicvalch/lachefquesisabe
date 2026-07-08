import Link from "next/link";
import { buttonClasses } from "@/components/ui/Button";

export function HeroMariaSlide() {
  return (
    <div className="mx-auto grid max-w-6xl gap-10 px-6 py-16 sm:py-20 lg:grid-cols-[1.1fr_0.9fr] lg:items-center lg:gap-12">
      <div className="flex flex-col items-start gap-6">
        <span className="inline-flex items-center rounded-full border border-white/15 bg-white/10 px-4 py-1.5 text-sm font-semibold uppercase tracking-wide text-white/90">
          Sobre María
        </span>
        <h2 className="font-display text-3xl font-semibold leading-tight text-white sm:text-4xl md:text-5xl">
          La historia detrás de{" "}
          <em className="italic">La Chef que Sí Sabe</em>
        </h2>
        <p className="max-w-xl text-lg text-cream/85">
          María Checa Arias-Schreiber cocina desde la memoria, la tradición
          peruana y una mirada saludable que no sacrifica el sabor.
        </p>
        <div className="flex flex-wrap gap-3 pt-2">
          <Link href="/historia" className={buttonClasses("primary")}>
            Leer la historia completa
          </Link>
          <a href="#recetas-newsletter" className={buttonClasses("outline")}>
            Quiero mis recetas
          </a>
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
        </div>
      </div>
    </div>
  );
}
