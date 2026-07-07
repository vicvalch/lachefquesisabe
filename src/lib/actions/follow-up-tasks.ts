"use server";

import { revalidatePath } from "next/cache";
import { z } from "zod";
import { createClient } from "@/lib/supabase/server";
import {
  cancelFollowUpTask,
  createFollowUpTask,
  rescheduleFollowUpTask,
  skipFollowUpTask,
} from "@/lib/leads/follow-up-task-lifecycle";
import {
  createFollowUpTaskSchema,
  rescheduleFollowUpTaskSchema,
  taskNotesSchema,
} from "@/lib/validations/follow-up-task";

const taskIdSchema = z.string().uuid();
const leadIdSchema = z.string().uuid();

function revalidateFollowUps(leadId?: string) {
  revalidatePath("/admin/seguimientos");
  revalidatePath("/admin/dashboard");
  revalidatePath("/admin/leads");
  if (leadId) {
    revalidatePath(`/admin/leads/${leadId}`);
  }
}

export interface SkipFollowUpTaskState {
  error?: string;
}

export async function skipFollowUpTaskAction(
  _prevState: SkipFollowUpTaskState,
  formData: FormData,
): Promise<SkipFollowUpTaskState> {
  const taskIdParsed = taskIdSchema.safeParse(formData.get("taskId"));
  if (!taskIdParsed.success) {
    return { error: "Tarea inválida." };
  }

  const notesParsed = taskNotesSchema.safeParse(formData.get("notes"));
  if (!notesParsed.success) {
    return {
      error: notesParsed.error.issues[0]?.message ?? "Revisa los datos ingresados.",
    };
  }

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return { error: "No autorizado." };
  }

  const result = await skipFollowUpTask(
    supabase,
    taskIdParsed.data,
    notesParsed.data || null,
  );

  if (!result.ok) {
    return { error: "No pudimos actualizar la tarea. Intenta de nuevo." };
  }

  revalidateFollowUps(formData.get("leadId")?.toString());
  return {};
}

export interface CancelFollowUpTaskState {
  error?: string;
}

export async function cancelFollowUpTaskAction(
  _prevState: CancelFollowUpTaskState,
  formData: FormData,
): Promise<CancelFollowUpTaskState> {
  const taskIdParsed = taskIdSchema.safeParse(formData.get("taskId"));
  if (!taskIdParsed.success) {
    return { error: "Tarea inválida." };
  }

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return { error: "No autorizado." };
  }

  const result = await cancelFollowUpTask(supabase, taskIdParsed.data);

  if (!result.ok) {
    return { error: "No pudimos cancelar la tarea. Intenta de nuevo." };
  }

  revalidateFollowUps(formData.get("leadId")?.toString());
  return {};
}

export interface RescheduleFollowUpTaskState {
  error?: string;
}

export async function rescheduleFollowUpTaskAction(
  _prevState: RescheduleFollowUpTaskState,
  formData: FormData,
): Promise<RescheduleFollowUpTaskState> {
  const taskIdParsed = taskIdSchema.safeParse(formData.get("taskId"));
  if (!taskIdParsed.success) {
    return { error: "Tarea inválida." };
  }

  const parsed = rescheduleFollowUpTaskSchema.safeParse({
    due_at: formData.get("due_at"),
  });

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

  const result = await rescheduleFollowUpTask(
    supabase,
    taskIdParsed.data,
    parsed.data.due_at,
  );

  if (!result.ok) {
    return { error: "No pudimos reprogramar la tarea. Intenta de nuevo." };
  }

  revalidateFollowUps(formData.get("leadId")?.toString());
  return {};
}

export interface CreateFollowUpTaskState {
  error?: string;
}

export async function createFollowUpTaskAction(
  _prevState: CreateFollowUpTaskState,
  formData: FormData,
): Promise<CreateFollowUpTaskState> {
  const leadIdParsed = leadIdSchema.safeParse(formData.get("leadId"));
  if (!leadIdParsed.success) {
    return { error: "Lead inválido." };
  }

  const parsed = createFollowUpTaskSchema.safeParse({
    title: formData.get("title"),
    due_at: formData.get("due_at"),
    message_template_key: formData.get("message_template_key"),
  });

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

  const result = await createFollowUpTask(supabase, {
    leadId: leadIdParsed.data,
    title: parsed.data.title,
    dueAt: parsed.data.due_at,
    messageTemplateKey: parsed.data.message_template_key || null,
    demoEventId: null,
    createdBy: user.id,
  });

  if (!result.ok) {
    return { error: "No pudimos crear la tarea. Intenta de nuevo." };
  }

  revalidateFollowUps(leadIdParsed.data);
  return {};
}
