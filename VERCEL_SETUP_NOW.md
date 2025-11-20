# Vercelデプロイ設定 - 今すぐ実行

## 現在の状況
- ✅ コードは準備完了
- ✅ `frontend/package.json`にNext.js 14.0.4が含まれている
- ❌ VercelがRoot Directoryを認識していない

## 解決方法：Vercelダッシュボードで設定（5分で完了）

### ステップ1: Vercelダッシュボードにアクセス
1. ブラウザで https://vercel.com/dashboard を開く
2. ログイン（必要に応じて）
3. プロジェクト「poke-sup」をクリック

### ステップ2: Root Directoryを設定
1. 左側メニューから **Settings** をクリック
2. **General** タブを選択
3. 下にスクロールして **Root Directory** セクションを見つける
4. **Edit** ボタンをクリック
5. テキストフィールドに `frontend` と入力
6. **Save** をクリック

### ステップ3: 環境変数を設定
1. **Settings** → **Environment Variables** タブを選択
2. **Add New** をクリック
3. 以下を入力：
   - **Key**: `NEXT_PUBLIC_API_URL`
   - **Value**: `https://[RailwayバックエンドURL]`（例: `https://poke-sup-backend.railway.app`）
   - **Environment**: Production, Preview, Development すべてにチェック
4. **Save** をクリック

### ステップ4: 再デプロイ
1. 上部メニューから **Deployments** タブをクリック
2. 最新のデプロイメント（エラーになっているもの）をクリック
3. 右上の **⋯** メニューから **Redeploy** を選択
4. **Redeploy** をクリック

## 確認事項
設定後、以下を確認：
- [ ] Root Directoryが`frontend`に設定されている
- [ ] Framework Presetが「Next.js」になっている
- [ ] 環境変数`NEXT_PUBLIC_API_URL`が設定されている
- [ ] 再デプロイが成功している

## デプロイ成功後のURL
- 本番URL: `https://poke-sup-kensudogits-projects.vercel.app`
- または: `https://poke-sup.vercel.app`（カスタムドメイン設定時）

## トラブルシューティング
もし設定後もエラーが続く場合：
1. Vercelダッシュボードで **Settings** → **General** を確認
2. **Build & Development Settings** セクションを確認
3. **Framework Preset** が「Next.js」になっているか確認
4. **Build Command** が `npm run build` になっているか確認

