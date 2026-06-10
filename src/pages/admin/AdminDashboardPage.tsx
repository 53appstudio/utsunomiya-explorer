import { Link } from "react-router-dom";
import { useLang } from "@/i18n/LanguageContext";

export default function AdminDashboardPage() {
  const { t } = useLang();
  const items = [
    { to: "/admin/posts", label: t("managePosts") },
    { to: "/admin/categories", label: t("manageCategories") },
    { to: "/admin/tags", label: t("manageTags") },
  ];
  return (
    <div className="max-w-2xl mx-auto p-6">
      <h1 className="text-2xl font-bold mb-4">{t("admin")}</h1>
      <div className="grid gap-3">
        {items.map((i) => (
          <Link key={i.to} to={i.to} className="border rounded-lg p-4 hover:bg-muted">
            {i.label} →
          </Link>
        ))}
      </div>
    </div>
  );
}
