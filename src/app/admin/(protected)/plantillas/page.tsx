import { createClient } from "@/lib/supabase/server";
import { listMessageTemplates } from "@/lib/message-templates/queries";
import { MessageTemplateForm } from "@/components/admin/MessageTemplateForm";

export const metadata = {
  title: "Plantillas de mensaje | Admin | La Chef que Sí Sabe",
};

export default async function MessageTemplatesPage() {
  const supabase = await createClient();
  const templates = await listMessageTemplates(supabase);

  return (
    <div className="flex flex-col gap-6">
      <div>
        <h1 className="font-display text-2xl font-semibold text-ink">
          Plantillas de mensaje
        </h1>
        <p className="mt-1 text-sm text-ink-soft">
          Estos son los mensajes sugeridos que aparecen al copiar o abrir
          WhatsApp desde el Centro de Seguimientos y el detalle de un lead.
          Desactiva una plantilla para que deje de sugerirse sin borrarla.
        </p>
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        {templates.map((template) => (
          <MessageTemplateForm key={template.id} template={template} />
        ))}
      </div>
    </div>
  );
}
