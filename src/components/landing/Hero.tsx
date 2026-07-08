import { HeroCarousel } from "@/components/landing/hero/HeroCarousel";
import { HeroMainSlide } from "@/components/landing/hero/HeroMainSlide";
import { HeroMariaSlide } from "@/components/landing/hero/HeroMariaSlide";

export function Hero() {
  return (
    <HeroCarousel
      slides={[
        {
          id: "principal",
          label: "Cocina rico, fácil y sin complicarte",
          content: <HeroMainSlide />,
        },
        {
          id: "sobre-maria",
          label: "Sobre María",
          content: <HeroMariaSlide />,
        },
      ]}
    />
  );
}
