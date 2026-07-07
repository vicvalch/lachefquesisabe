import { describe, expect, it, vi, beforeEach, afterEach } from "vitest";
import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { LeadForm } from "./LeadForm";

const push = vi.fn();

vi.mock("next/navigation", () => ({
  useRouter: () => ({ push }),
}));

describe("LeadForm", () => {
  beforeEach(() => {
    push.mockClear();
    vi.stubGlobal(
      "fetch",
      vi.fn().mockResolvedValue({
        ok: true,
        json: () => Promise.resolve({ ok: true }),
      }),
    );
  });

  afterEach(() => {
    vi.unstubAllGlobals();
  });

  it("muestra errores de validación si se envía vacío", async () => {
    const user = userEvent.setup();
    render(<LeadForm />);

    await user.click(screen.getByRole("button", { name: /enviar/i }));

    expect(
      await screen.findByText(/cuéntanos tu nombre completo/i),
    ).toBeInTheDocument();
    expect(fetch).not.toHaveBeenCalled();
    expect(push).not.toHaveBeenCalled();
  });

  it("envía el formulario y redirige a la página de gracias", async () => {
    const user = userEvent.setup();
    render(<LeadForm />);

    await user.type(screen.getByLabelText("Nombre"), "Ana Pérez");
    await user.type(screen.getByLabelText("Email"), "ana@example.com");
    await user.click(
      screen.getByLabelText(/acepto que la chef que sí sabe/i),
    );
    await user.click(screen.getByRole("button", { name: /enviar/i }));

    await waitFor(() => expect(fetch).toHaveBeenCalledWith(
      "/api/leads",
      expect.objectContaining({ method: "POST" }),
    ));

    await waitFor(() => expect(push).toHaveBeenCalledWith("/gracias"));
  });
});
