import { Post, Category, Tag } from "@/types";

const KEY_POSTS = "demo.posts";
const KEY_CATS = "demo.categories";
const KEY_TAGS = "demo.tags";
const KEY_SEEDED = "demo.seeded.v2";

// Stock images from Unsplash (steak / restaurant themed)
const IMG_STEAK_1 = "https://images.unsplash.com/photo-1558030006-450675393462?w=1200&q=80";
const IMG_STEAK_2 = "https://images.unsplash.com/photo-1546964124-0cce460f38ef?w=1200&q=80";
const IMG_STEAK_3 = "https://images.unsplash.com/photo-1607116176109-bff3b1d4f7ad?w=1200&q=80";
const IMG_INTERIOR = "https://images.unsplash.com/photo-1552566626-52f8b828add9?w=1200&q=80";
const IMG_WAGYU = "https://images.unsplash.com/photo-1588168333986-5078d3ae3976?w=1200&q=80";
const IMG_HAMBURG = "https://images.unsplash.com/photo-1551782450-a2132b4ba21d?w=1200&q=80";

const DEMO_CATEGORIES: Category[] = [
  { id: "cat-restaurant", name_ja: "レストラン", name_en: "Restaurants", name_zh: "餐厅", name_ko: "레스토랑", sort_order: 1 },
  { id: "cat-gourmet", name_ja: "グルメ", name_en: "Gourmet", name_zh: "美食", name_ko: "맛집", sort_order: 2 },
  { id: "cat-sightseeing", name_ja: "観光スポット", name_en: "Sightseeing", name_zh: "观光景点", name_ko: "관광지", sort_order: 3 },
];

const DEMO_TAGS: Tag[] = [
  { id: "tag-steak", name_ja: "ステーキ", name_en: "Steak", name_zh: "牛排", name_ko: "스테이크" },
  { id: "tag-wagyu", name_ja: "和牛", name_en: "Wagyu", name_zh: "和牛", name_ko: "와규" },
  { id: "tag-utsunomiya", name_ja: "宇都宮", name_en: "Utsunomiya", name_zh: "宇都宫", name_ko: "우츠노미야" },
  { id: "tag-lunch", name_ja: "ランチ", name_en: "Lunch", name_zh: "午餐", name_ko: "런치" },
  { id: "tag-dinner", name_ja: "ディナー", name_en: "Dinner", name_zh: "晚餐", name_ko: "디너" },
];

const now = Date.now();

const DEMO_POSTS: Post[] = [
  {
    id: "post-kei-1",
    title_ja: "ステーキ慶 ― 精肉店直営、宇都宮の本格ステーキ",
    title_en: "Steak Kei — Authentic Steak from a Butcher-Run Restaurant in Utsunomiya",
    title_zh: "牛排慶 — 宇都宫精肉店直营的正宗牛排",
    title_ko: "스테이크 케이 — 우츠노미야 정육점 직영 정통 스테이크",
    body_ja: `宇都宮にある「ステーキ慶（ステーキけい）」は、地元の精肉店が直営する本格ステーキ店です。

栃木の精肉店から直接仕入れた国産和牛・国産牛を、確かな技術で焼き上げてくれます。「上質のお肉を、お手頃価格で。」がコンセプト。

【おすすめポイント】
・精肉業直営ならではの鮮度と価格
・国産和牛をリーズナブルに味わえる
・落ち着いた雰囲気の店内
・全頭が放射性物質検査済みで安心

【店舗情報】
・住所：栃木県宇都宮市
・電話：028-645-1911
・定休日：月曜日
・ご予約はお電話にて承ります

ランチでもディナーでも、宇都宮で美味しいステーキを食べたい方にぜひおすすめしたい一軒です。`,
    body_en: `"Steak Kei" in Utsunomiya is an authentic steak restaurant run directly by a local butcher shop.

They serve Japanese wagyu and domestic beef sourced directly from a Tochigi butcher, grilled with refined technique. Their concept: "Premium meat at reasonable prices."

Highlights:
- Freshness and value from a butcher-run kitchen
- Affordable Japanese wagyu
- Calm, welcoming interior
- All beef is radiation-tested for safety

Info:
- Address: Utsunomiya, Tochigi
- Phone: 028-645-1911
- Closed: Mondays
- Reservations by phone

A must-visit for anyone looking for a great steak in Utsunomiya, lunch or dinner.`,
    body_zh: `位于宇都宫的"牛排慶"是一家由当地精肉店直营的正宗牛排餐厅。

精选自栃木精肉店直采的国产和牛与国产牛肉，由经验丰富的厨师精心烤制。理念是"上等好肉，亲民价格"。

【推荐亮点】
・精肉店直营，新鲜度与价格优势明显
・以实惠的价格享用国产和牛
・店内氛围安静舒适
・所有牛肉均通过放射性物质检测，安心可靠

【店铺信息】
・地址：栃木县宇都宫市
・电话：028-645-1911
・休息日：周一
・预约请致电

无论午餐还是晚餐，想在宇都宫品尝美味牛排，这里都值得一试。`,
    body_ko: `우츠노미야에 있는 "스테이크 케이"는 현지 정육점이 직접 운영하는 정통 스테이크 전문점입니다.

도치기의 정육점에서 직접 매입한 일본산 와규와 국산 소고기를 숙련된 기술로 구워냅니다. 컨셉은 "고급 고기를 합리적인 가격으로".

【추천 포인트】
・정육점 직영만의 신선도와 가격
・국산 와규를 합리적인 가격으로
・차분한 분위기의 매장
・모든 소고기 방사성 물질 검사 완료로 안심

【매장 정보】
・주소: 도치기현 우츠노미야시
・전화: 028-645-1911
・정기휴일: 월요일
・예약은 전화로

런치든 디너든, 우츠노미야에서 맛있는 스테이크를 원한다면 꼭 추천하고 싶은 곳입니다.`,
    category_id: "cat-restaurant",
    tag_ids: ["tag-steak", "tag-wagyu", "tag-utsunomiya", "tag-dinner"],
    images: [
      { url: IMG_STEAK_1, path: "demo/steak1", sortOrder: 0 },
      { url: IMG_INTERIOR, path: "demo/interior", sortOrder: 1 },
      { url: IMG_WAGYU, path: "demo/wagyu", sortOrder: 2 },
    ],
    published: true,
  },
  {
    id: "post-kei-2",
    title_ja: "ステーキ慶のおすすめメニュー ― 国産和牛サーロイン",
    title_en: "Steak Kei's Must-Try: Domestic Wagyu Sirloin",
    title_zh: "牛排慶推荐菜 — 国产和牛西冷",
    title_ko: "스테이크 케이 추천 메뉴 — 국산 와규 등심",
    body_ja: `ステーキ慶でぜひ味わってほしいのが、国産和牛サーロインステーキ。

きめ細やかな霜降りと、上品な甘みのある脂が口の中でとろけます。精肉店直営ならではの目利きで、その日の最良の部位を提供してくれるのも嬉しいポイント。

【人気メニュー】
・国産和牛サーロインステーキ
・国産牛フィレステーキ
・サイコロステーキ
・ハンバーグステーキ

ライス・スープ・サラダがついたセットメニューもあり、コストパフォーマンスは抜群です。`,
    body_en: `If you visit Steak Kei, do not miss the Domestic Wagyu Sirloin.

Fine marbling and elegantly sweet fat melt on the tongue. Because it is run by a butcher, you can trust they select the best cut of the day.

Popular dishes:
- Domestic Wagyu Sirloin
- Domestic Beef Fillet
- Cubed steak
- Hamburg steak

Set menus include rice, soup, and salad — excellent value for money.`,
    body_zh: `来到牛排慶，一定要尝尝国产和牛西冷牛排。

细腻的雪花纹理与高雅甘甜的脂肪在口中融化。精肉店直营，挑选当日最佳部位的眼光令人信赖。

【人气菜单】
・国产和牛西冷
・国产牛菲力
・骰子牛排
・汉堡牛排

附带米饭、汤、沙拉的套餐性价比极高。`,
    body_ko: `스테이크 케이에 가신다면 꼭 드셔보셔야 할 것은 국산 와규 등심 스테이크.

섬세한 마블링과 우아한 단맛의 지방이 입안에서 녹아내립니다. 정육점 직영이기에 그날의 최상의 부위를 골라주는 안목도 매력적입니다.

【인기 메뉴】
・국산 와규 등심 스테이크
・국산 소고기 필레 스테이크
・큐브 스테이크
・함박 스테이크

밥, 수프, 샐러드가 포함된 세트 메뉴는 가성비가 뛰어납니다.`,
    category_id: "cat-gourmet",
    tag_ids: ["tag-steak", "tag-wagyu", "tag-lunch", "tag-dinner"],
    images: [
      { url: IMG_STEAK_2, path: "demo/steak2", sortOrder: 0 },
      { url: IMG_HAMBURG, path: "demo/hamburg", sortOrder: 1 },
    ],
    published: true,
  },
  {
    id: "post-kei-3",
    title_ja: "宇都宮グルメ巡り ― ステーキ慶でランチ",
    title_en: "Utsunomiya Food Tour — Lunch at Steak Kei",
    title_zh: "宇都宫美食巡礼 — 在牛排慶享用午餐",
    title_ko: "우츠노미야 미식 투어 — 스테이크 케이에서 런치",
    body_ja: `餃子だけじゃない宇都宮グルメ。今回はステーキ慶でランチをいただきました。

ランチタイムはお得なセットメニューがあり、平日でも多くのお客様で賑わいます。柔らかいお肉と熱々の鉄板、香ばしい香りが食欲をそそります。

宇都宮駅から少し足を伸ばす価値あり。観光ついでにぜひ立ち寄ってみてください。`,
    body_en: `Utsunomiya is not only about gyoza. This time we had lunch at Steak Kei.

Lunch sets are great value and the place gets busy even on weekdays. Tender meat sizzling on a hot iron plate — the aroma alone is irresistible.

Worth the short trip from Utsunomiya Station. A perfect stop on a sightseeing day.`,
    body_zh: `宇都宫不只有饺子。这次我们到牛排慶享用了午餐。

午餐时段有超值套餐，平日也座无虚席。柔嫩的牛肉在炽热的铁板上嗞嗞作响，香气令人垂涎。

从宇都宫站稍走一段也很值得。观光途中不妨顺路一访。`,
    body_ko: `우츠노미야는 교자뿐만이 아닙니다. 이번에는 스테이크 케이에서 런치를 즐겼습니다.

런치 타임에는 알찬 세트 메뉴가 있어 평일에도 손님으로 북적입니다. 부드러운 고기와 뜨거운 철판, 고소한 향이 식욕을 자극합니다.

우츠노미야역에서 조금 발걸음을 옮길 가치가 있는 곳. 관광 중에 꼭 들러보세요.`,
    category_id: "cat-sightseeing",
    tag_ids: ["tag-utsunomiya", "tag-lunch", "tag-steak"],
    images: [
      { url: IMG_STEAK_3, path: "demo/steak3", sortOrder: 0 },
    ],
    published: true,
  },
];

function seedIfNeeded() {
  if (typeof window === "undefined") return;
  if (localStorage.getItem(KEY_SEEDED)) return;
  localStorage.setItem(KEY_CATS, JSON.stringify(DEMO_CATEGORIES));
  localStorage.setItem(KEY_TAGS, JSON.stringify(DEMO_TAGS));
  localStorage.setItem(KEY_POSTS, JSON.stringify(DEMO_POSTS));
  localStorage.setItem(KEY_SEEDED, "1");
}

export function getDemoPosts(): Post[] {
  seedIfNeeded();
  try { return JSON.parse(localStorage.getItem(KEY_POSTS) || "[]"); } catch { return []; }
}
export function getDemoCategories(): Category[] {
  seedIfNeeded();
  try { return JSON.parse(localStorage.getItem(KEY_CATS) || "[]"); } catch { return []; }
}
export function getDemoTags(): Tag[] {
  seedIfNeeded();
  try { return JSON.parse(localStorage.getItem(KEY_TAGS) || "[]"); } catch { return []; }
}
export function getDemoPost(id: string): Post | null {
  return getDemoPosts().find((p) => p.id === id) ?? null;
}
