import type { DemoEventRow, LeadRow, PrimaryInterest } from "@/types/database";
import { formatDemoDate, formatDemoTime } from "@/lib/demos/format";

const INTEREST_PHRASES: Record<PrimaryInterest, string> = {
  easy_recipes: "las recetas fáciles",
  save_time: "ahorrar tiempo en la cocina",
  in_person_demo: "la demostración presencial",
  virtual_demo: "la demostración virtual",
  buy_thermomix: "comprar una Thermomix",
  more_info: "lo que me contaste",
};

export interface WhatsAppTemplate {
  id: string;
  label: string;
  build: (lead: LeadRow) => string;
}

function firstName(name: string): string {
  return name.trim().split(/\s+/)[0] ?? name;
}

export const WHATSAPP_TEMPLATES: WhatsAppTemplate[] = [
  {
    id: "primer_contacto",
    label: "Primer contacto",
    build: (lead) =>
      `¡Hola ${firstName(lead.name)}! 👩‍🍳 Soy la chef que sí sabe. Vi que dejaste tus datos porque te interesa ${INTEREST_PHRASES[lead.primary_interest]}. ¿Tienes un minuto para contarme un poco más y ver cómo te puedo ayudar?`,
  },
  {
    id: "seguimiento",
    label: "Seguimiento",
    build: (lead) =>
      `Hola ${firstName(lead.name)} 🙋‍♀️ Te escribo para dar seguimiento a tu interés en ${INTEREST_PHRASES[lead.primary_interest]}. ¿Sigues interesada/o? Cuéntame si tienes dudas, con gusto te ayudo.`,
  },
  {
    id: "recordatorio_demo",
    label: "Recordatorio de demo",
    build: (lead) =>
      `¡Hola ${firstName(lead.name)}! Te escribo para confirmar tu demostración 🎉 Cualquier cambio de horario avísame por aquí sin problema. ¡Nos vemos pronto!`,
  },
  {
    id: "post_demo",
    label: "Después de la demo",
    build: (lead) =>
      `Hola ${firstName(lead.name)}, ¡gracias por tu tiempo en la demostración! Espero que te haya gustado tanto como a mí compartirla. Quedo atenta a cualquier pregunta que tengas.`,
  },
];

export type DemoTemplateId =
  | "invitation"
  | "confirmation"
  | "reminder"
  | "post_demo";

interface DemoWhatsAppTemplate {
  id: DemoTemplateId;
  label: string;
  template: string;
}

/**
 * Plantillas específicas para el ciclo de vida de una demo. Los
 * placeholders ({{name}}, {{demo_title}}, {{demo_date}}, {{demo_time}},
 * {{demo_location}}) se rellenan con `renderDemoTemplate`.
 */
export const DEMO_WHATSAPP_TEMPLATES: DemoWhatsAppTemplate[] = [
  {
    id: "invitation",
    label: "Invitación a demo",
    template:
      '¡Hola {{name}}! 👩‍🍳 Te escribo para invitarte a "{{demo_title}}" el {{demo_date}} a las {{demo_time}}{{demo_location}}. ¿Te gustaría reservar tu lugar?',
  },
  {
    id: "confirmation",
    label: "Confirmación de demo",
    template:
      '¡Hola {{name}}! Tu lugar en "{{demo_title}}" quedó confirmado para el {{demo_date}} a las {{demo_time}}{{demo_location}}. ¡Te espero! 🎉',
  },
  {
    id: "reminder",
    label: "Recordatorio",
    template:
      '¡Hola {{name}}! Te escribo para recordarte "{{demo_title}}" el {{demo_date}} a las {{demo_time}}{{demo_location}}. Cualquier cambio avísame por aquí. ¡Nos vemos pronto!',
  },
  {
    id: "post_demo",
    label: "Después de la demo",
    template:
      'Hola {{name}}, ¡gracias por acompañarme en "{{demo_title}}"! Espero que te haya encantado. Quedo atenta a cualquier pregunta que tengas.',
  },
];

const DEMO_WHATSAPP_TEMPLATES_BY_ID = Object.fromEntries(
  DEMO_WHATSAPP_TEMPLATES.map((template) => [template.id, template]),
) as Record<DemoTemplateId, DemoWhatsAppTemplate>;

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
 * Rellena una plantilla de demo con los datos del lead y la demo, usando
 * Intl (locale es-CR) para fecha/hora sin dependencias externas. Nunca
 * lanza por campos opcionales faltantes (ubicación, meeting_url): esa
 * parte del mensaje simplemente se omite.
 */
export function renderDemoTemplate(
  templateId: DemoTemplateId,
  lead: LeadRow,
  demo: DemoEventRow,
): string {
  const { template } = DEMO_WHATSAPP_TEMPLATES_BY_ID[templateId];

  return template
    .replaceAll("{{name}}", firstName(lead.name))
    .replaceAll("{{demo_title}}", demo.title)
    .replaceAll("{{demo_date}}", formatDemoDate(demo.starts_at))
    .replaceAll("{{demo_time}}", formatDemoTime(demo.starts_at))
    .replaceAll("{{demo_location}}", buildDemoLocationPhrase(demo));
}

const COSTA_RICA_COUNTRY_CODE = "506";
const LOCAL_PHONE_LENGTH = 8;
const MIN_VALID_PHONE_LENGTH = 8;

/**
 * Limpia espacios, guiones y paréntesis. Los números ticos de 8 dígitos
 * (sin código de país) reciben el prefijo 506; los que ya traen código
 * internacional (más de 8 dígitos) se preservan tal cual.
 */
export function normalizePhoneForWhatsApp(phone: string | null): string | null {
  if (!phone) {
    return null;
  }

  const digits = phone.replace(/[^0-9]/g, "");

  if (digits.length < MIN_VALID_PHONE_LENGTH) {
    return null;
  }

  if (digits.length === LOCAL_PHONE_LENGTH) {
    return `${COSTA_RICA_COUNTRY_CODE}${digits}`;
  }

  return digits;
}

export function buildWhatsAppUrl(
  phone: string | null,
  message: string,
): string | null {
  const normalized = normalizePhoneForWhatsApp(phone);
  if (!normalized) {
    return null;
  }

  return `https://wa.me/${normalized}?text=${encodeURIComponent(message)}`;
}
