import { describe, expect, it, vi, beforeEach, afterEach } from "vitest";
import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { LeadForm } from "./LeadForm";

describe("LeadForm", () => {
  beforeEach(() => {
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
  });

  it("envía el formulario y muestra el mensaje de éxito", async () => {
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

    expect(
      await screen.findByText(/te contactaremos muy pronto/i),
    ).toBeInTheDocument();
  });
});
