"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import {
  newsletterSubscribeSchema,
  type NewsletterSubscribeValues,
} from "@/lib/validations/newsletter";
import { Field } from "@/components/ui/Field";
import { Input } from "@/components/ui/Input";
import { Button } from "@/components/ui/Button";
import { CheckCircleIcon } from "@/components/icons";

const defaultValues: NewsletterSubscribeValues = {
  full_name: "",
  email: "",
  phone: "",
  consent_contact: false,
  website: "",
};

export function NewsletterForm() {
  const [serverError, setServerError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors, isSubmitting },
  } = useForm<NewsletterSubscribeValues>({
    resolver: zodResolver(newsletterSubscribeSchema),
    defaultValues,
  });

  async function onSubmit(values: NewsletterSubscribeValues) {
    setServerError(null);
    try {
      const response = await fetch("/api/newsletter", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(values),
      });
      const result = await response.json();

      if (!response.ok || !result.ok) {
        setServerError(
          result.error || "No pudimos guardar tu suscripción. Intenta de nuevo.",
        );
        return;
      }

      reset(defaultValues);
      setSuccess(true);
    } catch {
      setServerError("Ocurrió un problema de conexión. Intenta de nuevo.");
    }
  }

  if (success) {
    return (
      <div className="flex flex-col items-center gap-3 py-6 text-center" role="status">
        <span className="flex h-12 w-12 items-center justify-center rounded-full bg-brand-50 text-brand-700">
          <CheckCircleIcon className="h-6 w-6" />
        </span>
        <p className="font-display text-xl font-semibold text-emerald-900">
          ¡Listo, ya estás suscrita!
        </p>
        <p className="max-w-sm text-sm text-ink-soft">
          Muy pronto vas a recibir mis recetas y avisos de nuevas
          demostraciones. Gracias por confiar en La Chef que Sí Sabe.
        </p>
        <button
          type="button"
          onClick={() => setSuccess(false)}
          className="text-sm font-semibold text-brand-700 hover:underline"
        >
          Suscribir otro correo
        </button>
      </div>
    );
  }

  return (
    <form
      onSubmit={handleSubmit(onSubmit)}
      noValidate
      className="grid gap-5 sm:grid-cols-2"
    >
      {/* Honeypot: oculto para personas, visible para bots */}
      <div className="hidden" aria-hidden="true">
        <label htmlFor="newsletter-website">No completar este campo</label>
        <input
          id="newsletter-website"
          tabIndex={-1}
          autoComplete="off"
          {...register("website")}
        />
      </div>

      <Field label="Nombre completo" htmlFor="full_name" error={errors.full_name?.message}>
        <Input id="full_name" autoComplete="name" {...register("full_name")} />
      </Field>

      <Field label="Email" htmlFor="newsletter-email" error={errors.email?.message}>
        <Input
          id="newsletter-email"
          type="email"
          autoComplete="email"
          {...register("email")}
        />
      </Field>

      <div className="sm:col-span-2">
        <Field
          label="WhatsApp (opcional)"
          htmlFor="newsletter-phone"
          error={errors.phone?.message}
        >
          <Input id="newsletter-phone" autoComplete="tel" {...register("phone")} />
        </Field>
      </div>

      <div className="sm:col-span-2">
        <label className="flex items-start gap-3 text-sm text-ink-soft">
          <input
            type="checkbox"
            className="mt-1 h-4 w-4 rounded border-ink/30 text-brand-500 focus:ring-brand-500"
            {...register("consent_contact")}
          />
          <span>
            Acepto que La Chef que Sí Sabe me contacte con recetas, tips y
            novedades. Consulta nuestra{" "}
            <a
              href="/privacidad"
              target="_blank"
              rel="noopener noreferrer"
              className="font-semibold text-brand-700 underline"
            >
              política de privacidad
            </a>
            .
          </span>
        </label>
        {errors.consent_contact && (
          <p className="mt-1 text-xs font-medium text-brand-700" role="alert">
            {errors.consent_contact.message}
          </p>
        )}
      </div>

      {serverError && (
        <div className="sm:col-span-2">
          <p className="text-sm font-medium text-brand-700" role="alert">
            {serverError}
          </p>
        </div>
      )}

      <div className="sm:col-span-2">
        <Button type="submit" disabled={isSubmitting} className="w-full sm:w-auto">
          {isSubmitting ? "Enviando..." : "Quiero mis recetas"}
        </Button>
      </div>
    </form>
  );
}
