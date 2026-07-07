import { cn } from "@/lib/utils";

const BULLET_LINE_PATTERN = /^[-*]\s+/;

function isBulletLine(line: string): boolean {
  return BULLET_LINE_PATTERN.test(line);
}

/**
 * Renderiza texto plano editable por el admin en párrafos y listas
 * simples, sin interpretar HTML: nunca usa dangerouslySetInnerHTML, así
 * que cualquier "<script>" o etiqueta en el texto se muestra literal, como
 * texto, en vez de ejecutarse o insertarse en el DOM.
 */
export function SafeTextRenderer({
  text,
  className,
}: {
  text: string;
  className?: string;
}) {
  const blocks = text
    .split(/\n{2,}/)
    .map((block) => block.trim())
    .filter(Boolean);

  return (
    <div className={cn("flex flex-col gap-4", className)}>
      {blocks.map((block, blockIndex) => {
        const lines = block
          .split("\n")
          .map((line) => line.trim())
          .filter(Boolean);

        if (lines.length > 0 && lines.every(isBulletLine)) {
          return (
            <ul key={blockIndex} className="list-disc space-y-1 pl-5">
              {lines.map((line, lineIndex) => (
                <li key={lineIndex}>{line.replace(BULLET_LINE_PATTERN, "")}</li>
              ))}
            </ul>
          );
        }

        return (
          <p key={blockIndex} className="whitespace-pre-wrap">
            {lines.join("\n")}
          </p>
        );
      })}
    </div>
  );
}
