import { Link } from "react-router-dom";
import { useLang } from "@/i18n/LanguageContext";
import { LANG_LABELS, Lang } from "@/i18n/translations";
import { useAuth } from "@/auth/AuthContext";

const LANGS: Lang[] = ["ja", "en", "zh", "ko"];

export function Header() {
  const { lang, setLang, t } = useLang();
  const { user, isAdmin, signOut } = useAuth();

  return (
    <header className="border-b bg-background sticky top-0 z-30">
      <div className="max-w-5xl mx-auto px-3 py-2 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
        <div className="flex items-center justify-between gap-3">
          <Link to="/" className="font-bold text-lg truncate">
            {t("siteTitle")}
          </Link>
          <nav className="flex items-center gap-3 text-sm">
            {isAdmin && (
              <Link to="/admin" className="text-muted-foreground hover:text-foreground">
                {t("admin")}
              </Link>
            )}
            {user ? (
              <button onClick={signOut} className="text-muted-foreground hover:text-foreground">
                {t("logout")}
              </button>
            ) : null}
          </nav>
        </div>
        <div className="flex gap-1 flex-wrap">
          {LANGS.map((l) => (
            <button
              key={l}
              onClick={() => setLang(l)}
              className={
                "px-2.5 py-1 text-xs sm:text-sm rounded-md border transition " +
                (lang === l
                  ? "bg-primary text-primary-foreground border-primary font-semibold"
                  : "bg-background text-foreground hover:bg-muted")
              }
              aria-pressed={lang === l}
            >
              {LANG_LABELS[l]}
            </button>
          ))}
        </div>
      </div>
    </header>
  );
}
