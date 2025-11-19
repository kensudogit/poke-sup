# Vercelデプロイ設定手順

## 問題
Vercelが`package.json`を見つけられず、「No Next.js version detected」エラーが発生しています。

## 解決方法：Vercelダッシュボードで設定

### ステップ1: プロジェクト設定を開く

1. [Vercel Dashboard](https://vercel.com/dashboard)にアクセス
2. プロジェクト「poke-sup」または「frontend」を選択
3. **Settings** → **General** に移動

### ステップ2: Root Directoryを設定

**Root Directory** フィールドに以下を入力：
```
frontend
```

### ステップ3: その他の設定を確認

以下の設定が自動検出されることを確認：
- **Framework Preset**: Next.js
- **Build Command**: `npm run build`（自動検出）
- **Output Directory**: `.next`（自動検出）
- **Install Command**: `npm install`（自動検出）

### ステップ4: 環境変数を設定

**Settings** → **Environment Variables** で以下を追加：

- **Key**: `NEXT_PUBLIC_API_URL`
- **Value**: `https://[RailwayバックエンドURL]`
- **Environment**: Production, Preview, Development すべてにチェック

### ステップ5: 再デプロイ

設定を保存後、**Deployments** タブで **Redeploy** をクリックするか、以下のコマンドを実行：

```bash
cd C:\devlop\poke-sup
vercel --prod
```

## 現在の設定ファイル

- `vercel.json`: プロジェクトルートに配置済み
- `frontend/package.json`: Next.js 14.0.4が含まれています
- `frontend/next.config.js`: Next.js設定ファイル

## 注意事項

- Root Directoryを設定しないと、Vercelはプロジェクトルートで`package.json`を探します
- `frontend`ディレクトリに`package.json`があるため、Root Directoryを`frontend`に設定する必要があります

