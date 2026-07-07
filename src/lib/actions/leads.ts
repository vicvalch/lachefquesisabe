"use server";

import { revalidatePath } from "next/cache";
import { z } from "zod";
import { createClient } from "@/lib/supabase/server";
import { updateLead } from "@/lib/leads/update-lead";
import { addContactLog } from "@/lib/leads/contact-logs";
import { updateLeadSchema } from "@/lib/validations/update-lead";
import { addContactLogSchema } from "@/lib/validations/contact-log";

const leadIdSchema = z.string().uuid();

export interface UpdateLeadState {
  error?: string;
}

/**
 * Actualiza el lead desde su detalle. Allowlist explícito: solo status,
 * notes y next_follow_up_at llegan a la capa de datos (ver
 * lib/leads/update-lead.ts); email, phone, source, consent_contact y
 * created_at nunca se leen de este formulario.
 */
export async function updateLeadAction(
  _prevState: UpdateLeadState,
  formData: FormData,
): Promise<UpdateLeadState> {
  const leadIdParsed = leadIdSchema.safeParse(formData.get("leadId"));

  if (!leadIdParsed.success) {
    return { error: "Lead inválido." };
  }

  const parsed = updateLeadSchema.safeParse({
    status: formData.get("status"),
    notes: formData.get("notes"),
    next_follow_up_at: formData.get("next_follow_up_at"),
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

  const result = await updateLead(supabase, leadIdParsed.data, {
    status: parsed.data.status,
    notes: parsed.data.notes || null,
    next_follow_up_at: parsed.data.next_follow_up_at || null,
  });

  if (!result.ok) {
    return { error: "No pudimos guardar los cambios. Intenta de nuevo." };
  }

  revalidatePath(`/admin/leads/${leadIdParsed.data}`);
  revalidatePath("/admin/leads");
  revalidatePath("/admin/dashboard");

  return {};
}

export interface AddContactLogState {
  error?: string;
}

export async function addContactLogAction(
  _prevState: AddContactLogState,
  formData: FormData,
): Promise<AddContactLogState> {
  const leadIdParsed = leadIdSchema.safeParse(formData.get("leadId"));

  if (!leadIdParsed.success) {
    return { error: "Lead inválido." };
  }

  const parsed = addContactLogSchema.safeParse({
    channel: formData.get("channel"),
    direction: formData.get("direction"),
    summary: formData.get("summary"),
    outcome: formData.get("outcome"),
    next_follow_up_at: formData.get("next_follow_up_at"),
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

  // created_by sale de la sesión autenticada, nunca del formulario.
  const result = await addContactLog(
    supabase,
    leadIdParsed.data,
    user.id,
    parsed.data,
  );

  if (!result.ok) {
    return { error: "No pudimos guardar el contacto. Intenta de nuevo." };
  }

  revalidatePath(`/admin/leads/${leadIdParsed.data}`);
  revalidatePath("/admin/leads");
  revalidatePath("/admin/dashboard");

  return {};
}
