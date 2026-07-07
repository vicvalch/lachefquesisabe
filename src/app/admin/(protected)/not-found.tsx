import Link from "next/link";
import { buttonClasses } from "@/components/ui/Button";

export default function AdminNotFound() {
  return (
    <div className="flex flex-col items-center gap-4 rounded-3xl border border-dashed border-ink/20 bg-white p-12 text-center">
      <p className="rounded-full bg-brand-500/15 px-4 py-1.5 text-sm font-semibold text-brand-700">
        404
      </p>
      <h1 className="font-display text-xl font-semibold text-ink">
        No encontramos esta página
      </h1>
      <p className="max-w-md text-sm text-ink-soft">
        Puede que el enlace esté mal escrito o que el registro ya no exista.
        Volvé al dashboard para seguir trabajando.
      </p>
      <Link href="/admin/dashboard" className={buttonClasses("primary")}>
        Ir al dashboard
      </Link>
    </div>
  );
}
