"use client";

import { useState } from "react";
import { buttonClasses } from "@/components/ui/Button";
import { cn } from "@/lib/utils";
import {
  DEMO_WHATSAPP_TEMPLATES,
  buildWhatsAppUrl,
  renderDemoTemplate,
  type DemoTemplateId,
} from "@/lib/whatsapp/templates";
import type { AttendanceStatus, DemoEventRow, LeadRow } from "@/types/database";

const DEFAULT_TEMPLATE_BY_ATTENDANCE: Record<AttendanceStatus, DemoTemplateId> = {
  registered: "invitation",
  confirmed: "confirmation",
  attended: "post_demo",
  no_show: "reminder",
  cancelled: "invitation",
};

/**
 * Copiar/abrir plantillas de WhatsApp para una demo específica. No usa la
 * API de WhatsApp: solo copia al portapapeles o abre un link wa.me, igual
 * que WhatsAppTemplates en el detalle de lead.
 */
export function DemoTemplateActions({
  lead,
  demo,
  attendanceStatus,
}: {
  lead: LeadRow;
  demo: DemoEventRow;
  attendanceStatus: AttendanceStatus;
}) {
  const [templateId, setTemplateId] = useState<DemoTemplateId>(
    DEFAULT_TEMPLATE_BY_ATTENDANCE[attendanceStatus],
  );
  const [copied, setCopied] = useState(false);

  const message = renderDemoTemplate(templateId, lead, demo);
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

  return (
    <div className="flex flex-col gap-2">
      <div className="flex flex-wrap gap-1.5">
        {DEMO_WHATSAPP_TEMPLATES.map((template) => (
          <button
            key={template.id}
            type="button"
            onClick={() => {
              setTemplateId(template.id);
              setCopied(false);
            }}
            className={cn(
              "rounded-full px-2.5 py-1 text-xs font-semibold transition-colors",
              template.id === templateId
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
