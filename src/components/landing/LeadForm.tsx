"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import {
  LEAD_INTEREST_OPTIONS,
  leadFormSchema,
  type LeadFormValues,
} from "@/lib/validations/lead";
import { Field } from "@/components/ui/Field";
import { Input } from "@/components/ui/Input";
import { Textarea } from "@/components/ui/Textarea";
import { Select } from "@/components/ui/Select";
import { Button } from "@/components/ui/Button";

const defaultValues: LeadFormValues = {
  name: "",
  email: "",
  phone: "",
  interest: "recetas",
  message: "",
  consent: false,
  website: "",
};

export function LeadForm() {
  const [status, setStatus] = useState<"idle" | "success" | "error">("idle");
  const [serverError, setServerError] = useState<string | null>(null);

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors, isSubmitting },
  } = useForm<LeadFormValues>({
    resolver: zodResolver(leadFormSchema),
    defaultValues,
  });

  async function onSubmit(values: LeadFormValues) {
    setServerError(null);
    try {
      const response = await fetch("/api/leads", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(values),
      });
      const result = await response.json();

      if (!response.ok || !result.ok) {
        setServerError(
          result.error || "No pudimos guardar tu información. Intenta de nuevo.",
        );
        setStatus("error");
        return;
      }

      setStatus("success");
      reset(defaultValues);
    } catch {
      setServerError("Ocurrió un problema de conexión. Intenta de nuevo.");
      setStatus("error");
    }
  }

  if (status === "success") {
    return (
      <div
        role="status"
        className="rounded-2xl border border-olive-500/30 bg-olive-500/10 p-8 text-center"
      >
        <p className="font-display text-xl font-semibold text-olive-600">
          ¡Gracias! Te contactaremos muy pronto.
        </p>
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
        <label htmlFor="website">No completar este campo</label>
        <input
          id="website"
          tabIndex={-1}
          autoComplete="off"
          {...register("website")}
        />
      </div>

      <Field label="Nombre" htmlFor="name" error={errors.name?.message}>
        <Input id="name" autoComplete="name" {...register("name")} />
      </Field>

      <Field label="Email" htmlFor="email" error={errors.email?.message}>
        <Input
          id="email"
          type="email"
          autoComplete="email"
          {...register("email")}
        />
      </Field>

      <Field
        label="Teléfono (opcional)"
        htmlFor="phone"
        error={errors.phone?.message}
      >
        <Input id="phone" autoComplete="tel" {...register("phone")} />
      </Field>

      <Field
        label="¿Qué te interesa?"
        htmlFor="interest"
        error={errors.interest?.message}
      >
        <Select id="interest" {...register("interest")}>
          {LEAD_INTEREST_OPTIONS.map((option) => (
            <option key={option.value} value={option.value}>
              {option.label}
            </option>
          ))}
        </Select>
      </Field>

      <div className="sm:col-span-2">
        <Field
          label="Cuéntame más (opcional)"
          htmlFor="message"
          error={errors.message?.message}
        >
          <Textarea id="message" {...register("message")} />
        </Field>
      </div>

      <div className="sm:col-span-2">
        <label className="flex items-start gap-3 text-sm text-ink-soft">
          <input
            type="checkbox"
            className="mt-1 h-4 w-4 rounded border-ink/30 text-brand-500 focus:ring-brand-500"
            {...register("consent")}
          />
          Acepto que La Chef que Sí Sabe me contacte con información sobre
          recetas y demostraciones.
        </label>
        {errors.consent && (
          <p className="mt-1 text-xs font-medium text-brand-700" role="alert">
            {errors.consent.message}
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
          {isSubmitting ? "Enviando..." : "Enviar"}
        </Button>
      </div>
    </form>
  );
}
