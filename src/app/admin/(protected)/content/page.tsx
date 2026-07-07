import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import { listContentPostsAdmin } from "@/lib/content/queries";
import { listCategories } from "@/lib/content/categories";
import { ContentPostsTable } from "@/components/admin/ContentPostsTable";
import { Button } from "@/components/ui/Button";

export const metadata = {
  title: "Contenido | Admin | La Chef que Sí Sabe",
};

export default async function ContentAdminPage() {
  const supabase = await createClient();
  const [posts, categories] = await Promise.all([
    listContentPostsAdmin(supabase),
    listCategories(supabase),
  ]);

  const categoriesById = Object.fromEntries(
    categories.map((category) => [category.id, category]),
  );

  return (
    <div className="flex flex-col gap-8">
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <h1 className="font-display text-2xl font-semibold text-ink">
            Contenido
          </h1>
          <p className="mt-1 text-sm text-ink-soft">
            Publica recetas, tips y guías para atraer tráfico y llevar
            visitantes hacia las demos.
          </p>
        </div>
        <Link href="/admin/content/new">
          <Button type="button">Nuevo contenido</Button>
        </Link>
      </div>

      <ContentPostsTable posts={posts} categoriesById={categoriesById} />
    </div>
  );
}
