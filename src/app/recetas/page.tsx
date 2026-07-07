import { createClient } from "@/lib/supabase/server";
import { listPublicContentPosts } from "@/lib/content/queries";
import { listCategories } from "@/lib/content/categories";
import { Header } from "@/components/landing/Header";
import { Footer } from "@/components/landing/Footer";
import { ContentPostCard } from "@/components/content/ContentPostCard";
import { ContentFilterBar } from "@/components/content/ContentFilterBar";
import { CONTENT_TYPE_VALUES } from "@/lib/validations/content-post";
import type { ContentType } from "@/types/database";

export const metadata = {
  title: "Recetas y tips | La Chef que Sí Sabe",
  description:
    "Recetas fáciles, tips de cocina y demostraciones para cocinar rico, fácil y sin complicarte.",
};

function parseType(value: string | undefined): ContentType | undefined {
  return value && (CONTENT_TYPE_VALUES as readonly string[]).includes(value)
    ? (value as ContentType)
    : undefined;
}

export default async function PublicRecipesPage({
  searchParams,
}: {
  searchParams: Promise<{ type?: string; category?: string }>;
}) {
  const params = await searchParams;
  const type = parseType(params.type);
  const categorySlug = params.category || undefined;

  const supabase = await createClient();
  const [posts, categories] = await Promise.all([
    listPublicContentPosts(supabase, { type, categorySlug }),
    listCategories(supabase),
  ]);

  const categoriesById = Object.fromEntries(
    categories.map((category) => [category.id, category]),
  );

  return (
    <>
      <Header />
      <main className="flex-1">
        <section className="mx-auto max-w-5xl px-6 py-16">
          <div className="text-center">
            <h1 className="font-display text-3xl font-semibold text-emerald-900 sm:text-4xl">
              Recetas y tips de cocina
            </h1>
            <p className="mt-3 text-ink-soft">
              Ideas simples para cocinar mejor cada día.
            </p>
          </div>

          <div className="mt-8">
            <ContentFilterBar
              categories={categories}
              currentType={type}
              currentCategorySlug={categorySlug}
            />
          </div>

          <div className="mt-12">
            {posts.length === 0 ? (
              <p className="rounded-3xl border border-dashed border-border p-10 text-center text-ink-soft">
                Todavía no hay contenido para este filtro. Dejá tus datos en
                la página principal y te avisamos cuando publiquemos algo
                nuevo.
              </p>
            ) : (
              <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
                {posts.map((post) => (
                  <ContentPostCard
                    key={post.id}
                    post={post}
                    category={post.category_id ? categoriesById[post.category_id] : null}
                  />
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
