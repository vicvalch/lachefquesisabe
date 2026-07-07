import { notFound } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import {
  getPublicContentPostBySlug,
  listOtherPublicContentPosts,
} from "@/lib/content/queries";
import { getCategoryById } from "@/lib/content/categories";
import { Header } from "@/components/landing/Header";
import { Footer } from "@/components/landing/Footer";
import { ContentPostCard } from "@/components/content/ContentPostCard";
import { ContentCtaSection } from "@/components/content/ContentCtaSection";
import { SafeTextRenderer } from "@/components/ui/SafeTextRenderer";
import {
  CONTENT_DIFFICULTY_LABELS,
  CONTENT_TYPE_LABELS,
} from "@/lib/validations/content-post";
import { formatDateTime } from "@/lib/utils";

const GENERIC_DESCRIPTION =
  "Recetas fáciles, tips de cocina y demostraciones para cocinar rico, fácil y sin complicarte.";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const supabase = await createClient();
  const post = await getPublicContentPostBySlug(supabase, slug);

  if (!post) {
    return { title: "Contenido | La Chef que Sí Sabe" };
  }

  return {
    title: post.seo_title || `${post.title} | La Chef que Sí Sabe`,
    description: post.seo_description || post.excerpt || GENERIC_DESCRIPTION,
  };
}

function splitLines(value: string | null): string[] {
  if (!value) return [];
  return value
    .split("\n")
    .map((line) => line.trim())
    .filter(Boolean);
}

export default async function PublicContentPostPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const supabase = await createClient();
  const post = await getPublicContentPostBySlug(supabase, slug);

  if (!post) {
    notFound();
  }

  const [otherPosts, category] = await Promise.all([
    listOtherPublicContentPosts(supabase, post.id),
    post.category_id ? getCategoryById(supabase, post.category_id) : null,
  ]);

  const ingredientLines = splitLines(post.ingredients);
  const instructionLines = splitLines(post.instructions);
  const totalMinutes =
    (post.prep_time_minutes ?? 0) + (post.cook_time_minutes ?? 0);

  return (
    <>
      <Header />
      <main className="flex-1">
        <section className="mx-auto max-w-3xl px-6 py-16">
          <div className="flex flex-wrap items-center gap-2">
            <span className="inline-block rounded-full bg-brand-100 px-4 py-1.5 text-sm font-semibold text-brand-700">
              {CONTENT_TYPE_LABELS[post.content_type]}
            </span>
            {category && (
              <span className="inline-block rounded-full bg-cream-dark/60 px-4 py-1.5 text-sm font-semibold text-ink-soft">
                {category.name}
              </span>
            )}
          </div>

          <h1 className="mt-4 font-display text-3xl font-semibold text-emerald-900 sm:text-4xl">
            {post.title}
          </h1>

          {post.published_at && (
            <p className="mt-2 text-sm text-ink-soft">
              Publicado el {formatDateTime(post.published_at)}
            </p>
          )}

          {post.excerpt && (
            <p className="mt-4 text-lg text-ink-soft">{post.excerpt}</p>
          )}

          {post.image_url && (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              src={post.image_url}
              alt={post.title}
              className="mt-6 w-full rounded-3xl object-cover"
            />
          )}

          {(post.prep_time_minutes ||
            post.cook_time_minutes ||
            post.servings ||
            post.difficulty) && (
            <div className="mt-6 flex flex-wrap gap-4 text-sm text-ink-soft">
              {post.prep_time_minutes && (
                <span>⏱ Preparación: {post.prep_time_minutes} min</span>
              )}
              {post.cook_time_minutes && (
                <span>🔥 Cocción: {post.cook_time_minutes} min</span>
              )}
              {totalMinutes > 0 && <span>⏳ Total: {totalMinutes} min</span>}
              {post.servings && <span>🍽 {post.servings} porciones</span>}
              {post.difficulty && (
                <span>{CONTENT_DIFFICULTY_LABELS[post.difficulty]}</span>
              )}
            </div>
          )}

          {ingredientLines.length > 0 && (
            <div className="mt-8 rounded-3xl border border-border-soft bg-white-soft p-6 shadow-sm">
              <h2 className="font-display text-lg font-semibold text-emerald-900">
                Ingredientes
              </h2>
              <ul className="mt-3 list-disc space-y-1 pl-5 text-ink-soft">
                {ingredientLines.map((line, index) => (
                  <li key={index}>{line}</li>
                ))}
              </ul>
            </div>
          )}

          {instructionLines.length > 0 && (
            <div className="mt-6 rounded-3xl border border-border-soft bg-white-soft p-6 shadow-sm">
              <h2 className="font-display text-lg font-semibold text-emerald-900">
                Instrucciones
              </h2>
              <ol className="mt-3 list-decimal space-y-2 pl-5 text-ink-soft">
                {instructionLines.map((line, index) => (
                  <li key={index}>{line}</li>
                ))}
              </ol>
            </div>
          )}

          <div className="mt-8 text-ink-soft">
            <SafeTextRenderer text={post.body} />
          </div>

          <ContentCtaSection />

          {otherPosts.length > 0 && (
            <div className="mt-16">
              <h2 className="font-display text-xl font-semibold text-emerald-900">
                Seguir aprendiendo
              </h2>
              <div className="mt-6 grid gap-6 sm:grid-cols-2">
                {otherPosts.map((other) => (
                  <ContentPostCard key={other.id} post={other} />
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
