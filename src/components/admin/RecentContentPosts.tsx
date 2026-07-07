import Link from "next/link";
import { ContentStatusBadge } from "@/components/ui/Badge";
import {
  CONTENT_STATUS_LABELS,
  CONTENT_TYPE_LABELS,
} from "@/lib/validations/content-post";
import { formatDateTime } from "@/lib/utils";
import type { ContentPostRow } from "@/types/database";

export function RecentContentPosts({ posts }: { posts: ContentPostRow[] }) {
  if (posts.length === 0) {
    return (
      <p className="rounded-2xl border border-dashed border-ink/20 p-6 text-center text-sm text-ink-soft">
        Todavía no hay contenido publicado ni en borrador.
      </p>
    );
  }

  return (
    <div className="overflow-x-auto rounded-2xl border border-ink/10 bg-white">
      <table className="min-w-full divide-y divide-ink/10 text-sm">
        <thead className="bg-cream-dark/50 text-left text-xs font-semibold uppercase tracking-wide text-ink-soft">
          <tr>
            <th className="px-4 py-3">Título</th>
            <th className="px-4 py-3">Estado</th>
            <th className="px-4 py-3">Tipo</th>
            <th className="px-4 py-3">Actualizado</th>
            <th className="px-4 py-3" />
          </tr>
        </thead>
        <tbody className="divide-y divide-ink/10">
          {posts.map((post) => (
            <tr key={post.id}>
              <td className="px-4 py-3 font-medium text-ink">{post.title}</td>
              <td className="px-4 py-3">
                <ContentStatusBadge
                  status={post.status}
                  label={CONTENT_STATUS_LABELS[post.status]}
                />
              </td>
              <td className="px-4 py-3 text-ink-soft">
                {CONTENT_TYPE_LABELS[post.content_type]}
              </td>
              <td className="px-4 py-3 text-ink-soft">
                {formatDateTime(post.updated_at)}
              </td>
              <td className="px-4 py-3 text-right">
                <Link
                  href={`/admin/content/${post.id}`}
                  className="text-sm font-semibold text-brand-700 hover:underline"
                >
                  Editar
                </Link>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
