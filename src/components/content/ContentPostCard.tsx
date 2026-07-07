import Link from "next/link";
import { buttonClasses } from "@/components/ui/Button";
import {
  CONTENT_DIFFICULTY_LABELS,
  CONTENT_TYPE_LABELS,
} from "@/lib/validations/content-post";
import type { ContentCategoryRow, ContentPostRow } from "@/types/database";

const READ_CTA_LABELS: Record<ContentPostRow["content_type"], string> = {
  recipe: "Leer receta",
  tip: "Leer tip",
  guide: "Leer guía",
};

function totalMinutes(post: ContentPostRow): number | null {
  const total = (post.prep_time_minutes ?? 0) + (post.cook_time_minutes ?? 0);
  return total > 0 ? total : null;
}

export function ContentPostCard({
  post,
  category,
}: {
  post: ContentPostRow;
  category?: ContentCategoryRow | null;
}) {
  const total = totalMinutes(post);

  return (
    <div className="flex flex-col gap-3 rounded-3xl border border-border-soft bg-white-soft p-6 shadow-sm">
      <div className="flex items-start justify-between gap-3">
        <h3 className="font-display text-lg font-semibold text-emerald-900">
          {post.title}
        </h3>
        <span className="shrink-0 rounded-full bg-brand-100 px-3 py-1 text-xs font-semibold text-brand-700">
          {CONTENT_TYPE_LABELS[post.content_type]}
        </span>
      </div>

      {category && (
        <span className="w-fit rounded-full bg-cream-dark/60 px-2.5 py-0.5 text-xs font-semibold text-ink-soft">
          {category.name}
        </span>
      )}

      {(total || post.difficulty) && (
        <div className="flex gap-3 text-sm text-ink-soft">
          {total && <span>⏱ {total} min</span>}
          {post.difficulty && (
            <span>{CONTENT_DIFFICULTY_LABELS[post.difficulty]}</span>
          )}
        </div>
      )}

      {post.excerpt && (
        <p className="line-clamp-3 text-sm text-ink-soft">{post.excerpt}</p>
      )}

      <Link
        href={`/recetas/${post.slug}`}
        className={buttonClasses("primary", "mt-2 self-start px-5 py-2.5 text-sm")}
      >
        {READ_CTA_LABELS[post.content_type]}
      </Link>
    </div>
  );
}
