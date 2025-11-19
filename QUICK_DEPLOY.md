# 🚀 Railwayクイックデプロイ

## 5分でデプロイ完了！

### ステップ1: GitHubにプッシュ（既にプッシュ済みの場合はスキップ）

```bash
git add .
git commit -m "Railwayデプロイ準備"
git push origin main
```

### ステップ2: Railwayでデプロイ

1. **https://railway.app にアクセスしてログイン**

2. **新しいプロジェクトを作成**
   - "New Project" をクリック
   - "Deploy from GitHub repo" を選択
   - リポジトリを選択

3. **バックエンドサービスを設定**
   - サービス名: `poke-sup-backend`
   - Settings → Root Directory: `backend`
   - Settings → Dockerfile Path: `Dockerfile`（または空欄）

4. **PostgreSQLを追加**
   - "New" → "Database" → "Add PostgreSQL"
   - 自動的に `DATABASE_URL` が設定されます

5. **環境変数を設定**
   - Settings → Variables で以下を追加：

   ```
   FLASK_ENV=production
   SECRET_KEY=[下記コマンドで生成]
   JWT_SECRET_KEY=[下記コマンドで生成]
   PORT=5000
   ```

   **SECRET_KEY生成:**
   ```bash
   python -c "import secrets; print(secrets.token_urlsafe(32))"
   ```
   このコマンドを2回実行して、それぞれを `SECRET_KEY` と `JWT_SECRET_KEY` に設定

6. **フロントエンドサービスを追加**
   - 同じプロジェクトで "New" → "GitHub Repo"
   - 同じリポジトリを選択
   - サービス名: `poke-sup-frontend`
   - Settings → Root Directory: `frontend`
   - Settings → Build Command: `npm install && npm run build`
   - Settings → Start Command: `npm start`

7. **フロントエンドの環境変数を設定**
   ```
   NEXT_PUBLIC_API_URL=https://[バックエンドのRailway URL]
   PORT=3000
   NODE_ENV=production
   ```
   *バックエンドのURLは、バックエンドサービスのSettings → Domainsで確認*

8. **デプロイ完了を待つ**
   - 各サービスの "Deployments" タブで進行状況を確認

### ステップ3: データベース初期化

```bash
# Railway CLIをインストール（初回のみ）
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

### ステップ4: 動作確認

- フロントエンドのURLにアクセス
- テストアカウントでログイン:
  - メール: `patient@example.com`
  - パスワード: `password123`

## ✅ 完了！

これで完全公開モードでデプロイ完了です！

## 🔗 公開URL

- バックエンド: `https://[サービス名].railway.app`
- フロントエンド: `https://[サービス名].railway.app`

## 📝 トラブルシューティング

### ビルドエラー
- Root Directoryが正しく設定されているか確認
- ログを確認してエラー内容を確認

### データベース接続エラー
- `DATABASE_URL`が正しく設定されているか確認
- PostgreSQLサービスが起動しているか確認

### API接続エラー
- `NEXT_PUBLIC_API_URL`が正しいか確認
- バックエンドのURLが正しいか確認


