import { notFound } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import {
  getPublicRecipeBySlug,
  listOtherPublicRecipes,
} from "@/lib/recipes/queries";
import { Header } from "@/components/landing/Header";
import { Footer } from "@/components/landing/Footer";
import { RecipeCard } from "@/components/recipes/RecipeCard";
import { RecipeCtaSection } from "@/components/recipes/RecipeCtaSection";
import { RECIPE_CONTENT_TYPE_LABELS } from "@/lib/validations/recipe";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const supabase = await createClient();
  const recipe = await getPublicRecipeBySlug(supabase, slug);

  return {
    title: recipe
      ? `${recipe.title} | La Chef que Sí Sabe`
      : "Receta | La Chef que Sí Sabe",
  };
}

export default async function PublicRecipeDetailPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const supabase = await createClient();
  const recipe = await getPublicRecipeBySlug(supabase, slug);

  if (!recipe) {
    notFound();
  }

  const otherRecipes = await listOtherPublicRecipes(supabase, recipe.id);
  const ingredientLines = recipe.ingredients
    ? recipe.ingredients.split("\n").map((line) => line.trim()).filter(Boolean)
    : [];

  return (
    <>
      <Header />
      <main className="flex-1">
        <section className="mx-auto max-w-3xl px-6 py-16">
          <span className="inline-block rounded-full bg-brand-100 px-4 py-1.5 text-sm font-semibold text-brand-700">
            {RECIPE_CONTENT_TYPE_LABELS[recipe.content_type]}
          </span>
          <h1 className="mt-4 font-display text-3xl font-semibold text-ink sm:text-4xl">
            {recipe.title}
          </h1>

          {(recipe.prep_minutes || recipe.servings) && (
            <div className="mt-3 flex gap-4 text-ink-soft">
              {recipe.prep_minutes && <p>⏱ {recipe.prep_minutes} min</p>}
              {recipe.servings && <p>🍽 {recipe.servings} porciones</p>}
            </div>
          )}

          {recipe.cover_image_url && (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              src={recipe.cover_image_url}
              alt={recipe.title}
              className="mt-6 w-full rounded-3xl object-cover"
            />
          )}

          {recipe.summary && (
            <p className="mt-6 text-lg text-ink-soft">{recipe.summary}</p>
          )}

          {ingredientLines.length > 0 && (
            <div className="mt-8 rounded-3xl border border-ink/10 bg-white p-6 shadow-sm">
              <h2 className="font-display text-lg font-semibold text-ink">
                Ingredientes
              </h2>
              <ul className="mt-3 list-disc space-y-1 pl-5 text-ink-soft">
                {ingredientLines.map((line, index) => (
                  <li key={index}>{line}</li>
                ))}
              </ul>
            </div>
          )}

          <div className="mt-8 whitespace-pre-wrap text-ink-soft">
            {recipe.content}
          </div>

          <RecipeCtaSection message={recipe.cta_message} />

          {otherRecipes.length > 0 && (
            <div className="mt-16">
              <h2 className="font-display text-xl font-semibold text-ink">
                Seguir aprendiendo
              </h2>
              <div className="mt-6 grid gap-6 sm:grid-cols-2">
                {otherRecipes.map((other) => (
                  <RecipeCard key={other.id} recipe={other} />
                ))}
              </div>
            </div>
          )}
        </section>
      </main>
      <Footer />
    </>
  );
}
