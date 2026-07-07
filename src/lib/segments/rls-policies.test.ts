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

  it("outreach_campaign_recipients permite select/insert/update pero nunca delete (el historial de a quién se seleccionó no se borra)", () => {
    const section = migrationSql.split(
      "create table if not exists public.outreach_campaign_recipients",
    )[1];
    expect(section).toMatch(
      /"Authenticated can read campaign recipients"[\s\S]*?for select\s+to authenticated/,
    );
    expect(section).toMatch(
      /"Authenticated can insert campaign recipients"[\s\S]*?for insert\s+to authenticated/,
    );
    expect(section).toMatch(
      /"Authenticated can update campaign recipients"[\s\S]*?for update\s+to authenticated/,
    );
    expect(section).not.toMatch(/for delete/);
  });

  it("agrega 'campaign' al enum task_source recreándolo completo (no ALTER TYPE ADD VALUE)", () => {
    expect(migrationSql).toMatch(/drop type if exists task_source/);
    expect(migrationSql).toMatch(/'manual',\s*\n\s*'campaign'/);
    expect(migrationSql).not.toMatch(/alter type task_source add value/i);
  });

  it("lead_segments.criteria es jsonb con default '{}' y se exige que sea un objeto", () => {
    expect(migrationSql).toMatch(/criteria jsonb not null default '\{\}'::jsonb/);
    expect(migrationSql).toMatch(
      /constraint lead_segments_criteria_is_object check \(jsonb_typeof\(criteria\) = 'object'\)/,
    );
  });

  it("define los enums campaign_status, campaign_task_priority y campaign_recipient_status", () => {
    expect(migrationSql).toMatch(
      /create type campaign_status as enum \(\s*'draft',\s*'ready',\s*'tasks_created',\s*'completed',\s*'cancelled'\s*\)/,
    );
    expect(migrationSql).toMatch(
      /create type campaign_task_priority as enum \('low', 'medium', 'high'\)/,
    );
    expect(migrationSql).toMatch(
      /create type campaign_recipient_status as enum \(\s*'selected',\s*'task_created',\s*'skipped',\s*'cancelled'\s*\)/,
    );
  });

  it("outreach_campaigns referencia message_templates por id (no por key) y arranca en status draft", () => {
    expect(migrationSql).toMatch(
      /message_template_id uuid references public\.message_templates \(id\) on delete set null/,
    );
    expect(migrationSql).toMatch(/status campaign_status not null default 'draft'/);
  });

  it("outreach_campaigns.segment_id borra en cascada, follow_up_tasks.campaign_id conserva la tarea", () => {
    expect(migrationSql).toMatch(
      /segment_id uuid not null references public\.lead_segments \(id\) on delete cascade/,
    );
    expect(migrationSql).toMatch(
      /add column if not exists campaign_id uuid references public\.outreach_campaigns \(id\) on delete set null/,
    );
  });

  it("outreach_campaign_recipients evita duplicar destinatarios por campaña+lead y arranca en status selected", () => {
    expect(migrationSql).toMatch(
      /constraint outreach_campaign_recipients_unique_lead unique \(campaign_id, lead_id\)/,
    );
    expect(migrationSql).toMatch(
      /status campaign_recipient_status not null default 'selected'/,
    );
  });
});
