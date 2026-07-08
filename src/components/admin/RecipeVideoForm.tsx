"use client";

import { useActionState } from "react";
import { createRecipeVideoAction } from "@/lib/actions/recipe-videos";
import { Field } from "@/components/ui/Field";
import { Select } from "@/components/ui/Select";
import { Input } from "@/components/ui/Input";
import { Textarea } from "@/components/ui/Textarea";
import { Button } from "@/components/ui/Button";
import {
  RECIPE_VIDEO_DIFFICULTY_OPTIONS,
  RECIPE_VIDEO_STATUS_OPTIONS,
} from "@/lib/validations/recipe-video";

interface RecipeVideoFormState {
  error?: string;
}

const initialState: RecipeVideoFormState = {};

export function RecipeVideoForm() {
  const [state, formAction, pending] = useActionState(
    createRecipeVideoAction,
    initialState,
  );

  return (
    <form action={formAction} className="flex flex-col gap-4">
      <Field label="Título" htmlFor="title">
        <Input
          id="title"
          name="title"
          required
          placeholder="Ej: Arroz con pollo en Thermomix"
        />
      </Field>

      <Field
        label="Link de YouTube"
        htmlFor="youtube_url"
        hint="Cualquier link de YouTube (watch, youtu.be, shorts). Nunca se sube el video, solo se guarda el link"
      >
        <Input
          id="youtube_url"
          name="youtube_url"
          required
          placeholder="https://www.youtube.com/watch?v=..."
        />
      </Field>

      <div className="grid gap-4 sm:grid-cols-3">
        <Field label="Categoría" htmlFor="category">
          <Input id="category" name="category" defaultValue="recetas" />
        </Field>

        <Field label="Duración (min, opcional)" htmlFor="duration_minutes">
          <Input
            id="duration_minutes"
            name="duration_minutes"
            type="number"
            min={1}
            max={600}
          />
        </Field>

        <Field label="Dificultad (opcional)" htmlFor="difficulty">
          <Select id="difficulty" name="difficulty" defaultValue="">
            <option value="">Sin definir</option>
            {RECIPE_VIDEO_DIFFICULTY_OPTIONS.map((option) => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </Select>
        </Field>
      </div>

      <Field
        label="Descripción (opcional)"
        htmlFor="description"
        hint="Extracto corto que se muestra en la tarjeta del video"
      >
        <Textarea id="description" name="description" rows={3} />
      </Field>

      <Field
        label="Miniatura (opcional)"
        htmlFor="thumbnail_url"
        hint="Si se deja vacío, se usa la miniatura pública de YouTube"
      >
        <Input id="thumbnail_url" name="thumbnail_url" placeholder="https://..." />
      </Field>

      <Field
        label="Ingredientes (opcional)"
        htmlFor="ingredients"
        hint="Uno por línea"
      >
        <Textarea
          id="ingredients"
          name="ingredients"
          rows={4}
          placeholder={"2 tazas de arroz\n1 pechuga de pollo\n..."}
        />
      </Field>

      <Field
        label="Etiquetas (opcional)"
        htmlFor="tags"
        hint="Separadas por coma, ej: pollo, rápido, familiar"
      >
        <Input id="tags" name="tags" placeholder="pollo, rápido, familiar" />
      </Field>

      <Field label="Estado" htmlFor="status">
        <Select id="status" name="status" defaultValue="draft">
          {RECIPE_VIDEO_STATUS_OPTIONS.map((option) => (
            <option key={option.value} value={option.value}>
              {option.label}
            </option>
          ))}
        </Select>
      </Field>

      {state.error && (
        <p className="text-sm font-medium text-brand-700" role="alert">
          {state.error}
        </p>
      )}

      <Button type="submit" disabled={pending} className="self-start">
        {pending ? "Guardando..." : "Crear video"}
      </Button>
    </form>
  );
}
