import Link from "next/link";
import { ContentStatusBadge } from "@/components/ui/Badge";
import {
  CONTENT_STATUS_LABELS,
  CONTENT_TYPE_LABELS,
} from "@/lib/validations/content-post";
import { formatDateTime } from "@/lib/utils";
import type { ContentCategoryRow, ContentPostRow } from "@/types/database";

export function ContentPostsTable({
  posts,
  categoriesById,
}: {
  posts: ContentPostRow[];
  categoriesById: Record<string, ContentCategoryRow>;
}) {
  if (posts.length === 0) {
    return (
      <p className="rounded-2xl border border-dashed border-ink/20 p-8 text-center text-ink-soft">
        Todavía no hay contenido. Crea el primero para empezar a atraer
        tráfico.
      </p>
    );
  }

  return (
    <div className="overflow-x-auto rounded-2xl border border-ink/10 bg-white">
      <table className="min-w-full divide-y divide-ink/10 text-sm">
        <thead className="bg-cream-dark/50 text-left text-xs font-semibold uppercase tracking-wide text-ink-soft">
          <tr>
            <th className="px-4 py-3">Título</th>
            <th className="px-4 py-3">Tipo</th>
            <th className="px-4 py-3">Categoría</th>
            <th className="px-4 py-3">Creado</th>
            <th className="px-4 py-3">Estado</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-ink/10">
          {posts.map((post) => (
            <tr key={post.id} className="hover:bg-cream-dark/30">
              <td className="px-4 py-3 font-medium text-ink">
                <Link
                  href={`/admin/content/${post.id}`}
                  className="hover:text-brand-700 hover:underline"
                >
                  {post.title}
                </Link>
                {post.featured && (
                  <span className="ml-2 rounded-full bg-mustard-400/40 px-2 py-0.5 text-xs font-semibold text-brand-700">
                    Destacado
                  </span>
                )}
              </td>
              <td className="px-4 py-3 text-ink-soft">
                {CONTENT_TYPE_LABELS[post.content_type]}
              </td>
              <td className="px-4 py-3 text-ink-soft">
                {post.category_id
                  ? (categoriesById[post.category_id]?.name ?? "—")
                  : "—"}
              </td>
              <td className="px-4 py-3 text-ink-soft">
                {formatDateTime(post.created_at)}
              </td>
              <td className="px-4 py-3">
                <ContentStatusBadge
                  status={post.status}
                  label={CONTENT_STATUS_LABELS[post.status]}
                />
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
