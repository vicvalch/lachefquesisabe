-- PR3 (registro público a demos): el registro desde /demos/[slug] pide
-- WhatsApp obligatorio y email opcional (WhatsApp es el canal principal
-- para confirmar el lugar). El formulario general de la landing sigue
-- pidiendo email obligatorio a nivel de Zod; esto solo relaja la
-- restricción en la base para permitir el otro flujo.

alter table public.leads alter column email drop not null;

alter table public.leads drop constraint if exists leads_email_format;
alter table public.leads
  add constraint leads_email_format check (
    email is null or email ~* '^[^@\s]+@[^@\s]+\.[^@\s]+$'
  );
