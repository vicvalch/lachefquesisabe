import Link from "next/link";
import { RecipeForm } from "@/components/admin/RecipeForm";
import { Card } from "@/components/ui/Card";

export const metadata = {
  title: "Nueva receta | Admin | La Chef que Sí Sabe",
};

export default function NewRecipePage() {
  return (
    <div className="flex flex-col gap-6">
      <Link
        href="/admin/recetas"
        className="text-sm font-semibold text-brand-700 hover:underline"
      >
        ← Volver a recetas
      </Link>

      <div>
        <h1 className="font-display text-2xl font-semibold text-ink">
          Crear receta
        </h1>
        <p className="mt-1 text-sm text-ink-soft">
          Se guarda como borrador; podrás publicarla luego desde su edición.
        </p>
      </div>

      <Card className="max-w-2xl">
        <RecipeForm />
      </Card>
    </div>
  );
}
