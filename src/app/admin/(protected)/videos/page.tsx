import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import { listRecipeVideosAdmin } from "@/lib/recipe-videos/queries";
import { RecipeVideosTable } from "@/components/admin/RecipeVideosTable";
import { Button } from "@/components/ui/Button";

export const metadata = {
  title: "Videos | Admin | La Chef que Sí Sabe",
};

export default async function VideosAdminPage() {
  const supabase = await createClient();
  const videos = await listRecipeVideosAdmin(supabase);

  return (
    <div className="flex flex-col gap-8">
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <h1 className="font-display text-2xl font-semibold text-ink">Videos</h1>
          <p className="mt-1 text-sm text-ink-soft">
            Recetas en video de YouTube: solo se guardan el link y sus
            metadatos, nunca se sube el video a Supabase.
          </p>
        </div>
        <Link href="/admin/videos/new">
          <Button type="button">Nuevo video</Button>
        </Link>
      </div>

      <RecipeVideosTable videos={videos} />
    </div>
  );
}
