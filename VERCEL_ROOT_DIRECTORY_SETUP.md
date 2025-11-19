# Vercel Root Directory設定手順

## 問題
Vercelが`frontend/package.json`を見つけられず、「No Next.js version detected」エラーが発生しています。

## 解決方法

### ステップ1: Vercelダッシュボードにアクセス
1. [Vercel Dashboard](https://vercel.com/dashboard)にアクセス
2. プロジェクト「poke-sup」を選択

### ステップ2: Root Directoryを設定
1. **Settings** → **General** に移動
2. **Root Directory** セクションを見つける
3. **Edit** をクリック
4. **Root Directory** フィールドに以下を入力：
   ```
   frontend
   ```
5. **Save** をクリック

### ステップ3: 環境変数を設定
1. **Settings** → **Environment Variables** に移動
2. 以下の環境変数を追加：
   - **Key**: `NEXT_PUBLIC_API_URL`
   - **Value**: `https://[RailwayバックエンドURL]`
   - **Environment**: Production, Preview, Development すべてにチェック
3. **Save** をクリック

### ステップ4: 再デプロイ
1. **Deployments** タブに移動
2. 最新のデプロイメントを選択
3. **Redeploy** をクリック

または、CLIから：
```bash
cd C:\devlop\poke-sup
vercel --prod
```

## 確認事項
- [ ] Root Directoryが`frontend`に設定されている
- [ ] 環境変数`NEXT_PUBLIC_API_URL`が設定されている
- [ ] 再デプロイが成功している

