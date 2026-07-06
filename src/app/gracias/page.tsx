import Link from "next/link";
import { Header } from "@/components/landing/Header";
import { Footer } from "@/components/landing/Footer";
import { buttonClasses } from "@/components/ui/Button";

export const metadata = {
  title: "¡Gracias! | La Chef que Sí Sabe",
  robots: { index: false },
};

export default function GraciasPage() {
  return (
    <>
      <Header />
      <main className="flex-1">
        <section className="mx-auto flex max-w-2xl flex-col items-center gap-6 px-6 py-24 text-center">
          <p className="rounded-full bg-olive-500/15 px-4 py-1.5 text-sm font-semibold text-olive-600">
            ¡Listo!
          </p>
          <h1 className="font-display text-3xl font-semibold text-ink sm:text-4xl">
            Gracias por escribirnos
          </h1>
          <p className="text-lg text-ink-soft">
            Recibimos tus datos y te contactaremos muy pronto para contarte
            más sobre recetas, demos de cocina y demostraciones de
            Thermomix.
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
