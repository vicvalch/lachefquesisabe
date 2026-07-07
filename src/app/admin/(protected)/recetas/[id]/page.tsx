import Link from "next/link";
import { notFound } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { getRecipeById } from "@/lib/recipes/queries";
import { RecipeForm } from "@/components/admin/RecipeForm";
import { Card } from "@/components/ui/Card";

export const metadata = {
  title: "Editar receta | Admin | La Chef que Sí Sabe",
};

export default async function RecipeDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const supabase = await createClient();
  const recipe = await getRecipeById(supabase, id);

  if (!recipe) {
    notFound();
  }

  return (
    <div className="flex flex-col gap-6">
      <Link
        href="/admin/recetas"
        className="text-sm font-semibold text-brand-700 hover:underline"
      >
        ← Volver a recetas
      </Link>

      <div>
        <h1 className="font-display text-2xl font-semibold text-ink">
          {recipe.title}
        </h1>
        <p className="mt-1 text-sm text-ink-soft">
          Edita el contenido y usa el campo Estado para publicarla o
          despublicarla.
        </p>
      </div>

      <Card className="max-w-2xl">
        <RecipeForm recipe={recipe} />
      </Card>
    </div>
  );
}
