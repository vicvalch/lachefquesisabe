"use client";

import { useMemo, useState } from "react";
import { Textarea } from "@/components/ui/Textarea";
import { Button, buttonClasses } from "@/components/ui/Button";
import { cn } from "@/lib/utils";
import {
  WHATSAPP_TEMPLATES,
  buildWhatsAppUrl,
  type WhatsAppTemplateId,
} from "@/lib/whatsapp/templates";
import type { LeadRow } from "@/types/database";

export function WhatsAppTemplates({
  lead,
  defaultTemplateId,
}: {
  lead: LeadRow;
  defaultTemplateId?: WhatsAppTemplateId;
}) {
  const initialTemplate =
    WHATSAPP_TEMPLATES.find((template) => template.id === defaultTemplateId) ??
    WHATSAPP_TEMPLATES[0];
  const [templateId, setTemplateId] = useState(initialTemplate.id);
  const [message, setMessage] = useState(() => initialTemplate.build(lead));
  const [copied, setCopied] = useState(false);

  const whatsappLink = useMemo(
    () => buildWhatsAppUrl(lead.phone, message),
    [lead.phone, message],
  );

  function selectTemplate(id: WhatsAppTemplateId) {
    const template = WHATSAPP_TEMPLATES.find((t) => t.id === id);
    if (!template) return;
    setTemplateId(id);
    setMessage(template.build(lead));
    setCopied(false);
  }

  async function handleCopy() {
    try {
      await navigator.clipboard.writeText(message);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      // El portapapeles puede fallar sin permisos: el textarea sigue disponible para copiar a mano.
    }
  }

  return (
    <div className="flex flex-col gap-4">
      <div className="flex flex-wrap gap-2">
        {WHATSAPP_TEMPLATES.map((template) => (
          <button
            key={template.id}
            type="button"
            onClick={() => selectTemplate(template.id)}
            className={cn(
              "rounded-full px-4 py-1.5 text-sm font-semibold transition-colors",
              template.id === templateId
                ? "bg-brand-500 text-white"
                : "bg-brand-50 text-ink-soft hover:bg-brand-100",
            )}
          >
            {template.label}
          </button>
        ))}
      </div>

      <Textarea
        value={message}
        onChange={(event) => setMessage(event.target.value)}
        rows={5}
      />

      <div className="flex flex-wrap items-center gap-3">
        <Button type="button" variant="secondary" onClick={handleCopy}>
          {copied ? "¡Copiado!" : "Copiar mensaje"}
        </Button>
        {whatsappLink && (
          <a
            href={whatsappLink}
            target="_blank"
            rel="noopener noreferrer"
            className={buttonClasses("primary")}
          >
            Abrir en WhatsApp
          </a>
        )}
      </div>
      {!whatsappLink && (
        <p className="text-xs text-ink-soft">
          Este lead no tiene un teléfono válido para abrir WhatsApp
          directamente. Puedes copiar el mensaje y enviarlo por otro medio.
        </p>
      )}
    </div>
  );
}
