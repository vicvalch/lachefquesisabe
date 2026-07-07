import type { SupabaseClient } from "@supabase/supabase-js";
import type { Database, MessageTemplateRow } from "@/types/database";

export async function listMessageTemplates(
  supabase: SupabaseClient<Database>,
): Promise<MessageTemplateRow[]> {
  const { data, error } = await supabase
    .from("message_templates")
    .select("*")
    .order("created_at", { ascending: true });

  if (error || !data) {
    return [];
  }

  return data;
}

export async function getMessageTemplateByKey(
  supabase: SupabaseClient<Database>,
  key: string,
): Promise<MessageTemplateRow | null> {
  const { data, error } = await supabase
    .from("message_templates")
    .select("*")
    .eq("key", key)
    .maybeSingle();

  if (error || !data) {
    return null;
  }

  return data;
}
