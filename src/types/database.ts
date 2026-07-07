export type LeadInterest =
  | "recetas"
  | "demo_cocina"
  | "demo_thermomix"
  | "otro";

export type LeadStatus = "nuevo" | "contactado" | "convertido" | "descartado";

export type LeadActivityType = "note" | "contact";

export type ContactChannel = "whatsapp" | "llamada" | "email" | "otro";

export type LeadRow = {
  id: string;
  created_at: string;
  name: string;
  email: string;
  phone: string | null;
  interest: LeadInterest;
  message: string | null;
  status: LeadStatus;
  source: string;
  consent_contact: boolean;
};

export type LeadInsert = {
  id?: string;
  created_at?: string;
  name: string;
  email: string;
  phone?: string | null;
  interest: LeadInterest;
  message?: string | null;
  status?: LeadStatus;
  source?: string;
  consent_contact: boolean;
};

export type LeadUpdate = {
  name?: string;
  email?: string;
  phone?: string | null;
  interest?: LeadInterest;
  message?: string | null;
  status?: LeadStatus;
  source?: string;
  consent_contact?: boolean;
};

export type LeadActivityRow = {
  id: string;
  created_at: string;
  lead_id: string;
  created_by: string | null;
  type: LeadActivityType;
  channel: ContactChannel | null;
  content: string;
};

export type LeadActivityInsert = {
  id?: string;
  created_at?: string;
  lead_id: string;
  created_by?: string | null;
  type: LeadActivityType;
  channel?: ContactChannel | null;
  content: string;
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
      lead_activities: {
        Row: LeadActivityRow;
        Insert: LeadActivityInsert;
        Update: Partial<LeadActivityInsert>;
        Relationships: [];
      };
    };
    Views: Record<string, never>;
    Functions: Record<string, never>;
  };
};
