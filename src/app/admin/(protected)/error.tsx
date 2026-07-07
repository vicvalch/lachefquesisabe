"use client";

import { useEffect } from "react";
import { buttonClasses } from "@/components/ui/Button";

export default function AdminErrorBoundary({
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
    <div className="flex flex-col items-center gap-4 rounded-3xl border border-dashed border-ink/20 bg-white p-12 text-center">
      <p className="rounded-full bg-brand-500/15 px-4 py-1.5 text-sm font-semibold text-brand-700">
        Ups
      </p>
      <h1 className="font-display text-xl font-semibold text-ink">
        Algo salió mal
      </h1>
      <p className="max-w-md text-sm text-ink-soft">
        Tuvimos un problema al cargar esta sección del panel. Intentá de
        nuevo en unos segundos.
      </p>
      <button
        type="button"
        onClick={() => unstable_retry()}
        className={buttonClasses("primary")}
      >
        Intentar de nuevo
      </button>
    </div>
  );
}
