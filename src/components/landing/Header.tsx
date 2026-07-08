"use client";

import { useState } from "react";
import Link from "next/link";
import { Logo } from "@/components/brand/Logo";
import { buttonClasses } from "@/components/ui/Button";

const NAV_LINKS = [
  { href: "/recetas", label: "Recetas" },
  { href: "#videos", label: "Videos" },
  { href: "#thermomix", label: "Thermomix" },
  { href: "/demos", label: "Demos" },
  { href: "#contacto", label: "Contacto" },
];

export function Header() {
  const [open, setOpen] = useState(false);

  return (
    <header className="sticky top-0 z-40 border-b border-border-soft/60 bg-cream/90 backdrop-blur">
      <div className="mx-auto flex max-w-6xl items-center justify-between px-6 py-4">
        <Link
          href="/"
          aria-label="La Chef que Sí Sabe, ir al inicio"
          onClick={() => setOpen(false)}
        >
          <Logo />
        </Link>
        <nav className="hidden items-center gap-8 md:flex">
          {NAV_LINKS.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              className="text-sm font-semibold text-ink-soft transition-colors hover:text-brand-700"
            >
              {link.label}
            </Link>
          ))}
        </nav>
        <div className="flex items-center gap-2">
          <a
            href="#recetas-newsletter"
            className={buttonClasses("primary", "hidden px-5 py-2.5 text-sm sm:inline-flex")}
          >
            Quiero mis recetas
          </a>
          <button
            type="button"
            onClick={() => setOpen((value) => !value)}
            aria-label={open ? "Cerrar menú" : "Abrir menú"}
            aria-expanded={open}
            className="flex h-10 w-10 items-center justify-center rounded-full border border-border text-ink md:hidden"
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
      </div>
      {open && (
        <nav className="flex flex-col gap-1 border-t border-border-soft/60 px-6 py-4 md:hidden">
          {NAV_LINKS.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              onClick={() => setOpen(false)}
              className="rounded-full px-3 py-2.5 text-sm font-semibold text-ink-soft transition-colors hover:bg-brand-50 hover:text-brand-700"
            >
              {link.label}
            </Link>
          ))}
          <a
            href="#recetas-newsletter"
            onClick={() => setOpen(false)}
            className={buttonClasses("primary", "mt-2 justify-center px-5 py-2.5 text-sm sm:hidden")}
          >
            Quiero mis recetas
          </a>
        </nav>
      )}
    </header>
  );
}
