import Link from "next/link";
import { Header } from "@/components/landing/Header";
import { Footer } from "@/components/landing/Footer";
import { buttonClasses } from "@/components/ui/Button";

export const metadata = {
  title: "Página no encontrada | La Chef que Sí Sabe",
  robots: { index: false },
};

export default function NotFound() {
  return (
    <>
      <Header />
      <main className="flex-1">
        <section className="mx-auto flex max-w-2xl flex-col items-center gap-6 px-6 py-24 text-center">
          <p className="rounded-full bg-brand-500/15 px-4 py-1.5 text-sm font-semibold text-brand-700">
            404
          </p>
          <h1 className="font-display text-3xl font-semibold text-ink sm:text-4xl">
            No encontramos esta página
          </h1>
          <p className="text-lg text-ink-soft">
            Puede que el enlace esté mal escrito o que la página ya no
            exista. Volvé al inicio para seguir navegando.
          </p>
          <Link href="/" className={buttonClasses("primary")}>
            Volver al inicio
          </Link>
        </section>
      </main>
      <Footer />
    </>
  );
}
