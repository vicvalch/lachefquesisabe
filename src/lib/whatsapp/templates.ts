import type { DemoEventRow, LeadRow, PrimaryInterest } from "@/types/database";
import { formatDateTime } from "@/lib/utils";

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

/**
 * Mensaje de recordatorio para una demo específica, con fecha y ubicación,
 * para el seguimiento manual por WhatsApp desde el detalle de la demo.
 */
export function buildDemoReminderMessage(
  lead: LeadRow,
  demo: DemoEventRow,
): string {
  const where = demo.location ? ` en ${demo.location}` : "";
  return `¡Hola ${firstName(lead.name)}! Te escribo para confirmar tu lugar en "${demo.title}" el ${formatDateTime(demo.scheduled_at)}${where}. ¿Nos confirmas tu asistencia? 🎉`;
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
