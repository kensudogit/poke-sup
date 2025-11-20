# Vercelデプロイ - クイック修正

## 現在の問題
Vercelが`frontend/package.json`を見つけられません。

## 解決方法（2分で完了）

### ステップ1: Vercelダッシュボードを開く
https://vercel.com/dashboard → プロジェクト「poke-sup」を選択

### ステップ2: Root Directoryを設定
1. **Settings** → **General**
2. **Root Directory** セクションで **Edit**
3. 値に `frontend` を入力
4. **Save**

### ステップ3: 環境変数を設定
1. **Settings** → **Environment Variables**
2. **Add New**
3. Key: `NEXT_PUBLIC_API_URL`
4. Value: `https://[RailwayバックエンドURL]`
5. Environment: すべてにチェック
6. **Save**

### ステップ4: 再デプロイ
1. **Deployments** タブ
2. 最新デプロイ → **⋯** → **Redeploy**

## 完了！

設定後、デプロイが自動的に成功します。

