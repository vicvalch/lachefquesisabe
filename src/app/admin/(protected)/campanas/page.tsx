import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import { listOutreachCampaigns } from "@/lib/campaigns/queries";
import { OutreachCampaignsTable } from "@/components/admin/OutreachCampaignsTable";
import { Button } from "@/components/ui/Button";

export const metadata = {
  title: "Campañas | Admin | La Chef que Sí Sabe",
};

export default async function OutreachCampaignsPage() {
  const supabase = await createClient();
  const campaigns = await listOutreachCampaigns(supabase);

  return (
    <div className="flex flex-col gap-6">
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <h1 className="font-display text-2xl font-semibold text-ink">
            Campañas de seguimiento
          </h1>
          <p className="mt-1 text-sm text-ink-soft">
            Una campaña combina un segmento con una plantilla y genera una
            tarea de seguimiento manual por cada lead que entra al segmento.
          </p>
        </div>
        <Link href="/admin/campanas/new">
          <Button type="button">+ Nueva campaña</Button>
        </Link>
      </div>

      <OutreachCampaignsTable campaigns={campaigns} />
    </div>
  );
}
