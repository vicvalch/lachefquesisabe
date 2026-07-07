import { randomUUID } from "node:crypto";

const DIACRITICS_PATTERN = /[̀-ͯ]/g;

/**
 * Genera un slug único a partir del título de la receta/tip. El sufijo
 * aleatorio evita colisiones entre títulos repetidos sin depender de un
 * contador global.
 */
export function generateRecipeSlug(title: string): string {
  const base = title
    .normalize("NFD")
    .replace(DIACRITICS_PATTERN, "")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 60);

  const suffix = randomUUID().slice(0, 8);

  return base ? `${base}-${suffix}` : suffix;
}
