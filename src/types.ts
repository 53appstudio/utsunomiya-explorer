import { Timestamp } from "firebase/firestore";

export interface Category {
  id: string;
  name_ja: string;
  name_en: string;
  name_zh: string;
  name_ko: string;
  sort_order: number;
}

export interface Tag {
  id: string;
  name_ja: string;
  name_en: string;
  name_zh: string;
  name_ko: string;
}

export interface PostImage {
  url: string;
  path: string;
  sortOrder: number;
}

export interface Post {
  id: string;
  title_ja: string;
  title_en: string;
  title_zh: string;
  title_ko: string;
  body_ja: string;
  body_en: string;
  body_zh: string;
  body_ko: string;
  category_id: string | null;
  tag_ids: string[];
  images: PostImage[];
  published: boolean;
  created_at?: Timestamp;
  updated_at?: Timestamp;
}
