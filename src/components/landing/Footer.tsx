import Link from "next/link";
import { Logo } from "@/components/brand/Logo";

export function Footer() {
  return (
    <footer className="border-t border-border-soft bg-cream-dark/60 py-10">
      <div className="mx-auto flex max-w-6xl flex-col items-start gap-4 px-6 sm:flex-row sm:items-center sm:justify-between">
        <Logo />
        <div className="text-sm text-ink-soft">
          <p>@lachefquesisabe</p>
          <p>&copy; {new Date().getFullYear()} La Chef que Sí Sabe. Todos los derechos reservados.</p>
          <p>
            <Link href="/privacidad" className="underline hover:text-brand-700">
              Política de privacidad
            </Link>
          </p>
        </div>
      </div>
      <p className="mx-auto mt-6 max-w-6xl px-6 text-xs text-ink-soft/70">
        Thermomix® es una marca registrada de Vorwerk. La Chef que Sí Sabe no
        tiene afiliación oficial con Vorwerk salvo que se indique lo
        contrario.
      </p>
    </footer>
  );
}
