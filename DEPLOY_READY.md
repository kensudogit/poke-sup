# 🚀 Railwayデプロイ準備完了

## ✅ 準備完了項目

### 1. 設定ファイル
- ✅ `railway.toml` - Railway設定ファイル
- ✅ `railway.json` - 代替設定ファイル
- ✅ `Dockerfile` - 統合Dockerfile
- ✅ `.railwayignore` - 除外ファイル設定
- ✅ `backend/Dockerfile` - バックエンド用Dockerfile
- ✅ `railway-backend.toml` - バックエンド用設定
- ✅ `railway-frontend.toml` - フロントエンド用設定

### 2. コード修正
- ✅ `backend/config.py` - RailwayのPostgreSQL URL対応
- ✅ `backend/app.py` - ポート設定の改善
- ✅ `frontend/next.config.js` - 本番環境設定

### 3. ドキュメント
- ✅ `RAILWAY_DEPLOY_GUIDE.md` - 詳細なデプロイガイド

## 🎯 デプロイ手順（簡易版）

### ステップ1: GitHubにプッシュ

```bash
git add .
git commit -m "Railwayデプロイ準備完了"
git push origin main
```

### ステップ2: Railwayでプロジェクト作成

1. https://railway.app にアクセス
2. "New Project" → "Deploy from GitHub repo"
3. リポジトリを選択

### ステップ3: バックエンドサービス設定

1. サービス名: `poke-sup-backend`
2. Settings → Root Directory: `backend`
3. Settings → Dockerfile Path: `Dockerfile`（または空欄）

### ステップ4: 環境変数設定

**バックエンドサービス:**
```
DATABASE_URL=${{Postgres.DATABASE_URL}}
FLASK_ENV=production
SECRET_KEY=[生成した32文字以上の文字列]
JWT_SECRET_KEY=[生成した32文字以上の文字列]
PORT=5000
```

**SECRET_KEY生成コマンド:**
```bash
python -c "import secrets; print(secrets.token_urlsafe(32))"
```

### ステップ5: PostgreSQL追加

1. "New" → "Database" → "Add PostgreSQL"
2. 自動的に`DATABASE_URL`が設定されます

### ステップ6: フロントエンドサービス追加（別サービス方式）

1. 同じプロジェクトで "New" → "GitHub Repo"
2. 同じリポジトリを選択
3. サービス名: `poke-sup-frontend`
4. Settings → Root Directory: `frontend`
5. Settings → Build Command: `npm install && npm run build`
6. Settings → Start Command: `npm start`

**環境変数:**
```
NEXT_PUBLIC_API_URL=https://[バックエンドのRailway URL]
PORT=3000
NODE_ENV=production
```

### ステップ7: データベース初期化

```bash
# Railway CLIをインストール
npm i -g @railway/cli

# ログイン
railway login

# プロジェクトに接続
railway link

# データベース初期化
railway run python backend/scripts/init_db.py
```

## 🔗 公開URL

デプロイ後、以下のURLでアクセス可能：

- バックエンド: `https://[サービス名].railway.app`
- フロントエンド: `https://[サービス名].railway.app`

## 📝 チェックリスト

- [ ] GitHubにコードをプッシュ
- [ ] Railwayでプロジェクト作成
- [ ] バックエンドサービス設定
- [ ] 環境変数設定（SECRET_KEY生成済み）
- [ ] PostgreSQL追加
- [ ] フロントエンドサービス追加（別サービス方式の場合）
- [ ] デプロイ開始
- [ ] データベース初期化
- [ ] 動作確認

## 🎉 完了！

これでRailwayへの完全公開デプロイの準備が完了しました！

詳細な手順は `RAILWAY_DEPLOY_GUIDE.md` を参照してください。


