import { Card } from "@/components/ui/Card";
import {
  ClockIcon,
  ChefHatIcon,
  LeafIcon,
  SparklesIcon,
  BookIcon,
  HeartIcon,
} from "@/components/icons";

const BENEFITS = [
  {
    icon: ClockIcon,
    title: "Ahorra tiempo",
    description: "Cocina más rápido y organizá mejor tu día.",
  },
  {
    icon: ChefHatIcon,
    title: "Todo en uno",
    description: "Pica, mezcla, cocina, vaporiza, amasa y mucho más.",
  },
  {
    icon: LeafIcon,
    title: "Come mejor cada día",
    description: "Ideas simples con ingredientes reales.",
  },
  {
    icon: SparklesIcon,
    title: "Resultados consistentes",
    description: "Recetas guiadas para cocinar con más confianza.",
  },
  {
    icon: BookIcon,
    title: "Inspiración constante",
    description: "Recetas, tips y demos para cada ocasión.",
  },
  {
    icon: HeartIcon,
    title: "Acompañamiento cercano",
    description: "Te guío antes, durante y después de tu demo.",
  },
];

export function Features() {
  return (
    <section id="beneficios" className="bg-cream-dark/60 pb-20 pt-24 sm:pt-28">
      <div className="mx-auto max-w-6xl px-6">
        <h2 className="font-display text-3xl font-semibold text-emerald-900 sm:text-4xl">
          Qué vas a encontrar
        </h2>
        <div className="mt-10 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {BENEFITS.map(({ icon: Icon, title, description }) => (
            <Card key={title} className="border-border-soft">
              <span className="flex h-11 w-11 items-center justify-center rounded-full bg-brand-50 text-brand-700">
                <Icon className="h-5 w-5" />
              </span>
              <h3 className="mt-4 font-display text-xl font-semibold text-emerald-900">
                {title}
              </h3>
              <p className="mt-2 text-ink-soft">{description}</p>
            </Card>
          ))}
        </div>
      </div>
    </section>
  );
}
