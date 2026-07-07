import { readFileSync } from "node:fs";
import path from "node:path";
import { describe, expect, it } from "vitest";

const migrationsDir = path.resolve(__dirname, "../../../supabase/migrations");
const contentHubSql = readFileSync(
  path.join(migrationsDir, "0005_content_hub.sql"),
  "utf8",
);

const categoriesSection = contentHubSql.split(
  "create table if not exists public.content_posts",
)[0];
const postsSection = contentHubSql.split(
  "create table if not exists public.content_posts",
)[1];

/**
 * Estas pruebas no reemplazan probar RLS contra Postgres real, pero sirven
 * como guardia de regresión: si alguien agrega sin querer una policy que
 * le da a "anon" acceso de escritura, o lectura de borradores/archivados,
 * esto falla en CI en vez de descubrirse en producción.
 */
describe("RLS de content_categories", () => {
  it("no otorga a anon INSERT/UPDATE/DELETE sobre content_categories", () => {
    expect(categoriesSection).not.toMatch(/for insert\s+to anon/i);
    expect(categoriesSection).not.toMatch(/for update\s+to anon/i);
    expect(categoriesSection).not.toMatch(/for delete\s+to anon/i);
  });

  it("otorga a anon SELECT sobre content_categories solo para is_active = true", () => {
    expect(categoriesSection).toMatch(
      /for select\s+to anon\s+using \(is_active = true\)/,
    );
  });

  it("el equipo autenticado conserva CRUD completo sobre content_categories", () => {
    expect(categoriesSection).toMatch(/for select\s+to authenticated/i);
    expect(categoriesSection).toMatch(/for insert\s+to authenticated/i);
    expect(categoriesSection).toMatch(/for update\s+to authenticated/i);
    expect(categoriesSection).toMatch(/for delete\s+to authenticated/i);
  });
});

describe("RLS de content_posts", () => {
  it("no otorga a anon INSERT/UPDATE/DELETE sobre content_posts", () => {
    expect(postsSection).toBeDefined();
    expect(postsSection).not.toMatch(/for insert\s+to anon/i);
    expect(postsSection).not.toMatch(/for update\s+to anon/i);
    expect(postsSection).not.toMatch(/for delete\s+to anon/i);
  });

  it("otorga a anon SELECT sobre content_posts solo published con published_at cumplido", () => {
    expect(postsSection).toMatch(
      /for select\s+to anon\s+using \(status = 'published' and published_at is not null and published_at <= now\(\)\)/,
    );
  });

  it("no deja a anon leer drafts ni archivados: la condición exige status = 'published'", () => {
    const anonSelectMatch = postsSection.match(
      /for select\s+to anon\s+using \(([^)]*)\)/,
    );
    expect(anonSelectMatch).not.toBeNull();
    const condition = anonSelectMatch?.[1] ?? "";
    expect(condition).not.toMatch(/draft/);
    expect(condition).not.toMatch(/archived/);
  });

  it("el equipo autenticado conserva CRUD completo sobre content_posts", () => {
    expect(postsSection).toMatch(/for select\s+to authenticated/i);
    expect(postsSection).toMatch(/for insert\s+to authenticated/i);
    expect(postsSection).toMatch(/for update\s+to authenticated/i);
    expect(postsSection).toMatch(/for delete\s+to authenticated/i);
  });
});
