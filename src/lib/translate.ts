// シンプルな自動翻訳ユーティリティ
// Gemini 1.5 Flash API を使用して高精度な翻訳を行います。

export type LangKey = "ja" | "en" | "zh" | "ko";

export async function translateOne(text: string, from: LangKey, to: LangKey): Promise<string> {
  if (!text.trim()) return "";
  if (from === to) return text;

  const apiKey = import.meta.env.VITE_GEMINI_API_KEY;
  if (!apiKey) {
    throw new Error("Gemini API key is not configured");
  }

  const langNames: Record<LangKey, string> = {
    ja: "Japanese",
    en: "English",
    zh: "Simplified Chinese",
    ko: "Korean",
  };

  const url = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=${apiKey}`;
  
  // プロンプト：フォーマットを維持し、翻訳後のテキストのみを返すように指示します。
  const prompt = `Translate the following text from ${langNames[from]} to ${langNames[to]}.
Provide only the translated text. Do not add any introduction, explanation, markdown styling, or wrapper.
Original text:
${text}`;

  const response = await fetch(url, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      contents: [
        {
          parts: [
            {
              text: prompt
            }
          ]
        }
      ]
    })
  });

  if (!response.ok) {
    throw new Error("翻訳に失敗しました (Gemini API エラー)");
  }

  const data = await response.json();
  const translated = data?.candidates?.[0]?.content?.parts?.[0]?.text;
  return translated?.trim() || "";
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

