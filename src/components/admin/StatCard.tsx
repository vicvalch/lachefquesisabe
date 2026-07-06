import { Card } from "@/components/ui/Card";

interface StatCardProps {
  label: string;
  value: number | string;
  hint?: string;
}

export function StatCard({ label, value, hint }: StatCardProps) {
  return (
    <Card>
      <p className="text-sm font-semibold text-ink-soft">{label}</p>
      <p className="mt-2 font-display text-3xl font-semibold text-brand-700">
        {value}
      </p>
      {hint && <p className="mt-1 text-xs text-ink-soft">{hint}</p>}
    </Card>
  );
}
