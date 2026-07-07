import Link from "next/link";
import { notFound } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { getContentPostById } from "@/lib/content/queries";
import { listCategories } from "@/lib/content/categories";
import { ContentPostForm } from "@/components/admin/ContentPostForm";
import { Card } from "@/components/ui/Card";

export const metadata = {
  title: "Editar contenido | Admin | La Chef que Sí Sabe",
};

export default async function ContentPostDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const supabase = await createClient();
  const post = await getContentPostById(supabase, id);

  if (!post) {
    notFound();
  }

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
          {post.title}
        </h1>
        <p className="mt-1 text-sm text-ink-soft">
          Edita el contenido y usa el campo Estado para publicarlo,
          despublicarlo (volver a borrador) o archivarlo.
        </p>
      </div>

      <Card className="max-w-2xl">
        <ContentPostForm post={post} categories={categories} />
      </Card>
    </div>
  );
}
