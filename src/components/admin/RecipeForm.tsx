"use client";

import { useActionState } from "react";
import {
  createRecipeAction,
  updateRecipeAction,
} from "@/lib/actions/recipes";
import { Field } from "@/components/ui/Field";
import { Select } from "@/components/ui/Select";
import { Input } from "@/components/ui/Input";
import { Textarea } from "@/components/ui/Textarea";
import { Button } from "@/components/ui/Button";
import {
  RECIPE_CONTENT_TYPE_OPTIONS,
  RECIPE_STATUS_OPTIONS,
} from "@/lib/validations/recipe";
import type { RecipeRow } from "@/types/database";

interface RecipeFormState {
  error?: string;
}

const initialState: RecipeFormState = {};

export function RecipeForm({ recipe }: { recipe?: RecipeRow }) {
  const action = recipe ? updateRecipeAction : createRecipeAction;
  const [state, formAction, pending] = useActionState(action, initialState);

  return (
    <form action={formAction} className="flex flex-col gap-4">
      {recipe && <input type="hidden" name="recipeId" value={recipe.id} />}

      <Field label="Título" htmlFor="title">
        <Input
          id="title"
          name="title"
          required
          defaultValue={recipe?.title}
          placeholder="Ej: Arroz con pollo en 20 minutos"
        />
      </Field>

      <div className="grid gap-4 sm:grid-cols-2">
        <Field label="Tipo de contenido" htmlFor="content_type">
          <Select
            id="content_type"
            name="content_type"
            defaultValue={recipe?.content_type ?? "recipe"}
          >
            {RECIPE_CONTENT_TYPE_OPTIONS.map((option) => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </Select>
        </Field>

        {recipe ? (
          <Field label="Estado" htmlFor="status">
            <Select id="status" name="status" defaultValue={recipe.status}>
              {RECIPE_STATUS_OPTIONS.map((option) => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </Select>
          </Field>
        ) : (
          <p className="self-end pb-2.5 text-xs text-ink-soft">
            Se crea como borrador; la publicas después desde su edición.
          </p>
        )}
      </div>

      <Field
        label="Resumen (opcional)"
        htmlFor="summary"
        hint="Teaser corto que se muestra en las tarjetas del listado público"
      >
        <Textarea
          id="summary"
          name="summary"
          rows={2}
          defaultValue={recipe?.summary ?? ""}
        />
      </Field>

      <Field
        label="Imagen de portada (opcional)"
        htmlFor="cover_image_url"
        hint="Link a una imagen ya alojada; todavía no hay subida de archivos"
      >
        <Input
          id="cover_image_url"
          name="cover_image_url"
          defaultValue={recipe?.cover_image_url ?? ""}
          placeholder="https://..."
        />
      </Field>

      <div className="grid gap-4 sm:grid-cols-2">
        <Field
          label="Tiempo de preparación (opcional)"
          htmlFor="prep_minutes"
          hint="En minutos"
        >
          <Input
            id="prep_minutes"
            name="prep_minutes"
            type="number"
            min={1}
            max={600}
            defaultValue={recipe?.prep_minutes ?? ""}
          />
        </Field>
        <Field label="Porciones (opcional)" htmlFor="servings">
          <Input
            id="servings"
            name="servings"
            type="number"
            min={1}
            max={50}
            defaultValue={recipe?.servings ?? ""}
          />
        </Field>
      </div>

      <Field
        label="Ingredientes (opcional)"
        htmlFor="ingredients"
        hint="Uno por línea"
      >
        <Textarea
          id="ingredients"
          name="ingredients"
          rows={5}
          defaultValue={recipe?.ingredients ?? ""}
          placeholder={"2 tazas de arroz\n1 pechuga de pollo\n..."}
        />
      </Field>

      <Field
        label="Contenido"
        htmlFor="content"
        hint="Pasos de la receta o el cuerpo del tip"
      >
        <Textarea
          id="content"
          name="content"
          rows={10}
          required
          defaultValue={recipe?.content ?? ""}
        />
      </Field>

      <Field
        label="Mensaje de cierre (opcional)"
        htmlFor="cta_message"
        hint='Ej: "¿Te gustó? Vení a una demo en vivo y aprendé el truco completo"'
      >
        <Textarea
          id="cta_message"
          name="cta_message"
          rows={2}
          defaultValue={recipe?.cta_message ?? ""}
        />
      </Field>

      {state.error && (
        <p className="text-sm font-medium text-brand-700" role="alert">
          {state.error}
        </p>
      )}

      <Button type="submit" disabled={pending} className="self-start">
        {pending
          ? "Guardando..."
          : recipe
            ? "Guardar cambios"
            : "Crear receta"}
      </Button>
    </form>
  );
}
