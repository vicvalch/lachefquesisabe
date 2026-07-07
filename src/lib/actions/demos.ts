"use server";

import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import { z } from "zod";
import { createClient } from "@/lib/supabase/server";
import { createDemoEvent } from "@/lib/demos/create-demo";
import { updateDemoEventStatus } from "@/lib/demos/update-demo";
import {
  registerLeadForDemo,
  removeRegistration,
  updateAttendanceStatus,
} from "@/lib/demos/registrations";
import { createDemoEventSchema, updateDemoEventStatusSchema } from "@/lib/validations/demo-event";
import {
  registerLeadForDemoSchema,
  updateAttendanceSchema,
} from "@/lib/validations/demo-registration";

const idSchema = z.string().uuid();

function revalidateDemo(demoEventId: string) {
  revalidatePath("/admin/demos");
  revalidatePath(`/admin/demos/${demoEventId}`);
  revalidatePath("/admin/dashboard");
}

export interface CreateDemoEventState {
  error?: string;
}

export async function createDemoEventAction(
  _prevState: CreateDemoEventState,
  formData: FormData,
): Promise<CreateDemoEventState> {
  const parsed = createDemoEventSchema.safeParse({
    title: formData.get("title"),
    description: formData.get("description"),
    public_notes: formData.get("public_notes"),
    mode: formData.get("mode"),
    location_name: formData.get("location_name"),
    location_address: formData.get("location_address"),
    meeting_url: formData.get("meeting_url"),
    starts_at: formData.get("starts_at"),
    ends_at: formData.get("ends_at"),
    capacity: formData.get("capacity"),
    internal_notes: formData.get("internal_notes"),
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

  const result = await createDemoEvent(supabase, user.id, parsed.data);

  if (!result.ok) {
    return { error: "No pudimos crear la demo. Intenta de nuevo." };
  }

  revalidatePath("/admin/demos");
  revalidatePath("/admin/dashboard");
  redirect(`/admin/demos/${result.id}`);
}


export interface UpdateDemoEventStatusState {
  error?: string;
}

export async function updateDemoEventStatusAction(
  _prevState: UpdateDemoEventStatusState,
  formData: FormData,
): Promise<UpdateDemoEventStatusState> {
  const demoIdParsed = idSchema.safeParse(formData.get("demoEventId"));
  if (!demoIdParsed.success) {
    return { error: "Demo inválida." };
  }

  const parsed = updateDemoEventStatusSchema.safeParse({
    status: formData.get("status"),
    internal_notes: formData.get("internal_notes"),
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

  const result = await updateDemoEventStatus(
    supabase,
    demoIdParsed.data,
    parsed.data,
  );

  if (!result.ok) {
    return { error: "No pudimos guardar los cambios. Intenta de nuevo." };
  }

  revalidateDemo(demoIdParsed.data);
  return {};
}

export interface RegisterLeadState {
  error?: string;
}

export async function registerLeadAction(
  _prevState: RegisterLeadState,
  formData: FormData,
): Promise<RegisterLeadState> {
  const demoIdParsed = idSchema.safeParse(formData.get("demoEventId"));
  if (!demoIdParsed.success) {
    return { error: "Demo inválida." };
  }

  const parsed = registerLeadForDemoSchema.safeParse({
    lead_id: formData.get("lead_id"),
    notes: formData.get("notes"),
  });

  if (!parsed.success) {
    return {
      error: parsed.error.issues[0]?.message ?? "Selecciona un lead.",
    };
  }

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return { error: "No autorizado." };
  }

  const result = await registerLeadForDemo(
    supabase,
    demoIdParsed.data,
    parsed.data,
  );

  if (!result.ok) {
    return { error: result.error };
  }

  revalidateDemo(demoIdParsed.data);
  revalidatePath("/admin/leads");
  return {};
}

export interface UpdateAttendanceState {
  error?: string;
}

export async function updateAttendanceAction(
  _prevState: UpdateAttendanceState,
  formData: FormData,
): Promise<UpdateAttendanceState> {
  const demoIdParsed = idSchema.safeParse(formData.get("demoEventId"));
  const registrationIdParsed = idSchema.safeParse(
    formData.get("registrationId"),
  );
  const leadIdParsed = idSchema.safeParse(formData.get("leadId"));

  if (!demoIdParsed.success || !registrationIdParsed.success || !leadIdParsed.success) {
    return { error: "Inscripción inválida." };
  }

  const parsed = updateAttendanceSchema.safeParse({
    attendance_status: formData.get("attendance_status"),
    notes: formData.get("notes"),
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

  const result = await updateAttendanceStatus(
    supabase,
    registrationIdParsed.data,
    leadIdParsed.data,
    demoIdParsed.data,
    parsed.data,
  );

  if (!result.ok) {
    return { error: "No pudimos guardar los cambios. Intenta de nuevo." };
  }

  revalidateDemo(demoIdParsed.data);
  revalidatePath("/admin/leads");
  revalidatePath(`/admin/leads/${leadIdParsed.data}`);
  return {};
}

export interface RemoveRegistrationState {
  error?: string;
}

export async function removeRegistrationAction(
  _prevState: RemoveRegistrationState,
  formData: FormData,
): Promise<RemoveRegistrationState> {
  const demoIdParsed = idSchema.safeParse(formData.get("demoEventId"));
  const registrationIdParsed = idSchema.safeParse(
    formData.get("registrationId"),
  );

  if (!demoIdParsed.success || !registrationIdParsed.success) {
    return { error: "Inscripción inválida." };
  }

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return { error: "No autorizado." };
  }

  const result = await removeRegistration(supabase, registrationIdParsed.data);

  if (!result.ok) {
    return { error: "No pudimos quitar la inscripción. Intenta de nuevo." };
  }

  revalidateDemo(demoIdParsed.data);
  return {};
}
