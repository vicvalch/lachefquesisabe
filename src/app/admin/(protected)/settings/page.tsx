import { createClient } from "@/lib/supabase/server";
import { Card } from "@/components/ui/Card";
import {
  THERMOMIX_IMAGE_URL,
  THERMOMIX_OFFICIAL_URL,
  THERMOMIX_VIDEO_URL,
  WHATSAPP_NUMBER,
} from "@/lib/config/site";

export const metadata = {
  title: "Configuración | Admin | La Chef que Sí Sabe",
};

function statusLabel(value: string | null) {
  return value ? "Configurado" : "Sin configurar";
}

export default async function SettingsAdminPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  return (
    <div className="flex flex-col gap-8">
      <div>
        <h1 className="font-display text-2xl font-semibold text-ink">
          Configuración
        </h1>
        <p className="mt-1 text-sm text-ink-soft">
          Datos de la cuenta y configuración pública del sitio. Los valores
          de sitio se gestionan con variables de entorno del hosting, no
          desde acá.
        </p>
      </div>

      <Card className="max-w-2xl">
        <h2 className="font-display text-lg font-semibold text-emerald-900">
          Cuenta
        </h2>
        <dl className="mt-4 grid gap-3 text-sm">
          <div className="flex justify-between gap-4">
            <dt className="text-ink-soft">Email</dt>
            <dd className="font-medium text-ink">{user?.email ?? "—"}</dd>
          </div>
        </dl>
      </Card>

      <Card className="max-w-2xl">
        <h2 className="font-display text-lg font-semibold text-emerald-900">
          Sitio público
        </h2>
        <dl className="mt-4 grid gap-3 text-sm">
          <div className="flex justify-between gap-4">
            <dt className="text-ink-soft">Número de WhatsApp</dt>
            <dd className="font-medium text-ink">{statusLabel(WHATSAPP_NUMBER)}</dd>
          </div>
          <div className="flex justify-between gap-4">
            <dt className="text-ink-soft">Imagen sección Thermomix</dt>
            <dd className="font-medium text-ink">
              {statusLabel(THERMOMIX_IMAGE_URL)}
            </dd>
          </div>
          <div className="flex justify-between gap-4">
            <dt className="text-ink-soft">Video sección Thermomix</dt>
            <dd className="font-medium text-ink">
              {statusLabel(THERMOMIX_VIDEO_URL)}
            </dd>
          </div>
          <div className="flex justify-between gap-4">
            <dt className="text-ink-soft">Link oficial Thermomix</dt>
            <dd className="font-medium text-ink">
              {statusLabel(THERMOMIX_OFFICIAL_URL)}
            </dd>
          </div>
        </dl>
        <p className="mt-4 text-xs text-ink-soft">
          Editá estos valores en las variables de entorno
          NEXT_PUBLIC_WHATSAPP_NUMBER, NEXT_PUBLIC_THERMOMIX_IMAGE_URL,
          NEXT_PUBLIC_THERMOMIX_VIDEO_URL y
          NEXT_PUBLIC_THERMOMIX_OFFICIAL_URL, y volvé a desplegar el sitio.
        </p>
      </Card>
    </div>
  );
}
