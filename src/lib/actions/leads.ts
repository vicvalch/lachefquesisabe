"use server";

import { revalidatePath } from "next/cache";
import { z } from "zod";
import { createClient } from "@/lib/supabase/server";
import { updateLeadStatus } from "@/lib/leads/update-status";
import { addLeadActivity } from "@/lib/leads/activities";
import { addLeadActivitySchema } from "@/lib/validations/lead-activity";
import type { LeadStatus } from "@/types/database";

const LEAD_STATUS_VALUES: [LeadStatus, ...LeadStatus[]] = [
  "nuevo",
  "contactado",
  "convertido",
  "descartado",
];

const statusActionSchema = z.object({
  leadId: z.string().uuid(),
  status: z.enum(LEAD_STATUS_VALUES),
});

export interface UpdateLeadStatusState {
  error?: string;
}

export async function updateLeadStatusAction(
  _prevState: UpdateLeadStatusState,
  formData: FormData,
): Promise<UpdateLeadStatusState> {
  const parsed = statusActionSchema.safeParse({
    leadId: formData.get("leadId"),
    status: formData.get("status"),
  });

  if (!parsed.success) {
    return { error: "Estado inválido." };
  }

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return { error: "No autorizado." };
  }

  const result = await updateLeadStatus(
    supabase,
    parsed.data.leadId,
    parsed.data.status,
  );

  if (!result.ok) {
    return { error: "No pudimos actualizar el estado. Intenta de nuevo." };
  }

  revalidatePath(`/admin/leads/${parsed.data.leadId}`);
  revalidatePath("/admin/leads");
  revalidatePath("/admin/dashboard");

  return {};
}

export interface AddLeadActivityState {
  error?: string;
}

const leadIdSchema = z.string().uuid();

export async function addLeadActivityAction(
  _prevState: AddLeadActivityState,
  formData: FormData,
): Promise<AddLeadActivityState> {
  const leadIdParsed = leadIdSchema.safeParse(formData.get("leadId"));

  if (!leadIdParsed.success) {
    return { error: "Lead inválido." };
  }

  const parsed = addLeadActivitySchema.safeParse({
    type: formData.get("type"),
    channel: formData.get("channel") || undefined,
    content: formData.get("content"),
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

  const result = await addLeadActivity(
    supabase,
    leadIdParsed.data,
    user.id,
    parsed.data,
  );

  if (!result.ok) {
    return { error: "No pudimos guardar el registro. Intenta de nuevo." };
  }

  revalidatePath(`/admin/leads/${leadIdParsed.data}`);

  return {};
}
