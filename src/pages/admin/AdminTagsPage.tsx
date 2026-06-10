import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { collection, addDoc, getDocs, doc, updateDoc, deleteDoc } from "firebase/firestore";
import { db } from "@/firebase";
import { Tag } from "@/types";
import { useLang } from "@/i18n/LanguageContext";
import { toast } from "sonner";

const empty = { name_ja: "", name_en: "", name_zh: "", name_ko: "" };

const LANG_LABELS = [
  { key: "ja" as const, label: "日本語", placeholder: "例：おすすめ" },
  { key: "en" as const, label: "English", placeholder: "e.g. Recommended" },
  { key: "zh" as const, label: "中文", placeholder: "例如：推荐" },
  { key: "ko" as const, label: "한국어", placeholder: "예: 추천" },
];

export default function AdminTagsPage() {
  const { t } = useLang();
  const [items, setItems] = useState<Tag[]>([]);
  const [draft, setDraft] = useState({ ...empty });
  const [editing, setEditing] = useState<string | null>(null);
  const [editDraft, setEditDraft] = useState({ ...empty });

  async function load() {
    if (!db) return;
    const snap = await getDocs(collection(db, "tags"));
    setItems(snap.docs.map((d) => ({ id: d.id, ...d.data() } as Tag)));
  }
  useEffect(() => { load(); }, []);

  async function add() {
    if (!db) return;
    if (!draft.name_ja) return;
    await addDoc(collection(db, "tags"), draft);
    setDraft({ ...empty });
    toast.success(t("saved"));
    load();
  }
  async function save(id: string) {
    if (!db) return;
    await updateDoc(doc(db, "tags", id), editDraft);
    setEditing(null);
    toast.success(t("saved"));
    load();
  }
  async function remove(id: string) {
    if (!db) return;
    if (!confirm(t("confirmDelete"))) return;
    await deleteDoc(doc(db, "tags", id));
    toast.success(t("deleted"));
    load();
  }

  return (
    <div className="max-w-3xl mx-auto p-4">
      <Link to="/admin" className="text-sm text-muted-foreground">← {t("back")}</Link>
      <h1 className="text-xl font-bold my-3">{t("manageTags")}</h1>

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
        </div>
        <button onClick={add} className="bg-primary text-primary-foreground px-4 py-2 rounded text-sm">{t("add")}</button>
      </div>

      {/* 一覧 */}
      <div className="flex flex-wrap gap-3">
        {items.map((tg) => (
          <div key={tg.id} className="border rounded-lg p-3 text-sm">
            {editing === tg.id ? (
              <div className="space-y-2 min-w-[260px]">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                  {LANG_LABELS.map((l) => (
                    <div key={l.key} className="space-y-1">
                      <label className="text-[10px] font-medium text-muted-foreground">{l.label}</label>
                      <input
                        value={(editDraft as any)[`name_${l.key}`]}
                        onChange={(e) => setEditDraft({ ...editDraft, [`name_${l.key}`]: e.target.value })}
                        className="border rounded px-2 py-1 text-xs w-full"
                      />
                    </div>
                  ))}
                </div>
                <div className="flex gap-2">
                  <button onClick={() => save(tg.id)} className="bg-primary text-primary-foreground px-3 py-1 rounded text-xs">{t("save")}</button>
                  <button onClick={() => setEditing(null)} className="border px-3 py-1 rounded text-xs">{t("cancel")}</button>
                </div>
              </div>
            ) : (
              <div className="flex items-center gap-3">
                <span className="font-medium">{tg.name_ja}</span>
                <span className="text-xs text-muted-foreground">{tg.name_en} / {tg.name_zh} / {tg.name_ko}</span>
                <button onClick={() => { setEditing(tg.id); setEditDraft({ name_ja: tg.name_ja, name_en: tg.name_en, name_zh: tg.name_zh, name_ko: tg.name_ko }); }} className="text-xs underline">{t("edit")}</button>
                <button onClick={() => remove(tg.id)} className="text-xs text-red-600 underline">{t("delete")}</button>
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}
