import { Logo } from "@/components/brand/Logo";
import { LoginForm } from "@/components/admin/LoginForm";

export const metadata = {
  title: "Ingresar | La Chef que Sí Sabe",
};

interface LoginPageProps {
  searchParams: Promise<{ redirectTo?: string }>;
}

export default async function LoginPage({ searchParams }: LoginPageProps) {
  const { redirectTo } = await searchParams;

  return (
    <div className="flex min-h-svh flex-1 items-center justify-center bg-gradient-to-b from-emerald-900 to-emerald-700 px-6 py-16">
      <div className="w-full max-w-sm">
        <div className="mb-8 flex justify-center">
          <Logo className="text-white [&_span:last-child]:text-white" />
        </div>
        <div className="rounded-3xl border border-border-soft bg-white-soft p-8 shadow-md">
          <span className="inline-flex items-center rounded-full bg-brand-50 px-3 py-1 text-xs font-semibold text-brand-700">
            Panel privado
          </span>
          <h1 className="mt-3 font-display text-xl font-semibold text-emerald-900">
            Acceso al panel admin
          </h1>
          <p className="mt-1 text-sm text-ink-soft">
            Gestioná leads, demos, seguimientos y campañas manuales.
          </p>
          <div className="mt-6">
            <LoginForm redirectTo={redirectTo} />
          </div>
        </div>
      </div>
    </div>
  );
}
