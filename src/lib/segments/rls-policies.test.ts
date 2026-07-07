import { readFileSync } from "node:fs";
import path from "node:path";
import { describe, expect, it } from "vitest";

const migrationsDir = path.resolve(__dirname, "../../../supabase/migrations");
const migrationSql = readFileSync(
  path.join(migrationsDir, "0007_lead_segments_campaigns.sql"),
  "utf8",
);

/**
 * Guardia de regresión (no reemplaza probar RLS contra Postgres real):
 * segmentos y campañas son herramientas internas de organización del
 * seguimiento manual, de uso exclusivo del equipo admin. El sitio público
 * nunca las toca, ni siquiera indirectamente (a diferencia de
 * follow_up_tasks, no hay ningún trigger security definer aquí).
 */
describe("RLS de lead_segments, outreach_campaigns y outreach_campaign_recipients", () => {
  it("no otorga a anon ningún permiso sobre lead_segments", () => {
    const section = migrationSql
      .split("create table if not exists public.lead_segments")[1]
      .split("create table if not exists public.outreach_campaigns")[0];
    expect(section).not.toMatch(/to anon/i);
  });

  it("no otorga a anon ningún permiso sobre outreach_campaigns", () => {
    const section = migrationSql
      .split("create table if not exists public.outreach_campaigns")[1]
      .split("create table if not exists public.outreach_campaign_recipients")[0];
    expect(section).not.toMatch(/to anon/i);
  });

  it("no otorga a anon ningún permiso sobre outreach_campaign_recipients", () => {
    const section = migrationSql.split(
      "create table if not exists public.outreach_campaign_recipients",
    )[1];
    expect(section).not.toMatch(/to anon/i);
  });

  it("otorga al equipo autenticado CRUD completo sobre lead_segments y outreach_campaigns", () => {
    for (const table of ["lead segments", "outreach campaigns"]) {
      expect(migrationSql).toMatch(
        new RegExp(`"Authenticated can read ${table}"[\\s\\S]*?for select\\s+to authenticated`),
      );
      expect(migrationSql).toMatch(
        new RegExp(`"Authenticated can insert ${table}"[\\s\\S]*?for insert\\s+to authenticated`),
      );
      expect(migrationSql).toMatch(
        new RegExp(`"Authenticated can update ${table}"[\\s\\S]*?for update\\s+to authenticated`),
      );
      expect(migrationSql).toMatch(
        new RegExp(`"Authenticated can delete ${table}"[\\s\\S]*?for delete\\s+to authenticated`),
      );
    }
  });

  it("outreach_campaign_recipients es append-only: solo lectura e inserción, sin update ni delete", () => {
    const section = migrationSql.split(
      "create table if not exists public.outreach_campaign_recipients",
    )[1];
    expect(section).toMatch(
      /"Authenticated can read campaign recipients"[\s\S]*?for select\s+to authenticated/,
    );
    expect(section).toMatch(
      /"Authenticated can insert campaign recipients"[\s\S]*?for insert\s+to authenticated/,
    );
    expect(section).not.toMatch(/for update/);
    expect(section).not.toMatch(/for delete/);
  });

  it("agrega 'campaign' al enum task_source recreándolo completo (no ALTER TYPE ADD VALUE)", () => {
    expect(migrationSql).toMatch(/drop type if exists task_source/);
    expect(migrationSql).toMatch(/'manual',\s*\n\s*'campaign'/);
    expect(migrationSql).not.toMatch(/alter type task_source add value/i);
  });

  it("outreach_campaigns.segment_id borra en cascada, follow_up_tasks.campaign_id conserva la tarea", () => {
    expect(migrationSql).toMatch(
      /segment_id uuid not null references public\.lead_segments \(id\) on delete cascade/,
    );
    expect(migrationSql).toMatch(
      /add column if not exists campaign_id uuid references public\.outreach_campaigns \(id\) on delete set null/,
    );
  });

  it("outreach_campaign_recipients evita duplicar destinatarios por campaña+lead", () => {
    expect(migrationSql).toMatch(
      /constraint outreach_campaign_recipients_unique_lead unique \(campaign_id, lead_id\)/,
    );
  });
});
