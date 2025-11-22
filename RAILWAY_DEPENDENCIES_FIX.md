# Railway 依存関係エラー修正

## ❌ エラー

```
ModuleNotFoundError: No module named 'flask'
```

## 🔍 原因

ルートのDockerfile（統合Dockerfile）を使用する場合、バックエンドの依存関係が最終ステージに正しくコピーされていませんでした。

マルチステージビルドでは、ビルドステージでインストールされたPythonパッケージは、明示的にコピーしない限り最終ステージには含まれません。

## ✅ 解決方法

### 方法1: Dockerfileを修正（推奨）

ルートの`Dockerfile`を修正して、最終ステージで依存関係を再インストールするようにしました。

```dockerfile
# ステージ3: 本番環境
FROM python:3.11-slim

WORKDIR /app

# バックエンドの依存関係をインストール
COPY backend/requirements.txt /app/backend/requirements.txt
RUN pip install --no-cache-dir -r /app/backend/requirements.txt

# バックエンドのコードをコピー
COPY --from=backend /app/backend /app/backend
```

### 方法2: バックエンド専用サービスとしてデプロイ（推奨）

バックエンドとフロントエンドを別々のサービスとしてデプロイする場合：

1. **Railwayでバックエンドサービスを作成**
   - Root Directory: `backend`
   - Dockerfile Path: `Dockerfile`（または空欄）
   - `backend/Dockerfile`を使用（既に正しく設定済み）

2. **railway-backend.toml を使用**
   - このファイルは既に正しく設定されています

3. **環境変数を設定**
   ```
   DATABASE_URL=${{Postgres.DATABASE_URL}}
   FLASK_ENV=production
   SECRET_KEY=<your-secret-key>
   JWT_SECRET_KEY=<your-jwt-secret-key>
   PORT=5000
   ```

## 🔍 確認方法

デプロイ後、以下のログが表示されるはずです：

```
Collecting flask==3.0.0
...
Successfully installed flask-3.0.0 ...
```

エラーが解消され、アプリケーションが正常に起動するはずです。

## 📋 チェックリスト

- [ ] Dockerfileが修正されている
- [ ] 依存関係がインストールされている（ビルドログで確認）
- [ ] アプリケーションが正常に起動している
- [ ] エラーログがない

## 🚀 次のステップ

1. 変更をコミット・プッシュ
2. Railwayが自動的に再デプロイ
3. ビルドログで依存関係のインストールを確認
4. デプロイログでアプリケーションの起動を確認

---

*この修正により、Flaskを含むすべての依存関係が正しくインストールされ、アプリケーションが正常に起動するはずです。*

