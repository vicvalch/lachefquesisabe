"use client";

import { useActionState } from "react";
import {
  createContentPostAction,
  updateContentPostAction,
} from "@/lib/actions/content";
import { Field } from "@/components/ui/Field";
import { Select } from "@/components/ui/Select";
import { Input } from "@/components/ui/Input";
import { Textarea } from "@/components/ui/Textarea";
import { Button } from "@/components/ui/Button";
import {
  CONTENT_DIFFICULTY_OPTIONS,
  CONTENT_STATUS_OPTIONS,
  CONTENT_TYPE_OPTIONS,
} from "@/lib/validations/content-post";
import type { ContentCategoryRow, ContentPostRow } from "@/types/database";

interface ContentPostFormState {
  error?: string;
}

const initialState: ContentPostFormState = {};

export function ContentPostForm({
  post,
  categories,
}: {
  post?: ContentPostRow;
  categories: ContentCategoryRow[];
}) {
  const action = post ? updateContentPostAction : createContentPostAction;
  const [state, formAction, pending] = useActionState(action, initialState);

  return (
    <form action={formAction} className="flex flex-col gap-4">
      {post && <input type="hidden" name="postId" value={post.id} />}

      <Field label="Título" htmlFor="title">
        <Input
          id="title"
          name="title"
          required
          defaultValue={post?.title}
          placeholder="Ej: Arroz con pollo en 20 minutos"
        />
      </Field>

      <div className="grid gap-4 sm:grid-cols-3">
        <Field label="Tipo de contenido" htmlFor="content_type">
          <Select
            id="content_type"
            name="content_type"
            defaultValue={post?.content_type ?? "recipe"}
          >
            {CONTENT_TYPE_OPTIONS.map((option) => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </Select>
        </Field>

        <Field label="Categoría (opcional)" htmlFor="category_id">
          <Select
            id="category_id"
            name="category_id"
            defaultValue={post?.category_id ?? ""}
          >
            <option value="">Sin categoría</option>
            {categories.map((category) => (
              <option key={category.id} value={category.id}>
                {category.name}
              </option>
            ))}
          </Select>
        </Field>

        <Field label="Estado" htmlFor="status">
          <Select
            id="status"
            name="status"
            defaultValue={post?.status ?? "draft"}
          >
            {CONTENT_STATUS_OPTIONS.map((option) => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </Select>
        </Field>
      </div>

      <Field
        label="Extracto (opcional)"
        htmlFor="excerpt"
        hint="Teaser corto que se muestra en las tarjetas del listado público"
      >
        <Textarea
          id="excerpt"
          name="excerpt"
          rows={2}
          defaultValue={post?.excerpt ?? ""}
        />
      </Field>

      <Field
        label="Imagen (opcional)"
        htmlFor="image_url"
        hint="Link a una imagen ya alojada; todavía no hay subida de archivos"
      >
        <Input
          id="image_url"
          name="image_url"
          defaultValue={post?.image_url ?? ""}
          placeholder="https://..."
        />
      </Field>

      <div className="grid gap-4 sm:grid-cols-4">
        <Field
          label="Preparación (min, opcional)"
          htmlFor="prep_time_minutes"
        >
          <Input
            id="prep_time_minutes"
            name="prep_time_minutes"
            type="number"
            min={1}
            max={600}
            defaultValue={post?.prep_time_minutes ?? ""}
          />
        </Field>
        <Field label="Cocción (min, opcional)" htmlFor="cook_time_minutes">
          <Input
            id="cook_time_minutes"
            name="cook_time_minutes"
            type="number"
            min={1}
            max={600}
            defaultValue={post?.cook_time_minutes ?? ""}
          />
        </Field>
        <Field label="Porciones (opcional)" htmlFor="servings">
          <Input
            id="servings"
            name="servings"
            type="number"
            min={1}
            max={100}
            defaultValue={post?.servings ?? ""}
          />
        </Field>
        <Field label="Dificultad (opcional)" htmlFor="difficulty">
          <Select
            id="difficulty"
            name="difficulty"
            defaultValue={post?.difficulty ?? ""}
          >
            <option value="">Sin definir</option>
            {CONTENT_DIFFICULTY_OPTIONS.map((option) => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </Select>
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
          defaultValue={post?.ingredients ?? ""}
          placeholder={"2 tazas de arroz\n1 pechuga de pollo\n..."}
        />
      </Field>

      <Field
        label="Instrucciones (opcional)"
        htmlFor="instructions"
        hint="Un paso por línea"
      >
        <Textarea
          id="instructions"
          name="instructions"
          rows={6}
          defaultValue={post?.instructions ?? ""}
          placeholder={"1. Sofríe el pollo.\n2. Agrega el arroz.\n..."}
        />
      </Field>

      <Field
        label="Contenido"
        htmlFor="body"
        hint="El cuerpo del artículo: introducción de la receta, el tip o la guía completa"
      >
        <Textarea
          id="body"
          name="body"
          rows={8}
          required
          defaultValue={post?.body ?? ""}
        />
      </Field>

      <div className="grid gap-4 sm:grid-cols-2">
        <Field
          label="Título SEO (opcional)"
          htmlFor="seo_title"
          hint="Reemplaza el título en buscadores y redes"
        >
          <Input
            id="seo_title"
            name="seo_title"
            defaultValue={post?.seo_title ?? ""}
          />
        </Field>
        <Field
          label="Descripción SEO (opcional)"
          htmlFor="seo_description"
          hint="Si se deja vacío, se usa el extracto"
        >
          <Input
            id="seo_description"
            name="seo_description"
            defaultValue={post?.seo_description ?? ""}
          />
        </Field>
      </div>

      <label className="flex items-center gap-2 text-sm font-semibold text-ink">
        <input
          type="checkbox"
          name="featured"
          defaultChecked={post?.featured ?? false}
          className="h-4 w-4 rounded border-ink/20"
        />
        Destacado (aparece primero en el listado público)
      </label>

      {state.error && (
        <p className="text-sm font-medium text-brand-700" role="alert">
          {state.error}
        </p>
      )}

      <Button type="submit" disabled={pending} className="self-start">
        {pending ? "Guardando..." : post ? "Guardar cambios" : "Crear contenido"}
      </Button>
    </form>
  );
}
