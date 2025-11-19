# 🚀 Railway完全公開デプロイ - 最終版

## ✅ 修正完了

### 問題
- `npm ci`が`package-lock.json`を見つけられないエラー

### 解決
- ✅ `package-lock.json`を生成
- ✅ Dockerfileを修正（`package-lock.json`がある場合は`npm ci`を使用）
- ✅ バックエンドとフロントエンドを別サービスとしてデプロイする方法を追加

## 📋 推奨デプロイ方法（別サービス方式）

### ステップ1: バックエンドサービスのデプロイ

1. **Railwayで新しいプロジェクトを作成**
   - "New Project" → "Deploy from GitHub repo"

2. **バックエンドサービス設定**
   - サービス名: `poke-sup-backend`
   - Settings → Root Directory: `backend`
   - Settings → Dockerfile Path: `Dockerfile`（または空欄）

3. **PostgreSQLを追加**
   - "New" → "Database" → "Add PostgreSQL"

4. **環境変数を設定**
   ```
   DATABASE_URL=${{Postgres.DATABASE_URL}}
   FLASK_ENV=production
   SECRET_KEY=[生成したキー]
   JWT_SECRET_KEY=[生成したキー]
   PORT=5000
   ```

5. **デプロイ開始**
   - Railwayが自動的にビルドとデプロイを開始

### ステップ2: フロントエンドサービスのデプロイ

1. **同じプロジェクトに新しいサービスを追加**
   - "New" → "GitHub Repo"
   - 同じリポジトリを選択

2. **フロントエンドサービス設定**
   - サービス名: `poke-sup-frontend`
   - Settings → Root Directory: `frontend`
   - Settings → Build Command: `npm install && npm run build`
   - Settings → Start Command: `npm start`

3. **環境変数を設定**
   ```
   NEXT_PUBLIC_API_URL=https://[バックエンドのRailway URL]
   PORT=3000
   NODE_ENV=production
   ```
   *バックエンドのURLは、バックエンドサービスのSettings → Domainsで確認*

4. **デプロイ開始**

### ステップ3: データベース初期化

```bash
# Railway CLIをインストール
npm i -g @railway/cli

# ログイン
railway login

# プロジェクトに接続
railway link

# バックエンドサービスを選択
railway service

# データベース初期化
railway run python scripts/init_db.py
```

## 🔑 SECRET_KEY生成

```bash
python -c "import secrets; print(secrets.token_urlsafe(32))"
```

このコマンドを2回実行して、それぞれを`SECRET_KEY`と`JWT_SECRET_KEY`に設定してください。

## 🌐 公開URL

デプロイ後、各サービスのURLは以下で確認できます：

- バックエンド: `https://[サービス名].railway.app`
- フロントエンド: `https://[サービス名].railway.app`

## 📝 チェックリスト

- [x] `package-lock.json`を生成
- [x] Dockerfileを修正
- [ ] GitHubにコードをプッシュ
- [ ] Railwayでバックエンドサービスを作成
- [ ] PostgreSQLを追加
- [ ] 環境変数を設定
- [ ] フロントエンドサービスを作成
- [ ] データベースを初期化
- [ ] 動作確認

## 🎉 完了！

これでRailwayへの完全公開デプロイが可能です！

