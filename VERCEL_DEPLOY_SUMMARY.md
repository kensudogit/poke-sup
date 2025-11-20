# Vercelデプロイ - 最終まとめ

## 現在の状況

### ✅ 完了していること
- `frontend/package.json`にNext.js 14.0.4が含まれている
- `vercel.json`でfrontendディレクトリを参照する設定済み
- ローカルビルドは成功している
- プロジェクト「poke-sup」はVercelにリンク済み

### ❌ 問題点
- VercelがRoot Directoryを認識していない
- 「No Next.js version detected」エラーが発生

## 解決方法（必須）

### Vercelダッシュボードで設定

**重要**: Vercel CLIからはRoot Directoryを設定できません。Vercelダッシュボードでの設定が必須です。

#### 手順

1. **Vercelダッシュボードにアクセス**
   ```
   https://vercel.com/dashboard
   ```
   → プロジェクト「poke-sup」を選択

2. **Root Directoryを設定**
   - Settings → General
   - Root Directory セクション → Edit
   - 値: `frontend`
   - Save

3. **環境変数を設定**
   - Settings → Environment Variables
   - Add New
   - Key: `NEXT_PUBLIC_API_URL`
   - Value: `https://[RailwayバックエンドURL]`
   - Environment: Production, Preview, Development すべて
   - Save

4. **再デプロイ**
   - Deployments タブ
   - 最新デプロイ → ⋯ → Redeploy

## 設定後の確認

設定が完了したら、以下を確認：
- Root Directory: `frontend` ✅
- Framework Preset: `Next.js` ✅
- 環境変数: 設定済み ✅

## デプロイ成功後のURL

- 本番URL: `https://poke-sup-kensudogits-projects.vercel.app`
- または: `https://poke-sup.vercel.app`

## 注意事項

Root Directoryを設定しない限り、Vercelはプロジェクトルートで`package.json`を探すため、エラーが続きます。

設定後、自動的に再デプロイが開始され、成功します。

