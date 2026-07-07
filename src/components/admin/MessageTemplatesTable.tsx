import Link from "next/link";
import type { MessageTemplateRow } from "@/types/database";

export function MessageTemplatesTable({
  templates,
}: {
  templates: MessageTemplateRow[];
}) {
  if (templates.length === 0) {
    return (
      <p className="rounded-2xl border border-dashed border-ink/20 p-8 text-center text-ink-soft">
        Todavía no hay plantillas. Crea la primera para empezar a sugerir
        mensajes desde el Centro de Seguimientos.
      </p>
    );
  }

  return (
    <div className="overflow-x-auto rounded-2xl border border-ink/10 bg-white">
      <table className="min-w-full divide-y divide-ink/10 text-sm">
        <thead className="bg-cream-dark/50 text-left text-xs font-semibold uppercase tracking-wide text-ink-soft">
          <tr>
            <th className="px-4 py-3">Nombre</th>
            <th className="px-4 py-3">Clave</th>
            <th className="px-4 py-3">Estado</th>
            <th className="px-4 py-3" />
          </tr>
        </thead>
        <tbody className="divide-y divide-ink/10">
          {templates.map((template) => (
            <tr key={template.id} className="hover:bg-cream-dark/30">
              <td className="px-4 py-3 font-medium text-ink">
                <Link
                  href={`/admin/plantillas/${template.id}`}
                  className="hover:text-brand-700 hover:underline"
                >
                  {template.label}
                </Link>
              </td>
              <td className="px-4 py-3 text-ink-soft">
                <code className="text-xs">{template.key}</code>
              </td>
              <td className="px-4 py-3">
                <span
                  className={
                    template.is_active
                      ? "inline-flex items-center rounded-full bg-olive-500/25 px-3 py-1 text-xs font-semibold text-olive-600"
                      : "inline-flex items-center rounded-full bg-ink/15 px-3 py-1 text-xs font-semibold text-ink-soft"
                  }
                >
                  {template.is_active ? "Activa" : "Inactiva"}
                </span>
              </td>
              <td className="px-4 py-3 text-right">
                <Link
                  href={`/admin/plantillas/${template.id}`}
                  className="text-sm font-semibold text-brand-700 hover:underline"
                >
                  Editar
                </Link>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
