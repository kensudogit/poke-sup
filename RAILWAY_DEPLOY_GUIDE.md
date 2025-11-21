# Railway完全公開デプロイガイド

## 📋 デプロイ手順

### 方法1: バックエンドとフロントエンドを別々のサービスとしてデプロイ（推奨）

#### ステップ1: バックエンドのデプロイ

1. **Railwayで新しいプロジェクトを作成**
   - Railwayダッシュボードにログイン
   - "New Project" をクリック
   - "Deploy from GitHub repo" を選択

2. **リポジトリを接続**
   - GitHubリポジトリを選択
   - ブランチを選択（通常は `main` または `master`）

3. **サービス設定**
   - サービス名: `poke-sup-backend`
   - Root Directory: `backend`
   - Dockerfile Path: `Dockerfile`（または空欄）

4. **環境変数を設定**
   ```
   DATABASE_URL=${{Postgres.DATABASE_URL}}
   FLASK_ENV=production
   SECRET_KEY=[ランダムな32文字以上の文字列]
   JWT_SECRET_KEY=[ランダムな32文字以上の文字列]
   PORT=5000
   ```

5. **PostgreSQLサービスを追加**
   - "New" → "Database" → "Add PostgreSQL"
   - 自動的に `DATABASE_URL` が設定されます

6. **デプロイを開始**
   - Railwayが自動的にビルドとデプロイを開始します

#### ステップ2: フロントエンドのデプロイ

1. **同じプロジェクトに新しいサービスを追加**
   - プロジェクト内で "New" → "GitHub Repo" を選択
   - 同じリポジトリを選択

2. **サービス設定**
   - サービス名: `poke-sup-frontend`
   - **Root Directory: `frontend`** ⚠️ **重要: これを設定しないとNext.jsが検出されません**
   - Build Command: `npm install && npm run build`（自動検出される場合が多い）
   - Start Command: `npm start`（自動検出される場合が多い）

   **注意**: Root Directoryを`frontend`に設定することで、Railwayは`frontend/package.json`を正しく認識します。
   
   エラー「No Next.js version detected」が発生する場合は、[RAILWAY_FRONTEND_SETUP.md](./RAILWAY_FRONTEND_SETUP.md)を参照してください。

3. **環境変数を設定**
   ```
   NEXT_PUBLIC_API_URL=https://[バックエンドのRailway URL]
   PORT=3000
   NODE_ENV=production
   ```

4. **デプロイを開始**

#### ステップ3: カスタムドメインの設定（オプション）

1. **バックエンドのカスタムドメイン**
   - バックエンドサービス → Settings → Domains
   - カスタムドメインを追加

2. **フロントエンドのカスタムドメイン**
   - フロントエンドサービス → Settings → Domains
   - カスタムドメインを追加

3. **環境変数を更新**
   - フロントエンドの `NEXT_PUBLIC_API_URL` をバックエンドのカスタムドメインに更新

### 方法2: 単一サービスでデプロイ（シンプル）

1. **Railwayで新しいプロジェクトを作成**
   - "New Project" → "Deploy from GitHub repo"

2. **サービス設定**
   - Root Directory: 空欄（プロジェクトルート）
   - Dockerfile Path: `Dockerfile`

3. **環境変数を設定**
   ```
   DATABASE_URL=${{Postgres.DATABASE_URL}}
   FLASK_ENV=production
   SECRET_KEY=[ランダムな32文字以上の文字列]
   JWT_SECRET_KEY=[ランダムな32文字以上の文字列]
   NEXT_PUBLIC_API_URL=https://[このサービスのURL]
   PORT=5000
   ```

4. **PostgreSQLサービスを追加**

5. **デプロイを開始**

## 🔐 環境変数の生成

### SECRET_KEYとJWT_SECRET_KEYの生成

```bash
# Pythonで生成
python -c "import secrets; print(secrets.token_urlsafe(32))"

# OpenSSLで生成
openssl rand -hex 32
```

## 📊 データベースの初期化

デプロイ後、データベースを初期化する必要があります：

1. **Railway CLIをインストール**
   ```bash
   npm i -g @railway/cli
   ```

2. **ログイン**
   ```bash
   railway login
   ```

3. **プロジェクトに接続**
   ```bash
   railway link
   ```

4. **データベースを初期化**
   ```bash
   railway run python backend/scripts/init_db.py
   ```

## 🔧 トラブルシューティング

### ビルドエラー

- **requirements.txtが見つからない**
  - Root Directoryが正しく設定されているか確認
  - `backend/Dockerfile`を使用する場合は、Root Directoryを`backend`に設定

- **npm installエラー**
  - Node.jsのバージョンを確認
  - `package.json`の依存関係を確認

### ランタイムエラー

- **データベース接続エラー**
  - `DATABASE_URL`が正しく設定されているか確認
  - PostgreSQLサービスが起動しているか確認

- **API接続エラー**
  - `NEXT_PUBLIC_API_URL`が正しく設定されているか確認
  - CORS設定を確認

### ログの確認

```bash
# Railway CLIでログを確認
railway logs

# 特定のサービスのログ
railway logs --service poke-sup-backend
```

## 📝 チェックリスト

- [ ] GitHubリポジトリにコードをプッシュ
- [ ] Railwayでプロジェクトを作成
- [ ] バックエンドサービスを設定
- [ ] フロントエンドサービスを設定（別サービス方式の場合）
- [ ] PostgreSQLサービスを追加
- [ ] 環境変数を設定
- [ ] デプロイを開始
- [ ] データベースを初期化
- [ ] 動作確認
- [ ] カスタムドメインを設定（オプション）

## 🌐 公開URLの確認

デプロイ後、Railwayダッシュボードで各サービスのURLを確認できます：

- バックエンド: `https://[サービス名].railway.app`
- フロントエンド: `https://[サービス名].railway.app`

## 🔄 更新のデプロイ

コードを更新した場合：

1. GitHubにプッシュ
2. Railwayが自動的に再デプロイを開始
3. デプロイ完了を待つ

## 📞 サポート

問題が発生した場合：
1. Railwayのログを確認
2. ブラウザのコンソールでエラーを確認
3. ネットワークタブでAPIリクエストを確認


