import { Card } from "@/components/ui/Card";

const FEATURES = [
  {
    title: "Recetas prácticas",
    description:
      "Ingredientes fáciles de conseguir, pasos claros y trucos para que te salga rico a la primera.",
  },
  {
    title: "Demostraciones en vivo",
    description:
      "Aprende viendo: te muestro cada receta paso a paso, con tiempo para tus preguntas.",
  },
  {
    title: "Todo con Thermomix",
    description:
      "Descubre cómo sacarle el máximo provecho a tu Thermomix, aunque recién estés empezando.",
  },
];

export function Features() {
  return (
    <section id="recetas" className="bg-cream-dark/60 py-20">
      <div className="mx-auto max-w-6xl px-6">
        <h2 className="font-display text-3xl font-semibold text-ink sm:text-4xl">
          Qué vas a encontrar
        </h2>
        <div className="mt-10 grid gap-6 sm:grid-cols-3">
          {FEATURES.map((feature) => (
            <Card key={feature.title}>
              <h3 className="font-display text-xl font-semibold text-brand-700">
                {feature.title}
              </h3>
              <p className="mt-2 text-ink-soft">{feature.description}</p>
            </Card>
          ))}
        </div>
      </div>
    </section>
  );
}
