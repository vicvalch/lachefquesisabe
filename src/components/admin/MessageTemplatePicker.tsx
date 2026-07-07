"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { Textarea } from "@/components/ui/Textarea";
import { Button, buttonClasses } from "@/components/ui/Button";
import { cn } from "@/lib/utils";
import { buildWhatsAppUrl } from "@/lib/whatsapp/templates";
import { buildTemplateContext, renderMessageTemplate } from "@/lib/message-templates/render";
import type { DemoEventRow, LeadRow, MessageTemplateRow } from "@/types/database";

/**
 * Selector de plantilla de mensaje + textarea editable + copiar/abrir en
 * WhatsApp. Reemplaza el antiguo WhatsAppTemplates/DemoTemplateActions
 * (arreglos estáticos) por plantillas persistidas en message_templates.
 */
export function MessageTemplatePicker({
  templates,
  lead,
  demo = null,
  defaultTemplateKey,
}: {
  templates: MessageTemplateRow[];
  lead: LeadRow;
  demo?: DemoEventRow | null;
  defaultTemplateKey?: string | null;
}) {
  const activeTemplates = useMemo(
    () => templates.filter((template) => template.is_active),
    [templates],
  );
  const context = useMemo(() => buildTemplateContext(lead, demo), [lead, demo]);

  const initialTemplate =
    activeTemplates.find((template) => template.key === defaultTemplateKey) ??
    activeTemplates[0] ??
    null;

  const [templateKey, setTemplateKey] = useState(initialTemplate?.key ?? null);
  const [message, setMessage] = useState(() =>
    initialTemplate ? renderMessageTemplate(initialTemplate.body, context) : "",
  );
  const [copied, setCopied] = useState(false);

  const whatsappLink = useMemo(
    () => buildWhatsAppUrl(lead.phone, message),
    [lead.phone, message],
  );

  function selectTemplate(key: string) {
    const template = activeTemplates.find((t) => t.key === key);
    if (!template) return;
    setTemplateKey(key);
    setMessage(renderMessageTemplate(template.body, context));
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

  if (activeTemplates.length === 0) {
    return (
      <p className="text-xs text-ink-soft">
        Todavía no hay plantillas de mensaje activas. Crea o activa una desde{" "}
        <Link href="/admin/plantillas" className="font-semibold underline">
          /admin/plantillas
        </Link>
        .
      </p>
    );
  }

  return (
    <div className="flex flex-col gap-4">
      <div className="flex flex-wrap gap-2">
        {activeTemplates.map((template) => (
          <button
            key={template.key}
            type="button"
            onClick={() => selectTemplate(template.key)}
            className={cn(
              "rounded-full px-4 py-1.5 text-sm font-semibold transition-colors",
              template.key === templateKey
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
