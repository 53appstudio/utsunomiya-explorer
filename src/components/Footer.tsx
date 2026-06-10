import { Link } from "react-router-dom";
import { useLang } from "@/i18n/LanguageContext";
import { useAuth } from "@/auth/AuthContext";

export function Footer() {
  const { t } = useLang();
  const { user, isAdmin } = useAuth();
  return (
    <footer className="mt-12 border-t border-border/60 bg-card/40">
      <div className="max-w-5urn-5xl max-w-5xl mx-auto px-4 py-6 flex flex-col sm:flex-row gap-3 items-center justify-between text-sm text-muted-foreground">
        <div className="flex items-center gap-2">
          <span>🌸</span>
          <span>© {new Date().getFullYear()} {t("siteTitle")}</span>
        </div>
        <div className="flex items-center gap-4">
          {user && isAdmin ? (
            <Link to="/admin" className="hover:text-primary transition">
              {t("admin")}
            </Link>
          ) : (
            <Link to="/admin/login" className="hover:text-primary transition">
              {t("login")} / {t("admin")}
            </Link>
          )}
        </div>
      </div>
    </footer>
  );
}
