import { useEffect, useRef, useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import {
  addDoc, collection, doc, getDoc, getDocs, serverTimestamp, setDoc, updateDoc,
} from "firebase/firestore";
import { db, storage } from "@/firebase";
import { ref, uploadBytes, getDownloadURL, deleteObject } from "firebase/storage";
import { Post, Category, Tag, PostImage } from "@/types";
import { useLang } from "@/i18n/LanguageContext";
import { LANG_LABELS, Lang } from "@/i18n/translations";
import { toast } from "sonner";

const LANGS: Lang[] = ["ja", "en", "zh", "ko"];
const MAX_IMAGES = 20;

type Form = {
  title_ja: string; title_en: string; title_zh: string; title_ko: string;
  body_ja: string; body_en: string; body_zh: string; body_ko: string;
  category_id: string;
  tag_ids: string[];
  published: boolean;
  images: PostImage[];
};

const emptyForm: Form = {
  title_ja: "", title_en: "", title_zh: "", title_ko: "",
  body_ja: "", body_en: "", body_zh: "", body_ko: "",
  category_id: "", tag_ids: [], published: false, images: [],
};

export default function AdminPostEditPage() {
  const { id } = useParams<{ id: string }>();
  const isNew = !id;
  const { t } = useLang();
  const navigate = useNavigate();
  const [form, setForm] = useState<Form>(emptyForm);
  const [cats, setCats] = useState<Category[]>([]);
  const [tags, setTags] = useState<Tag[]>([]);
  const [activeLang, setActiveLang] = useState<Lang>("ja");
  const [postId, setPostId] = useState<string | null>(id ?? null);
  const [uploading, setUploading] = useState(false);
  const [saving, setSaving] = useState(false);
  const fileRef = useRef<HTMLInputElement>(null);
  const [dragOver, setDragOver] = useState(false);

  useEffect(() => {
    if (!db) return;
    (async () => {
      const [cSnap, tSnap] = await Promise.all([
        getDocs(collection(db, "categories")),
        getDocs(collection(db, "tags")),
      ]);
      setCats(cSnap.docs.map((d) => ({ id: d.id, ...d.data() } as Category)));
      setTags(tSnap.docs.map((d) => ({ id: d.id, ...d.data() } as Tag)));
      if (id) {
        const snap = await getDoc(doc(db, "posts", id));
        if (snap.exists()) {
          const p = snap.data() as Post;
          setForm({
            title_ja: p.title_ja ?? "", title_en: p.title_en ?? "", title_zh: p.title_zh ?? "", title_ko: p.title_ko ?? "",
            body_ja: p.body_ja ?? "", body_en: p.body_en ?? "", body_zh: p.body_zh ?? "", body_ko: p.body_ko ?? "",
            category_id: p.category_id ?? "",
            tag_ids: p.tag_ids ?? [],
            published: p.published ?? false,
            images: p.images ?? [],
          });
        }
      }
    })();
  }, [id]);

  /** Make sure a post doc exists (so we can upload images under its ID). */
  async function ensurePostId(): Promise<string> {
    if (!db) throw new Error("Firebase not configured");
    if (postId) return postId;
    const ref = await addDoc(collection(db, "posts"), {
      ...form,
      created_at: serverTimestamp(),
      updated_at: serverTimestamp(),
    });
    setPostId(ref.id);
    return ref.id;
  }

  async function handleFiles(files: FileList | File[]) {
    if (!storage || !db) {
      toast.error("Firebase not configured");
      return;
    }
    const arr = Array.from(files);
    if (form.images.length + arr.length > MAX_IMAGES) {
      toast.error(t("maxImagesError"));
      return;
    }
    setUploading(true);
    try {
      const pid = await ensurePostId();
      const added: PostImage[] = [];
      for (const file of arr) {
        const path = `posts/${pid}/${Date.now()}_${file.name}`;
        const r = ref(storage, path);
        await uploadBytes(r, file);
        const url = await getDownloadURL(r);
        added.push({ url, path, sortOrder: form.images.length + added.length });
      }
      setForm((f) => ({ ...f, images: [...f.images, ...added] }));
    } catch (e: any) {
      toast.error(e.message ?? "upload failed");
    } finally {
      setUploading(false);
    }
  }

  async function removeImage(idx: number) {
    if (!storage) return;
    const img = form.images[idx];
    try { await deleteObject(ref(storage, img.path)); } catch {}
    const next = form.images.filter((_, i) => i !== idx).map((im, i) => ({ ...im, sortOrder: i }));
    setForm((f) => ({ ...f, images: next }));
  }

  function move(idx: number, delta: number) {
    const next = [...form.images];
    const target = idx + delta;
    if (target < 0 || target >= next.length) return;
    [next[idx], next[target]] = [next[target], next[idx]];
    setForm((f) => ({ ...f, images: next.map((im, i) => ({ ...im, sortOrder: i })) }));
  }

  function toggleTag(tid: string) {
    setForm((f) => ({
      ...f,
      tag_ids: f.tag_ids.includes(tid) ? f.tag_ids.filter((x) => x !== tid) : [...f.tag_ids, tid],
    }));
  }

  async function save() {
    setSaving(true);
    try {
      const payload: any = {
        ...form,
        category_id: form.category_id || null,
        updated_at: serverTimestamp(),
      };
      if (postId) {
        await updateDoc(doc(db, "posts", postId), payload);
      } else {
        payload.created_at = serverTimestamp();
        const r = await addDoc(collection(db, "posts"), payload);
        setPostId(r.id);
      }
      toast.success(t("saved"));
      navigate("/admin/posts");
    } catch (e: any) {
      toast.error(e.message ?? "save failed");
    } finally {
      setSaving(false);
    }
  }

  return (
    <div className="max-w-3xl mx-auto p-4 space-y-4">
      <Link to="/admin/posts" className="text-sm text-muted-foreground">← {t("back")}</Link>
      <h1 className="text-xl font-bold">{isNew ? t("newPost") : t("edit")}</h1>

      <div className="border rounded-lg p-3">
        <div className="flex gap-1 mb-3 border-b">
          {LANGS.map((l) => (
            <button key={l} onClick={() => setActiveLang(l)} className={"px-3 py-1.5 text-sm -mb-px border-b-2 " + (activeLang === l ? "border-primary font-semibold" : "border-transparent text-muted-foreground")}>
              {LANG_LABELS[l]}
            </button>
          ))}
        </div>
        <div className="space-y-2">
          <label className="text-sm">{t("title")} ({activeLang})</label>
          <input
            value={(form as any)[`title_${activeLang}`]}
            onChange={(e) => setForm({ ...form, [`title_${activeLang}`]: e.target.value })}
            className="w-full border rounded px-3 py-2"
          />
          <label className="text-sm">{t("body")} ({activeLang})</label>
          <textarea
            rows={10}
            value={(form as any)[`body_${activeLang}`]}
            onChange={(e) => setForm({ ...form, [`body_${activeLang}`]: e.target.value })}
            className="w-full border rounded px-3 py-2 font-mono text-sm"
          />
        </div>
      </div>

      <div className="border rounded-lg p-3 space-y-2">
        <label className="text-sm">{t("category")}</label>
        <select value={form.category_id} onChange={(e) => setForm({ ...form, category_id: e.target.value })} className="w-full border rounded px-3 py-2 bg-background">
          <option value="">{t("selectCategory")}</option>
          {cats.map((c) => <option key={c.id} value={c.id}>{c.name_ja}</option>)}
        </select>
        <label className="text-sm">{t("tags")}</label>
        <div className="flex flex-wrap gap-1">
          {tags.map((tg) => (
            <button key={tg.id} type="button" onClick={() => toggleTag(tg.id)} className={"text-xs px-2 py-1 rounded border " + (form.tag_ids.includes(tg.id) ? "bg-primary text-primary-foreground border-primary" : "bg-background")}>
              {tg.name_ja}
            </button>
          ))}
        </div>
        <label className="flex items-center gap-2 text-sm pt-2">
          <input type="checkbox" checked={form.published} onChange={(e) => setForm({ ...form, published: e.target.checked })} />
          {t("published")}
        </label>
      </div>

      <div className="border rounded-lg p-3 space-y-2">
        <div className="flex items-center justify-between">
          <label className="text-sm font-medium">{t("uploadImages")}</label>
          <span className="text-xs text-muted-foreground">{form.images.length}/{MAX_IMAGES}</span>
        </div>
        <div
          onDragOver={(e) => { e.preventDefault(); setDragOver(true); }}
          onDragLeave={() => setDragOver(false)}
          onDrop={(e) => { e.preventDefault(); setDragOver(false); handleFiles(e.dataTransfer.files); }}
          onClick={() => fileRef.current?.click()}
          className={"border-2 border-dashed rounded-lg p-6 text-center cursor-pointer text-sm " + (dragOver ? "border-primary bg-accent" : "border-border")}
        >
          {uploading ? t("loading") : t("dragHere")}
          <input ref={fileRef} type="file" accept="image/*" multiple hidden onChange={(e) => e.target.files && handleFiles(e.target.files)} />
        </div>
        <div className="grid grid-cols-3 sm:grid-cols-4 gap-2">
          {form.images.map((im, i) => (
            <div key={i} className="relative group border rounded overflow-hidden">
              <img src={im.url} alt="" className="w-full aspect-square object-cover" />
              <div className="absolute inset-x-0 bottom-0 bg-background/90 flex justify-between text-xs p-1">
                <button onClick={() => move(i, -1)} disabled={i === 0} className="px-1 disabled:opacity-30">←</button>
                <span>{i + 1}</span>
                <button onClick={() => move(i, 1)} disabled={i === form.images.length - 1} className="px-1 disabled:opacity-30">→</button>
              </div>
              <button onClick={() => removeImage(i)} className="absolute top-1 right-1 bg-red-600 text-white rounded-full w-6 h-6 text-xs">×</button>
            </div>
          ))}
        </div>
      </div>

      <div className="flex gap-2">
        <button onClick={save} disabled={saving} className="bg-primary text-primary-foreground px-4 py-2 rounded font-medium disabled:opacity-50">{t("save")}</button>
        <Link to="/admin/posts" className="border px-4 py-2 rounded">{t("cancel")}</Link>
      </div>
    </div>
  );
}
