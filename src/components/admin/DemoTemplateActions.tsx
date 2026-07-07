"use client";

import { useMemo, useState } from "react";
import { buttonClasses } from "@/components/ui/Button";
import { cn } from "@/lib/utils";
import { buildWhatsAppUrl } from "@/lib/whatsapp/templates";
import { buildTemplateContext, renderMessageTemplate } from "@/lib/message-templates/render";
import type {
  AttendanceStatus,
  DemoEventRow,
  LeadRow,
  MessageTemplateRow,
} from "@/types/database";

const DEFAULT_TEMPLATE_KEY_BY_ATTENDANCE: Record<AttendanceStatus, string> = {
  registered: "invitacion_demo",
  confirmed: "recordatorio_demo",
  attended: "post_demo",
  no_show: "reagendar",
  cancelled: "invitacion_demo",
};

const DEMO_TEMPLATE_KEYS = [
  "invitacion_demo",
  "recordatorio_demo",
  "post_demo",
  "reagendar",
];

/**
 * Copiar/abrir plantillas de mensaje para una demo específica. No usa la
 * API de WhatsApp: solo copia al portapapeles o abre un link wa.me, igual
 * que MessageTemplatePicker en el detalle de lead.
 */
export function DemoTemplateActions({
  lead,
  demo,
  attendanceStatus,
  templates,
}: {
  lead: LeadRow;
  demo: DemoEventRow;
  attendanceStatus: AttendanceStatus;
  templates: MessageTemplateRow[];
}) {
  const demoTemplates = useMemo(
    () =>
      templates.filter(
        (template) => template.is_active && DEMO_TEMPLATE_KEYS.includes(template.key),
      ),
    [templates],
  );
  const context = useMemo(() => buildTemplateContext(lead, demo), [lead, demo]);

  const [templateKey, setTemplateKey] = useState(
    DEFAULT_TEMPLATE_KEY_BY_ATTENDANCE[attendanceStatus],
  );
  const [copied, setCopied] = useState(false);

  const activeTemplate = demoTemplates.find((t) => t.key === templateKey);
  const message = activeTemplate
    ? renderMessageTemplate(activeTemplate.body, context)
    : "";
  const whatsappLink = buildWhatsAppUrl(lead.phone, message);

  async function handleCopy() {
    try {
      await navigator.clipboard.writeText(message);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      // El portapapeles puede fallar sin permisos: no hay fallback necesario acá.
    }
  }

  if (demoTemplates.length === 0) {
    return (
      <p className="text-xs text-ink-soft">Sin plantillas activas.</p>
    );
  }

  return (
    <div className="flex flex-col gap-2">
      <div className="flex flex-wrap gap-1.5">
        {demoTemplates.map((template) => (
          <button
            key={template.key}
            type="button"
            onClick={() => {
              setTemplateKey(template.key);
              setCopied(false);
            }}
            className={cn(
              "rounded-full px-2.5 py-1 text-xs font-semibold transition-colors",
              template.key === templateKey
                ? "bg-brand-500 text-white"
                : "bg-brand-50 text-ink-soft hover:bg-brand-100",
            )}
          >
            {template.label}
          </button>
        ))}
      </div>
      <div className="flex flex-wrap items-center gap-2">
        <button
          type="button"
          onClick={handleCopy}
          className={buttonClasses("ghost", "px-3 py-1.5 text-xs")}
        >
          {copied ? "¡Copiado!" : "Copiar"}
        </button>
        {whatsappLink && (
          <a
            href={whatsappLink}
            target="_blank"
            rel="noopener noreferrer"
            className={buttonClasses("ghost", "px-3 py-1.5 text-xs")}
          >
            WhatsApp
          </a>
        )}
      </div>
    </div>
  );
}
