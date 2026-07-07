import { buildWhatsAppUrl } from "@/lib/whatsapp/templates";
import { WHATSAPP_DEFAULT_MESSAGE, WHATSAPP_NUMBER } from "@/lib/config/site";
import { buttonClasses } from "@/components/ui/Button";
import { MessageCircleIcon } from "@/components/icons";

export function WhatsAppCtaSection() {
  const whatsappUrl = buildWhatsAppUrl(WHATSAPP_NUMBER, WHATSAPP_DEFAULT_MESSAGE);
  const href = whatsappUrl ?? "#contacto";

  return (
    <section className="px-6 py-16">
      <div className="mx-auto max-w-4xl overflow-hidden rounded-3xl bg-gradient-to-br from-emerald-900 to-emerald-700 p-8 text-center shadow-sm sm:p-12">
        <span className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-white/10 text-white">
          <MessageCircleIcon className="h-7 w-7" />
        </span>
        <h2 className="mt-5 font-display text-2xl font-semibold text-white sm:text-3xl">
          ¿Lista para transformar tu cocina?
        </h2>
        <p className="mx-auto mt-3 max-w-lg text-cream/80">
          Escribime y agendemos una demo personalizada.
        </p>
        <a
          href={href}
          target={whatsappUrl ? "_blank" : undefined}
          rel={whatsappUrl ? "noopener noreferrer" : undefined}
          className={buttonClasses("whatsapp", "mt-6 gap-2 px-6 py-3")}
        >
          <MessageCircleIcon className="h-4 w-4" />
          Contactar por WhatsApp
        </a>
      </div>
    </section>
  );
}
