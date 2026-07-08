"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import type { KeyboardEvent, ReactNode, TouchEvent } from "react";
import { ChevronLeftIcon, ChevronRightIcon } from "@/components/icons";

const AUTOPLAY_INTERVAL_MS = 6000;
const SWIPE_THRESHOLD_PX = 50;

export interface HeroSlideDefinition {
  id: string;
  label: string;
  content: ReactNode;
}

interface HeroCarouselProps {
  slides: HeroSlideDefinition[];
}

export function HeroCarousel({ slides }: HeroCarouselProps) {
  const [activeIndex, setActiveIndex] = useState(0);
  const [isPaused, setIsPaused] = useState(false);
  const touchStartX = useRef<number | null>(null);

  const goTo = useCallback(
    (index: number) => {
      setActiveIndex(((index % slides.length) + slides.length) % slides.length);
    },
    [slides.length],
  );

  const goNext = useCallback(() => goTo(activeIndex + 1), [goTo, activeIndex]);
  const goPrevious = useCallback(() => goTo(activeIndex - 1), [goTo, activeIndex]);

  useEffect(() => {
    if (isPaused || slides.length < 2) return;
    if (
      typeof window.matchMedia === "function" &&
      window.matchMedia("(prefers-reduced-motion: reduce)").matches
    ) {
      return;
    }

    const timer = window.setInterval(() => {
      setActiveIndex((current) => (current + 1) % slides.length);
    }, AUTOPLAY_INTERVAL_MS);

    return () => window.clearInterval(timer);
  }, [isPaused, slides.length, activeIndex]);

  const handleKeyDown = (event: KeyboardEvent<HTMLElement>) => {
    if (event.key === "ArrowLeft") {
      event.preventDefault();
      goPrevious();
    } else if (event.key === "ArrowRight") {
      event.preventDefault();
      goNext();
    }
  };

  const handleTouchStart = (event: TouchEvent<HTMLElement>) => {
    touchStartX.current = event.touches[0]?.clientX ?? null;
  };

  const handleTouchEnd = (event: TouchEvent<HTMLElement>) => {
    const startX = touchStartX.current;
    const endX = event.changedTouches[0]?.clientX;
    touchStartX.current = null;
    if (startX == null || endX == null) return;

    const delta = endX - startX;
    if (delta > SWIPE_THRESHOLD_PX) {
      goPrevious();
    } else if (delta < -SWIPE_THRESHOLD_PX) {
      goNext();
    }
  };

  return (
    <section
      aria-roledescription="carousel"
      aria-label="Presentación principal"
      className="relative overflow-hidden bg-gradient-to-b from-emerald-900 to-emerald-700"
      onMouseEnter={() => setIsPaused(true)}
      onMouseLeave={() => setIsPaused(false)}
      onFocus={() => setIsPaused(true)}
      onBlur={(event) => {
        if (!event.currentTarget.contains(event.relatedTarget as Node | null)) {
          setIsPaused(false);
        }
      }}
      onKeyDown={handleKeyDown}
      onTouchStart={handleTouchStart}
      onTouchEnd={handleTouchEnd}
    >
      <div className="grid">
        {slides.map((slide, index) => {
          const isActive = index === activeIndex;
          return (
            <div
              key={slide.id}
              className={`col-start-1 row-start-1 transition-opacity duration-700 ease-out ${
                isActive ? "opacity-100" : "opacity-0"
              }`}
              aria-roledescription="slide"
              aria-label={`${index + 1} de ${slides.length}: ${slide.label}`}
              aria-hidden={!isActive}
              inert={!isActive}
            >
              {slide.content}
            </div>
          );
        })}
      </div>

      {slides.length > 1 && (
        <>
          <button
            type="button"
            onClick={goPrevious}
            aria-label="Diapositiva anterior"
            className="absolute left-2 top-1/2 z-10 hidden -translate-y-1/2 items-center justify-center rounded-full border border-white/20 bg-white/10 p-2.5 text-white backdrop-blur-sm transition hover:bg-white/20 hover:-translate-x-0.5 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-white sm:flex sm:left-4"
          >
            <ChevronLeftIcon className="h-5 w-5" />
          </button>
          <button
            type="button"
            onClick={goNext}
            aria-label="Siguiente diapositiva"
            className="absolute right-2 top-1/2 z-10 hidden -translate-y-1/2 items-center justify-center rounded-full border border-white/20 bg-white/10 p-2.5 text-white backdrop-blur-sm transition hover:bg-white/20 hover:translate-x-0.5 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-white sm:flex sm:right-4"
          >
            <ChevronRightIcon className="h-5 w-5" />
          </button>

          <div
            className="relative z-10 flex justify-center gap-2 pb-6 sm:pb-8"
            role="group"
            aria-label="Selector de diapositiva"
          >
            {slides.map((slide, index) => {
              const isActive = index === activeIndex;
              return (
                <button
                  key={slide.id}
                  type="button"
                  aria-label={`Ir a: ${slide.label}`}
                  aria-current={isActive ? "true" : undefined}
                  onClick={() => goTo(index)}
                  className={`h-2 rounded-full transition-all duration-300 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-white ${
                    isActive ? "w-7 bg-white" : "w-2 bg-white/40 hover:bg-white/60"
                  }`}
                />
              );
            })}
          </div>
        </>
      )}
    </section>
  );
}
