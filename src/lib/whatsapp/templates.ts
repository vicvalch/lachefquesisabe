import type { LeadInterest, LeadRow } from "@/types/database";

const INTEREST_PHRASES: Record<LeadInterest, string> = {
  recetas: "las recetas",
  demo_cocina: "la demostración de cocina",
  demo_thermomix: "la demostración de Thermomix",
  otro: "lo que me contaste",
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
      `¡Hola ${firstName(lead.name)}! 👩‍🍳 Soy la chef que sí sabe. Vi que dejaste tus datos porque te interesa ${INTEREST_PHRASES[lead.interest]}. ¿Tienes un minuto para contarme un poco más y ver cómo te puedo ayudar?`,
  },
  {
    id: "seguimiento",
    label: "Seguimiento",
    build: (lead) =>
      `Hola ${firstName(lead.name)} 🙋‍♀️ Te escribo para dar seguimiento a tu interés en ${INTEREST_PHRASES[lead.interest]}. ¿Sigues interesada/o? Cuéntame si tienes dudas, con gusto te ayudo.`,
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

export function sanitizePhoneForWhatsApp(phone: string | null): string | null {
  if (!phone) {
    return null;
  }

  const digits = phone.replace(/[^0-9]/g, "");
  return digits.length >= 8 ? digits : null;
}

export function buildWhatsAppLink(phone: string | null, message: string): string | null {
  const sanitized = sanitizePhoneForWhatsApp(phone);
  if (!sanitized) {
    return null;
  }

  return `https://wa.me/${sanitized}?text=${encodeURIComponent(message)}`;
}
