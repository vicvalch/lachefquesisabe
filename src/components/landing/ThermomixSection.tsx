import Link from "next/link";
import { buttonClasses } from "@/components/ui/Button";
import { YoutubeEmbed } from "@/components/videos/YoutubeEmbed";
import { buildWhatsAppUrl } from "@/lib/whatsapp/templates";
import {
  THERMOMIX_IMAGE_URL,
  THERMOMIX_OFFICIAL_URL,
  THERMOMIX_VIDEO_URL,
  WHATSAPP_NUMBER,
  WHATSAPP_THERMOMIX_MESSAGE,
} from "@/lib/config/site";
import { extractYoutubeVideoId } from "@/lib/recipe-videos/youtube";
import {
  ChefHatIcon,
  ClockIcon,
  MessageCircleIcon,
  SparklesIcon,
  UsersIcon,
} from "@/components/icons";

const BENEFITS = [
  {
    icon: ClockIcon,
    title: "Recupera horas cada semana",
    description: "Pica, cocina, vaporiza y amasa con una sola máquina.",
  },
  {
    icon: ChefHatIcon,
    title: "Cocina como una experta",
    description: "Recetas guiadas paso a paso, sin errores ni adivinar.",
  },
  {
    icon: SparklesIcon,
    title: "Resultados consistentes",
    description: "El mismo resultado delicioso cada vez que cocinas.",
  },
  {
    icon: UsersIcon,
    title: "Acompañamiento personal",
    description: "María te guía antes, durante y después de tu compra.",
  },
];

const DEFAULT_THERMOMIX_IMAGE = "/assets/thermomix.jpeg";

export function ThermomixSection() {
  const whatsappUrl = buildWhatsAppUrl(WHATSAPP_NUMBER, WHATSAPP_THERMOMIX_MESSAGE);
  const whatsappHref = whatsappUrl ?? "#contacto";
  const thermomixVideoId = THERMOMIX_VIDEO_URL
    ? extractYoutubeVideoId(THERMOMIX_VIDEO_URL)
    : null;
  const thermomixImageSrc = THERMOMIX_IMAGE_URL || DEFAULT_THERMOMIX_IMAGE;

  return (
    <section id="thermomix" className="px-6 py-20">
      <div className="mx-auto max-w-6xl">
        <div className="rounded-[2rem] bg-gradient-to-br from-emerald-900 to-emerald-700 p-8 shadow-lg sm:p-12">
          <div className="grid gap-10 lg:grid-cols-2 lg:items-center">
            <div>
              <span className="inline-flex items-center rounded-full border border-white/15 bg-white/10 px-4 py-1.5 text-sm font-semibold text-white/90">
                Thermomix® · Agente autorizada
              </span>
              <h2 className="mt-4 font-display text-3xl font-semibold text-white sm:text-4xl">
                Trae la Thermomix a tu cocina
              </h2>
              <p className="mt-4 max-w-lg text-cream/85">
                Descubre por qué miles de familias transformaron su forma de
                cocinar. María te acompaña desde la primera demo hasta que la
                Thermomix ya sea parte de tu rutina.
              </p>

              <div className="mt-6 flex flex-wrap gap-3">
                <Link href="/demos" className={buttonClasses("primary")}>
                  Quiero una demo de Thermomix
                </Link>
                <a
                  href={whatsappHref}
                  target={whatsappUrl ? "_blank" : undefined}
                  rel={whatsappUrl ? "noopener noreferrer" : undefined}
                  className={buttonClasses("outline", "gap-2")}
                >
                  <MessageCircleIcon className="h-4 w-4" />
                  Contactar a María
                </a>
              </div>

              {THERMOMIX_OFFICIAL_URL && (
                <a
                  href={THERMOMIX_OFFICIAL_URL}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="mt-4 inline-block text-sm font-semibold text-cream/90 underline underline-offset-4 hover:text-white"
                >
                  Conocer Thermomix en el sitio oficial →
                </a>
              )}
            </div>

            <div className="overflow-hidden rounded-3xl">
              {thermomixVideoId ? (
                <YoutubeEmbed
                  videoId={thermomixVideoId}
                  title="Video Thermomix"
                  thumbnailUrl={null}
                />
              ) : (
                // eslint-disable-next-line @next/next/no-img-element
                <img
                  src={thermomixImageSrc}
                  alt="Thermomix, la máquina de cocina inteligente"
                  className="aspect-video w-full object-cover"
                  loading="lazy"
                />
              )}
            </div>
          </div>

          <div className="mt-10 grid gap-4 border-t border-white/10 pt-8 sm:grid-cols-2 lg:grid-cols-4">
            {BENEFITS.map(({ icon: Icon, title, description }) => (
              <div key={title} className="flex flex-col gap-2">
                <span className="flex h-10 w-10 items-center justify-center rounded-full bg-white/10 text-white">
                  <Icon className="h-5 w-5" />
                </span>
                <p className="font-display text-base font-semibold text-white">
                  {title}
                </p>
                <p className="text-sm text-cream/75">{description}</p>
              </div>
            ))}
          </div>
        </div>

        <p className="mx-auto mt-6 max-w-2xl text-center text-sm font-medium text-ink-soft">
          María Checa Arias-Schreiber es agente autorizada de ventas de
          Thermomix.
        </p>
      </div>
    </section>
  );
}
