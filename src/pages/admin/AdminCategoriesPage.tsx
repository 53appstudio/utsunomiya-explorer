import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { collection, addDoc, getDocs, doc, updateDoc, deleteDoc, orderBy, query } from "firebase/firestore";
import { db } from "@/firebase";
import { Category } from "@/types";
import { useLang } from "@/i18n/LanguageContext";
import { toast } from "sonner";

const empty = { name_ja: "", name_en: "", name_zh: "", name_ko: "", sort_order: 0 };

export default function AdminCategoriesPage() {
  const { t } = useLang();
  const [items, setItems] = useState<Category[]>([]);
  const [draft, setDraft] = useState({ ...empty });
  const [editing, setEditing] = useState<string | null>(null);
  const [editDraft, setEditDraft] = useState({ ...empty });

  async function load() {
    const snap = await getDocs(query(collection(db, "categories"), orderBy("sort_order", "asc")));
    setItems(snap.docs.map((d) => ({ id: d.id, ...d.data() } as Category)));
  }
  useEffect(() => { load(); }, []);

  async function add() {
    if (!draft.name_ja) return;
    await addDoc(collection(db, "categories"), { ...draft, sort_order: Number(draft.sort_order) || 0 });
    setDraft({ ...empty });
    toast.success(t("saved"));
    load();
  }
  async function save(id: string) {
    await updateDoc(doc(db, "categories", id), { ...editDraft, sort_order: Number(editDraft.sort_order) || 0 });
    setEditing(null);
    toast.success(t("saved"));
    load();
  }
  async function remove(id: string) {
    if (!confirm(t("confirmDelete"))) return;
    await deleteDoc(doc(db, "categories", id));
    toast.success(t("deleted"));
    load();
  }

  return (
    <div className="max-w-3xl mx-auto p-4">
      <Link to="/admin" className="text-sm text-muted-foreground">← {t("back")}</Link>
      <h1 className="text-xl font-bold my-3">{t("manageCategories")}</h1>

      <div className="border rounded-lg p-3 mb-6 space-y-2">
        <h2 className="font-semibold text-sm">{t("add")}</h2>
        <div className="grid grid-cols-2 gap-2">
          {(["ja", "en", "zh", "ko"] as const).map((l) => (
            <input key={l} placeholder={`name_${l}`} value={(draft as any)[`name_${l}`]} onChange={(e) => setDraft({ ...draft, [`name_${l}`]: e.target.value })} className="border rounded px-2 py-1 text-sm" />
          ))}
          <input type="number" placeholder={t("sortOrder")} value={draft.sort_order} onChange={(e) => setDraft({ ...draft, sort_order: Number(e.target.value) })} className="border rounded px-2 py-1 text-sm" />
        </div>
        <button onClick={add} className="bg-primary text-primary-foreground px-3 py-1.5 rounded text-sm">{t("add")}</button>
      </div>

      <div className="space-y-2">
        {items.map((c) => (
          <div key={c.id} className="border rounded-lg p-3">
            {editing === c.id ? (
              <div className="space-y-2">
                <div className="grid grid-cols-2 gap-2">
                  {(["ja", "en", "zh", "ko"] as const).map((l) => (
                    <input key={l} value={(editDraft as any)[`name_${l}`]} onChange={(e) => setEditDraft({ ...editDraft, [`name_${l}`]: e.target.value })} className="border rounded px-2 py-1 text-sm" />
                  ))}
                  <input type="number" value={editDraft.sort_order} onChange={(e) => setEditDraft({ ...editDraft, sort_order: Number(e.target.value) })} className="border rounded px-2 py-1 text-sm" />
                </div>
                <div className="flex gap-2">
                  <button onClick={() => save(c.id)} className="bg-primary text-primary-foreground px-3 py-1 rounded text-sm">{t("save")}</button>
                  <button onClick={() => setEditing(null)} className="border px-3 py-1 rounded text-sm">{t("cancel")}</button>
                </div>
              </div>
            ) : (
              <div className="flex items-center justify-between gap-2">
                <div className="text-sm">
                  <div className="font-medium">{c.name_ja} / {c.name_en} / {c.name_zh} / {c.name_ko}</div>
                  <div className="text-xs text-muted-foreground">#{c.sort_order}</div>
                </div>
                <div className="flex gap-2 shrink-0">
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
