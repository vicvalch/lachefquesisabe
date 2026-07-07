const DIACRITICS_PATTERN = /[̀-ͯ]/g;

/**
 * Convierte un título en un slug: minúsculas, sin acentos, espacios y
 * caracteres raros colapsados en guiones simples, sin guiones al inicio o
 * al final.
 */
export function slugify(title: string): string {
  return title
    .normalize("NFD")
    .replace(DIACRITICS_PATTERN, "")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/-+/g, "-")
    .replace(/^-+|-+$/g, "");
}

/**
 * Genera un slug único a partir del título, delegando la verificación de
 * colisión a `slugExists` (normalmente una consulta a content_posts) para
 * mantener esta función pura y testeable. Si el slug base ya existe,
 * agrega un sufijo numérico incremental (-2, -3, ...).
 */
export async function generateUniqueSlug(
  title: string,
  slugExists: (slug: string) => Promise<boolean>,
): Promise<string> {
  const base = slugify(title) || "contenido";

  let candidate = base;
  let suffix = 2;
  while (await slugExists(candidate)) {
    candidate = `${base}-${suffix}`;
    suffix += 1;
  }

  return candidate;
}
