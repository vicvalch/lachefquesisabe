// Número de WhatsApp del negocio para los CTA públicos (formato libre: se
// normaliza con normalizePhoneForWhatsApp). Opcional: si no está configurado,
// los CTA de WhatsApp caen de vuelta al formulario de contacto en vez de
// enviar a un número inventado.
export const WHATSAPP_NUMBER = process.env.NEXT_PUBLIC_WHATSAPP_NUMBER || null;

export const WHATSAPP_DEFAULT_MESSAGE =
  "¡Hola! Quiero agendar una demo con La Chef que Sí Sabe.";
