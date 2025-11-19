# クイックスタートガイド

## 🚀 5分で始めるポケさぽ

### 1. プロジェクトの起動

```bash
cd C:\devlop\poke-sup
docker-compose up -d
```

### 2. データベースの初期化（オプション）

サンプルユーザーを作成する場合：

```bash
docker-compose exec backend python scripts/init_db.py
```

### 3. アプリケーションにアクセス

ブラウザで以下を開く：
- **フロントエンド**: http://localhost:3002

### 4. テストアカウントでログイン

データベースを初期化した場合、以下のアカウントでログインできます：

#### 患者アカウント
- **メール**: `patient@example.com`
- **パスワード**: `password123`

#### 医療従事者アカウント
- **メール**: `provider@example.com`
- **パスワード**: `password123`

#### 管理者アカウント
- **メール**: `admin@example.com`
- **パスワード**: `password123`

### 5. 新規登録

または、新規アカウントを作成することもできます。

## 📍 アクセス情報

- **フロントエンド**: http://localhost:3002
- **バックエンドAPI**: http://localhost:5002
- **ヘルスチェック**: http://localhost:5002/api/health

## 🔧 トラブルシューティング

### コンテナが起動しない

```bash
# ログを確認
docker-compose logs

# コンテナを再起動
docker-compose restart
```

### ポートが使用されている

`docker-compose.yml`でポート番号を変更してください。

### データベース接続エラー

```bash
# データベースコンテナの状態を確認
docker-compose ps postgres

# データベースを再起動
docker-compose restart postgres
```

## 📚 次のステップ

1. **会話を開始**: ダッシュボードから新しい会話を作成
2. **健康データを記録**: 血圧、体重などのデータを追加
3. **リマインダーを設定**: 服薬や診察のリマインダーを作成

## 🛑 停止方法

```bash
docker-compose down
```

データを保持する場合（推奨）：
```bash
docker-compose down
```

データを削除する場合：
```bash
docker-compose down -v
```


