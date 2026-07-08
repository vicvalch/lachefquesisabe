import { createClient } from "@/lib/supabase/server";
import { listPublicRecipeVideos } from "@/lib/recipe-videos/queries";
import { RecipeVideoCard } from "@/components/videos/RecipeVideoCard";
import { ScreenIcon } from "@/components/icons";

export async function RecipeVideosSection() {
  const supabase = await createClient();
  const videos = await listPublicRecipeVideos(supabase, { limit: 6 });

  return (
    <section id="videos" className="bg-cream-dark/60 px-6 py-20">
      <div className="mx-auto max-w-6xl">
        <div className="text-center">
          <p className="text-sm font-semibold uppercase tracking-wide text-brand-700">
            Recetas en video
          </p>
          <h2 className="mt-2 font-display text-3xl font-semibold text-emerald-900 sm:text-4xl">
            Aprende a cocinar viéndome cocinar
          </h2>
          <p className="mx-auto mt-3 max-w-xl text-ink-soft">
            Videos cortos y prácticos para cocinar rico, fácil y sin
            complicarte.
          </p>
        </div>

        <div className="mt-10">
          {videos.length === 0 ? (
            <div className="mx-auto flex max-w-lg flex-col items-center gap-3 rounded-3xl border border-dashed border-border bg-white-soft/60 p-10 text-center">
              <span className="flex h-12 w-12 items-center justify-center rounded-full bg-brand-50 text-brand-700">
                <ScreenIcon className="h-6 w-6" />
              </span>
              <p className="font-display text-lg font-semibold text-emerald-900">
                Recetas en video muy pronto
              </p>
              <p className="text-sm text-ink-soft">
                Estoy preparando los primeros videos de recetas. Suscríbete
                para enterarte apenas estén disponibles.
              </p>
            </div>
          ) : (
            <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
              {videos.map((video) => (
                <RecipeVideoCard key={video.id} video={video} />
              ))}
            </div>
          )}
        </div>
      </div>
    </section>
  );
}
