import Link from "next/link";
import { buttonClasses } from "@/components/ui/Button";
import { RECIPE_CONTENT_TYPE_LABELS } from "@/lib/validations/recipe";
import type { RecipeRow } from "@/types/database";

export function RecipeCard({ recipe }: { recipe: RecipeRow }) {
  return (
    <div className="flex flex-col gap-3 rounded-3xl border border-ink/10 bg-white p-6 shadow-sm">
      <div className="flex items-start justify-between gap-3">
        <h3 className="font-display text-lg font-semibold text-ink">
          {recipe.title}
        </h3>
        <span className="shrink-0 rounded-full bg-brand-100 px-3 py-1 text-xs font-semibold text-brand-700">
          {RECIPE_CONTENT_TYPE_LABELS[recipe.content_type]}
        </span>
      </div>

      {(recipe.prep_minutes || recipe.servings) && (
        <div className="flex gap-3 text-sm text-ink-soft">
          {recipe.prep_minutes && <span>⏱ {recipe.prep_minutes} min</span>}
          {recipe.servings && <span>🍽 {recipe.servings} porciones</span>}
        </div>
      )}

      {recipe.summary && (
        <p className="line-clamp-3 text-sm text-ink-soft">{recipe.summary}</p>
      )}

      <Link
        href={`/recetas/${recipe.slug}`}
        className={buttonClasses("primary", "mt-2 self-start px-5 py-2.5 text-sm")}
      >
        Ver receta
      </Link>
    </div>
  );
}
