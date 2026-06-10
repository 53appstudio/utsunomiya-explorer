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
    <div className="max-w-5xl mx-auto px-4 py-6">
      {/* Hero */}
      <section className="relative overflow-hidden rounded-3xl bg-gradient-soft p-6 sm:p-10 mb-8 shadow-card">
        <div className="absolute -top-6 -right-6 text-7xl opacity-30 select-none">🌸</div>
        <div className="absolute bottom-2 left-4 text-4xl opacity-20 select-none">🍃</div>
        <h1 className="font-display text-2xl sm:text-4xl font-bold text-foreground">
          {t("siteTitle")}
        </h1>
        <p className="mt-2 text-sm sm:text-base text-muted-foreground max-w-md">
          {lang === "ja" && "宇都宮の魅力を、やさしくご案内します。"}
          {lang === "en" && "A gentle guide to the charms of Utsunomiya."}
          {lang === "zh" && "温柔地为您介绍宇都宫的魅力。"}
          {lang === "ko" && "우츠노미야의 매력을 부드럽게 안내합니다."}
        </p>
      </section>

      {/* Filters */}
      <div className="mb-6 flex flex-wrap gap-2 items-center bg-card/60 rounded-2xl p-3 shadow-card">
        <span className="text-xs font-semibold text-mint-deep px-2">{t("filter")}</span>
        <select
          className="rounded-full border border-border bg-background px-3 py-1.5 text-sm focus:outline-none focus:ring-2 focus:ring-primary/40"
          value={catFilter}
          onChange={(e) => setCatFilter(e.target.value)}
        >
          <option value="">{t("category")}: {t("all")}</option>
          {cats.map((c) => (
            <option key={c.id} value={c.id}>{pickLocalized(c, "name", lang)}</option>
          ))}
        </select>
        <select
          className="rounded-full border border-border bg-background px-3 py-1.5 text-sm focus:outline-none focus:ring-2 focus:ring-primary/40"
          value={tagFilter}
          onChange={(e) => setTagFilter(e.target.value)}
        >
          <option value="">{t("tag")}: {t("all")}</option>
          {tags.map((tg) => (
            <option key={tg.id} value={tg.id}>{pickLocalized(tg, "name", lang)}</option>
          ))}
        </select>
        <span className="text-xs text-muted-foreground ml-auto px-2">✿ {t("newest")}</span>
      </div>

      {loading ? (
        <p className="text-center text-muted-foreground py-12">{t("loading")}</p>
      ) : filtered.length === 0 ? (
        <div className="text-center py-16 rounded-3xl bg-card/60 shadow-card">
          <div className="text-5xl mb-3">🌷</div>
          <p className="text-muted-foreground">{t("noResults")}</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
          {filtered.map((p) => {
            const thumb = p.images?.[0]?.url;
            return (
              <Link
                key={p.id}
                to={`/post/${p.id}`}
                className="group rounded-3xl overflow-hidden bg-card shadow-card hover:shadow-soft hover:-translate-y-1 transition-all border border-border/60"
              >
                <div className="relative overflow-hidden">
                  {thumb ? (
                    <img src={thumb} alt="" className="w-full aspect-[4/3] object-cover group-hover:scale-105 transition-transform duration-500" />
                  ) : (
                    <div className="w-full aspect-[4/3] bg-gradient-soft flex items-center justify-center text-5xl">🌸</div>
                  )}
                </div>
                <div className="p-4">
                  <h2 className="font-display font-bold line-clamp-2 group-hover:text-primary transition-colors">
                    {pickLocalized(p, "title", lang)}
                  </h2>
                </div>
              </Link>
            );
          })}
        </div>
      )}
    </div>
  );
}
