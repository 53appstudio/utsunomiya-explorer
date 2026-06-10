import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { collection, addDoc, getDocs, doc, updateDoc, deleteDoc, orderBy, query } from "firebase/firestore";
import { db } from "@/firebase";
import { Category } from "@/types";
import { useLang } from "@/i18n/LanguageContext";
import { toast } from "sonner";
import { translateToAll, LangKey } from "@/lib/translate";

const empty = { name_ja: "", name_en: "", name_zh: "", name_ko: "", sort_order: 0 };

const LANG_LABELS = [
  { key: "ja" as const, label: "日本語", placeholder: "例：観光スポット" },
  { key: "en" as const, label: "English", placeholder: "e.g. Sightseeing" },
  { key: "zh" as const, label: "中文", placeholder: "例如：观光景点" },
  { key: "ko" as const, label: "한국어", placeholder: "예: 관광지" },
];

export default function AdminCategoriesPage() {
  const { t } = useLang();
  const [items, setItems] = useState<Category[]>([]);
  const [draft, setDraft] = useState({ ...empty });
  const [editing, setEditing] = useState<string | null>(null);
  const [editDraft, setEditDraft] = useState({ ...empty });
  const [translating, setTranslating] = useState<null | "add" | "edit">(null);

  async function autoTranslate(target: "add" | "edit", source: LangKey) {
    const current = target === "add" ? draft : editDraft;
    if (!(current as any)[`name_${source}`]?.trim()) {
      toast.error("先に翻訳元の単語を入力してください");
      return;
    }
    setTranslating(target);
    try {
      const next = await translateToAll(current as any, source, { overwrite: true });
      if (target === "add") setDraft({ ...current, ...next });
      else setEditDraft({ ...current, ...next });
      toast.success("自動翻訳しました");
    } catch {
      toast.error("翻訳に失敗しました");
    } finally {
      setTranslating(null);
    }
  }

  async function load() {
    if (!db) return;
    const snap = await getDocs(query(collection(db, "categories"), orderBy("sort_order", "asc")));
    setItems(snap.docs.map((d) => ({ id: d.id, ...d.data() } as Category)));
  }
  useEffect(() => { load(); }, []);

  async function add() {
    if (!db) return;
    if (!draft.name_ja) return;
    await addDoc(collection(db, "categories"), { ...draft, sort_order: Number(draft.sort_order) || 0 });
    setDraft({ ...empty });
    toast.success(t("saved"));
    load();
  }
  async function save(id: string) {
    if (!db) return;
    await updateDoc(doc(db, "categories", id), { ...editDraft, sort_order: Number(editDraft.sort_order) || 0 });
    setEditing(null);
    toast.success(t("saved"));
    load();
  }
  async function remove(id: string) {
    if (!db) return;
    if (!confirm(t("confirmDelete"))) return;
    await deleteDoc(doc(db, "categories", id));
    toast.success(t("deleted"));
    load();
  }

  return (
    <div className="max-w-3xl mx-auto p-4">
      <Link to="/admin" className="text-sm text-muted-foreground">← {t("back")}</Link>
      <h1 className="text-xl font-bold my-3">{t("manageCategories")}</h1>

      {/* 追加フォーム */}
      <div className="border rounded-lg p-4 mb-6 space-y-3">
        <h2 className="font-semibold text-sm">{t("add")}</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          {LANG_LABELS.map((l) => (
            <div key={l.key} className="space-y-1">
              <label className="text-xs font-medium text-muted-foreground">{l.label}</label>
              <input
                placeholder={l.placeholder}
                value={(draft as any)[`name_${l.key}`]}
                onChange={(e) => setDraft({ ...draft, [`name_${l.key}`]: e.target.value })}
                className="border rounded px-3 py-2 text-sm w-full"
              />
            </div>
          ))}
          <div className="space-y-1">
            <label className="text-xs font-medium text-muted-foreground">{t("sortOrder")}</label>
            <input
              type="number"
              placeholder="0"
              value={draft.sort_order}
              onChange={(e) => setDraft({ ...draft, sort_order: Number(e.target.value) })}
              className="border rounded px-3 py-2 text-sm w-full"
            />
            <p className="text-[10px] text-muted-foreground">数字が小さいほど先に表示されます</p>
          </div>
        </div>
        <button onClick={add} className="bg-primary text-primary-foreground px-4 py-2 rounded text-sm">{t("add")}</button>
      </div>

      {/* 一覧 */}
      <div className="space-y-3">
        {items.map((c) => (
          <div key={c.id} className="border rounded-lg p-4">
            {editing === c.id ? (
              <div className="space-y-3">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  {LANG_LABELS.map((l) => (
                    <div key={l.key} className="space-y-1">
                      <label className="text-xs font-medium text-muted-foreground">{l.label}</label>
                      <input
                        value={(editDraft as any)[`name_${l.key}`]}
                        onChange={(e) => setEditDraft({ ...editDraft, [`name_${l.key}`]: e.target.value })}
                        className="border rounded px-3 py-2 text-sm w-full"
                      />
                    </div>
                  ))}
                  <div className="space-y-1">
                    <label className="text-xs font-medium text-muted-foreground">{t("sortOrder")}</label>
                    <input
                      type="number"
                      value={editDraft.sort_order}
                      onChange={(e) => setEditDraft({ ...editDraft, sort_order: Number(e.target.value) })}
                      className="border rounded px-3 py-2 text-sm w-full"
                    />
                  </div>
                </div>
                <div className="flex gap-2">
                  <button onClick={() => save(c.id)} className="bg-primary text-primary-foreground px-4 py-2 rounded text-sm">{t("save")}</button>
                  <button onClick={() => setEditing(null)} className="border px-4 py-2 rounded text-sm">{t("cancel")}</button>
                </div>
              </div>
            ) : (
              <div className="flex items-center justify-between gap-3">
                <div className="text-sm">
                  <div className="font-medium">{c.name_ja}</div>
                  <div className="text-xs text-muted-foreground">{c.name_en} / {c.name_zh} / {c.name_ko}</div>
                  <div className="text-xs text-muted-foreground mt-1">並び順: {c.sort_order}</div>
                </div>
                <div className="flex gap-3 shrink-0">
                  <button onClick={() => { setEditing(c.id); setEditDraft({ name_ja: c.name_ja, name_en: c.name_en, name_zh: c.name_zh, name_ko: c.name_ko, sort_order: c.sort_order }); }} className="text-sm underline">{t("edit")}</button>
                  <button onClick={() => remove(c.id)} className="text-sm text-red-600 underline">{t("delete")}</button>
                </div>
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}
