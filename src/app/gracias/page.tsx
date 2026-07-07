import Link from "next/link";
import { Header } from "@/components/landing/Header";
import { Footer } from "@/components/landing/Footer";
import { buttonClasses } from "@/components/ui/Button";

export const metadata = {
  title: "¡Gracias! | La Chef que Sí Sabe",
  robots: { index: false },
};

export default async function GraciasPage({
  searchParams,
}: {
  searchParams: Promise<{ demo?: string }>;
}) {
  const { demo } = await searchParams;

  return (
    <>
      <Header />
      <main className="flex-1">
        <section className="mx-auto flex max-w-2xl flex-col items-center gap-6 px-6 py-24 text-center">
          <p className="rounded-full bg-olive-500/15 px-4 py-1.5 text-sm font-semibold text-olive-600">
            ¡Listo!
          </p>
          <h1 className="font-display text-3xl font-semibold text-ink sm:text-4xl">
            {demo ? "Gracias por registrarte" : "Gracias por escribirnos"}
          </h1>
          <p className="text-lg text-ink-soft">
            {demo
              ? "¡Gracias! Ya recibimos tu registro para la demostración. Pronto te vamos a contactar para confirmar los detalles."
              : "Recibimos tus datos y te contactaremos muy pronto para contarte más sobre recetas, demos de cocina y demostraciones de Thermomix."}
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
