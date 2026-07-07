import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import { listRecipesAdmin } from "@/lib/recipes/queries";
import { RecipesTable } from "@/components/admin/RecipesTable";
import { Button } from "@/components/ui/Button";

export const metadata = {
  title: "Recetas | Admin | La Chef que Sí Sabe",
};

export default async function RecipesAdminPage() {
  const supabase = await createClient();
  const recipes = await listRecipesAdmin(supabase);

  return (
    <div className="flex flex-col gap-8">
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <h1 className="font-display text-2xl font-semibold text-ink">
            Recetas
          </h1>
          <p className="mt-1 text-sm text-ink-soft">
            Publica recetas y tips de cocina para atraer tráfico y llevar
            visitantes hacia las demos.
          </p>
        </div>
        <Link href="/admin/recetas/new">
          <Button type="button">Nueva receta</Button>
        </Link>
      </div>

      <RecipesTable recipes={recipes} />
    </div>
  );
}
