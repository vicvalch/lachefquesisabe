import Link from "next/link";
import { Header } from "@/components/landing/Header";
import { Footer } from "@/components/landing/Footer";
import { buttonClasses } from "@/components/ui/Button";
import {
  ChefHatIcon,
  HeartIcon,
  UsersIcon,
  LeafIcon,
  SparklesIcon,
  ScreenIcon,
} from "@/components/icons";

export const metadata = {
  title: "Historia | La Chef que Sí Sabe",
  description:
    "Conocé la historia de María Checa Arias-Schreiber: raíces peruanas, diseño funcional de cocinas y una cocina saludable llena de sabor.",
};

const SECTIONS = [
  {
    icon: ChefHatIcon,
    title: "Una vida alrededor de la cocina",
    paragraphs: [
      "María ha pasado años cocinando, compartiendo recetas y creando comida que se siente práctica, cálida y llena de memoria. Para ella, cocinar nunca fue solo una tarea: es una forma de cuidar a quienes se sientan a la mesa.",
    ],
  },
  {
    icon: HeartIcon,
    title: "Raíces peruanas y amor por los postres",
    paragraphs: [
      "Nacida en Perú, María conserva un cariño especial por los sabores de su tierra, en particular por los postres peruanos. Muchas de sus recetas están conectadas a su propia historia familiar, a celebraciones y a los sabores que la acompañaron desde niña.",
    ],
  },
  {
    icon: UsersIcon,
    title: "Diseño funcional para cocinas reales",
    paragraphs: [
      "Antes de dedicarse de lleno a la cocina, María estudió diseño del espacio interno. Con esa formación acompañó a restaurantes y cocinas industriales a organizar sus áreas de trabajo de forma más funcional, pensando siempre en cómo se mueve realmente un equipo dentro de una cocina.",
    ],
  },
  {
    icon: LeafIcon,
    title: "Una cocina más consciente",
    paragraphs: [
      "Con el tiempo, María fue adaptando sus recetas de toda la vida hacia una mirada más saludable: opciones sin gluten, atención a las alergias y menos azúcar. Para ella, comer más consciente no significa resignar sabor — sus recetas siguen siendo deliciosas, nunca aburridas ni de \"dieta\".",
    ],
  },
  {
    icon: SparklesIcon,
    title: "Thermomix como nueva herramienta",
    paragraphs: [
      "Cuando incorporó su Thermomix, María encontró una herramienta que le permitió descubrir, adaptar y perfeccionar sus recetas con más precisión y menos esfuerzo. Hoy, María Checa Arias-Schreiber es agente autorizada de ventas de Thermomix.",
    ],
  },
];

export default function HistoriaPage() {
  return (
    <>
      <Header />
      <main className="flex-1">
        <section className="bg-gradient-to-b from-emerald-900 to-emerald-700 px-6 py-16 text-center sm:py-20">
          <span className="inline-flex items-center rounded-full border border-white/15 bg-white/10 px-4 py-1.5 text-sm font-semibold uppercase tracking-wide text-white/90">
            Historia
          </span>
          <h1 className="mx-auto mt-5 max-w-2xl font-display text-3xl font-semibold leading-tight text-white sm:text-4xl md:text-5xl">
            La historia de María Checa Arias-Schreiber
          </h1>
          <p className="mx-auto mt-4 max-w-xl text-cream/85">
            Una cocina con raíces peruanas, diseño funcional y recetas
            saludables llenas de sabor.
          </p>
        </section>

        <section className="mx-auto max-w-3xl px-6 py-16 sm:py-20">
          <div className="flex flex-col gap-12">
            {SECTIONS.map(({ icon: Icon, title, paragraphs }) => (
              <div
                key={title}
                className="flex flex-col gap-4 border-t border-border-soft pt-10 first:border-t-0 first:pt-0"
              >
                <span className="flex h-11 w-11 items-center justify-center rounded-full bg-brand-50 text-brand-700">
                  <Icon className="h-5 w-5" />
                </span>
                <h2 className="font-display text-2xl font-semibold text-emerald-900">
                  {title}
                </h2>
                {paragraphs.map((paragraph) => (
                  <p key={paragraph} className="text-ink-soft">
                    {paragraph}
                  </p>
                ))}
              </div>
            ))}
          </div>
        </section>

        <section className="px-6 py-16">
          <div className="mx-auto max-w-4xl overflow-hidden rounded-3xl bg-gradient-to-br from-emerald-900 to-emerald-700 p-8 text-center shadow-sm sm:p-12">
            <h2 className="font-display text-2xl font-semibold text-white sm:text-3xl">
              Seguí la historia en tu propia cocina
            </h2>
            <p className="mx-auto mt-3 max-w-lg text-cream/80">
              Recetas, videos y demostraciones para cocinar con el mismo
              cariño y sentido práctico de siempre.
            </p>
            <div className="mt-6 flex flex-wrap justify-center gap-3">
              <Link href="/#recetas-newsletter" className={buttonClasses("primary")}>
                Quiero mis recetas
              </Link>
              <Link href="/demos" className={buttonClasses("outline")}>
                Quiero una demo de Thermomix
              </Link>
              <Link
                href="/#videos"
                className={buttonClasses("outline", "gap-2")}
              >
                <ScreenIcon className="h-4 w-4" />
                Ver recetas en video
              </Link>
            </div>
          </div>
        </section>
      </main>
      <Footer />
    </>
  );
}
