import type { DemoEventRow, LeadRow } from "@/types/database";
import { formatDemoDate, formatDemoTime } from "@/lib/demos/format";

export interface MessageTemplateContext {
  name: string;
  demoTitle?: string;
  demoDate?: string;
  demoTime?: string;
  demoLocation?: string;
}

function firstName(name: string): string {
  return name.trim().split(/\s+/)[0] ?? name;
}

function buildDemoLocationPhrase(demo: DemoEventRow): string {
  if (demo.mode === "virtual") {
    return demo.meeting_url ? ` (virtual: ${demo.meeting_url})` : " (virtual)";
  }

  const place = [demo.location_name, demo.location_address]
    .filter((value): value is string => Boolean(value))
    .join(", ");

  return place ? ` en ${place}` : "";
}

/**
 * Arma el contexto para renderizar una plantilla: siempre incluye el
 * nombre del lead, y solo incluye los placeholders de demo cuando la tarea
 * está atada a una demo concreta.
 */
export function buildTemplateContext(
  lead: LeadRow,
  demo?: DemoEventRow | null,
): MessageTemplateContext {
  const base: MessageTemplateContext = { name: firstName(lead.name) };

  if (!demo) {
    return base;
  }

  return {
    ...base,
    demoTitle: demo.title,
    demoDate: formatDemoDate(demo.starts_at),
    demoTime: formatDemoTime(demo.starts_at),
    demoLocation: buildDemoLocationPhrase(demo),
  };
}

/**
 * Reemplaza los placeholders conocidos ({{name}}, {{demo_title}},
 * {{demo_date}}, {{demo_time}}, {{demo_location}}) con el contexto dado.
 * Los placeholders de demo que falten en el contexto (plantilla genérica
 * usada sin demo) se reemplazan por texto vacío en vez de lanzar.
 */
export function renderMessageTemplate(
  body: string,
  context: MessageTemplateContext,
): string {
  return body
    .replaceAll("{{name}}", context.name)
    .replaceAll("{{demo_title}}", context.demoTitle ?? "")
    .replaceAll("{{demo_date}}", context.demoDate ?? "")
    .replaceAll("{{demo_time}}", context.demoTime ?? "")
    .replaceAll("{{demo_location}}", context.demoLocation ?? "");
}
