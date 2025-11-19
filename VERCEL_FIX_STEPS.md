# Vercelデプロイエラー修正手順

## 現在のエラー
「No Next.js version detected」- Vercelが`frontend/package.json`を見つけられません

## 解決方法（必須）

### VercelダッシュボードでRoot Directoryを設定

1. **Vercelダッシュボードにアクセス**
   - https://vercel.com/dashboard
   - プロジェクト「poke-sup」を選択

2. **Settings → General に移動**

3. **Root Directory を設定**
   - 「Root Directory」セクションを探す
   - 「Edit」をクリック
   - 値に `frontend` を入力
   - 「Save」をクリック

4. **環境変数を設定**
   - Settings → Environment Variables
   - 追加: `NEXT_PUBLIC_API_URL` = `https://[RailwayバックエンドURL]`
   - Environment: Production, Preview, Development すべてにチェック

5. **再デプロイ**
   - Deployments タブ → 最新デプロイ → 「Redeploy」

## 現在の状態
- ✅ `vercel.json`を削除（自動検出に任せる）
- ✅ `frontend/package.json`にNext.js 14.0.4が含まれている
- ❌ Root Directoryが設定されていない（ダッシュボードで設定が必要）

## 注意
Root Directoryを設定しない限り、Vercelはプロジェクトルートで`package.json`を探すため、エラーが続きます。

