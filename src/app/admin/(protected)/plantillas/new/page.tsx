import Link from "next/link";
import { CreateMessageTemplateForm } from "@/components/admin/CreateMessageTemplateForm";
import { Card } from "@/components/ui/Card";

export const metadata = {
  title: "Nueva plantilla | Admin | La Chef que Sí Sabe",
};

export default function NewMessageTemplatePage() {
  return (
    <div className="flex flex-col gap-6">
      <Link
        href="/admin/plantillas"
        className="text-sm font-semibold text-brand-700 hover:underline"
      >
        ← Volver a plantillas
      </Link>

      <div>
        <h1 className="font-display text-2xl font-semibold text-ink">
          Nueva plantilla de mensaje
        </h1>
        <p className="mt-1 text-sm text-ink-soft">
          La clave no se puede cambiar después de crearla.
        </p>
      </div>

      <Card className="max-w-2xl">
        <CreateMessageTemplateForm />
      </Card>
    </div>
  );
}
