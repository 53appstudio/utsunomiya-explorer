import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { collection, getDocs, orderBy, query, doc, deleteDoc } from "firebase/firestore";
import { db, storage } from "@/firebase";
import { ref, deleteObject } from "firebase/storage";
import { Post } from "@/types";
import { useLang } from "@/i18n/LanguageContext";
import { toast } from "sonner";

export default function AdminPostsPage() {
  const { t } = useLang();
  const [items, setItems] = useState<Post[]>([]);

  async function load() {
    const snap = await getDocs(query(collection(db, "posts"), orderBy("created_at", "desc")));
    setItems(snap.docs.map((d) => ({ id: d.id, ...d.data() } as Post)));
  }
  useEffect(() => { load(); }, []);

  async function remove(p: Post) {
    if (!confirm(t("confirmDelete"))) return;
    // Delete images from storage
    for (const img of p.images ?? []) {
      try { await deleteObject(ref(storage, img.path)); } catch {}
    }
    await deleteDoc(doc(db, "posts", p.id));
    toast.success(t("deleted"));
    load();
  }

  return (
    <div className="max-w-3xl mx-auto p-4">
      <Link to="/admin" className="text-sm text-muted-foreground">← {t("back")}</Link>
      <div className="flex items-center justify-between my-3">
        <h1 className="text-xl font-bold">{t("managePosts")}</h1>
        <Link to="/admin/posts/new" className="bg-primary text-primary-foreground px-3 py-1.5 rounded text-sm">+ {t("newPost")}</Link>
      </div>
      <div className="space-y-2">
        {items.map((p) => (
          <div key={p.id} className="border rounded-lg p-3 flex items-center justify-between gap-2">
            <div className="text-sm min-w-0">
              <div className="font-medium truncate">{p.title_ja || "(no title)"}</div>
              <div className="text-xs text-muted-foreground">{p.published ? t("published") : t("draft")}</div>
            </div>
            <div className="flex gap-2 shrink-0">
              <Link to={`/admin/posts/${p.id}`} className="text-sm underline">{t("edit")}</Link>
              <button onClick={() => remove(p)} className="text-sm text-red-600 underline">{t("delete")}</button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
