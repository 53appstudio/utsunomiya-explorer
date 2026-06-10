import { createContext, useContext, useEffect, useState, ReactNode } from "react";
import { translations, Lang, TKey } from "./translations";

interface Ctx {
  lang: Lang;
  setLang: (l: Lang) => void;
  t: (key: TKey) => string;
}

const LanguageContext = createContext<Ctx | null>(null);
const STORAGE_KEY = "app.lang";
const SUPPORTED: Lang[] = ["ja", "en", "zh", "ko"];

export function LanguageProvider({ children }: { children: ReactNode }) {
  const [lang, setLangState] = useState<Lang>(() => {
    if (typeof window === "undefined") return "ja";
    const saved = localStorage.getItem(STORAGE_KEY) as Lang | null;
    return saved && SUPPORTED.includes(saved) ? saved : "ja";
  });

  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, lang);
    document.documentElement.lang = lang === "zh" ? "zh-CN" : lang;
  }, [lang]);

  const t = (key: TKey) => translations[lang][key] ?? translations.ja[key] ?? key;

  return (
    <LanguageContext.Provider value={{ lang, setLang: setLangState, t }}>
      {children}
    </LanguageContext.Provider>
  );
}

export function useLang() {
  const ctx = useContext(LanguageContext);
  if (!ctx) throw new Error("useLang must be used within LanguageProvider");
  return ctx;
}

/** Pick localized field from an object with keys like title_ja, title_en, ... */
export function pickLocalized<T extends Record<string, any>>(
  obj: T | null | undefined,
  base: string,
  lang: Lang,
): string {
  if (!obj) return "";
  return obj[`${base}_${lang}`] || obj[`${base}_ja`] || obj[`${base}_en`] || "";
}
