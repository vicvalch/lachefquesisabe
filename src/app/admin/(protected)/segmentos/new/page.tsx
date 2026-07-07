import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import { listAllDemoEvents } from "@/lib/demos/queries";
import { listContentPostsAdmin } from "@/lib/content/queries";
import { LeadSegmentForm } from "@/components/admin/LeadSegmentForm";
import { Card } from "@/components/ui/Card";

export const metadata = {
  title: "Nuevo segmento | Admin | La Chef que Sí Sabe",
};

export default async function NewLeadSegmentPage() {
  const supabase = await createClient();
  const [demoEvents, contentPosts] = await Promise.all([
    listAllDemoEvents(supabase),
    listContentPostsAdmin(supabase),
  ]);

  return (
    <div className="flex flex-col gap-6">
      <Link
        href="/admin/segmentos"
        className="text-sm font-semibold text-brand-700 hover:underline"
      >
        ← Volver a segmentos
      </Link>

      <div>
        <h1 className="font-display text-2xl font-semibold text-ink">
          Nuevo segmento
        </h1>
        <p className="mt-1 text-sm text-ink-soft">
          Los filtros se combinan con AND. Deja un filtro sin marcar/vacío
          para no restringir por esa dimensión.
        </p>
      </div>

      <Card className="max-w-2xl">
        <LeadSegmentForm demoEvents={demoEvents} contentPosts={contentPosts} />
      </Card>
    </div>
  );
}
