# Railway データベース接続エラー - 詳細対応

## 🔍 提供された接続文字列

```
postgresql://postgres:fHIqvhJPlodplOEfxivUqwpZItrYUOCN@yamanote.proxy.rlwy.net:14503/railway
```

この接続文字列は正しい形式です。以下の手順で問題を解決してください。

## ✅ 解決手順

### ステップ1: Railwayで環境変数を設定

1. **Railwayダッシュボードにアクセス**
   - https://railway.app にログイン

2. **バックエンドサービスを選択**
   - プロジェクト → バックエンドサービス

3. **Variablesタブを開く**
   - Settings → Variables

4. **DATABASE_URLを設定**
   - 変数名: `DATABASE_URL`
   - 値: `postgresql://postgres:fHIqvhJPlodplOEfxivUqwpZItrYUOCN@yamanote.proxy.rlwy.net:14503/railway`
   - **重要**: 値全体をコピー＆ペーストしてください

5. **保存**
   - 「Save」または「Add」をクリック

### ステップ2: 接続文字列の確認

接続文字列の形式：
```
postgresql://[ユーザー名]:[パスワード]@[ホスト]:[ポート]/[データベース名]
```

提供された接続文字列：
- ユーザー名: `postgres`
- パスワード: `fHIqvhJPlodplOEfxivUqwpZItrYUOCN`
- ホスト: `yamanote.proxy.rlwy.net`
- ポート: `14503`
- データベース名: `railway`

### ステップ3: PostgreSQLサービスの確認

1. **PostgreSQLサービスが起動しているか確認**
   - Railwayダッシュボード → PostgreSQLサービス
   - Deployments タブで最新のデプロイメントが成功しているか確認

2. **サービスが同じプロジェクト内にあるか確認**
   - バックエンドサービスとPostgreSQLサービスが同じプロジェクト内にあることを確認

### ステップ4: 接続タイムアウトの設定

RailwayのPostgreSQLは、初回接続に時間がかかる場合があります。`config.py`で接続タイムアウトを設定します。

## 🔧 コードの改善

### config.pyの改善

接続プールの設定を追加して、接続の安定性を向上させます。

```python
SQLALCHEMY_ENGINE_OPTIONS = {
    'pool_pre_ping': True,  # 接続の有効性を確認
    'pool_recycle': 300,    # 5分ごとに接続を再利用
    'connect_args': {
        'connect_timeout': 10,  # 接続タイムアウト（秒）
        'sslmode': 'require'    # SSL接続を要求
    }
}
```

## 📋 トラブルシューティング

### エラー1: 接続タイムアウト

**症状:**
```
OperationalError: timeout expired
```

**解決:**
- 接続タイムアウトを増やす
- ネットワーク接続を確認

### エラー2: SSL接続エラー

**症状:**
```
SSL connection required
```

**解決:**
- `sslmode=require` を接続文字列に追加
- または、`config.py`でSSL設定を追加

### エラー3: 認証エラー

**症状:**
```
password authentication failed
```

**解決:**
- 接続文字列のパスワードが正しいか確認
- PostgreSQLサービスのVariablesでパスワードを確認

### エラー4: データベースが存在しない

**症状:**
```
database "railway" does not exist
```

**解決:**
- データベース名が正しいか確認
- PostgreSQLサービスでデータベースが作成されているか確認

## 🚀 接続テスト

環境変数を設定した後、以下のコマンドで接続をテストできます：

```bash
# Railway CLIを使用
railway run python -c "from app import app; from extensions import db; app.app_context().push(); db.session.execute(db.text('SELECT 1')); print('Connection successful!')"
```

## 📝 チェックリスト

- [ ] `DATABASE_URL`環境変数が設定されている
- [ ] 接続文字列が完全にコピーされている（前後の空白がない）
- [ ] PostgreSQLサービスが起動している
- [ ] バックエンドサービスとPostgreSQLサービスが同じプロジェクト内にある
- [ ] 再デプロイが完了している
- [ ] ログで `database_configured: true` が表示される

## 🔗 参考

- [Railway Database Documentation](https://docs.railway.com/databases/postgresql)
- [PostgreSQL Connection Strings](https://www.postgresql.org/docs/current/libpq-connect.html)

---

*この手順で、データベース接続が正常に確立されるはずです。*

