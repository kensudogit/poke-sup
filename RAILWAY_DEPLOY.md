# Railway デプロイガイド

## 問題の解決方法

### エラー内容
```
ERROR: failed to build: failed to solve: failed to compute cache key: failed to calculate checksum of ref: "/requirements.txt": not found
```

### 原因
Railwayでデプロイする際、ビルドコンテキストがプロジェクトルートに設定されているため、`backend/Dockerfile`から`requirements.txt`を参照できない。

### 解決方法

#### 方法1: Railwayの設定でビルドコンテキストを変更（推奨）

1. Railwayのプロジェクト設定に移動
2. **Settings** → **Build** セクション
3. **Root Directory** を `backend` に設定
4. **Dockerfile Path** を `Dockerfile` に設定（または空欄）

#### 方法2: ルートDockerfileを使用

プロジェクトルートに`Dockerfile`を作成し、`backend`ディレクトリを参照するように設定。

既に`Dockerfile`を作成済みです。Railwayの設定で：
- **Root Directory**: 空欄（プロジェクトルート）
- **Dockerfile Path**: `Dockerfile`

#### 方法3: railway.tomlを使用

`railway.toml`ファイルを作成済みです。Railwayが自動的にこの設定を読み込みます。

## 環境変数の設定

Railwayの**Variables**セクションで以下を設定：

```
DATABASE_URL=postgresql://[ユーザー名]:[パスワード]@[ホスト]:[ポート]/[データベース名]
FLASK_ENV=production
SECRET_KEY=[ランダムな文字列]
JWT_SECRET_KEY=[ランダムな文字列]
```

## データベースの設定

1. RailwayでPostgreSQLサービスを追加
2. 接続情報を環境変数`DATABASE_URL`に設定
3. データベースを初期化（必要に応じて）

## デプロイ手順

1. GitHubリポジトリにコードをプッシュ
2. Railwayで新しいプロジェクトを作成
3. GitHubリポジトリを接続
4. ビルド設定を確認（上記の方法1、2、3のいずれか）
5. 環境変数を設定
6. PostgreSQLサービスを追加
7. デプロイを開始

## トラブルシューティング

### ビルドが失敗する場合

- `railway.toml`の設定を確認
- Railwayのビルドログを確認
- `backend/Dockerfile`のパスが正しいか確認

### アプリケーションが起動しない場合

- 環境変数が正しく設定されているか確認
- データベース接続が正しいか確認
- ログを確認してエラーを特定

