# Vercelデプロイガイド

## 概要

このガイドでは、ポケさぽアプリケーションをVercelに完全公開モードでデプロイする手順を説明します。

## アーキテクチャ

- **フロントエンド**: Vercel（Next.js）
- **バックエンド**: Railway または Render（Flask + Socket.IO）
- **データベース**: Railway PostgreSQL または Supabase

## 前提条件

1. Vercelアカウント（[vercel.com](https://vercel.com)で無料登録）
2. GitHubアカウント（コードをプッシュ済み）
3. Railwayアカウント（バックエンド用、または別のサービス）

## デプロイ手順

### ステップ1: バックエンドをデプロイ（Railway推奨）

1. Railwayにログイン
2. 新しいプロジェクトを作成
3. GitHubリポジトリを接続
4. サービスを追加：
   - **PostgreSQL** を追加
   - **Backend** を追加（Dockerfileを使用）

5. 環境変数を設定：
   ```
   DATABASE_URL=<PostgreSQL接続URL>
   FLASK_ENV=production
   SECRET_KEY=<ランダムな文字列>
   JWT_SECRET_KEY=<ランダムな文字列>
   ```

6. デプロイ後、バックエンドのURLを確認（例: `https://poke-sup-backend.railway.app`）

### ステップ2: フロントエンドをVercelにデプロイ

#### 方法1: Vercel CLIを使用

```bash
# Vercel CLIをインストール
npm i -g vercel

# プロジェクトルートに移動
cd C:\devlop\poke-sup

# Vercelにログイン
vercel login

# デプロイ（初回は対話形式）
vercel

# 本番環境にデプロイ
vercel --prod
```

#### 方法2: Vercelダッシュボードを使用

1. [Vercel Dashboard](https://vercel.com/dashboard)にアクセス
2. **Add New Project** をクリック
3. GitHubリポジトリを選択
4. プロジェクト設定：
   - **Framework Preset**: Next.js
   - **Root Directory**: `frontend`
   - **Build Command**: `npm run build`
   - **Output Directory**: `.next`
   - **Install Command**: `npm install`

5. 環境変数を設定：
   ```
   NEXT_PUBLIC_API_URL=https://poke-sup-backend.railway.app
   ```

6. **Deploy** をクリック

### ステップ3: 環境変数の設定

Vercelダッシュボードで以下の環境変数を設定：

```
NEXT_PUBLIC_API_URL=https://<バックエンドのURL>
```

**設定方法**:
1. Vercelダッシュボードでプロジェクトを選択
2. **Settings** → **Environment Variables**
3. 変数を追加：
   - **Key**: `NEXT_PUBLIC_API_URL`
   - **Value**: バックエンドのURL（例: `https://poke-sup-backend.railway.app`）
   - **Environment**: Production, Preview, Development すべてにチェック

### ステップ4: CORS設定の確認

バックエンドの`config.py`でCORS設定を確認：

```python
CORS_ORIGINS = [
    "https://your-vercel-app.vercel.app",
    "https://your-custom-domain.com"
]
```

### ステップ5: カスタムドメインの設定（オプション）

1. Vercelダッシュボードでプロジェクトを選択
2. **Settings** → **Domains**
3. ドメインを追加
4. DNS設定を完了

## 本番環境の確認事項

### ✅ チェックリスト

- [ ] バックエンドが正常に動作している
- [ ] データベースが接続されている
- [ ] 環境変数が正しく設定されている
- [ ] CORS設定が正しい
- [ ] HTTPSが有効になっている
- [ ] フロントエンドからバックエンドAPIにアクセスできる
- [ ] 認証機能が動作している
- [ ] WebSocket接続が動作している（Socket.IO）

## トラブルシューティング

### 問題1: API接続エラー

**原因**: バックエンドURLが正しく設定されていない

**解決策**:
1. Vercelの環境変数を確認
2. バックエンドが正常に動作しているか確認
3. CORS設定を確認

### 問題2: WebSocket接続エラー

**原因**: VercelはWebSocketを直接サポートしていない

**解決策**:
- バックエンドをRailwayやRenderなどのWebSocket対応サービスにデプロイ
- または、Socket.IOのポーリングフォールバックを使用

### 問題3: ビルドエラー

**原因**: 依存関係や型エラー

**解決策**:
1. ローカルで`npm run build`を実行してエラーを確認
2. 型エラーを修正
3. 依存関係を更新

## デプロイ後の確認

1. **フロントエンドURL**: `https://your-app.vercel.app`
2. **バックエンドURL**: `https://your-backend.railway.app`
3. **APIヘルスチェック**: `https://your-backend.railway.app/api/health`

## セキュリティ設定

### 環境変数の管理

- 本番環境のシークレットはVercelの環境変数で管理
- `.env.local`ファイルはGitにコミットしない

### HTTPS

- Vercelは自動的にHTTPSを有効化
- カスタムドメインでもHTTPSが自動設定される

## 更新と再デプロイ

### 自動デプロイ

- GitHubにプッシュすると自動的にデプロイされる
- プルリクエストごとにプレビュー環境が作成される

### 手動デプロイ

```bash
vercel --prod
```

## サポート

問題が発生した場合：
1. Vercelのログを確認
2. バックエンドのログを確認
3. ブラウザのコンソールでエラーを確認

## 参考リンク

- [Vercel Documentation](https://vercel.com/docs)
- [Next.js Deployment](https://nextjs.org/docs/deployment)
- [Railway Documentation](https://docs.railway.app)


