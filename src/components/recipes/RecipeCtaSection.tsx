import Link from "next/link";
import { buttonClasses } from "@/components/ui/Button";

export function RecipeCtaSection({ message }: { message?: string | null }) {
  return (
    <div className="mt-10 rounded-3xl border border-ink/10 bg-white p-8 text-center shadow-sm">
      <h2 className="font-display text-xl font-semibold text-ink">
        {message || "¿Te gustó? Sigamos cocinando juntas."}
      </h2>
      <p className="mt-2 text-ink-soft">
        Reserva tu lugar en una demo en vivo o déjanos tus datos y te
        contactamos.
      </p>
      <div className="mt-6 flex flex-wrap justify-center gap-3">
        <Link href="/demos" className={buttonClasses("primary", "px-6 py-3 text-sm")}>
          Registrarme a una demo
        </Link>
        <Link href="/#contacto" className={buttonClasses("secondary", "px-6 py-3 text-sm")}>
          Dejar mis datos
        </Link>
        <Link href="/recetas" className={buttonClasses("ghost", "px-6 py-3 text-sm")}>
          Seguir aprendiendo
        </Link>
      </div>
    </div>
  );
}
