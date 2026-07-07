import { readFileSync } from "node:fs";
import path from "node:path";
import { describe, expect, it } from "vitest";

const migrationsDir = path.resolve(__dirname, "../../../supabase/migrations");
const initSql = readFileSync(path.join(migrationsDir, "0001_init.sql"), "utf8");
const contactLogsSql = readFileSync(
  path.join(migrationsDir, "0002_contact_logs.sql"),
  "utf8",
);

/**
 * Guardia de regresión (no reemplaza probar RLS contra Postgres real): leads
 * es la única tabla que el sitio público puede escribir directamente (con
 * consentimiento), y solo insertar, nunca leer/actualizar/borrar.
 * contact_logs es de uso exclusivo del equipo admin.
 */
describe("RLS de leads", () => {
  it("habilita row level security", () => {
    expect(initSql).toMatch(/alter table public\.leads enable row level security/);
  });

  it("anon solo puede insertar leads, y solo con consentimiento de contacto", () => {
    expect(initSql).toMatch(
      /"Public can submit leads"[\s\S]*?for insert\s+to anon\s+with check \(consent_contact = true\)/,
    );
  });

  it("anon no tiene ninguna policy de select/update/delete sobre leads", () => {
    const anonPolicies = initSql.match(/to anon/gi) ?? [];
    expect(anonPolicies).toHaveLength(1);
  });

  it("otorga al equipo autenticado select/update/delete, pero no insert", () => {
    expect(initSql).toMatch(
      /"Authenticated can read leads"[\s\S]*?for select\s+to authenticated/,
    );
    expect(initSql).toMatch(
      /"Authenticated can update leads"[\s\S]*?for update\s+to authenticated/,
    );
    expect(initSql).toMatch(
      /"Authenticated can delete leads"[\s\S]*?for delete\s+to authenticated/,
    );
    expect(initSql).not.toMatch(/"Authenticated can insert leads"/);
  });
});

describe("RLS de contact_logs", () => {
  it("habilita row level security", () => {
    expect(contactLogsSql).toMatch(
      /alter table public\.contact_logs enable row level security/,
    );
  });

  it("no otorga a anon ninguna policy: uso exclusivo del equipo admin", () => {
    const section = contactLogsSql.split(
      "create table if not exists public.contact_logs",
    )[1];
    expect(section).not.toMatch(/to anon/i);
  });

  it("otorga al equipo autenticado leer e insertar, pero nunca actualizar ni borrar", () => {
    const section = contactLogsSql.split(
      "create table if not exists public.contact_logs",
    )[1];
    expect(section).toMatch(
      /"Authenticated can read contact logs"[\s\S]*?for select\s+to authenticated/,
    );
    expect(section).toMatch(
      /"Authenticated can insert contact logs"[\s\S]*?for insert\s+to authenticated/,
    );
    expect(section).not.toMatch(/for update/);
    expect(section).not.toMatch(/for delete/);
  });
});
