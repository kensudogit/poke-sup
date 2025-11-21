# Railway フロントエンド設定ガイド

## ❌ エラー

```
No Next.js version detected. Make sure your package.json has "next" in either "dependencies" or "devDependencies". Also check your Root Directory setting matches the directory of your package.json file.
```

## 🔍 原因

このエラーは、Railwayが`package.json`を見つけられない、またはRoot Directoryの設定が正しくない場合に発生します。

## ✅ 解決方法

### 方法1: RailwayダッシュボードでRoot Directoryを設定（推奨）

1. **Railwayダッシュボードにログイン**
   - プロジェクトを選択
   - フロントエンドサービスを選択（または新規作成）

2. **Settings → Deploy を開く**
   - **Root Directory** を `frontend` に設定
   - これにより、Railwayは `frontend/package.json` を正しく認識します

3. **Build Settings を確認**
   - Build Command: `npm install && npm run build`（自動検出される場合が多い）
   - Start Command: `npm start`（自動検出される場合が多い）

4. **保存して再デプロイ**

### 方法2: railway-frontend.tomlを使用

`railway-frontend.toml` ファイルを使用する場合：

1. **Railwayダッシュボードで設定**
   - Settings → Deploy
   - Root Directory: `frontend`
   - Config File: `railway-frontend.toml`（または空欄で自動検出）

2. **railway-frontend.toml の内容**
   ```toml
   [build]
   builder = "NIXPACKS"
   
   [deploy]
   restartPolicyType = "ON_FAILURE"
   restartPolicyMaxRetries = 10
   ```

   **注意**: Root Directoryが`frontend`に設定されている場合、`buildCommand`と`startCommand`は不要です（自動検出されます）。

### 方法3: Dockerfileを使用

Dockerfileを使用する場合：

1. **frontend/Dockerfile を確認**
   ```dockerfile
   FROM node:18-alpine
   
   WORKDIR /app
   
   COPY package*.json ./
   RUN npm install
   
   COPY . .
   
   RUN npm run build
   
   EXPOSE 3000
   
   CMD ["npm", "start"]
   ```

2. **Railway設定**
   - Root Directory: `frontend`
   - Dockerfile Path: `Dockerfile`
   - Build Command: （空欄、Dockerfileを使用）
   - Start Command: （空欄、DockerfileのCMDを使用）

## 📋 確認事項

### package.jsonの確認

`frontend/package.json` に以下が含まれているか確認：

```json
{
  "dependencies": {
    "next": "14.0.4",
    ...
  }
}
```

✅ 現在の`package.json`には`next: "14.0.4"`が含まれています。

### Root Directoryの確認

Railwayダッシュボードで：
- Settings → Deploy → Root Directory が `frontend` に設定されているか確認

### ファイル構造の確認

プロジェクトの構造：
```
poke-sup/
├── frontend/
│   ├── package.json  ← ここにNext.jsが含まれている
│   ├── next.config.js
│   └── ...
├── backend/
└── railway-frontend.toml
```

## 🚀 デプロイ手順

### ステップ1: Railwayでサービスを作成

1. Railwayダッシュボード → プロジェクト
2. "New" → "GitHub Repo" を選択
3. リポジトリを選択

### ステップ2: Root Directoryを設定

1. サービス → Settings → Deploy
2. **Root Directory**: `frontend` に設定
3. 保存

### ステップ3: 環境変数を設定

```
NEXT_PUBLIC_API_URL=https://your-backend.railway.app
PORT=3000
NODE_ENV=production
```

### ステップ4: デプロイ

1. 変更を保存
2. Railwayが自動的にビルドとデプロイを開始
3. ログを確認

## 🔍 トラブルシューティング

### エラーが続く場合

1. **Root Directoryを再確認**
   - Settings → Deploy → Root Directory が `frontend` になっているか

2. **package.jsonの場所を確認**
   - `frontend/package.json` が存在するか
   - `next` が `dependencies` に含まれているか

3. **ビルドログを確認**
   ```bash
   railway logs
   ```
   または、Railwayダッシュボード → デプロイメント → Build Logs

4. **手動でビルドコマンドを指定**
   - Settings → Deploy → Build Command: `npm install && npm run build`
   - Settings → Deploy → Start Command: `npm start`

### よくある間違い

❌ **Root Directoryが空欄またはルート（`.`）**
- Railwayは`package.json`を`./package.json`で探す
- 実際のファイルは`./frontend/package.json`にある

✅ **Root Directoryが`frontend`**
- Railwayは`package.json`を`./frontend/package.json`で探す
- 正しく認識される

## 📚 参考

- [Railway Deploy Documentation](https://docs.railway.com/guides/deployments)
- [Next.js on Railway](https://docs.railway.com/guides/nextjs)

---

*この設定により、Next.jsが正しく検出され、デプロイが成功するはずです。*

