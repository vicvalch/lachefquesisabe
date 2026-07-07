import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import { listMessageTemplates } from "@/lib/message-templates/queries";
import { MessageTemplatesTable } from "@/components/admin/MessageTemplatesTable";
import { Button } from "@/components/ui/Button";

export const metadata = {
  title: "Plantillas de mensaje | Admin | La Chef que Sí Sabe",
};

export default async function MessageTemplatesPage() {
  const supabase = await createClient();
  const templates = await listMessageTemplates(supabase);

  return (
    <div className="flex flex-col gap-6">
      <div className="flex flex-wrap items-start justify-between gap-4">
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
        <Link href="/admin/plantillas/new">
          <Button type="button">+ Nueva plantilla</Button>
        </Link>
      </div>

      <MessageTemplatesTable templates={templates} />
    </div>
  );
}
