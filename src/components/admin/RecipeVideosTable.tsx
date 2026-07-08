import { ContentStatusBadge } from "@/components/ui/Badge";
import {
  RECIPE_VIDEO_STATUS_LABELS,
} from "@/lib/validations/recipe-video";
import { formatDateTime } from "@/lib/utils";
import type { RecipeVideoRow } from "@/types/database";

export function RecipeVideosTable({ videos }: { videos: RecipeVideoRow[] }) {
  if (videos.length === 0) {
    return (
      <div className="rounded-2xl border border-dashed border-ink/20 p-10 text-center text-ink-soft">
        <p className="font-display text-lg font-semibold text-emerald-900">
          Todavía no hay videos de recetas
        </p>
        <p className="mt-2 text-sm">
          Agrega el primero para empezar a mostrar recetas en video en la
          página principal.
        </p>
      </div>
    );
  }

  return (
    <div className="overflow-x-auto rounded-2xl border border-ink/10 bg-white">
      <table className="min-w-full divide-y divide-ink/10 text-sm">
        <thead className="bg-cream-dark/50 text-left text-xs font-semibold uppercase tracking-wide text-ink-soft">
          <tr>
            <th className="px-4 py-3">Título</th>
            <th className="px-4 py-3">Categoría</th>
            <th className="px-4 py-3">Duración</th>
            <th className="px-4 py-3">Creado</th>
            <th className="px-4 py-3">Estado</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-ink/10">
          {videos.map((video) => (
            <tr key={video.id} className="hover:bg-cream-dark/30">
              <td className="px-4 py-3 font-medium text-ink">{video.title}</td>
              <td className="px-4 py-3 capitalize text-ink-soft">{video.category}</td>
              <td className="px-4 py-3 text-ink-soft">
                {video.duration_minutes ? `${video.duration_minutes} min` : "—"}
              </td>
              <td className="px-4 py-3 text-ink-soft">
                {formatDateTime(video.created_at)}
              </td>
              <td className="px-4 py-3">
                <ContentStatusBadge
                  status={video.status}
                  label={RECIPE_VIDEO_STATUS_LABELS[video.status]}
                />
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
