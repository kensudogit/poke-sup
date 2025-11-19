# Vercelデプロイ - クイックスタート

## 🚀 5分でデプロイ完了！

### ステップ1: Vercel CLIをインストール

```bash
npm i -g vercel
```

### ステップ2: プロジェクトルートに移動

```bash
cd C:\devlop\poke-sup
```

### ステップ3: Vercelにログイン

```bash
vercel login
```

ブラウザが開き、Vercelアカウントでログインします。

### ステップ4: プロジェクトをリンク

```bash
vercel link
```

以下の質問に答えます：
- **Set up and deploy?** → `Y`
- **Which scope?** → あなたのアカウントを選択
- **Link to existing project?** → `N`（新規プロジェクトの場合）
- **Project name?** → `poke-sup`（または任意の名前）
- **Directory?** → `frontend`（重要！）

### ステップ5: 環境変数を設定

```bash
vercel env add NEXT_PUBLIC_API_URL production
```

バックエンドのURLを入力（例: `https://poke-sup-backend.railway.app`）

### ステップ6: デプロイ

```bash
vercel --prod
```

## 📝 重要: バックエンドの準備

Vercelにデプロイする前に、バックエンドを別のサービス（Railway推奨）にデプロイしておく必要があります。

### Railwayでバックエンドをデプロイ

1. [Railway](https://railway.app)にログイン
2. 新しいプロジェクトを作成
3. PostgreSQLサービスを追加
4. Backendサービスを追加（Dockerfileを使用）
5. 環境変数を設定：
   - `DATABASE_URL`（PostgreSQLから自動生成）
   - `FLASK_ENV=production`
   - `SECRET_KEY`（ランダムな文字列）
   - `JWT_SECRET_KEY`（ランダムな文字列）
6. デプロイ後、バックエンドのURLをコピー

### Vercelで環境変数を設定

Vercelダッシュボードで：
1. プロジェクトを選択
2. **Settings** → **Environment Variables**
3. 追加：
   - **Key**: `NEXT_PUBLIC_API_URL`
   - **Value**: RailwayのバックエンドURL
   - **Environment**: Production, Preview, Development すべて

## ✅ デプロイ確認

デプロイが完了すると、以下のようなURLが表示されます：
```
https://poke-sup-xxxxx.vercel.app
```

このURLにアクセスして、アプリケーションが正常に動作することを確認してください。

## 🔄 自動デプロイの設定

GitHubリポジトリと連携すると、プッシュするたびに自動的にデプロイされます：

1. Vercelダッシュボードでプロジェクトを選択
2. **Settings** → **Git**
3. GitHubリポジトリを接続
4. 自動デプロイが有効になります

## 🆘 トラブルシューティング

### ビルドエラー

```bash
cd frontend
npm run build
```

ローカルでビルドしてエラーを確認してください。

### API接続エラー

環境変数`NEXT_PUBLIC_API_URL`が正しく設定されているか確認してください。

### CORSエラー

バックエンドの`config.py`でCORS設定を確認：
```python
CORS_ORIGINS = [
    "https://your-vercel-app.vercel.app"
]
```

## 📚 詳細な手順

詳細は`VERCEL_DEPLOY.md`を参照してください。


