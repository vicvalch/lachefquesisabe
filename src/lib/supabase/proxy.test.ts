import { NextRequest } from "next/server";
import { beforeEach, describe, expect, it, vi } from "vitest";

const getUser = vi.fn();

vi.mock("@supabase/ssr", () => ({
  createServerClient: vi.fn(() => ({
    auth: { getUser },
  })),
}));

vi.mock("./env", () => ({
  getSupabaseUrl: () => "https://example.supabase.co",
  getSupabaseAnonKey: () => "anon-key",
}));

import { updateSession } from "./proxy";

function buildRequest(pathname: string) {
  return new NextRequest(new URL(pathname, "https://lachefquesisabe.com"));
}

describe("updateSession (protección de /admin)", () => {
  beforeEach(() => {
    getUser.mockReset();
  });

  it("redirige a /admin/login con redirectTo cuando un usuario anónimo pide una ruta /admin protegida", async () => {
    getUser.mockResolvedValue({ data: { user: null } });

    const response = await updateSession(buildRequest("/admin/leads"));

    expect(response.status).toBe(307);
    const location = new URL(response.headers.get("location")!);
    expect(location.pathname).toBe("/admin/login");
    expect(location.searchParams.get("redirectTo")).toBe("/admin/leads");
  });

  it("no redirige a un usuario anónimo que visita /admin/login", async () => {
    getUser.mockResolvedValue({ data: { user: null } });

    const response = await updateSession(buildRequest("/admin/login"));

    expect(response.headers.get("location")).toBeNull();
  });

  it("redirige a /admin/dashboard cuando un usuario autenticado visita /admin/login", async () => {
    getUser.mockResolvedValue({ data: { user: { id: "user-1" } } });

    const response = await updateSession(buildRequest("/admin/login"));

    expect(response.status).toBe(307);
    const location = new URL(response.headers.get("location")!);
    expect(location.pathname).toBe("/admin/dashboard");
  });

  it("deja pasar a un usuario autenticado que visita una ruta /admin protegida", async () => {
    getUser.mockResolvedValue({ data: { user: { id: "user-1" } } });

    const response = await updateSession(buildRequest("/admin/leads"));

    expect(response.headers.get("location")).toBeNull();
  });

  it("no redirige rutas públicas para un usuario anónimo", async () => {
    getUser.mockResolvedValue({ data: { user: null } });

    const response = await updateSession(buildRequest("/recetas"));

    expect(response.headers.get("location")).toBeNull();
  });
});
