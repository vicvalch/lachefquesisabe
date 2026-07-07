import Link from "next/link";
import { notFound } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { getMessageTemplateById } from "@/lib/message-templates/queries";
import { MessageTemplateForm } from "@/components/admin/MessageTemplateForm";
import { Card } from "@/components/ui/Card";

export const metadata = {
  title: "Editar plantilla | Admin | La Chef que Sí Sabe",
};

export default async function EditMessageTemplatePage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const supabase = await createClient();
  const template = await getMessageTemplateById(supabase, id);

  if (!template) {
    notFound();
  }

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
          Editar plantilla
        </h1>
        <p className="mt-1 text-sm text-ink-soft">
          El nombre y el mensaje son lo único editable; la clave se mantiene
          fija porque el código la usa para sugerir esta plantilla.
        </p>
      </div>

      <Card className="max-w-2xl">
        <MessageTemplateForm template={template} />
      </Card>
    </div>
  );
}
