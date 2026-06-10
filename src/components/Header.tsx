import { Link } from "react-router-dom";
import { useLang } from "@/i18n/LanguageContext";
import { LANG_LABELS, Lang } from "@/i18n/translations";
import { useAuth } from "@/auth/AuthContext";

const LANGS: Lang[] = ["ja", "en", "zh", "ko"];

export function Header() {
  const { lang, setLang, t } = useLang();
  const { user, isAdmin, isDemo, signOut } = useAuth();

  return (
    <>
    {isDemo && (
      <div className="bg-gradient-primary text-primary-foreground text-xs text-center py-1.5 px-4">
        🧪 デモモード: Firebase未設定のため、管理画面UIを自由に確認できます（保存はできません）
      </div>
    )}
    <header className="sticky top-0 z-30 backdrop-blur-md bg-background/80 border-b border-border/60">
      <div className="max-w-5xl mx-auto px-4 py-3 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
        <div className="flex items-center justify-between gap-3">
          <Link to="/" className="flex items-center gap-2 font-display font-bold text-lg sm:text-xl">
            <span className="inline-flex items-center justify-center w-9 h-9 rounded-full bg-gradient-primary text-primary-foreground shadow-soft text-base">
              🌸
            </span>
            <span className="truncate">{t("siteTitle")}</span>
          </Link>
          <nav className="flex items-center gap-3 text-sm">
            {isAdmin && (
              <Link to="/admin" className="px-3 py-1 rounded-full bg-secondary/60 text-secondary-foreground hover:bg-secondary transition">
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
        <div className="flex gap-1.5 flex-wrap">
          {LANGS.map((l) => (
            <button
              key={l}
              onClick={() => setLang(l)}
              aria-pressed={lang === l}
              className={
                "px-3 py-1.5 text-xs sm:text-sm rounded-full border transition-all " +
                (lang === l
                  ? "bg-gradient-primary text-primary-foreground border-transparent font-semibold shadow-soft scale-105"
                  : "bg-card text-foreground border-border hover:bg-accent hover:border-primary/30")
              }
            >
              {LANG_LABELS[l]}
            </button>
          ))}
        </div>
      </div>
    </header>
  );
}
