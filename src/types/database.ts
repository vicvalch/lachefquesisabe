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

export type LeadRow = {
  id: string;
  created_at: string;
  name: string;
  email: string;
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
  email: string;
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
    };
    Views: Record<string, never>;
    Functions: Record<string, never>;
  };
};
