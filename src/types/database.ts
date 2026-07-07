export type PrimaryInterest =
  | "easy_recipes"
  | "save_time"
  | "in_person_demo"
  | "virtual_demo"
  | "buy_thermomix"
  | "more_info";

export type LeadStatus =
  | "new"
  | "contacted"
  | "interested"
  | "invited_to_demo"
  | "confirmed_demo"
  | "attended"
  | "no_show"
  | "post_demo_follow_up"
  | "purchased"
  | "lost";

export type ContactChannel =
  | "whatsapp"
  | "phone"
  | "email"
  | "instagram"
  | "tiktok"
  | "in_person"
  | "other";

export type ContactDirection = "outbound" | "inbound";

export type DemoMode = "in_person" | "virtual";

export type DemoEventStatus =
  | "draft"
  | "scheduled"
  | "full"
  | "completed"
  | "cancelled";

export type AttendanceStatus =
  | "registered"
  | "confirmed"
  | "attended"
  | "no_show"
  | "cancelled";

export type ContentType = "recipe" | "tip" | "guide";

export type ContentStatus = "draft" | "published" | "archived";

export type ContentDifficulty = "easy" | "medium" | "hard";

export type TaskStatus = "open" | "completed" | "skipped" | "cancelled";

/**
 * Doble uso intencional: documenta tanto el mecanismo que creó la tarea
 * como su "tipo" (para qué es). Los cinco valores específicos
 * (initial_contact, demo_invitation, demo_confirmation,
 * post_demo_follow_up, no_show_recovery) corresponden 1:1 a los eventos
 * automáticos de creación de tareas; status_change cubre el resto de
 * cambios de estado del lead, y contact_log/manual son creaciones desde
 * el admin.
 */
export type TaskSource =
  | "initial_contact"
  | "demo_invitation"
  | "demo_confirmation"
  | "post_demo_follow_up"
  | "no_show_recovery"
  | "status_change"
  | "contact_log"
  | "manual";

export type LeadRow = {
  id: string;
  created_at: string;
  name: string;
  email: string | null;
  phone: string | null;
  primary_interest: PrimaryInterest;
  message: string | null;
  status: LeadStatus;
  source: string;
  consent_contact: boolean;
  notes: string | null;
  next_follow_up_at: string | null;
  last_contacted_at: string | null;
};

export type LeadInsert = {
  id?: string;
  created_at?: string;
  name: string;
  email?: string | null;
  phone?: string | null;
  primary_interest: PrimaryInterest;
  message?: string | null;
  status?: LeadStatus;
  source?: string;
  consent_contact: boolean;
  notes?: string | null;
  next_follow_up_at?: string | null;
  last_contacted_at?: string | null;
};

export type LeadUpdate = {
  name?: string;
  email?: string;
  phone?: string | null;
  primary_interest?: PrimaryInterest;
  message?: string | null;
  status?: LeadStatus;
  source?: string;
  consent_contact?: boolean;
  notes?: string | null;
  next_follow_up_at?: string | null;
  last_contacted_at?: string | null;
};

export type ContactLogRow = {
  id: string;
  created_at: string;
  lead_id: string;
  created_by: string | null;
  channel: ContactChannel;
  direction: ContactDirection;
  summary: string;
  outcome: string | null;
  next_follow_up_at: string | null;
};

export type ContactLogInsert = {
  id?: string;
  created_at?: string;
  lead_id: string;
  created_by?: string | null;
  channel: ContactChannel;
  direction: ContactDirection;
  summary: string;
  outcome?: string | null;
  next_follow_up_at?: string | null;
};

export type DemoEventRow = {
  id: string;
  created_at: string;
  updated_at: string;
  created_by: string | null;
  title: string;
  slug: string;
  mode: DemoMode;
  status: DemoEventStatus;
  starts_at: string;
  ends_at: string | null;
  location_name: string | null;
  location_address: string | null;
  meeting_url: string | null;
  capacity: number;
  description: string | null;
  public_notes: string | null;
  internal_notes: string | null;
};

export type DemoEventInsert = {
  id?: string;
  created_at?: string;
  updated_at?: string;
  created_by?: string | null;
  title: string;
  slug: string;
  mode: DemoMode;
  status?: DemoEventStatus;
  starts_at: string;
  ends_at?: string | null;
  location_name?: string | null;
  location_address?: string | null;
  meeting_url?: string | null;
  capacity: number;
  description?: string | null;
  public_notes?: string | null;
  internal_notes?: string | null;
};

export type DemoEventUpdate = {
  title?: string;
  slug?: string;
  mode?: DemoMode;
  status?: DemoEventStatus;
  starts_at?: string;
  ends_at?: string | null;
  location_name?: string | null;
  location_address?: string | null;
  meeting_url?: string | null;
  capacity?: number;
  description?: string | null;
  public_notes?: string | null;
  internal_notes?: string | null;
};

export type DemoRegistrationRow = {
  id: string;
  created_at: string;
  demo_event_id: string;
  lead_id: string;
  attendance_status: AttendanceStatus;
  notes: string | null;
};

export type DemoRegistrationInsert = {
  id?: string;
  created_at?: string;
  demo_event_id: string;
  lead_id: string;
  attendance_status?: AttendanceStatus;
  notes?: string | null;
};

export type DemoRegistrationUpdate = {
  attendance_status?: AttendanceStatus;
  notes?: string | null;
};

export type ContentCategoryRow = {
  id: string;
  created_at: string;
  updated_at: string;
  name: string;
  slug: string;
  description: string | null;
  sort_order: number;
  is_active: boolean;
};

export type ContentCategoryInsert = {
  id?: string;
  created_at?: string;
  updated_at?: string;
  name: string;
  slug: string;
  description?: string | null;
  sort_order?: number;
  is_active?: boolean;
};

export type ContentCategoryUpdate = {
  name?: string;
  slug?: string;
  description?: string | null;
  sort_order?: number;
  is_active?: boolean;
};

export type ContentPostRow = {
  id: string;
  created_at: string;
  updated_at: string;
  published_at: string | null;
  created_by: string | null;
  category_id: string | null;
  title: string;
  slug: string;
  content_type: ContentType;
  status: ContentStatus;
  excerpt: string | null;
  body: string;
  ingredients: string | null;
  instructions: string | null;
  prep_time_minutes: number | null;
  cook_time_minutes: number | null;
  servings: number | null;
  difficulty: ContentDifficulty | null;
  image_url: string | null;
  seo_title: string | null;
  seo_description: string | null;
  featured: boolean;
};

export type ContentPostInsert = {
  id?: string;
  created_at?: string;
  updated_at?: string;
  published_at?: string | null;
  created_by?: string | null;
  category_id?: string | null;
  title: string;
  slug: string;
  content_type?: ContentType;
  status?: ContentStatus;
  excerpt?: string | null;
  body: string;
  ingredients?: string | null;
  instructions?: string | null;
  prep_time_minutes?: number | null;
  cook_time_minutes?: number | null;
  servings?: number | null;
  difficulty?: ContentDifficulty | null;
  image_url?: string | null;
  seo_title?: string | null;
  seo_description?: string | null;
  featured?: boolean;
};

export type ContentPostUpdate = {
  published_at?: string | null;
  category_id?: string | null;
  title?: string;
  slug?: string;
  content_type?: ContentType;
  status?: ContentStatus;
  excerpt?: string | null;
  body?: string;
  ingredients?: string | null;
  instructions?: string | null;
  prep_time_minutes?: number | null;
  cook_time_minutes?: number | null;
  servings?: number | null;
  difficulty?: ContentDifficulty | null;
  image_url?: string | null;
  seo_title?: string | null;
  seo_description?: string | null;
  featured?: boolean;
};

export type MessageTemplateRow = {
  id: string;
  created_at: string;
  updated_at: string;
  key: string;
  label: string;
  body: string;
  is_active: boolean;
};

export type MessageTemplateInsert = {
  id?: string;
  created_at?: string;
  updated_at?: string;
  key: string;
  label: string;
  body: string;
  is_active?: boolean;
};

export type MessageTemplateUpdate = {
  label?: string;
  body?: string;
  is_active?: boolean;
};

export type FollowUpTaskRow = {
  id: string;
  created_at: string;
  updated_at: string;
  lead_id: string;
  demo_event_id: string | null;
  contact_log_id: string | null;
  created_by: string | null;
  title: string;
  message_template_key: string | null;
  status: TaskStatus;
  due_at: string;
  source: TaskSource;
  completed_at: string | null;
  notes: string | null;
};

export type FollowUpTaskInsert = {
  id?: string;
  created_at?: string;
  updated_at?: string;
  lead_id: string;
  demo_event_id?: string | null;
  contact_log_id?: string | null;
  created_by?: string | null;
  title: string;
  message_template_key?: string | null;
  status?: TaskStatus;
  due_at?: string;
  source?: TaskSource;
  completed_at?: string | null;
  notes?: string | null;
};

export type FollowUpTaskUpdate = {
  demo_event_id?: string | null;
  contact_log_id?: string | null;
  title?: string;
  message_template_key?: string | null;
  status?: TaskStatus;
  due_at?: string;
  completed_at?: string | null;
  notes?: string | null;
};

export type Database = {
  public: {
    Tables: {
      leads: {
        Row: LeadRow;
        Insert: LeadInsert;
        Update: LeadUpdate;
        Relationships: [];
      };
      contact_logs: {
        Row: ContactLogRow;
        Insert: ContactLogInsert;
        Update: Partial<ContactLogInsert>;
        Relationships: [];
      };
      demo_events: {
        Row: DemoEventRow;
        Insert: DemoEventInsert;
        Update: DemoEventUpdate;
        Relationships: [];
      };
      demo_registrations: {
        Row: DemoRegistrationRow;
        Insert: DemoRegistrationInsert;
        Update: DemoRegistrationUpdate;
        Relationships: [];
      };
      content_categories: {
        Row: ContentCategoryRow;
        Insert: ContentCategoryInsert;
        Update: ContentCategoryUpdate;
        Relationships: [];
      };
      content_posts: {
        Row: ContentPostRow;
        Insert: ContentPostInsert;
        Update: ContentPostUpdate;
        Relationships: [];
      };
      message_templates: {
        Row: MessageTemplateRow;
        Insert: MessageTemplateInsert;
        Update: MessageTemplateUpdate;
        Relationships: [];
      };
      follow_up_tasks: {
        Row: FollowUpTaskRow;
        Insert: FollowUpTaskInsert;
        Update: FollowUpTaskUpdate;
        Relationships: [];
      };
    };
    Views: Record<string, never>;
    Functions: Record<string, never>;
  };
};
