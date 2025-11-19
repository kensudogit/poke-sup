# セットアップガイド

## クイックスタート

### 1. リポジトリのクローン

```bash
cd C:\devlop\poke-sup
```

### 2. Docker Composeで起動（最も簡単）

```bash
docker-compose up -d
```

これで以下が起動します：
- PostgreSQL (ポート 5432)
- Flask バックエンド (ポート 5000)
- Next.js フロントエンド (ポート 3000)

### 3. ブラウザでアクセス

http://localhost:3000 にアクセスして、アプリケーションを使用開始できます。

## 詳細なセットアップ

### バックエンドのセットアップ

```bash
cd backend

# 仮想環境の作成
python -m venv venv

# 仮想環境の有効化
# Windows
venv\Scripts\activate
# Linux/Mac
source venv/bin/activate

# 依存関係のインストール
pip install -r requirements.txt

# 環境変数の設定
cp .env.example .env
# .envファイルを編集

# データベースの初期化（初回のみ）
python app.py
```

### フロントエンドのセットアップ

```bash
cd frontend

# 依存関係のインストール
npm install

# 環境変数の設定
cp .env.example .env.local
# NEXT_PUBLIC_API_URL=http://localhost:5000 を確認

# 開発サーバーの起動
npm run dev
```

## テスト

### フロントエンドのテスト

```bash
cd frontend
npm run test
```

### バックエンドのテスト

```bash
cd backend
# テストファイルを追加後、実行
pytest
```

## トラブルシューティング

### ポートが既に使用されている場合

`docker-compose.yml`でポート番号を変更してください。

### データベース接続エラー

1. PostgreSQLが起動しているか確認
2. `.env`ファイルの`DATABASE_URL`を確認
3. データベースが作成されているか確認

### フロントエンドがバックエンドに接続できない

1. バックエンドが起動しているか確認（http://localhost:5000）
2. `.env.local`の`NEXT_PUBLIC_API_URL`を確認
3. CORS設定を確認

