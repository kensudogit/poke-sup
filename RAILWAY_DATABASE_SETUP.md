# Railway データベース設定ガイド

## ❌ エラー

```
psycopg2.OperationalError: Connection refused
connection to server at "localhost" (127.0.0.1), port 5432 failed: Connection refused
```

ログに `"database_configured": false` が表示される場合も、この問題を示しています。

## 🔍 原因

1. **PostgreSQLサービスが追加されていない**
2. **`DATABASE_URL`環境変数が設定されていない**
3. **環境変数が正しく参照されていない**

## ✅ 解決方法

### ステップ1: PostgreSQLサービスを追加

1. **Railwayダッシュボードにログイン**
   - https://railway.app にアクセス

2. **プロジェクトを選択**
   - デプロイしたプロジェクトをクリック

3. **PostgreSQLサービスを追加**
   - 「New」ボタンをクリック
   - 「Database」を選択
   - 「Add PostgreSQL」をクリック

4. **自動設定の確認**
   - PostgreSQLサービスを追加すると、`DATABASE_URL`環境変数が自動的に設定されます
   - バックエンドサービス → Variables で確認

### ステップ2: 環境変数の確認

Railwayダッシュボード → バックエンドサービス → Variables で以下を確認：

#### 必須の環境変数

```
DATABASE_URL=${{Postgres.DATABASE_URL}}
```

**重要**: `${{Postgres.DATABASE_URL}}` の形式で設定されていることを確認してください。
- `Postgres` はPostgreSQLサービスの名前です
- サービス名が異なる場合は、その名前に置き換えてください

#### その他の環境変数

```
FLASK_ENV=production
SECRET_KEY=<your-secret-key>
JWT_SECRET_KEY=<your-jwt-secret-key>
PORT=5000
```

### ステップ3: 環境変数の手動設定（必要に応じて）

PostgreSQLサービスを追加しても`DATABASE_URL`が自動設定されない場合：

1. **PostgreSQLサービスのVariablesを確認**
   - PostgreSQLサービス → Variables
   - `DATABASE_URL`、`PGHOST`、`PGPORT`、`PGUSER`、`PGPASSWORD`、`PGDATABASE` を確認

2. **バックエンドサービスのVariablesに追加**
   - バックエンドサービス → Variables
   - `DATABASE_URL` を追加
   - 値: `${{Postgres.DATABASE_URL}}` （Postgresは実際のサービス名に置き換え）

### ステップ4: サービス間の接続確認

Railwayでは、同じプロジェクト内のサービスは自動的に接続できます。

1. **サービスが同じプロジェクト内にあることを確認**
   - バックエンドサービスとPostgreSQLサービスが同じプロジェクト内にあるか確認

2. **サービス名を確認**
   - PostgreSQLサービスの名前を確認
   - デフォルトは `Postgres` ですが、変更されている場合があります

## 🔧 トラブルシューティング

### エラーが続く場合

#### 1. DATABASE_URLの形式を確認

Railwayの`DATABASE_URL`は以下の形式です：
```
postgresql://user:password@host:port/database
```

または：
```
postgres://user:password@host:port/database
```

`config.py`で`postgres://`を`postgresql://`に変換していることを確認：

```python
if database_url.startswith('postgres://'):
    database_url = database_url.replace('postgres://', 'postgresql://', 1)
```

#### 2. ログで確認

アプリケーション起動時のログで以下を確認：

```json
{"level": "info", "message": "Application starting", "database_configured": true}
```

`database_configured: false` の場合は、`DATABASE_URL`が設定されていません。

#### 3. 環境変数の直接確認

Railway CLIで確認：

```bash
railway variables
```

または、Railwayダッシュボードで確認：
- サービス → Variables タブ

#### 4. PostgreSQLサービスの状態確認

- PostgreSQLサービスが起動しているか確認
- サービス → Deployments で最新のデプロイメントが成功しているか確認

## 📋 チェックリスト

- [ ] PostgreSQLサービスが追加されている
- [ ] PostgreSQLサービスが起動している
- [ ] `DATABASE_URL`環境変数が設定されている
- [ ] `DATABASE_URL`の値が `${{Postgres.DATABASE_URL}}` の形式になっている
- [ ] バックエンドサービスとPostgreSQLサービスが同じプロジェクト内にある
- [ ] ログに `"database_configured": true` が表示される

## 🚀 デプロイ後の確認

デプロイ後、以下のログが表示されるはずです：

```json
{"level": "info", "message": "Application starting", "database_configured": true}
{"level": "info", "message": "Database tables created/verified"}
```

エラーが解消され、データベース接続が正常に確立されるはずです。

## 📚 参考

- [Railway Database Documentation](https://docs.railway.com/databases/postgresql)
- [Railway Environment Variables](https://docs.railway.com/develop/variables)

---

*この設定により、データベース接続が正常に確立され、アプリケーションが正常に起動するはずです。*

