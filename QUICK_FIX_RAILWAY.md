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

**確認:**
- Railwayダッシュボード → Variables → `DATABASE_URL` が設定されているか
- PostgreSQLサービスが起動しているか

**解決:**
```python
# config.py で postgres:// を postgresql:// に変換
if database_url.startswith('postgres://'):
    database_url = database_url.replace('postgres://', 'postgresql://', 1)
```

#### 原因3: 環境変数が設定されていない

**確認:**
Railwayダッシュボード → Variables で以下が設定されているか：
- `SECRET_KEY`
- `JWT_SECRET_KEY`
- `DATABASE_URL` (PostgreSQLサービスを追加すると自動設定)
- `FLASK_ENV=production`

#### 原因4: 起動コマンドが正しくない

**確認:**
- `railway.toml` または Railway設定で `startCommand` が正しいか
- Dockerfileの `CMD` が正しいか

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

## 📚 詳細なトラブルシューティング

より詳細な情報は [RAILWAY_TROUBLESHOOTING.md](./RAILWAY_TROUBLESHOOTING.md) を参照してください。

---

## 🔗 参考リンク

- [Railway Logs Documentation](https://docs.railway.com/guides/logs)
- [Railway Common Errors](https://docs.railway.com/reference/errors)

