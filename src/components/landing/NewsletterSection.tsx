import { NewsletterForm } from "@/components/landing/NewsletterForm";
import { BookIcon } from "@/components/icons";

export function NewsletterSection() {
  return (
    <section id="recetas-newsletter" className="px-6 py-20">
      <div className="mx-auto max-w-3xl">
        <div className="text-center">
          <span className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-brand-50 text-brand-700">
            <BookIcon className="h-6 w-6" />
          </span>
          <h2 className="mt-4 font-display text-3xl font-semibold text-emerald-900 sm:text-4xl">
            Quiero mis recetas
          </h2>
          <p className="mx-auto mt-3 max-w-xl text-ink-soft">
            Suscríbete y recibe recetas fáciles, tips de cocina y aviso de
            nuevas demostraciones directo de María Checa Arias-Schreiber.
          </p>
        </div>
        <div className="mt-10 rounded-3xl border border-border-soft bg-white-soft p-8 shadow-md sm:p-10">
          <NewsletterForm />
        </div>
      </div>
    </section>
  );
}
