"use client";

import { useState } from "react";
import { youtubeEmbedUrl } from "@/lib/recipe-videos/youtube";

interface YoutubeEmbedProps {
  videoId: string;
  title: string;
  thumbnailUrl: string | null;
}

/**
 * Embed "click to play": no carga el iframe de YouTube hasta que la
 * persona hace click, así la landing no paga el costo de red/JS de YouTube
 * para videos que nadie reproduce.
 */
export function YoutubeEmbed({ videoId, title, thumbnailUrl }: YoutubeEmbedProps) {
  const [playing, setPlaying] = useState(false);

  if (playing) {
    return (
      <div className="relative aspect-video w-full overflow-hidden rounded-2xl bg-ink">
        <iframe
          src={youtubeEmbedUrl(videoId)}
          title={title}
          className="absolute inset-0 h-full w-full"
          allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
          referrerPolicy="strict-origin-when-cross-origin"
          allowFullScreen
        />
      </div>
    );
  }

  return (
    <button
      type="button"
      onClick={() => setPlaying(true)}
      aria-label={`Reproducir video: ${title}`}
      className="group relative aspect-video w-full overflow-hidden rounded-2xl bg-ink"
    >
      {thumbnailUrl ? (
        // eslint-disable-next-line @next/next/no-img-element
        <img
          src={thumbnailUrl}
          alt=""
          className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-105"
        />
      ) : (
        <div className="h-full w-full bg-gradient-to-br from-emerald-900 to-emerald-700" />
      )}
      <span className="absolute inset-0 flex items-center justify-center bg-ink/20 transition-colors group-hover:bg-ink/30">
        <span className="flex h-16 w-16 items-center justify-center rounded-full bg-white/95 shadow-lg transition-transform group-hover:scale-110">
          <svg viewBox="0 0 24 24" fill="currentColor" className="ml-1 h-6 w-6 text-brand-700">
            <path d="M8 5v14l11-7z" />
          </svg>
        </span>
      </span>
    </button>
  );
}
