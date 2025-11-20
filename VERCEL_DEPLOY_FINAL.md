# Vercel完全公開デプロイ - 最終手順

## 問題
- Vercelが`frontend/package.json`を見つけられない
- Root Directoryの設定が必要

## 解決方法（2つの選択肢）

### 方法1: Vercelダッシュボードで設定（推奨・必須）

1. **Vercelダッシュボードにアクセス**
   - https://vercel.com/dashboard
   - プロジェクト「poke-sup」を選択

2. **Settings → General に移動**

3. **Root Directory を設定**
   - 「Root Directory」セクションを探す
   - 「Edit」をクリック
   - 値に `frontend` を入力
   - 「Save」をクリック

4. **Framework Preset を確認**
   - 「Next.js」に設定されていることを確認

5. **環境変数を設定**
   - Settings → Environment Variables
   - 追加: `NEXT_PUBLIC_API_URL` = `https://[RailwayバックエンドURL]`
   - Environment: Production, Preview, Development すべてにチェック

6. **再デプロイ**
   - Deployments タブ → 最新デプロイ → 「Redeploy」

### 方法2: GitHubから直接デプロイ

1. **コードをGitHubにプッシュ**
   ```bash
   cd C:\devlop\poke-sup
   git add .
   git commit -m "Vercelデプロイ準備"
   git push origin main
   ```

2. **Vercelダッシュボードで新規プロジェクト作成**
   - https://vercel.com/dashboard
   - 「Add New Project」をクリック
   - GitHubリポジトリ「poke-sup」を選択

3. **プロジェクト設定**
   - **Root Directory**: `frontend`
   - **Framework Preset**: Next.js（自動検出）
   - **Build Command**: `npm run build`（自動検出）
   - **Output Directory**: `.next`（自動検出）

4. **環境変数を設定**
   - `NEXT_PUBLIC_API_URL` = `https://[RailwayバックエンドURL]`

5. **Deploy** をクリック

## 現在の状態
- ✅ `frontend/package.json`にNext.js 14.0.4が含まれている
- ✅ ビルドはローカルで成功している
- ❌ VercelがRoot Directoryを認識していない

## 注意事項
Root Directoryを設定しない限り、Vercelはプロジェクトルートで`package.json`を探すため、エラーが続きます。

