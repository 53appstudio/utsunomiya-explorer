# 宇都宮観光ガイド (Utsunomiya Tourism Guide)

宇都宮の民泊利用者向け多言語観光ガイド。React + Vite + Firebase + Netlify構成。

## セットアップ

### 1. 依存インストール

```bash
bun install   # または npm install
```

### 2. Firebaseプロジェクトを作成

[Firebase Console](https://console.firebase.google.com/) で:

1. プロジェクトを作成
2. **Authentication** → メール/パスワードを有効化
3. **Firestore Database** を作成（本番モード）
4. **Storage** を有効化
5. プロジェクト設定 → Webアプリを追加し、設定値を取得

### 3. 環境変数を設定

`.env.example` を `.env.local` にコピーして値を入力:

```bash
cp .env.example .env.local
```

### 4. Firestore / Storage ルールを適用

`firestore.rules` と `storage.rules` をFirebase CLIまたはコンソールから適用。

### 5. 起動

```bash
bun run dev
```

### 6. 最初の管理者登録

`/admin/login` で「新規登録」から最初のアカウントを作成すると、自動的に管理者になります。

## Netlifyデプロイ

1. リポジトリをNetlifyに接続
2. ビルド設定（`netlify.toml`で自動）:
   - Build command: `npm run build`
   - Publish directory: `dist`
3. **Site settings → Environment variables** に `.env.local` と同じ `VITE_FIREBASE_*` をすべて登録
4. デプロイ

## データ構造（Firestore）

- `posts/{id}` — `title_ja/en/zh/ko`, `body_ja/en/zh/ko`, `category_id`, `tag_ids[]`, `images[]`, `published`, `created_at`, `updated_at`
- `categories/{id}` — `name_ja/en/zh/ko`, `sort_order`
- `tags/{id}` — `name_ja/en/zh/ko`
- `admins/{uid}` — 管理者リスト

> 注: 元の要件では `post_tags` 中間テーブル / `post_images` テーブルがありましたが、Firestoreでは正規化よりも非正規化（配列フィールド）が自然なため、`posts` ドキュメント内に `tag_ids[]` と `images[]` を保持しています。

## 多言語

`src/i18n/translations.ts` にUI文言を集約。記事/カテゴリー/タグは4言語分のフィールドをDBに保持し、表示時に現在の言語のフィールドを選択。
