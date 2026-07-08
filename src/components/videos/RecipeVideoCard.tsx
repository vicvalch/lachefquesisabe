import { YoutubeEmbed } from "@/components/videos/YoutubeEmbed";
import type { RecipeVideoRow } from "@/types/database";

export function RecipeVideoCard({ video }: { video: RecipeVideoRow }) {
  return (
    <div className="flex flex-col gap-3 rounded-3xl border border-border-soft bg-white-soft p-5 shadow-sm transition-shadow hover:shadow-md">
      {video.youtube_video_id && (
        <YoutubeEmbed
          videoId={video.youtube_video_id}
          title={video.title}
          thumbnailUrl={video.thumbnail_url}
        />
      )}

      <div className="flex items-start justify-between gap-3">
        <h3 className="font-display text-lg font-semibold text-emerald-900">
          {video.title}
        </h3>
        {video.duration_minutes && (
          <span className="shrink-0 rounded-full bg-brand-100 px-3 py-1 text-xs font-semibold text-brand-700">
            {video.duration_minutes} min
          </span>
        )}
      </div>

      <span className="w-fit rounded-full bg-cream-dark/60 px-2.5 py-0.5 text-xs font-semibold capitalize text-ink-soft">
        {video.category}
      </span>

      {video.description && (
        <p className="line-clamp-2 text-sm text-ink-soft">{video.description}</p>
      )}
    </div>
  );
}
