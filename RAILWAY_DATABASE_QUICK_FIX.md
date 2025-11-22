# Railway データベース接続エラー - クイック修正

## 🚨 エラー

ログに以下のエラーが表示される：
```
Failed to create database tables
Database connection failed
```

## ⚡ 即座の解決方法（3ステップ）

### ステップ1: PostgreSQLサービスを追加

1. **Railwayダッシュボードにアクセス**
   - https://railway.app にログイン

2. **プロジェクトを選択**
   - デプロイしたプロジェクトをクリック

3. **PostgreSQLを追加**
   - 画面右上の **「New」** ボタンをクリック
   - **「Database」** を選択
   - **「Add PostgreSQL」** をクリック

### ステップ2: 環境変数を確認

1. **バックエンドサービスを選択**
   - プロジェクト内のバックエンドサービスをクリック

2. **Variablesタブを開く**
   - Settings → Variables（または直接Variablesタブ）

3. **DATABASE_URLを確認**
   - `DATABASE_URL` が自動的に追加されているか確認
   - 値が `${{Postgres.DATABASE_URL}}` になっているか確認
   - **注意**: `Postgres` はPostgreSQLサービスの名前です。変更されている場合は、その名前に置き換えてください

### ステップ3: 再デプロイ

1. **変更を保存**（必要に応じて）
2. **再デプロイ**
   - 最新のデプロイメント → 「Redeploy」をクリック
   - または、GitHubにプッシュして自動デプロイ

## ✅ 確認方法

デプロイ後、ログで以下を確認：

```json
{"level": "info", "message": "Application starting", "database_configured": true}
{"level": "info", "message": "Database tables created/verified"}
```

エラーが解消され、正常に起動するはずです。

## 🔍 トラブルシューティング

### DATABASE_URLが自動設定されない場合

1. **PostgreSQLサービスのVariablesを確認**
   - PostgreSQLサービス → Variables
   - `DATABASE_URL` が表示されているか確認

2. **手動で設定**
   - バックエンドサービス → Variables
   - `DATABASE_URL` を追加
   - 値: `${{Postgres.DATABASE_URL}}`
   - `Postgres` は実際のPostgreSQLサービスの名前に置き換え

### サービス名が異なる場合

PostgreSQLサービスの名前が `Postgres` 以外の場合：

1. **サービス名を確認**
   - PostgreSQLサービスの名前を確認（例: `postgres-db`、`database` など）

2. **環境変数を更新**
   - バックエンドサービス → Variables
   - `DATABASE_URL` の値を `${{サービス名.DATABASE_URL}}` に更新

## 📋 チェックリスト

- [ ] PostgreSQLサービスが追加されている
- [ ] PostgreSQLサービスが起動している（Deploymentsで確認）
- [ ] バックエンドサービスとPostgreSQLサービスが同じプロジェクト内にある
- [ ] `DATABASE_URL`環境変数が設定されている
- [ ] `DATABASE_URL`の値が `${{Postgres.DATABASE_URL}}` の形式になっている
- [ ] 再デプロイが完了している

## 📚 詳細ガイド

より詳細な情報は [RAILWAY_DATABASE_SETUP.md](./RAILWAY_DATABASE_SETUP.md) を参照してください。

---

*この3ステップで、データベース接続エラーが解決するはずです。*

