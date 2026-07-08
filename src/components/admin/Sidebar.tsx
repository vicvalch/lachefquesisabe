"use client";

import { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Logo } from "@/components/brand/Logo";
import { LogoutButton } from "@/components/admin/LogoutButton";
import { cn } from "@/lib/utils";

const NAV_LINKS = [
  { href: "/admin/dashboard", label: "Dashboard" },
  { href: "/admin/leads", label: "Leads" },
  { href: "/admin/demos", label: "Demos" },
  { href: "/admin/content", label: "Contenido" },
  { href: "/admin/videos", label: "Videos" },
  { href: "/admin/seguimientos", label: "Seguimientos" },
  { href: "/admin/plantillas", label: "Plantillas" },
  { href: "/admin/segmentos", label: "Segmentos" },
  { href: "/admin/campanas", label: "Campañas" },
  { href: "/admin/settings", label: "Configuración" },
];

function isActiveLink(pathname: string, href: string) {
  return pathname === href || pathname.startsWith(`${href}/`);
}

export function Sidebar() {
  const [open, setOpen] = useState(false);
  const pathname = usePathname();

  return (
    <>
      <div className="flex items-center justify-between border-b border-border-soft bg-white-soft px-4 py-3 md:hidden">
        <Link href="/admin/dashboard" onClick={() => setOpen(false)}>
          <Logo markOnly />
        </Link>
        <button
          type="button"
          onClick={() => setOpen((value) => !value)}
          aria-label={open ? "Cerrar menú" : "Abrir menú"}
          aria-expanded={open}
          className="flex h-10 w-10 items-center justify-center rounded-full border border-border text-ink"
        >
          <svg
            aria-hidden
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth={2}
            strokeLinecap="round"
            className="h-5 w-5"
          >
            {open ? (
              <path d="M6 6l12 12M18 6L6 18" />
            ) : (
              <path d="M4 7h16M4 12h16M4 17h16" />
            )}
          </svg>
        </button>
      </div>

      {open && (
        <button
          type="button"
          aria-label="Cerrar menú"
          onClick={() => setOpen(false)}
          className="fixed inset-0 z-40 bg-ink/40 md:hidden"
        />
      )}

      <aside
        className={cn(
          "fixed inset-y-0 left-0 z-50 flex w-72 max-w-[85vw] shrink-0 -translate-x-full flex-col justify-between border-r border-border-soft bg-white-soft p-6 transition-transform duration-200 md:static md:z-auto md:w-64 md:translate-x-0",
          open && "translate-x-0",
        )}
      >
        <div>
          <Link
            href="/admin/dashboard"
            onClick={() => setOpen(false)}
            className="hidden md:block"
          >
            <Logo markOnly />
          </Link>
          <nav className="mt-4 flex flex-col gap-1 md:mt-10">
            {NAV_LINKS.map((link) => {
              const active = isActiveLink(pathname, link.href);
              return (
                <Link
                  key={link.href}
                  href={link.href}
                  onClick={() => setOpen(false)}
                  aria-current={active ? "page" : undefined}
                  className={cn(
                    "rounded-full px-4 py-2 text-sm font-semibold transition-colors",
                    active
                      ? "bg-brand-50 text-brand-700"
                      : "text-ink-soft hover:bg-brand-50 hover:text-brand-700",
                  )}
                >
                  {link.label}
                </Link>
              );
            })}
          </nav>
        </div>
        <LogoutButton />
      </aside>
    </>
  );
}
