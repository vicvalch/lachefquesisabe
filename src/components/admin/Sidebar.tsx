import Link from "next/link";
import { Logo } from "@/components/brand/Logo";
import { LogoutButton } from "@/components/admin/LogoutButton";

const NAV_LINKS = [
  { href: "/admin/dashboard", label: "Dashboard" },
  { href: "/admin/seguimientos", label: "Seguimientos" },
  { href: "/admin/leads", label: "Leads" },
  { href: "/admin/segmentos", label: "Segmentos" },
  { href: "/admin/campanas", label: "Campañas" },
  { href: "/admin/demos", label: "Demos" },
  { href: "/admin/content", label: "Contenido" },
  { href: "/admin/plantillas", label: "Plantillas" },
];

export function Sidebar() {
  return (
    <aside className="flex w-64 shrink-0 flex-col justify-between border-r border-ink/10 bg-white p-6">
      <div>
        <Link href="/admin/dashboard">
          <Logo markOnly />
        </Link>
        <nav className="mt-10 flex flex-col gap-1">
          {NAV_LINKS.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              className="rounded-full px-4 py-2 text-sm font-semibold text-ink-soft transition-colors hover:bg-brand-50 hover:text-brand-700"
            >
              {link.label}
            </Link>
          ))}
        </nav>
      </div>
      <LogoutButton />
    </aside>
  );
}
