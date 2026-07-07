import { logout } from "@/lib/actions/auth";

export function LogoutButton() {
  return (
    <form action={logout}>
      <button
        type="submit"
        className="w-full rounded-full border border-ink/15 px-4 py-2 text-left text-sm font-semibold text-ink-soft transition-colors hover:bg-brand-50 hover:text-brand-700"
      >
        Cerrar sesión
      </button>
    </form>
  );
}
