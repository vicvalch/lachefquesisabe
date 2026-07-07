import { Header } from "@/components/landing/Header";
import { Footer } from "@/components/landing/Footer";

export const metadata = {
  title: "Política de privacidad | La Chef que Sí Sabe",
};

export default function PrivacidadPage() {
  return (
    <>
      <Header />
      <main className="flex-1">
        <section className="mx-auto max-w-3xl px-6 py-16">
          <h1 className="font-display text-3xl font-semibold text-ink">
            Política de privacidad
          </h1>
          <div className="mt-8 flex flex-col gap-6 text-ink-soft">
            <p>
              En La Chef que Sí Sabe (@lachefquesisabe) nos tomamos en serio
              la privacidad de quienes nos dejan sus datos. Esta página
              explica, de forma simple, qué información recopilamos a
              través de nuestro formulario de contacto y cómo la usamos.
            </p>

            <div>
              <h2 className="font-display text-xl font-semibold text-ink">
                Qué datos recopilamos
              </h2>
              <p className="mt-2">
                Cuando completas el formulario de la landing recopilamos tu
                nombre, email, teléfono (opcional), el tipo de interés que
                seleccionaste (recetas, demo de cocina, demo de Thermomix u
                otro) y el mensaje que quieras dejarnos.
              </p>
            </div>

            <div>
              <h2 className="font-display text-xl font-semibold text-ink">
                Para qué usamos tus datos
              </h2>
              <p className="mt-2">
                Usamos tu información únicamente para contactarte sobre
                recetas, tips de cocina y demostraciones de Thermomix.
                Solo podemos guardar tus datos si marcaste la casilla de
                consentimiento del formulario.
              </p>
            </div>

            <div>
              <h2 className="font-display text-xl font-semibold text-ink">
                Con quién compartimos tus datos
              </h2>
              <p className="mt-2">
                No vendemos ni compartimos tus datos con terceros. Tu
                información se almacena en Supabase (nuestro proveedor de
                base de datos) y solo el equipo de La Chef que Sí Sabe tiene
                acceso a ella.
              </p>
            </div>

            <div>
              <h2 className="font-display text-xl font-semibold text-ink">
                Tus derechos
              </h2>
              <p className="mt-2">
                En cualquier momento puedes pedirnos acceder, corregir o
                eliminar tus datos. Para hacerlo, escríbenos por los mismos
                canales por los que nos conociste (por ejemplo, nuestras
                redes sociales @lachefquesisabe).
              </p>
            </div>
          </div>
        </section>
      </main>
      <Footer />
    </>
  );
}
