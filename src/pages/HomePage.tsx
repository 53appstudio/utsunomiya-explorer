import { useEffect, useState, useMemo } from "react";
import { Link } from "react-router-dom";
import { collection, getDocs, orderBy, query, where } from "firebase/firestore";
import { db } from "@/firebase";
import { Post, Category, Tag } from "@/types";
import { useLang, pickLocalized } from "@/i18n/LanguageContext";

export default function HomePage() {
  const { lang, t } = useLang();
  const [posts, setPosts] = useState<Post[]>([]);
  const [cats, setCats] = useState<Category[]>([]);
  const [tags, setTags] = useState<Tag[]>([]);
  const [catFilter, setCatFilter] = useState<string>("");
  const [tagFilter, setTagFilter] = useState<string>("");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!db) {
      setLoading(false);
      return;
    }
    (async () => {
      try {
        const [pSnap, cSnap, tSnap] = await Promise.all([
          getDocs(query(collection(db, "posts"), where("published", "==", true), orderBy("created_at", "desc"))),
          getDocs(query(collection(db, "categories"), orderBy("sort_order", "asc"))),
          getDocs(collection(db, "tags")),
        ]);
        setPosts(pSnap.docs.map((d) => ({ id: d.id, ...d.data() } as Post)));
        setCats(cSnap.docs.map((d) => ({ id: d.id, ...d.data() } as Category)));
        setTags(tSnap.docs.map((d) => ({ id: d.id, ...d.data() } as Tag)));
      } catch (e) {
        console.error(e);
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  const filtered = useMemo(() => {
    return posts.filter((p) => {
      if (catFilter && p.category_id !== catFilter) return false;
      if (tagFilter && !(p.tag_ids ?? []).includes(tagFilter)) return false;
      return true;
    });
  }, [posts, catFilter, tagFilter]);

  return (
    <div className="max-w-5xl mx-auto p-4">
      <div className="mb-4 flex flex-wrap gap-2 items-center">
        <span className="text-sm text-muted-foreground">{t("filter")}:</span>
        <select
          className="border rounded-md px-2 py-1 text-sm bg-background"
          value={catFilter}
          onChange={(e) => setCatFilter(e.target.value)}
        >
          <option value="">{t("category")}: {t("all")}</option>
          {cats.map((c) => (
            <option key={c.id} value={c.id}>
              {pickLocalized(c, "name", lang)}
            </option>
          ))}
        </select>
        <select
          className="border rounded-md px-2 py-1 text-sm bg-background"
          value={tagFilter}
          onChange={(e) => setTagFilter(e.target.value)}
        >
          <option value="">{t("tag")}: {t("all")}</option>
          {tags.map((tg) => (
            <option key={tg.id} value={tg.id}>
              {pickLocalized(tg, "name", lang)}
            </option>
          ))}
        </select>
        <span className="text-xs text-muted-foreground ml-auto">{t("newest")}</span>
      </div>

      {loading ? (
        <p className="text-center text-muted-foreground py-8">{t("loading")}</p>
      ) : filtered.length === 0 ? (
        <p className="text-center text-muted-foreground py-8">{t("noResults")}</p>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {filtered.map((p) => {
            const thumb = p.images?.[0]?.url;
            return (
              <Link
                key={p.id}
                to={`/post/${p.id}`}
                className="border rounded-lg overflow-hidden bg-background hover:shadow-md transition"
              >
                {thumb ? (
                  <img src={thumb} alt="" className="w-full aspect-video object-cover" />
                ) : (
                  <div className="w-full aspect-video bg-muted" />
                )}
                <div className="p-3">
                  <h2 className="font-semibold line-clamp-2">{pickLocalized(p, "title", lang)}</h2>
                </div>
              </Link>
            );
          })}
        </div>
      )}
    </div>
  );
}
