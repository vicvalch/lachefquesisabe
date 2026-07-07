import Link from "next/link";
import { buttonClasses } from "@/components/ui/Button";
import { buildWhatsAppUrl } from "@/lib/whatsapp/templates";
import { WHATSAPP_DEFAULT_MESSAGE, WHATSAPP_NUMBER } from "@/lib/config/site";
import { ClockIcon, ChefHatIcon, LeafIcon, MessageCircleIcon } from "@/components/icons";

const QUICK_HIGHLIGHTS = [
  { icon: ClockIcon, label: "Ahorra tiempo en la cocina" },
  { icon: ChefHatIcon, label: "Demos guiadas paso a paso" },
  { icon: LeafIcon, label: "Recetas naturales y simples" },
];

export function Hero() {
  const whatsappHref =
    buildWhatsAppUrl(WHATSAPP_NUMBER, WHATSAPP_DEFAULT_MESSAGE) ?? "#contacto";

  return (
    <section className="relative overflow-hidden bg-gradient-to-b from-emerald-900 to-emerald-700">
      <div className="mx-auto flex max-w-6xl flex-col items-start gap-6 px-6 pb-28 pt-16 sm:pb-32 sm:pt-24">
        <span className="inline-flex items-center rounded-full border border-white/15 bg-white/10 px-4 py-1.5 text-sm font-semibold text-white/90">
          Cocina natural · Thermomix · Costa Rica
        </span>
        <h1 className="font-display text-4xl font-semibold leading-tight text-white sm:text-5xl md:text-6xl">
          Cocina rico, fácil
          <br className="hidden sm:block" /> y{" "}
          <em className="italic">sin complicarte</em>.
        </h1>
        <p className="max-w-xl text-lg text-cream/85">
          Recetas, demos y acompañamiento personalizado para sacarle más
          provecho a tu Thermomix.
        </p>
        <div className="flex flex-wrap gap-3 pt-2">
          <Link href="/demos" className={buttonClasses("primary")}>
            Agendar una demo
          </Link>
          <Link href="/recetas" className={buttonClasses("outline")}>
            Ver recetas
          </Link>
          <a
            href={whatsappHref}
            target="_blank"
            rel="noopener noreferrer"
            className={buttonClasses("whatsapp", "gap-2")}
          >
            <MessageCircleIcon className="h-4 w-4" />
            Escribirme por WhatsApp
          </a>
        </div>
      </div>

      <div className="relative mx-auto -mt-16 max-w-6xl px-6 sm:-mt-20">
        <div className="grid gap-4 sm:grid-cols-3">
          {QUICK_HIGHLIGHTS.map(({ icon: Icon, label }) => (
            <div
              key={label}
              className="flex items-center gap-3 rounded-2xl border border-border-soft bg-white-soft p-5 shadow-md"
            >
              <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-brand-50 text-brand-700">
                <Icon className="h-5 w-5" />
              </span>
              <p className="text-sm font-semibold text-ink">{label}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
