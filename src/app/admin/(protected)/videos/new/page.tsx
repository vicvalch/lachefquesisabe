import Link from "next/link";
import { RecipeVideoForm } from "@/components/admin/RecipeVideoForm";
import { Card } from "@/components/ui/Card";

export const metadata = {
  title: "Nuevo video | Admin | La Chef que Sí Sabe",
};

export default function NewRecipeVideoPage() {
  return (
    <div className="flex flex-col gap-6">
      <Link
        href="/admin/videos"
        className="text-sm font-semibold text-brand-700 hover:underline"
      >
        ← Volver a videos
      </Link>

      <div>
        <h1 className="font-display text-2xl font-semibold text-ink">
          Agregar video de receta
        </h1>
        <p className="mt-1 text-sm text-ink-soft">
          Pega el link de YouTube; el video se sigue reproduciendo desde
          YouTube, acá solo se guardan sus metadatos.
        </p>
      </div>

      <Card className="max-w-2xl">
        <RecipeVideoForm />
      </Card>
    </div>
  );
}
