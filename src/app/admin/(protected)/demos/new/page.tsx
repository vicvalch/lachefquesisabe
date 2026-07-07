import Link from "next/link";
import { DemoEventForm } from "@/components/admin/DemoEventForm";
import { Card } from "@/components/ui/Card";

export const metadata = {
  title: "Nueva demo | Admin | La Chef que Sí Sabe",
};

export default function NewDemoPage() {
  return (
    <div className="flex flex-col gap-6">
      <Link
        href="/admin/demos"
        className="text-sm font-semibold text-brand-700 hover:underline"
      >
        ← Volver a demos
      </Link>

      <div>
        <h1 className="font-display text-2xl font-semibold text-ink">
          Crear demo
        </h1>
        <p className="mt-1 text-sm text-ink-soft">
          Define el cupo y el horario; después podrás agregar leads e ir
          marcando su asistencia.
        </p>
      </div>

      <Card className="max-w-2xl">
        <DemoEventForm />
      </Card>
    </div>
  );
}
