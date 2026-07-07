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

export type RecipeContentType = "recipe" | "tip";

export type RecipeStatus = "draft" | "published";

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

export type RecipeRow = {
  id: string;
  created_at: string;
  updated_at: string;
  published_at: string | null;
  created_by: string | null;
  title: string;
  slug: string;
  content_type: RecipeContentType;
  status: RecipeStatus;
  summary: string | null;
  cover_image_url: string | null;
  prep_minutes: number | null;
  servings: number | null;
  ingredients: string | null;
  content: string;
  cta_message: string | null;
};

export type RecipeInsert = {
  id?: string;
  created_at?: string;
  updated_at?: string;
  published_at?: string | null;
  created_by?: string | null;
  title: string;
  slug: string;
  content_type?: RecipeContentType;
  status?: RecipeStatus;
  summary?: string | null;
  cover_image_url?: string | null;
  prep_minutes?: number | null;
  servings?: number | null;
  ingredients?: string | null;
  content: string;
  cta_message?: string | null;
};

export type RecipeUpdate = {
  published_at?: string | null;
  title?: string;
  slug?: string;
  content_type?: RecipeContentType;
  status?: RecipeStatus;
  summary?: string | null;
  cover_image_url?: string | null;
  prep_minutes?: number | null;
  servings?: number | null;
  ingredients?: string | null;
  content?: string;
  cta_message?: string | null;
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
      recipes: {
        Row: RecipeRow;
        Insert: RecipeInsert;
        Update: RecipeUpdate;
        Relationships: [];
      };
    };
    Views: Record<string, never>;
    Functions: Record<string, never>;
  };
};
