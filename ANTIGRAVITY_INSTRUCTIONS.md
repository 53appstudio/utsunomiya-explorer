# Anti-Gravity 向け作業指示書

このリポジトリ（宇都宮観光ガイド）を **Firebase 本番環境で稼働させる** ための残作業をお願いします。
コード側（React + Vite + Firebase SDK / GitHub Actions / Firestore & Storage rules）はすべて準備済みです。
**Firebase プロジェクトの作成と接続情報の登録だけ** が残っています。

---

## 0. 前提・現状

- リポジトリは GitHub に接続済み。`main` ブランチへ push すると GitHub Actions が自動で
  - `bun run build` → Firebase Hosting へデプロイ
  - `firestore.rules` / `storage.rules` を Firebase へデプロイ
- 環境変数が未設定の場合、アプリは自動的に「デモモード」（localStorage）で動作する。
- 多言語（日 / 英 / 中 / 韓）対応済み。管理画面は `/admin`、ログインは `/admin/login`。

### 既に存在するファイル（変更不要）
- `firebase.json` — Hosting + Firestore rules + Storage rules
- `.firebaserc` — `projects.default` が `YOUR_FIREBASE_PROJECT_ID` プレースホルダ
- `firestore.rules`, `storage.rules`
- `.github/workflows/firebase-hosting-deploy.yml`
- `.github/workflows/firebase-rules-deploy.yml`
- `.env.example` — 必要な `VITE_FIREBASE_*` キー一覧
- `src/firebase.ts` — `VITE_FIREBASE_*` を読んで初期化
- `src/auth/AuthContext.tsx` — 初回ユーザーを自動的に admin 登録（`ensureAdminOnFirstUser`）

---

## 1. やってほしいこと（チェックリスト）

### 1-1. Firebase プロジェクト作成
[Firebase Console](https://console.firebase.google.com/) で：
- [ ] 新規プロジェクト作成（推奨名: `utsunomiya-tourism` など）
- [ ] **Authentication** → Sign-in method → **メール / パスワード** を有効化
- [ ] **Firestore Database** を作成（ロケーション: `asia-northeast1` 東京）
- [ ] **Storage** を有効化（同ロケーション）
- [ ] **Hosting** を有効化
- [ ] プロジェクト設定 → 全般 → **Web アプリを追加**（`</>` アイコン）→ アプリ名登録 → `firebaseConfig` の 6 項目を控える

### 1-2. `.firebaserc` の更新
`YOUR_FIREBASE_PROJECT_ID` を 1-1 で作ったプロジェクト ID に置き換えてコミット。

```json
{ "projects": { "default": "<実際のプロジェクトID>" } }
```

### 1-3. サービスアカウントキー作成
Firebase Console → プロジェクト設定 → **サービス アカウント** → **新しい秘密鍵を生成** で JSON をダウンロード。
（GitHub Actions が Hosting / Rules をデプロイするために使う）

### 1-4. GitHub Secrets を登録
リポジトリの **Settings → Secrets and variables → Actions → New repository secret** で以下 7 件を追加：

| Secret 名 | 値 |
|---|---|
| `FIREBASE_SERVICE_ACCOUNT` | 1-3 でダウンロードした JSON ファイルの中身全文 |
| `VITE_FIREBASE_API_KEY` | firebaseConfig.apiKey |
| `VITE_FIREBASE_AUTH_DOMAIN` | firebaseConfig.authDomain |
| `VITE_FIREBASE_PROJECT_ID` | firebaseConfig.projectId |
| `VITE_FIREBASE_STORAGE_BUCKET` | firebaseConfig.storageBucket |
| `VITE_FIREBASE_MESSAGING_SENDER_ID` | firebaseConfig.messagingSenderId |
| `VITE_FIREBASE_APP_ID` | firebaseConfig.appId |

### 1-5. `main` ブランチへ push
`.firebaserc` 更新コミットを `main` に push → GitHub Actions が走る。
- `Deploy to Firebase Hosting on push` が成功すると `https://<projectId>.web.app` で公開。
- `Deploy Firestore & Storage Rules` も成功していること。

### 1-6. 動作確認
- [ ] 公開 URL を開き、トップページが表示される
- [ ] `/admin/login` → 「新規登録」で最初のアカウントを作成（**そのユーザーが自動的に admin になる**）
- [ ] `/admin` から記事 / カテゴリ / タグの CRUD ができる
- [ ] 画像アップロードが Storage に保存される
- [ ] 多言語切り替え（JA / EN / ZH / KO）が動く

---

## 2. ローカル動作確認（任意）

```bash
bun install
cp .env.example .env.local
# .env.local に firebaseConfig の値を記入
bun run dev
```

---

## 3. 触ってほしくないもの

- `src/firebase.ts` の初期化ロジック
- `src/auth/AuthContext.tsx` の admin 判定（`admins/{uid}` コレクションを使用）
- `firestore.rules` / `storage.rules`（既にプロダクション想定で書かれている）
- `src/lib/demoStore.ts`（環境変数未設定時のフォールバック用、本番では使われない）

---

## 4. 想定されるトラブルと対処

| 症状 | 対処 |
|---|---|
| GitHub Actions の Build で `VITE_FIREBASE_*` が undefined | Secrets 名のタイプミス / 大文字小文字を確認 |
| Hosting デプロイで `HTTP 403` | `FIREBASE_SERVICE_ACCOUNT` の JSON が破損 / 権限不足。Firebase Console から再発行 |
| `/admin/login` でログイン後に admin にならない | `admins` コレクションが空でない状態で新規登録した。Firestore で他の `admins/{uid}` を削除してから再登録、または手動で `admins/{自分のuid}` ドキュメントを作成 |
| 画像アップロードで CORS / 403 | Storage の rules がデプロイされているか、`storage.rules` の内容を確認 |

---

以上。完了後、公開 URL と最初の admin メールアドレスを共有してください。
