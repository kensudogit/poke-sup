# システムステータス

## 🟢 現在の状態

**最終更新**: 2025-11-19 07:33

### サービス状態

| サービス | ステータス | ポート | URL |
|---------|----------|-------|-----|
| PostgreSQL | 🟢 正常 | 5436 | localhost:5436 |
| Flask バックエンド | 🟢 正常 | 5002 | http://localhost:5002 |
| Next.js フロントエンド | 🟢 正常 | 3002 | http://localhost:3002 |

### データベース

- **状態**: 🟢 初期化済み
- **テーブル**: 作成済み
- **サンプルデータ**: 作成済み

### テストアカウント

以下のアカウントでログインできます：

1. **患者** (`patient@example.com` / `password123`)
2. **医療従事者** (`provider@example.com` / `password123`)
3. **管理者** (`admin@example.com` / `password123`)

## 📊 機能ステータス

| 機能 | ステータス | 備考 |
|------|----------|------|
| ユーザー認証 | ✅ 動作中 | JWT認証 |
| リアルタイムチャット | ✅ 動作中 | WebSocket |
| 健康データ管理 | ✅ 動作中 | CRUD操作可能 |
| リマインダー | ✅ 動作中 | 作成・管理可能 |
| データ可視化 | ✅ 動作中 | グラフ表示 |

## 🔧 コマンド

### サービス管理

```bash
# 起動
docker-compose up -d

# 停止
docker-compose down

# 再起動
docker-compose restart

# ログ確認
docker-compose logs -f

# 状態確認
docker-compose ps
```

### データベース管理

```bash
# 初期化（サンプルデータ作成）
docker-compose exec backend python scripts/init_db.py

# データベース接続
docker exec -it poke-sup-db psql -U poke_sup -d poke_sup_db
```

### バックエンド管理

```bash
# ログ確認
docker-compose logs -f backend

# シェルアクセス
docker-compose exec backend bash
```

### フロントエンド管理

```bash
# ログ確認
docker-compose logs -f frontend

# シェルアクセス
docker-compose exec frontend sh
```

## 🐛 トラブルシューティング

### ポート競合

ポートが使用されている場合、`docker-compose.yml`でポート番号を変更してください。

現在のポート設定：
- PostgreSQL: 5436
- バックエンド: 5002
- フロントエンド: 3002

### データベース接続エラー

```bash
# データベースコンテナの再起動
docker-compose restart postgres

# データベースの状態確認
docker-compose logs postgres
```

### コンテナが起動しない

```bash
# ログを確認
docker-compose logs

# コンテナを再作成
docker-compose up -d --force-recreate
```

## 📝 次のステップ

1. ✅ システム起動完了
2. ✅ データベース初期化完了
3. 🌐 ブラウザで http://localhost:3002 にアクセス
4. 🔐 テストアカウントでログイン
5. 🎉 アプリケーションを使用開始！

