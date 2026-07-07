import Link from "next/link";
import { Logo } from "@/components/brand/Logo";
import { buttonClasses } from "@/components/ui/Button";

const NAV_LINKS = [
  { href: "/recetas", label: "Recetas" },
  { href: "#thermomix", label: "Thermomix" },
  { href: "/demos", label: "Demos" },
  { href: "#contacto", label: "Contacto" },
];

export function Header() {
  return (
    <header className="sticky top-0 z-40 border-b border-ink/5 bg-cream/90 backdrop-blur">
      <div className="mx-auto flex max-w-6xl items-center justify-between px-6 py-4">
        <Link href="/" aria-label="La Chef que Sí Sabe, ir al inicio">
          <Logo />
        </Link>
        <nav className="hidden items-center gap-8 md:flex">
          {NAV_LINKS.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              className="text-sm font-semibold text-ink-soft transition-colors hover:text-brand-600"
            >
              {link.label}
            </Link>
          ))}
        </nav>
        <a href="#contacto" className={buttonClasses("primary", "px-5 py-2.5 text-sm")}>
          Quiero mis recetas
        </a>
      </div>
    </header>
  );
}
