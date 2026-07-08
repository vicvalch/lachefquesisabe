import { describe, expect, it } from "vitest";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { HeroCarousel } from "./HeroCarousel";

const slides = [
  { id: "one", label: "Primera diapositiva", content: <p>Contenido uno</p> },
  { id: "two", label: "Segunda diapositiva", content: <p>Contenido dos</p> },
];

describe("HeroCarousel", () => {
  it("muestra la primera diapositiva activa y oculta el resto", () => {
    render(<HeroCarousel slides={slides} />);

    expect(screen.getByText("Contenido uno").closest("[aria-hidden]")).toHaveAttribute(
      "aria-hidden",
      "false",
    );
    expect(screen.getByText("Contenido dos").closest("[aria-hidden]")).toHaveAttribute(
      "aria-hidden",
      "true",
    );
  });

  it("avanza a la siguiente diapositiva al hacer clic en la flecha derecha", async () => {
    const user = userEvent.setup();
    render(<HeroCarousel slides={slides} />);

    await user.click(screen.getByRole("button", { name: /siguiente diapositiva/i }));

    expect(screen.getByText("Contenido dos").closest("[aria-hidden]")).toHaveAttribute(
      "aria-hidden",
      "false",
    );
    expect(screen.getByText("Contenido uno").closest("[aria-hidden]")).toHaveAttribute(
      "aria-hidden",
      "true",
    );
  });

  it("retrocede con la flecha izquierda desde la primera diapositiva (wrap around)", async () => {
    const user = userEvent.setup();
    render(<HeroCarousel slides={slides} />);

    await user.click(screen.getByRole("button", { name: /diapositiva anterior/i }));

    expect(screen.getByText("Contenido dos").closest("[aria-hidden]")).toHaveAttribute(
      "aria-hidden",
      "false",
    );
  });

  it("permite navegar usando los indicadores/dots", async () => {
    const user = userEvent.setup();
    render(<HeroCarousel slides={slides} />);

    const dots = screen.getAllByRole("button", { name: /^Ir a:/i });
    expect(dots).toHaveLength(2);

    await user.click(dots[1]);

    expect(screen.getByText("Contenido dos").closest("[aria-hidden]")).toHaveAttribute(
      "aria-hidden",
      "false",
    );
    expect(dots[1]).toHaveAttribute("aria-current", "true");
  });
});
