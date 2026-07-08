import { readFileSync } from "node:fs";
import path from "node:path";
import { describe, expect, it } from "vitest";

const migrationsDir = path.resolve(__dirname, "../../../supabase/migrations");
const recipeVideosSql = readFileSync(
  path.join(migrationsDir, "0008_recipe_videos.sql"),
  "utf8",
);

/**
 * Guardia de regresión (no reemplaza probar RLS contra Postgres real):
 * recipe_videos solo debe ser legible públicamente cuando está publicado,
 * y nunca escribible por "anon".
 */
describe("RLS de recipe_videos", () => {
  it("habilita row level security", () => {
    expect(recipeVideosSql).toMatch(
      /alter table public\.recipe_videos enable row level security/,
    );
  });

  it("no otorga a anon INSERT/UPDATE/DELETE", () => {
    expect(recipeVideosSql).not.toMatch(/for insert\s+to anon/i);
    expect(recipeVideosSql).not.toMatch(/for update\s+to anon/i);
    expect(recipeVideosSql).not.toMatch(/for delete\s+to anon/i);
  });

  it("otorga a anon SELECT solo published con published_at cumplido", () => {
    expect(recipeVideosSql).toMatch(
      /for select\s+to anon\s+using \(status = 'published' and published_at is not null and published_at <= now\(\)\)/,
    );
  });

  it("no deja a anon leer drafts ni archivados", () => {
    const anonSelectMatch = recipeVideosSql.match(
      /for select\s+to anon\s+using \(([^)]*)\)/,
    );
    expect(anonSelectMatch).not.toBeNull();
    const condition = anonSelectMatch?.[1] ?? "";
    expect(condition).not.toMatch(/draft/);
    expect(condition).not.toMatch(/archived/);
  });

  it("el equipo autenticado conserva CRUD completo", () => {
    expect(recipeVideosSql).toMatch(/for select\s+to authenticated/i);
    expect(recipeVideosSql).toMatch(/for insert\s+to authenticated/i);
    expect(recipeVideosSql).toMatch(/for update\s+to authenticated/i);
    expect(recipeVideosSql).toMatch(/for delete\s+to authenticated/i);
  });

  it("agrega los índices de status/published_at, category y tags (gin)", () => {
    expect(recipeVideosSql).toMatch(
      /create index if not exists recipe_videos_status_published_at_idx\s+on public\.recipe_videos \(status, published_at desc\)/,
    );
    expect(recipeVideosSql).toMatch(
      /create index if not exists recipe_videos_category_idx\s+on public\.recipe_videos \(category\)/,
    );
    expect(recipeVideosSql).toMatch(
      /create index if not exists recipe_videos_tags_idx\s+on public\.recipe_videos using gin \(tags\)/,
    );
  });
});
