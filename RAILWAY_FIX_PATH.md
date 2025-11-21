# Railway パス設定の修正

## 🔧 問題

ログに以下のエラーが表示される：
```
python: can't open file '/app/app.py': [Errno 2] No such file or directory
```

## 📋 原因

Railwayの設定ファイル（`railway.toml`）で、起動コマンドが `python app.py` となっているが、実際のファイルパスは `/app/backend/app.py` です。

## ✅ 解決方法

### 方法1: railway.tomlを修正（推奨）

`railway.toml` の `startCommand` を修正：

```toml
[deploy]
startCommand = "python backend/app.py"
```

### 方法2: Railwayダッシュボードで設定

1. Railwayダッシュボードにログイン
2. プロジェクト → サービスを選択
3. Settings → Deploy を開く
4. Start Command を `python backend/app.py` に変更
5. 保存して再デプロイ

### 方法3: バックエンド専用サービスとしてデプロイ（推奨）

バックエンドとフロントエンドを別々のサービスとしてデプロイする場合：

1. **Railwayで新しいサービスを作成**
   - Root Directory: `backend`
   - Dockerfile Path: `Dockerfile`（または空欄）

2. **railway-backend.toml を使用**
   - このファイルは既に正しく設定されています
   - `startCommand = "python app.py"` は、`backend/Dockerfile` の `WORKDIR /app` に対して正しいです

3. **環境変数を設定**
   ```
   DATABASE_URL=${{Postgres.DATABASE_URL}}
   FLASK_ENV=production
   SECRET_KEY=<your-secret-key>
   JWT_SECRET_KEY=<your-jwt-secret-key>
   PORT=5000
   ```

## 🔍 確認方法

デプロイ後、以下のコマンドで確認：

```bash
railway logs
```

正常な起動ログが表示されるはずです：
```
{"level":"info","message":"Application starting","port":5000,"environment":"production"}
{"level":"info","message":"Database tables created/verified"}
{"level":"info","message":"Starting server","host":"0.0.0.0","port":5000}
```

## 📝 ファイル構造の確認

### ルートのDockerfileを使用する場合

```
/app/
  └── backend/
      └── app.py  ← ここにある
```

起動コマンド: `python backend/app.py`

### backend/Dockerfileを使用する場合

```
/app/
  └── app.py  ← ここにある（WORKDIR /app）
```

起動コマンド: `python app.py`

## 🚀 次のステップ

1. `railway.toml` を修正（またはRailwayダッシュボードで設定）
2. 変更をコミット・プッシュ
3. Railwayが自動的に再デプロイ
4. ログを確認して正常に起動しているか確認

---

*この修正により、アプリケーションが正常に起動するはずです。*

