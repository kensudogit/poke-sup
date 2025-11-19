# ポケさぽ (Poke-Sup)

患者と医療従事者間のコミュニケーションを円滑にするシステム

## 技術スタック

- **バックエンド**: Python + Flask
- **フロントエンド**: React + TypeScript + Next.js + Vitest
- **データベース**: PostgreSQL
- **リアルタイム通信**: WebSocket

## 主な機能

- ✅ リアルタイムチャット機能
- ✅ ビデオ通話機能（準備中）
- ✅ 健康データの可視化
- ✅ リマインダー機能
- ✅ 多言語対応
- ✅ 現代的で魅力的なUIデザイン

## セットアップ

### 前提条件

- Docker & Docker Compose
- Node.js 18+
- Python 3.11+

### 開発環境の起動

#### 方法1: Docker Composeを使用（推奨）

```bash
# 全サービスを起動
docker-compose up -d

# ログを確認
docker-compose logs -f
```

#### 方法2: ローカル開発環境

```bash
# 1. PostgreSQLを起動（Docker Composeを使用）
docker-compose up -d postgres

# 2. バックエンドのセットアップ
cd backend
python -m venv venv
# Windows
venv\Scripts\activate
# Linux/Mac
source venv/bin/activate

pip install -r requirements.txt

# 環境変数を設定
cp .env.example .env
# .envファイルを編集して設定を確認

# バックエンドを起動
python app.py

# 3. フロントエンドのセットアップ（別のターミナル）
cd frontend
npm install

# 環境変数を設定
cp .env.example .env.local
# NEXT_PUBLIC_API_URL=http://localhost:5000 を確認

# フロントエンドを起動
npm run dev
```

### 環境変数

#### バックエンド (.env)
```
DATABASE_URL=postgresql://poke_sup:poke_sup_password@localhost:5432/poke_sup_db
SECRET_KEY=your-secret-key-change-in-production
FLASK_ENV=development
JWT_SECRET_KEY=your-jwt-secret-key
```

#### フロントエンド (.env.local)
```
NEXT_PUBLIC_API_URL=http://localhost:5000
```

### アクセス

- フロントエンド: http://localhost:3002
- バックエンドAPI: http://localhost:5002
- ヘルスチェック: http://localhost:5002/api/health
- PostgreSQL: localhost:5436

### テストアカウント

データベースを初期化すると、以下のテストアカウントが利用可能です：

```bash
docker-compose exec backend python scripts/init_db.py
```

**患者アカウント**
- メール: `patient@example.com`
- パスワード: `password123`

**医療従事者アカウント**
- メール: `provider@example.com`
- パスワード: `password123`

**管理者アカウント**
- メール: `admin@example.com`
- パスワード: `password123`

## プロジェクト構造

```
poke-sup/
├── backend/              # Flask バックエンド
│   ├── routes/          # API ルート
│   │   ├── auth.py      # 認証エンドポイント
│   │   ├── conversations.py
│   │   ├── messages.py
│   │   ├── health_data.py
│   │   ├── reminders.py
│   │   ├── users.py
│   │   └── socketio_handlers.py
│   ├── models.py        # データベースモデル
│   ├── config.py        # 設定
│   ├── utils.py         # ユーティリティ関数
│   └── app.py           # アプリケーションエントリーポイント
├── frontend/            # Next.js フロントエンド
│   ├── app/            # Next.js App Router
│   │   ├── dashboard/  # ダッシュボードページ
│   │   ├── layout.tsx
│   │   └── page.tsx
│   ├── components/     # React コンポーネント
│   │   ├── auth/       # 認証コンポーネント
│   │   ├── conversations/
│   │   ├── health/
│   │   ├── reminders/
│   │   └── common/     # 共通コンポーネント
│   ├── lib/            # ユーティリティ
│   └── store/          # 状態管理 (Zustand)
├── docker-compose.yml
├── README.md
├── SETUP.md
├── FEATURES.md
└── CONTRIBUTING.md
```

## 主要な機能詳細

### 認証システム
- JWT トークンベースの認証
- ユーザー登録・ログイン
- ロールベースのアクセス制御（患者、医療従事者、管理者）

### リアルタイムチャット
- WebSocket (Socket.IO) によるリアルタイム通信
- 会話の作成・管理
- メッセージ履歴の保存
- 既読機能

### 健康データ管理
- 複数のデータタイプ（血圧、体重、血糖値、体温など）
- グラフによる可視化（Recharts）
- 日付範囲でのフィルタリング
- データの追加・編集・削除

### リマインダー機能
- リマインダーの作成・管理
- 種類別分類（服薬、診察、運動など）
- 完了マーク機能
- スケジュール管理

## 開発のヒント

### バックエンドのデバッグ
```bash
cd backend
python app.py
# ログがコンソールに表示されます
```

### フロントエンドのデバッグ
```bash
cd frontend
npm run dev
# ブラウザの開発者ツールで確認
```

### データベースの確認
```bash
# PostgreSQL に接続
docker exec -it poke-sup-db psql -U poke_sup -d poke_sup_db
```

# poke-sup
