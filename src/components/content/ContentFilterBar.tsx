import Link from "next/link";
import { cn } from "@/lib/utils";
import type { ContentCategoryRow, ContentType } from "@/types/database";

const TYPE_FILTER_OPTIONS: { value: ContentType; label: string }[] = [
  { value: "recipe", label: "Recetas" },
  { value: "tip", label: "Tips" },
  { value: "guide", label: "Guías" },
];

function buildHref(type?: ContentType, categorySlug?: string): string {
  const params = new URLSearchParams();
  if (type) params.set("type", type);
  if (categorySlug) params.set("category", categorySlug);
  const query = params.toString();
  return query ? `/recetas?${query}` : "/recetas";
}

function pillClasses(active: boolean): string {
  return cn(
    "rounded-full px-4 py-1.5 text-sm font-semibold transition-colors",
    active
      ? "bg-brand-500 text-white"
      : "border border-ink/10 bg-white text-ink-soft hover:bg-brand-50",
  );
}

export function ContentFilterBar({
  categories,
  currentType,
  currentCategorySlug,
}: {
  categories: ContentCategoryRow[];
  currentType?: ContentType;
  currentCategorySlug?: string;
}) {
  return (
    <div className="flex flex-col items-center gap-3">
      <div className="flex flex-wrap justify-center gap-2">
        <Link
          href={buildHref(undefined, currentCategorySlug)}
          className={pillClasses(!currentType)}
        >
          Todo
        </Link>
        {TYPE_FILTER_OPTIONS.map((option) => (
          <Link
            key={option.value}
            href={buildHref(option.value, currentCategorySlug)}
            className={pillClasses(currentType === option.value)}
          >
            {option.label}
          </Link>
        ))}
      </div>

      {categories.length > 0 && (
        <div className="flex flex-wrap justify-center gap-2">
          <Link
            href={buildHref(currentType, undefined)}
            className={pillClasses(!currentCategorySlug)}
          >
            Todas las categorías
          </Link>
          {categories.map((category) => (
            <Link
              key={category.id}
              href={buildHref(currentType, category.slug)}
              className={pillClasses(currentCategorySlug === category.slug)}
            >
              {category.name}
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
