import { randomUUID } from "node:crypto";

const DIACRITICS_PATTERN = /[̀-ͯ]/g;

/**
 * Genera un slug único a partir del nombre de la campaña. El sufijo
 * aleatorio evita colisiones entre campañas con nombres repetidos sin
 * depender de un contador global (mismo enfoque que demos/slug.ts).
 */
export function generateCampaignSlug(name: string): string {
  const base = name
    .normalize("NFD")
    .replace(DIACRITICS_PATTERN, "")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 60);

  const suffix = randomUUID().slice(0, 8);

  return base ? `${base}-${suffix}` : suffix;
}
