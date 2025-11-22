# Railway エラー対応クイックガイド

## 🚨 "Application failed to respond" エラーが発生した場合

### 1. ログを確認（最重要）

**Railwayダッシュボード:**
1. Railwayダッシュボードにログイン
2. プロジェクト → サービスを選択
3. 最新のデプロイメントをクリック
4. 「Deploy Logs」タブでエラーを確認

**CLI:**
```bash
railway logs
```

### 2. よくある原因と解決方法

#### 原因1: ポート設定の問題

**確認:**
```python
# app.py で PORT 環境変数を使用しているか確認
port = int(os.environ.get('PORT', 5000))
socketio.run(app, host='0.0.0.0', port=port)
```

**解決:** Railwayが自動的に `PORT` 環境変数を設定するので、コードで使用していることを確認

#### 原因2: データベース接続エラー

**症状:**
```
psycopg2.OperationalError: Connection refused
connection to server at "localhost" (127.0.0.1), port 5432 failed
```

ログに `"database_configured": false` が表示される場合も、この問題を示しています。

**確認:**
- Railwayダッシュボード → Variables → `DATABASE_URL` が設定されているか
- PostgreSQLサービスが追加されているか
- PostgreSQLサービスが起動しているか

**解決:**

1. **PostgreSQLサービスを追加**
   - Railwayダッシュボード → プロジェクト
   - 「New」→ 「Database」→ 「Add PostgreSQL」
   - これにより、`DATABASE_URL`が自動的に設定されます

2. **環境変数を確認**
   - バックエンドサービス → Variables
   - `DATABASE_URL=${{Postgres.DATABASE_URL}}` が設定されているか確認
   - `Postgres` はPostgreSQLサービスの名前です（変更されている場合はその名前に置き換え）

3. **config.py の確認**
   ```python
   # config.py で postgres:// を postgresql:// に変換
   if database_url.startswith('postgres://'):
       database_url = database_url.replace('postgres://', 'postgresql://', 1)
   ```

詳細は以下を参照してください：
- [RAILWAY_DATABASE_QUICK_FIX.md](./RAILWAY_DATABASE_QUICK_FIX.md) - 3ステップのクイック修正
- [RAILWAY_DATABASE_SETUP.md](./RAILWAY_DATABASE_SETUP.md) - 詳細な設定ガイド

#### 原因3: 環境変数が設定されていない

**確認:**
Railwayダッシュボード → Variables で以下が設定されているか：
- `SECRET_KEY`
- `JWT_SECRET_KEY`
- `DATABASE_URL` (PostgreSQLサービスを追加すると自動設定)
- `FLASK_ENV=production`

#### 原因4: 起動コマンドのパスが正しくない

**症状:**
```
python: can't open file '/app/app.py': [Errno 2] No such file or directory
```

**確認:**
- `railway.toml` または Railway設定で `startCommand` が正しいか
- Dockerfileの `CMD` が正しいか
- ファイルの実際のパスを確認

**解決:**

**ルートのDockerfileを使用する場合:**
```toml
[deploy]
startCommand = "python backend/app.py"
```

**backend/Dockerfileを使用する場合（Root Directory: backend）:**
```toml
[deploy]
startCommand = "python app.py"
```

または、Railwayダッシュボードで：
1. サービス → Settings → Deploy
2. Start Command を確認・修正
3. 保存して再デプロイ

詳細は [RAILWAY_FIX_PATH.md](./RAILWAY_FIX_PATH.md) を参照してください。

### 3. 構造化ログでデバッグ

アプリケーションに構造化ログが実装されている場合、Railwayのログエクスプローラーで検索できます：

```
@level:error
@level:warn
"Application started"
"Database connection"
```

### 4. ヘルスチェックエンドポイント

アプリケーションが起動しているか確認：

```bash
curl https://your-app.railway.app/api/health
```

正常な応答:
```json
{
  "status": "ok",
  "database": "healthy",
  "service": "poke-sup-backend"
}
```

### 5. 再デプロイ

問題が解決しない場合：

1. Railwayダッシュボード → サービス → Settings → Redeploy
2. または、GitHubにプッシュして自動デプロイ

---

#### 原因5: 依存関係がインストールされていない

**症状:**
```
ModuleNotFoundError: No module named 'flask'
```

**確認:**
- Dockerfileで依存関係がインストールされているか
- マルチステージビルドで依存関係が最終ステージにコピーされているか

**解決:**
- ルートのDockerfileを使用する場合、最終ステージで依存関係を再インストール
- バックエンド専用サービスとしてデプロイする場合、`backend/Dockerfile`を使用

詳細は [RAILWAY_DEPENDENCIES_FIX.md](./RAILWAY_DEPENDENCIES_FIX.md) を参照してください。

## 📚 詳細なトラブルシューティング

- [RAILWAY_TROUBLESHOOTING.md](./RAILWAY_TROUBLESHOOTING.md) - 包括的なトラブルシューティングガイド
- [RAILWAY_FIX_PATH.md](./RAILWAY_FIX_PATH.md) - パス設定の問題と解決方法
- [RAILWAY_FRONTEND_SETUP.md](./RAILWAY_FRONTEND_SETUP.md) - フロントエンド（Next.js）の設定ガイド
- [RAILWAY_DEPENDENCIES_FIX.md](./RAILWAY_DEPENDENCIES_FIX.md) - 依存関係エラーの修正方法
- [RAILWAY_DATABASE_SETUP.md](./RAILWAY_DATABASE_SETUP.md) - データベース接続エラーの修正方法

---

## 🔗 参考リンク

- [Railway Logs Documentation](https://docs.railway.com/guides/logs)
- [Railway Common Errors](https://docs.railway.com/reference/errors)

