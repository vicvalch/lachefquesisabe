import { describe, expect, it } from "vitest";
import {
  extractYoutubeVideoId,
  youtubeEmbedUrl,
  youtubeThumbnailUrl,
} from "./youtube";

describe("extractYoutubeVideoId", () => {
  it("extrae el ID de una URL watch estándar", () => {
    expect(
      extractYoutubeVideoId("https://www.youtube.com/watch?v=dQw4w9WgXcQ"),
    ).toBe("dQw4w9WgXcQ");
  });

  it("extrae el ID de una URL youtu.be corta", () => {
    expect(extractYoutubeVideoId("https://youtu.be/dQw4w9WgXcQ")).toBe(
      "dQw4w9WgXcQ",
    );
  });

  it("extrae el ID de una URL de shorts", () => {
    expect(
      extractYoutubeVideoId("https://www.youtube.com/shorts/dQw4w9WgXcQ"),
    ).toBe("dQw4w9WgXcQ");
  });

  it("extrae el ID de una URL de embed", () => {
    expect(
      extractYoutubeVideoId("https://www.youtube.com/embed/dQw4w9WgXcQ"),
    ).toBe("dQw4w9WgXcQ");
  });

  it("acepta directamente un ID de 11 caracteres", () => {
    expect(extractYoutubeVideoId("dQw4w9WgXcQ")).toBe("dQw4w9WgXcQ");
  });

  it("devuelve null para un link inválido", () => {
    expect(extractYoutubeVideoId("https://example.com/video")).toBeNull();
  });

  it("devuelve null para texto que no es una URL ni un ID", () => {
    expect(extractYoutubeVideoId("no es un link")).toBeNull();
  });
});

describe("youtubeThumbnailUrl", () => {
  it("arma la URL de miniatura pública", () => {
    expect(youtubeThumbnailUrl("dQw4w9WgXcQ")).toBe(
      "https://img.youtube.com/vi/dQw4w9WgXcQ/hqdefault.jpg",
    );
  });
});

describe("youtubeEmbedUrl", () => {
  it("arma la URL de embed con youtube-nocookie", () => {
    expect(youtubeEmbedUrl("dQw4w9WgXcQ")).toBe(
      "https://www.youtube-nocookie.com/embed/dQw4w9WgXcQ?autoplay=1&rel=0",
    );
  });
});
