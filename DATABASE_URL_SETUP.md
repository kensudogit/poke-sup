# DATABASE_URL 設定ガイド

## 📋 提供された接続文字列

```
postgresql://postgres:fHIqvhJPlodplOEfxivUqwpZItrYUOCN@yamanote.proxy.rlwy.net:14503/railway
```

この接続文字列をRailwayで設定する手順です。

## ✅ 設定手順

### ステップ1: Railwayダッシュボードにアクセス

1. https://railway.app にログイン
2. プロジェクトを選択
3. **バックエンドサービス**を選択（フロントエンドサービスではありません）

### ステップ2: 環境変数を設定

1. **Settings**タブをクリック
2. **Variables**セクションを開く
3. **「+ New Variable」**をクリック

### ステップ3: DATABASE_URLを追加

**変数名:**
```
DATABASE_URL
```

**値:**
```
postgresql://postgres:fHIqvhJPlodplOEfxivUqwpZItrYUOCN@yamanote.proxy.rlwy.net:14503/railway
```

**重要:**
- 値全体をコピー＆ペーストしてください
- 前後に空白や改行がないことを確認してください
- 引用符（`"`や`'`）は不要です

### ステップ4: 保存と再デプロイ

1. **「Add」**または**「Save」**をクリック
2. サービスが自動的に再デプロイされます
3. デプロイが完了するまで待ちます（通常1-2分）

## 🔍 接続文字列の確認

接続文字列の構成要素：

| 要素 | 値 |
|------|-----|
| プロトコル | `postgresql://` |
| ユーザー名 | `postgres` |
| パスワード | `fHIqvhJPlodplOEfxivUqwpZItrYUOCN` |
| ホスト | `yamanote.proxy.rlwy.net` |
| ポート | `14503` |
| データベース名 | `railway` |

## ✅ 設定確認

デプロイ後、ログで以下を確認：

1. **正常な場合:**
   ```json
   {
     "level": "info",
     "message": "Database connection successful",
     "database_configured": true
   }
   ```

2. **エラーの場合:**
   ```json
   {
     "level": "error",
     "message": "Failed to create database tables",
     "database_configured": true,
     "is_connection_error": true
   }
   ```

## 🚨 よくある問題

### 問題1: 環境変数が設定されていない

**症状:**
- ログに `"database_configured": false` が表示される

**解決:**
- Variablesタブで`DATABASE_URL`が存在するか確認
- 変数名が正確に`DATABASE_URL`であることを確認（大文字小文字を区別）

### 問題2: 接続タイムアウト

**症状:**
```
OperationalError: timeout expired
```

**解決:**
- `config.py`で`connect_timeout: 10`が設定されています
- ネットワーク接続を確認
- 数分待ってから再試行

### 問題3: SSL接続エラー

**症状:**
```
SSL connection required
```

**解決:**
- `config.py`の`SQLALCHEMY_ENGINE_OPTIONS`で`sslmode: 'require'`が設定されています
- これで自動的にSSL接続が有効になります

### 問題4: 認証エラー

**症状:**
```
password authentication failed
```

**解決:**
- 接続文字列のパスワードが正しいか確認
- PostgreSQLサービスのVariablesでパスワードを確認

## 📝 チェックリスト

- [ ] Railwayダッシュボードにログイン
- [ ] バックエンドサービスを選択（フロントエンドではない）
- [ ] Settings → Variablesを開く
- [ ] `DATABASE_URL`変数を追加
- [ ] 接続文字列全体をコピー＆ペースト
- [ ] 前後の空白がないことを確認
- [ ] 保存
- [ ] 再デプロイが完了するまで待つ
- [ ] ログで`database_configured: true`を確認

## 🔗 関連ドキュメント

- [RAILWAY_DATABASE_CONNECTION_FIX.md](./RAILWAY_DATABASE_CONNECTION_FIX.md) - 詳細なトラブルシューティング
- [RAILWAY_DATABASE_SETUP.md](./RAILWAY_DATABASE_SETUP.md) - PostgreSQLサービスの追加方法
- [QUICK_FIX_RAILWAY.md](./QUICK_FIX_RAILWAY.md) - その他のエラー対応

---

*この手順で、データベース接続が正常に確立されるはずです。*


