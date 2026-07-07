"use server";

import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import { z } from "zod";
import { createClient } from "@/lib/supabase/server";
import { createLeadSegment } from "@/lib/segments/create-segment";
import { updateLeadSegment } from "@/lib/segments/update-segment";
import { leadSegmentFormSchema } from "@/lib/validations/lead-segment";

const segmentIdSchema = z.string().uuid();

function parseSegmentFormData(formData: FormData) {
  return {
    name: formData.get("name"),
    description: formData.get("description"),
    statuses: formData.getAll("statuses"),
    primary_interests: formData.getAll("primary_interests"),
    source: formData.get("source"),
    created_after: formData.get("created_after"),
    created_before: formData.get("created_before"),
    has_open_follow_up_task: formData.get("has_open_follow_up_task"),
  };
}

export interface CreateLeadSegmentState {
  error?: string;
}

export async function createLeadSegmentAction(
  _prevState: CreateLeadSegmentState,
  formData: FormData,
): Promise<CreateLeadSegmentState> {
  const parsed = leadSegmentFormSchema.safeParse(parseSegmentFormData(formData));

  if (!parsed.success) {
    return {
      error: parsed.error.issues[0]?.message ?? "Revisa los datos ingresados.",
    };
  }

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return { error: "No autorizado." };
  }

  const result = await createLeadSegment(supabase, user.id, parsed.data);

  if (!result.ok) {
    return { error: result.error };
  }

  revalidatePath("/admin/segmentos");
  redirect(`/admin/segmentos/${result.id}`);
}

export interface UpdateLeadSegmentState {
  error?: string;
}

export async function updateLeadSegmentAction(
  _prevState: UpdateLeadSegmentState,
  formData: FormData,
): Promise<UpdateLeadSegmentState> {
  const segmentIdParsed = segmentIdSchema.safeParse(formData.get("segmentId"));
  if (!segmentIdParsed.success) {
    return { error: "Segmento inválido." };
  }

  const parsed = leadSegmentFormSchema.safeParse(parseSegmentFormData(formData));

  if (!parsed.success) {
    return {
      error: parsed.error.issues[0]?.message ?? "Revisa los datos ingresados.",
    };
  }

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return { error: "No autorizado." };
  }

  const result = await updateLeadSegment(
    supabase,
    segmentIdParsed.data,
    parsed.data,
  );

  if (!result.ok) {
    return { error: "No pudimos guardar el segmento. Intenta de nuevo." };
  }

  revalidatePath("/admin/segmentos");
  revalidatePath(`/admin/segmentos/${segmentIdParsed.data}`);
  return {};
}
