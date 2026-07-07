import { readFileSync } from "node:fs";
import path from "node:path";
import { describe, expect, it } from "vitest";

const migrationsDir = path.resolve(__dirname, "../../../supabase/migrations");
const demoEventsSql = readFileSync(
  path.join(migrationsDir, "0003_demo_events.sql"),
  "utf8",
);
const leadsSql = readFileSync(
  path.join(migrationsDir, "0001_init.sql"),
  "utf8",
);

/**
 * Estas pruebas no reemplazan probar RLS contra Postgres real, pero sirven
 * como guardia de regresión: si alguien agrega sin querer una policy que
 * le da a "anon" lectura sobre datos privados, esto falla en CI en vez de
 * descubrirse en producción.
 */
describe("RLS pública de demos", () => {
  it("no otorga a anon SELECT sobre demo_registrations", () => {
    const registrationsSection = demoEventsSql.split(
      "create table if not exists public.demo_registrations",
    )[1];
    expect(registrationsSection).toBeDefined();
    expect(registrationsSection).not.toMatch(/for select\s+to anon/i);
  });

  it("no otorga a anon UPDATE sobre demo_registrations", () => {
    const registrationsSection = demoEventsSql.split(
      "create table if not exists public.demo_registrations",
    )[1];
    expect(registrationsSection).not.toMatch(/for update\s+to anon/i);
  });

  it("solo permite a anon INSERT en demo_registrations con attendance_status confirmed y demo abierta", () => {
    const registrationsSection = demoEventsSql.split(
      "create table if not exists public.demo_registrations",
    )[1];
    expect(registrationsSection).toMatch(/for insert\s+to anon/i);
    expect(registrationsSection).toMatch(/attendance_status = 'confirmed'/);
    expect(registrationsSection).toMatch(
      /status in \('scheduled', 'full'\)/,
    );
  });

  it("no otorga a anon INSERT/UPDATE/DELETE sobre demo_events", () => {
    const eventsSection = demoEventsSql.split(
      "create table if not exists public.demo_registrations",
    )[0];
    expect(eventsSection).not.toMatch(/for insert\s+to anon/i);
    expect(eventsSection).not.toMatch(/for update\s+to anon/i);
    expect(eventsSection).not.toMatch(/for delete\s+to anon/i);
  });

  it("otorga a anon SELECT sobre demo_events solo para status scheduled/full y starts_at futuro", () => {
    expect(demoEventsSql).toMatch(
      /for select\s+to anon\s+using \(status in \('scheduled', 'full'\) and starts_at >= now\(\)\)/,
    );
  });

  it("no otorga a anon SELECT sobre leads", () => {
    expect(leadsSql).not.toMatch(/for select\s+to anon/i);
  });
});
