"use client";

import { useEffect } from "react";
import Link from "next/link";
import { Header } from "@/components/landing/Header";
import { Footer } from "@/components/landing/Footer";
import { buttonClasses } from "@/components/ui/Button";

export default function GlobalErrorBoundary({
  error,
  unstable_retry,
}: {
  error: Error & { digest?: string };
  unstable_retry: () => void;
}) {
  useEffect(() => {
    console.error(error);
  }, [error]);

  return (
    <>
      <Header />
      <main className="flex-1">
        <section className="mx-auto flex max-w-2xl flex-col items-center gap-6 px-6 py-24 text-center">
          <p className="rounded-full bg-brand-500/15 px-4 py-1.5 text-sm font-semibold text-brand-700">
            Ups
          </p>
          <h1 className="font-display text-3xl font-semibold text-ink sm:text-4xl">
            Algo salió mal
          </h1>
          <p className="text-lg text-ink-soft">
            Tuvimos un problema al cargar esta página. Intentá de nuevo en
            unos segundos.
          </p>
          <div className="flex flex-wrap items-center justify-center gap-3">
            <button
              type="button"
              onClick={() => unstable_retry()}
              className={buttonClasses("primary")}
            >
              Intentar de nuevo
            </button>
            <Link href="/" className={buttonClasses("ghost")}>
              Volver al inicio
            </Link>
          </div>
        </section>
      </main>
      <Footer />
    </>
  );
}
