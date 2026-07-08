const YOUTUBE_ID_PATTERN = /^[a-zA-Z0-9_-]{11}$/;

/**
 * Extrae el video ID de una URL de YouTube (watch, youtu.be, shorts,
 * embed). Devuelve null si no se reconoce el formato, para que el llamador
 * decida cómo manejarlo (nunca lanza).
 */
export function extractYoutubeVideoId(input: string): string | null {
  const trimmed = input.trim();
  if (YOUTUBE_ID_PATTERN.test(trimmed)) {
    return trimmed;
  }

  try {
    const url = new URL(trimmed);
    if (url.hostname === "youtu.be") {
      const id = url.pathname.slice(1);
      return YOUTUBE_ID_PATTERN.test(id) ? id : null;
    }

    if (url.hostname.endsWith("youtube.com")) {
      const watchId = url.searchParams.get("v");
      if (watchId && YOUTUBE_ID_PATTERN.test(watchId)) {
        return watchId;
      }

      const match = url.pathname.match(/\/(?:embed|shorts)\/([a-zA-Z0-9_-]{11})/);
      if (match) {
        return match[1];
      }
    }
  } catch {
    return null;
  }

  return null;
}

export function youtubeThumbnailUrl(videoId: string): string {
  return `https://img.youtube.com/vi/${videoId}/hqdefault.jpg`;
}

export function youtubeEmbedUrl(videoId: string): string {
  return `https://www.youtube-nocookie.com/embed/${videoId}?autoplay=1&rel=0`;
}

export function youtubeWatchUrl(videoId: string): string {
  return `https://www.youtube.com/watch?v=${videoId}`;
}
