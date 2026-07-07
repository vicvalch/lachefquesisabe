const DEMO_LOCALE = "es-CR";

/**
 * Formatea la fecha/hora de una demo en locale es-CR usando Intl (sin
 * dependencias externas). Si el runtime no reconoce "es-CR", Intl cae de
 * vuelta a un formato genérico en vez de lanzar.
 */
export function formatDemoDate(startsAt: string): string {
  return new Intl.DateTimeFormat(DEMO_LOCALE, {
    day: "2-digit",
    month: "long",
    year: "numeric",
  }).format(new Date(startsAt));
}

export function formatDemoTime(startsAt: string): string {
  return new Intl.DateTimeFormat(DEMO_LOCALE, {
    hour: "2-digit",
    minute: "2-digit",
  }).format(new Date(startsAt));
}
