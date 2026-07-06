import { createClient } from "@/lib/supabase/server";
import { listLeads } from "@/lib/leads/queries";
import { LeadsTable } from "@/components/admin/LeadsTable";

export const metadata = {
  title: "Leads | Admin | La Chef que Sí Sabe",
};

export default async function LeadsPage() {
  const supabase = await createClient();
  const leads = await listLeads(supabase);

  return (
    <div className="flex flex-col gap-6">
      <div>
        <h1 className="font-display text-2xl font-semibold text-ink">
          Leads
        </h1>
        <p className="mt-1 text-sm text-ink-soft">
          Últimos {leads.length} leads recibidos desde la landing.
        </p>
      </div>
      <LeadsTable leads={leads} />
    </div>
  );
}
