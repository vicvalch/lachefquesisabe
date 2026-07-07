import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import { listLeads } from "@/lib/leads/queries";
import { LeadsTable } from "@/components/admin/LeadsTable";
import { Select } from "@/components/ui/Select";
import { Button } from "@/components/ui/Button";
import {
  LEAD_STATUS_OPTIONS,
  PRIMARY_INTEREST_OPTIONS,
} from "@/lib/validations/lead";
import type { LeadStatus, PrimaryInterest } from "@/types/database";

export const metadata = {
  title: "Leads | Admin | La Chef que Sí Sabe",
};

const STATUS_VALUES = LEAD_STATUS_OPTIONS.map((option) => option.value) as string[];
const INTEREST_VALUES = PRIMARY_INTEREST_OPTIONS.map(
  (option) => option.value,
) as string[];

function parseStatus(value: string | undefined): LeadStatus | undefined {
  return value && STATUS_VALUES.includes(value)
    ? (value as LeadStatus)
    : undefined;
}

function parseInterest(value: string | undefined): PrimaryInterest | undefined {
  return value && INTEREST_VALUES.includes(value)
    ? (value as PrimaryInterest)
    : undefined;
}

export default async function LeadsPage({
  searchParams,
}: {
  searchParams: Promise<{ status?: string; interest?: string }>;
}) {
  const params = await searchParams;
  const status = parseStatus(params.status);
  const interest = parseInterest(params.interest);
  const hasFilters = Boolean(status || interest);

  const supabase = await createClient();
  const leads = await listLeads(supabase, { status, interest });

  return (
    <div className="flex flex-col gap-6">
      <div>
        <h1 className="font-display text-2xl font-semibold text-ink">
          Leads
        </h1>
        <p className="mt-1 text-sm text-ink-soft">
          {leads.length}{" "}
          {hasFilters
            ? "leads que coinciden con el filtro."
            : "últimos leads recibidos desde la landing."}
        </p>
      </div>

      <form className="flex flex-wrap items-end gap-4" method="get">
        <div className="flex flex-col gap-1.5">
          <label htmlFor="status" className="text-sm font-semibold text-ink">
            Estado
          </label>
          <Select id="status" name="status" defaultValue={status ?? ""}>
            <option value="">Todos</option>
            {LEAD_STATUS_OPTIONS.map((option) => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </Select>
        </div>

        <div className="flex flex-col gap-1.5">
          <label htmlFor="interest" className="text-sm font-semibold text-ink">
            Interés
          </label>
          <Select id="interest" name="interest" defaultValue={interest ?? ""}>
            <option value="">Todos</option>
            {PRIMARY_INTEREST_OPTIONS.map((option) => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </Select>
        </div>

        <Button type="submit" variant="secondary">
          Filtrar
        </Button>
        {hasFilters && (
          <Link
            href="/admin/leads"
            className="text-sm font-semibold text-brand-700 hover:underline"
          >
            Limpiar filtros
          </Link>
        )}
      </form>

      <LeadsTable leads={leads} />
    </div>
  );
}
