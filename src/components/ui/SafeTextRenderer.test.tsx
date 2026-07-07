import { describe, expect, it } from "vitest";
import { render, screen } from "@testing-library/react";
import { SafeTextRenderer } from "./SafeTextRenderer";

describe("SafeTextRenderer", () => {
  it("renderiza párrafos separados por saltos de línea dobles", () => {
    const { container } = render(
      <SafeTextRenderer text={"Primer párrafo.\n\nSegundo párrafo."} />,
    );

    const paragraphs = container.querySelectorAll("p");
    expect(paragraphs).toHaveLength(2);
    expect(paragraphs[0].textContent).toBe("Primer párrafo.");
    expect(paragraphs[1].textContent).toBe("Segundo párrafo.");
  });

  it("renderiza bullets simples cuando todas las líneas del bloque empiezan con '- ' o '* '", () => {
    const { container } = render(
      <SafeTextRenderer text={"- Uno\n- Dos\n* Tres"} />,
    );

    const list = container.querySelector("ul");
    expect(list).not.toBeNull();
    const items = container.querySelectorAll("li");
    expect(items).toHaveLength(3);
    expect(items[0].textContent).toBe("Uno");
    expect(items[1].textContent).toBe("Dos");
    expect(items[2].textContent).toBe("Tres");
  });

  it("no interpreta HTML: una etiqueta en el texto se muestra literal", () => {
    render(<SafeTextRenderer text={"<b>negrita</b> y <script>alert(1)</script>"} />);

    expect(screen.getByText(/<b>negrita<\/b>/)).toBeInTheDocument();
    expect(document.querySelector("b")).toBeNull();
    expect(document.querySelector("script[data-injected]")).toBeNull();
    expect(document.body.innerHTML).not.toContain("<script>alert(1)</script>");
  });

  it("no confunde un párrafo normal con una lista si alguna línea no empieza con guion o asterisco", () => {
    const { container } = render(
      <SafeTextRenderer text={"- Uno\nDos sin guion"} />,
    );

    expect(container.querySelector("ul")).toBeNull();
    expect(container.querySelector("p")).not.toBeNull();
  });
});
