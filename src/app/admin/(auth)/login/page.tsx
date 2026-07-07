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
    <div className="flex min-h-svh flex-1 items-center justify-center bg-cream px-6 py-16">
      <div className="w-full max-w-sm">
        <div className="mb-8 flex justify-center">
          <Logo />
        </div>
        <div className="rounded-3xl border border-ink/10 bg-white p-8 shadow-sm">
          <h1 className="font-display text-xl font-semibold text-ink">
            Acceso al panel admin
          </h1>
          <p className="mt-1 text-sm text-ink-soft">
            Ingresa con tu cuenta para gestionar los leads.
          </p>
          <div className="mt-6">
            <LoginForm redirectTo={redirectTo} />
          </div>
        </div>
      </div>
    </div>
  );
}
