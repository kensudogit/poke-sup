# Vercel Root Directory設定 - 必須手順

## 問題
Vercelが`frontend/package.json`を見つけられず、「No Next.js version detected」エラーが発生しています。

## 解決方法：Vercelダッシュボードで設定

### 手順（5分で完了）

1. **Vercelダッシュボードを開く**
   - https://vercel.com/dashboard
   - プロジェクト「poke-sup」を選択

2. **Settings → General に移動**
   - 左側メニューから「Settings」をクリック
   - 「General」タブを選択

3. **Root Directory を設定**
   - ページを下にスクロール
   - 「Root Directory」セクションを見つける
   - 「Edit」ボタンをクリック
   - テキストフィールドに `frontend` と入力
   - 「Save」をクリック

4. **環境変数を設定**
   - 「Settings」→「Environment Variables」タブ
   - 「Add New」をクリック
   - 以下を入力：
     - Key: `NEXT_PUBLIC_API_URL`
     - Value: `https://[RailwayバックエンドURL]`
     - Environment: Production, Preview, Development すべてにチェック
   - 「Save」をクリック

5. **再デプロイ**
   - 「Deployments」タブをクリック
   - 最新のデプロイメントを選択
   - 「⋯」メニューから「Redeploy」を選択
   - 「Redeploy」をクリック

## 設定後の確認

設定が正しく反映されているか確認：
- Root Directory: `frontend`
- Framework Preset: `Next.js`
- Build Command: `npm run build`（自動検出）
- Output Directory: `.next`（自動検出）

## デプロイ成功後のURL

- 本番URL: `https://poke-sup-kensudogits-projects.vercel.app`
- または: `https://poke-sup.vercel.app`

## 重要

**Root Directoryを設定しない限り、Vercelはプロジェクトルートで`package.json`を探すため、エラーが続きます。**

CLIからはRoot Directoryを設定できないため、Vercelダッシュボードでの設定が必須です。

