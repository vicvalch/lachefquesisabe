// Número de WhatsApp del negocio para los CTA públicos (formato libre: se
// normaliza con normalizePhoneForWhatsApp). Opcional: si no está configurado,
// los CTA de WhatsApp caen de vuelta al formulario de contacto en vez de
// enviar a un número inventado.
export const WHATSAPP_NUMBER = process.env.NEXT_PUBLIC_WHATSAPP_NUMBER || null;

export const WHATSAPP_DEFAULT_MESSAGE =
  "¡Hola! Quiero agendar una demo con La Chef que Sí Sabe.";

export const WHATSAPP_THERMOMIX_MESSAGE =
  "¡Hola María! Quiero más información sobre la Thermomix.";

// Opcionales: personalizan la sección Thermomix sin tocar código. Si se
// dejan vacíos, la sección usa un placeholder ilustrado en su lugar.
export const THERMOMIX_IMAGE_URL = process.env.NEXT_PUBLIC_THERMOMIX_IMAGE_URL || null;
export const THERMOMIX_VIDEO_URL = process.env.NEXT_PUBLIC_THERMOMIX_VIDEO_URL || null;
export const THERMOMIX_OFFICIAL_URL =
  process.env.NEXT_PUBLIC_THERMOMIX_OFFICIAL_URL || null;
