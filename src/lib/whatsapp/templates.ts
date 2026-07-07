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
