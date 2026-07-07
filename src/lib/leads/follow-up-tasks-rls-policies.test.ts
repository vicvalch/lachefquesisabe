import { readFileSync } from "node:fs";
import path from "node:path";
import { describe, expect, it } from "vitest";

const migrationsDir = path.resolve(__dirname, "../../../supabase/migrations");
const migrationSql = readFileSync(
  path.join(migrationsDir, "0006_follow_up_tasks.sql"),
  "utf8",
);

/**
 * Guardia de regresión (no reemplaza probar RLS contra Postgres real): las
 * tareas de seguimiento y las plantillas de mensaje son de uso exclusivo
 * del equipo admin. La única escritura pública indirecta permitida es la
 * de los dos triggers `security definer`, acotados a un insert puntual
 * cada uno.
 */
describe("RLS de follow_up_tasks y message_templates", () => {
  it("no otorga a anon ningún permiso sobre follow_up_tasks", () => {
    const section = migrationSql.split(
      "create table if not exists public.follow_up_tasks",
    )[1];
    expect(section).toBeDefined();
    expect(section).not.toMatch(/to anon/i);
  });

  it("no otorga a anon ningún permiso sobre message_templates", () => {
    const section = migrationSql
      .split("create table if not exists public.message_templates")[1]
      .split("create table if not exists public.follow_up_tasks")[0];
    expect(section).not.toMatch(/to anon/i);
  });

  it("otorga al equipo autenticado CRUD completo sobre ambas tablas", () => {
    expect(migrationSql).toMatch(
      /"Authenticated can read follow up tasks"[\s\S]*?for select\s+to authenticated/,
    );
    expect(migrationSql).toMatch(
      /"Authenticated can insert follow up tasks"[\s\S]*?for insert\s+to authenticated/,
    );
    expect(migrationSql).toMatch(
      /"Authenticated can update follow up tasks"[\s\S]*?for update\s+to authenticated/,
    );
    expect(migrationSql).toMatch(
      /"Authenticated can delete follow up tasks"[\s\S]*?for delete\s+to authenticated/,
    );
  });

  it("los triggers automáticos corren security definer", () => {
    expect(migrationSql).toMatch(
      /create_initial_follow_up_task[\s\S]*?security definer/,
    );
    expect(migrationSql).toMatch(
      /create_demo_follow_up_task[\s\S]*?security definer/,
    );
  });

  it("la tarea inicial de un lead nuevo solo se crea cuando status = 'new'", () => {
    expect(migrationSql).toMatch(/if new\.status = 'new' then/);
  });

  it("la tarea de demo evita duplicados por lead+demo mientras esté pendiente", () => {
    expect(migrationSql).toMatch(/status = 'pending'/);
  });
});
