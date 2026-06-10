// シンプルな自動翻訳ユーティリティ
// MyMemory翻訳API (無料・APIキー不要・1日5000文字まで) を使用
// 短い単語（カテゴリ名・タグ名）程度ならこれで十分

export type LangKey = "ja" | "en" | "zh" | "ko";

const LANG_TO_MYMEMORY: Record<LangKey, string> = {
  ja: "ja",
  en: "en",
  zh: "zh-CN",
  ko: "ko",
};

export async function translateOne(text: string, from: LangKey, to: LangKey): Promise<string> {
  if (!text.trim()) return "";
  if (from === to) return text;
  const url = `https://api.mymemory.translated.net/get?q=${encodeURIComponent(text)}&langpair=${LANG_TO_MYMEMORY[from]}|${LANG_TO_MYMEMORY[to]}`;
  const res = await fetch(url);
  if (!res.ok) throw new Error("翻訳に失敗しました");
  const data = await res.json();
  return (data?.responseData?.translatedText as string) || "";
}

/**
 * 入力された1つの言語のテキストを元に、残り3言語に自動翻訳。
 * source: どの言語の入力値を元に翻訳するか
 * 既に値が入っている言語は上書きしません（空欄のみ埋める）。
 */
export async function translateToAll(
  values: Record<`name_${LangKey}`, string>,
  source: LangKey,
  options: { overwrite?: boolean } = {}
): Promise<Record<`name_${LangKey}`, string>> {
  const overwrite = options.overwrite ?? false;
  const src = values[`name_${source}`];
  if (!src?.trim()) return values;

  const targets: LangKey[] = (["ja", "en", "zh", "ko"] as LangKey[]).filter((l) => l !== source);
  const next = { ...values };
  await Promise.all(
    targets.map(async (lang) => {
      const key = `name_${lang}` as const;
      if (!overwrite && next[key]?.trim()) return;
      try {
        next[key] = await translateOne(src, source, lang);
      } catch {
        // 失敗時はそのまま
      }
    })
  );
  return next;
}
