# 宇都宮観光ガイド (Utsunomiya Tourism Guide)

宇都宮の民泊利用者向け多言語観光ガイド。**React + Vite + Firebase (Hosting / Firestore / Auth / Storage)** 構成、GitHub Actions で自動デプロイ。

---

## ローカル開発

```bash
bun install
cp .env.example .env.local   # Firebase Web SDKの値を入れる
bun run dev
```

---

## Firebase へ「GitHubから自動デプロイ」する手順

> このプロジェクトは `firebase.json` / `.firebaserc` / `.github/workflows/` がすでに整備済みです。
> 以下を1回設定すれば、以降は **`main` ブランチに push するだけで Firebase Hosting / Rules が自動デプロイ**されます。

### 1. Firebase プロジェクトを作成
[Firebase Console](https://console.firebase.google.com/) で:
- プロジェクト作成
- **Authentication** → メール/パスワードを有効化
- **Firestore Database** を作成（ロケーション: `asia-northeast1`）
- **Storage** を有効化
- **Hosting** を有効化
- プロジェクト設定 → Webアプリを追加し、`firebaseConfig` 6項目をコピー

### 2. `.firebaserc` を編集
```json
{ "projects": { "default": "あなたのFirebaseプロジェクトID" } }
```

### 3. サービスアカウントを作成（GitHub Actions 用）
Firebase Console → プロジェクト設定 → **サービスアカウント** → **新しい秘密鍵の生成** で JSON をダウンロード。

### 4. GitHub Secrets を登録
リポジトリの **Settings → Secrets and variables → Actions → New repository secret** に以下を登録:

| Secret 名 | 値 |
|---|---|
| `FIREBASE_SERVICE_ACCOUNT` | 手順3でダウンロードした JSON の中身まるごと |
| `VITE_FIREBASE_API_KEY` | firebaseConfig の apiKey |
| `VITE_FIREBASE_AUTH_DOMAIN` | firebaseConfig の authDomain |
| `VITE_FIREBASE_PROJECT_ID` | firebaseConfig の projectId |
| `VITE_FIREBASE_STORAGE_BUCKET` | firebaseConfig の storageBucket |
| `VITE_FIREBASE_MESSAGING_SENDER_ID` | firebaseConfig の messagingSenderId |
| `VITE_FIREBASE_APP_ID` | firebaseConfig の appId |

### 5. push して自動デプロイ
```bash
git push origin main
```
GitHub Actions タブで進捗を確認できます。完了すると `https://<projectId>.web.app` で公開されます。

### 6. 初回ログイン
公開URL `/admin/login` で「新規登録」から最初のアカウントを作成すると、自動的に管理者になります。

---

## ワークフロー一覧

- `.github/workflows/firebase-hosting-deploy.yml` — `main` への push で **ビルド + Hosting デプロイ**
- `.github/workflows/firebase-rules-deploy.yml` — `firestore.rules` / `storage.rules` / `firebase.json` 変更時に **ルール自動デプロイ**

## 手動デプロイ（任意）
```bash
npm i -g firebase-tools
firebase login
bun run build
firebase deploy
```

## データ構造（Firestore）
- `posts/{id}` — `title_ja/en/zh/ko`, `body_ja/en/zh/ko`, `category_id`, `tag_ids[]`, `images[]`, `published`, `created_at`, `updated_at`
- `categories/{id}` — `name_ja/en/zh/ko`, `sort_order`
- `tags/{id}` — `name_ja/en/zh/ko`
- `admins/{uid}` — 管理者リスト
