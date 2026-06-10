import { useEffect, useState } from "react";
import { useParams, Link } from "react-router-dom";
import { doc, getDoc } from "firebase/firestore";
import { db } from "@/firebase";
import { Post } from "@/types";
import { useLang, pickLocalized } from "@/i18n/LanguageContext";

export default function PostDetailPage() {
  const { id } = useParams<{ id: string }>();
  const { lang, t } = useLang();
  const [post, setPost] = useState<Post | null>(null);
  const [loading, setLoading] = useState(true);
  const [idx, setIdx] = useState(0);

  useEffect(() => {
    if (!id) return;
    (async () => {
      const snap = await getDoc(doc(db, "posts", id));
      if (snap.exists()) setPost({ id: snap.id, ...snap.data() } as Post);
      setLoading(false);
    })();
  }, [id]);

  if (loading) return <p className="p-8 text-center text-muted-foreground">{t("loading")}</p>;
  if (!post) return <p className="p-8 text-center">{t("notFound")}</p>;

  const images = (post.images ?? []).slice().sort((a, b) => a.sortOrder - b.sortOrder);

  return (
    <article className="max-w-3xl mx-auto p-4">
      <Link to="/" className="text-sm text-muted-foreground hover:underline">← {t("back")}</Link>
      <h1 className="text-2xl font-bold mt-3 mb-4">{pickLocalized(post, "title", lang)}</h1>

      {images.length > 0 && (
        <div className="mb-6">
          <div className="relative w-full aspect-video bg-muted rounded-lg overflow-hidden">
            <img src={images[idx].url} alt="" className="w-full h-full object-contain" />
            {images.length > 1 && (
              <>
                <button
                  onClick={() => setIdx((i) => (i - 1 + images.length) % images.length)}
                  className="absolute left-2 top-1/2 -translate-y-1/2 bg-background/80 rounded-full w-9 h-9"
                  aria-label="prev"
                >
                  ‹
                </button>
                <button
                  onClick={() => setIdx((i) => (i + 1) % images.length)}
                  className="absolute right-2 top-1/2 -translate-y-1/2 bg-background/80 rounded-full w-9 h-9"
                  aria-label="next"
                >
                  ›
                </button>
                <div className="absolute bottom-2 right-2 text-xs bg-background/80 px-2 py-0.5 rounded">
                  {idx + 1} / {images.length}
                </div>
              </>
            )}
          </div>
          {images.length > 1 && (
            <div className="mt-2 flex gap-2 overflow-x-auto">
              {images.map((im, i) => (
                <button key={i} onClick={() => setIdx(i)} className={"shrink-0 border-2 rounded " + (i === idx ? "border-primary" : "border-transparent")}>
                  <img src={im.url} alt="" className="w-16 h-16 object-cover rounded" />
                </button>
              ))}
            </div>
          )}
        </div>
      )}

      <div className="whitespace-pre-wrap leading-relaxed">{pickLocalized(post, "body", lang)}</div>
    </article>
  );
}
