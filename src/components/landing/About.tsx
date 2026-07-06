export function About() {
  return (
    <section id="thermomix" className="py-20">
      <div className="mx-auto grid max-w-6xl gap-10 px-6 md:grid-cols-2 md:items-center">
        <div>
          <p className="text-sm font-semibold uppercase tracking-wide text-brand-600">
            Sobre mí
          </p>
          <h2 className="mt-2 font-display text-3xl font-semibold text-ink sm:text-4xl">
            Cocinar no tiene por qué ser complicado
          </h2>
          <p className="mt-4 text-ink-soft">
            Llevo años enseñando a cocinar con Thermomix de forma simple y
            cercana, sin tecnicismos ni presión. Mi promesa es sencilla:
            recetas ricas, fáciles de seguir y demostraciones donde puedes
            resolver todas tus dudas en el momento.
          </p>
        </div>
        <div className="rounded-3xl bg-brand-100/60 p-10 text-center">
          <p className="font-display text-2xl italic text-brand-700">
            &ldquo;Cocina rico, fácil y sin complicarte.&rdquo;
          </p>
        </div>
      </div>
    </section>
  );
}
