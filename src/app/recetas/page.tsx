import { createClient } from "@/lib/supabase/server";
import { listPublicRecipes } from "@/lib/recipes/queries";
import { Header } from "@/components/landing/Header";
import { Footer } from "@/components/landing/Footer";
import { RecipeCard } from "@/components/recipes/RecipeCard";

export const metadata = {
  title: "Recetas | La Chef que Sí Sabe",
};

export default async function PublicRecipesPage() {
  const supabase = await createClient();
  const recipes = await listPublicRecipes(supabase);

  return (
    <>
      <Header />
      <main className="flex-1">
        <section className="mx-auto max-w-5xl px-6 py-16">
          <div className="text-center">
            <h1 className="font-display text-3xl font-semibold text-ink sm:text-4xl">
              Recetas y tips de cocina
            </h1>
            <p className="mt-3 text-ink-soft">
              Ideas prácticas para cocinar rico y fácil, directo desde la
              cocina de la chef.
            </p>
          </div>

          <div className="mt-12">
            {recipes.length === 0 ? (
              <p className="rounded-3xl border border-dashed border-ink/20 p-10 text-center text-ink-soft">
                Muy pronto vamos a publicar las primeras recetas. Dejá tus
                datos en la página principal y te avisamos.
              </p>
            ) : (
              <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
                {recipes.map((recipe) => (
                  <RecipeCard key={recipe.id} recipe={recipe} />
                ))}
              </div>
            )}
          </div>
        </section>
      </main>
      <Footer />
    </>
  );
}
