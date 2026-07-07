import Link from "next/link";
import { RecipeStatusBadge } from "@/components/ui/Badge";
import {
  RECIPE_CONTENT_TYPE_LABELS,
  RECIPE_STATUS_LABELS,
} from "@/lib/validations/recipe";
import { formatDateTime } from "@/lib/utils";
import type { RecipeRow } from "@/types/database";

export function RecipesTable({ recipes }: { recipes: RecipeRow[] }) {
  if (recipes.length === 0) {
    return (
      <p className="rounded-2xl border border-dashed border-ink/20 p-8 text-center text-ink-soft">
        Todavía no hay recetas ni tips. Crea el primero para empezar a atraer
        tráfico.
      </p>
    );
  }

  return (
    <div className="overflow-x-auto rounded-2xl border border-ink/10 bg-white">
      <table className="min-w-full divide-y divide-ink/10 text-sm">
        <thead className="bg-cream-dark/50 text-left text-xs font-semibold uppercase tracking-wide text-ink-soft">
          <tr>
            <th className="px-4 py-3">Título</th>
            <th className="px-4 py-3">Tipo</th>
            <th className="px-4 py-3">Creada</th>
            <th className="px-4 py-3">Estado</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-ink/10">
          {recipes.map((recipe) => (
            <tr key={recipe.id} className="hover:bg-cream-dark/30">
              <td className="px-4 py-3 font-medium text-ink">
                <Link
                  href={`/admin/recetas/${recipe.id}`}
                  className="hover:text-brand-700 hover:underline"
                >
                  {recipe.title}
                </Link>
              </td>
              <td className="px-4 py-3 text-ink-soft">
                {RECIPE_CONTENT_TYPE_LABELS[recipe.content_type]}
              </td>
              <td className="px-4 py-3 text-ink-soft">
                {formatDateTime(recipe.created_at)}
              </td>
              <td className="px-4 py-3">
                <RecipeStatusBadge
                  status={recipe.status}
                  label={RECIPE_STATUS_LABELS[recipe.status]}
                />
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
