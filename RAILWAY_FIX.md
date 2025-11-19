# Railwayデプロイエラー修正

## 🔧 修正内容

### 問題
`npm ci`コマンドが`package-lock.json`が見つからないため失敗していました。

### 解決方法

#### 方法1: package-lock.jsonを生成（推奨）

```bash
cd frontend
npm install
```

これで`package-lock.json`が生成されます。Gitにコミットしてください。

#### 方法2: Dockerfileを修正

`Dockerfile`を修正して、`package-lock.json`が存在する場合は`npm ci`、存在しない場合は`npm install`を使用するようにしました。

#### 方法3: バックエンドとフロントエンドを別々にデプロイ（最も推奨）

**バックエンドサービス:**
- Root Directory: `backend`
- Dockerfile Path: `Dockerfile`
- または `Dockerfile.simple` を使用

**フロントエンドサービス:**
- Root Directory: `frontend`
- Build Command: `npm install && npm run build`
- Start Command: `npm start`

## 📝 推奨デプロイ方法

### バックエンドとフロントエンドを別サービスとしてデプロイ

1. **バックエンドサービス**
   - Settings → Root Directory: `backend`
   - Settings → Dockerfile Path: `Dockerfile`（または空欄）
   - 環境変数:
     ```
     DATABASE_URL=${{Postgres.DATABASE_URL}}
     FLASK_ENV=production
     SECRET_KEY=[生成したキー]
     JWT_SECRET_KEY=[生成したキー]
     PORT=5000
     ```

2. **フロントエンドサービス**
   - Settings → Root Directory: `frontend`
   - Settings → Build Command: `npm install && npm run build`
   - Settings → Start Command: `npm start`
   - 環境変数:
     ```
     NEXT_PUBLIC_API_URL=https://[バックエンドのURL]
     PORT=3000
     NODE_ENV=production
     ```

この方法が最もシンプルで、トラブルが少ないです。

## ✅ 次のステップ

1. `package-lock.json`をGitにコミット
2. Railwayで再デプロイ
3. または、バックエンドとフロントエンドを別サービスとして設定

