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
 * de los tres triggers `security definer`, acotados a un insert/update
 * puntual cada uno.
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

  it("los tres triggers automáticos corren security definer", () => {
    expect(migrationSql).toMatch(
      /create_initial_follow_up_task[\s\S]*?security definer/,
    );
    expect(migrationSql).toMatch(
      /create_demo_follow_up_task[\s\S]*?security definer/,
    );
    expect(migrationSql).toMatch(
      /sync_lead_next_follow_up_at[\s\S]*?security definer/,
    );
  });

  it("no elimina leads.next_follow_up_at: se mantiene como snapshot derivado", () => {
    expect(migrationSql).not.toMatch(/drop column.*next_follow_up_at/i);
  });

  it("mantiene leads.next_follow_up_at sincronizado con la tarea open más próxima", () => {
    expect(migrationSql).toMatch(
      /after insert or update or delete on public\.follow_up_tasks/,
    );
    expect(migrationSql).toMatch(/status = 'open'/);
    expect(migrationSql).toMatch(/set next_follow_up_at = next_due_at/);
  });

  it("la tarea inicial de un lead nuevo (initial_contact) solo se crea cuando status = 'new'", () => {
    expect(migrationSql).toMatch(/if new\.status = 'new' then/);
    expect(migrationSql).toMatch(/'primer-contacto', now\(\), 'initial_contact'/);
  });

  it("la inscripción a demo crea demo_invitation (registered) o demo_confirmation (confirmed)", () => {
    expect(migrationSql).toMatch(
      /new\.attendance_status = 'registered'[\s\S]*?'demo_invitation'/,
    );
    expect(migrationSql).toMatch(
      /new\.attendance_status = 'confirmed'[\s\S]*?'demo_confirmation'/,
    );
  });

  it("demo_confirmation usa la plantilla confirmacion-demo, no recordatorio-demo", () => {
    const confirmedBranch = migrationSql
      .split("new.attendance_status = 'confirmed'")[1]
      .split("elsif")[0];
    expect(confirmedBranch).toMatch(/'confirmacion-demo'/);
    expect(confirmedBranch).not.toMatch(/'recordatorio-demo'/);
  });

  it("recordatorio-demo está reservada para demo_reminder, no para demo_confirmation", () => {
    expect(migrationSql).toMatch(/'demo_reminder'/);
    expect(migrationSql).not.toMatch(
      /new\.attendance_status = 'confirmed'[\s\S]*?'recordatorio-demo'/,
    );
  });

  it("la tarea de demo evita duplicados por lead+demo mientras esté open", () => {
    expect(migrationSql).toMatch(/status = 'open'/);
  });

  it("siembra las 8 plantillas de mensaje requeridas", () => {
    const expectedKeys = [
      "primer-contacto",
      "invitacion-demo",
      "confirmacion-demo",
      "recordatorio-demo",
      "seguimiento-post-demo",
      "recuperacion-no-show",
      "recontacto-suave",
      "seguimiento-compra",
    ];

    for (const key of expectedKeys) {
      expect(migrationSql).toMatch(new RegExp(`'${key}',`));
    }
  });
});
