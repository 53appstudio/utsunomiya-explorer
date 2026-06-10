import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { collection, addDoc, getDocs, doc, updateDoc, deleteDoc } from "firebase/firestore";
import { db } from "@/firebase";
import { Tag } from "@/types";
import { useLang } from "@/i18n/LanguageContext";
import { toast } from "sonner";

const empty = { name_ja: "", name_en: "", name_zh: "", name_ko: "" };

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

      <div className="border rounded-lg p-3 mb-6 space-y-2">
        <h2 className="font-semibold text-sm">{t("add")}</h2>
        <div className="grid grid-cols-2 gap-2">
          {(["ja", "en", "zh", "ko"] as const).map((l) => (
            <input key={l} placeholder={`name_${l}`} value={(draft as any)[`name_${l}`]} onChange={(e) => setDraft({ ...draft, [`name_${l}`]: e.target.value })} className="border rounded px-2 py-1 text-sm" />
          ))}
        </div>
        <button onClick={add} className="bg-primary text-primary-foreground px-3 py-1.5 rounded text-sm">{t("add")}</button>
      </div>

      <div className="flex flex-wrap gap-2">
        {items.map((tg) => (
          <div key={tg.id} className="border rounded-lg p-2 text-sm">
            {editing === tg.id ? (
              <div className="space-y-1">
                <div className="grid grid-cols-2 gap-1">
                  {(["ja", "en", "zh", "ko"] as const).map((l) => (
                    <input key={l} value={(editDraft as any)[`name_${l}`]} onChange={(e) => setEditDraft({ ...editDraft, [`name_${l}`]: e.target.value })} className="border rounded px-1 py-0.5 text-xs w-24" />
                  ))}
                </div>
                <div className="flex gap-1">
                  <button onClick={() => save(tg.id)} className="bg-primary text-primary-foreground px-2 py-0.5 rounded text-xs">{t("save")}</button>
                  <button onClick={() => setEditing(null)} className="border px-2 py-0.5 rounded text-xs">{t("cancel")}</button>
                </div>
              </div>
            ) : (
              <div className="flex items-center gap-2">
                <span>{tg.name_ja} / {tg.name_en} / {tg.name_zh} / {tg.name_ko}</span>
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
