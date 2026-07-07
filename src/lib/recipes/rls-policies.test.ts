import { readFileSync } from "node:fs";
import path from "node:path";
import { describe, expect, it } from "vitest";

const migrationsDir = path.resolve(__dirname, "../../../supabase/migrations");
const recipesSql = readFileSync(
  path.join(migrationsDir, "0005_recipes.sql"),
  "utf8",
);

/**
 * Estas pruebas no reemplazan probar RLS contra Postgres real, pero sirven
 * como guardia de regresión: si alguien agrega sin querer una policy que
 * le da a "anon" acceso de escritura, o lectura de borradores, esto falla
 * en CI en vez de descubrirse en producción.
 */
describe("RLS pública de recetas", () => {
  it("no otorga a anon INSERT/UPDATE/DELETE sobre recipes", () => {
    expect(recipesSql).not.toMatch(/for insert\s+to anon/i);
    expect(recipesSql).not.toMatch(/for update\s+to anon/i);
    expect(recipesSql).not.toMatch(/for delete\s+to anon/i);
  });

  it("otorga a anon SELECT sobre recipes solo para status published", () => {
    expect(recipesSql).toMatch(
      /for select\s+to anon\s+using \(status = 'published'\)/,
    );
  });

  it("el equipo autenticado conserva CRUD completo sobre recipes", () => {
    expect(recipesSql).toMatch(/for select\s+to authenticated/i);
    expect(recipesSql).toMatch(/for insert\s+to authenticated/i);
    expect(recipesSql).toMatch(/for update\s+to authenticated/i);
    expect(recipesSql).toMatch(/for delete\s+to authenticated/i);
  });
});
