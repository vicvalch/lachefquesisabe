import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import { listCategories } from "@/lib/content/categories";
import { ContentPostForm } from "@/components/admin/ContentPostForm";
import { Card } from "@/components/ui/Card";

export const metadata = {
  title: "Nuevo contenido | Admin | La Chef que Sí Sabe",
};

export default async function NewContentPostPage() {
  const supabase = await createClient();
  const categories = await listCategories(supabase);

  return (
    <div className="flex flex-col gap-6">
      <Link
        href="/admin/content"
        className="text-sm font-semibold text-brand-700 hover:underline"
      >
        ← Volver a contenido
      </Link>

      <div>
        <h1 className="font-display text-2xl font-semibold text-ink">
          Crear contenido
        </h1>
        <p className="mt-1 text-sm text-ink-soft">
          Elige el tipo (receta, tip o guía) y el estado en el que quieres
          guardarlo; puedes publicarlo ahora mismo o dejarlo en borrador.
        </p>
      </div>

      <Card className="max-w-2xl">
        <ContentPostForm categories={categories} />
      </Card>
    </div>
  );
}
