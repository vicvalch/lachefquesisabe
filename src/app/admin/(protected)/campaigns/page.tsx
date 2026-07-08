import { redirect } from "next/navigation";

// Alias en inglés: la funcionalidad de campañas vive en /admin/campanas
// (consistente con el resto de rutas admin, todas en español). Este alias
// evita un 404 a quien llegue buscando /admin/campaigns.
export default function AdminCampaignsAliasPage() {
  redirect("/admin/campanas");
}
