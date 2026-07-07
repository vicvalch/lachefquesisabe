export type LeadInterest =
  | "recetas"
  | "demo_cocina"
  | "demo_thermomix"
  | "otro";

export type LeadStatus = "nuevo" | "contactado" | "convertido" | "descartado";

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

export type Database = {
  public: {
    Tables: {
      leads: {
        Row: LeadRow;
        Insert: LeadInsert;
        Update: LeadUpdate;
        Relationships: [];
      };
    };
    Views: Record<string, never>;
    Functions: Record<string, never>;
  };
};
