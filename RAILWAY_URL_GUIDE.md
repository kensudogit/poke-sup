# Railway URL確認ガイド

## 🔗 URLの確認方法

### 方法1: Railwayダッシュボードで確認（推奨）

1. **Railwayダッシュボードにログイン**
   - https://railway.app にアクセス
   - ログイン

2. **プロジェクトを選択**
   - デプロイしたプロジェクトをクリック

3. **サービスのURLを確認**
   - 各サービス（バックエンド、フロントエンド）をクリック
   - **Settings** → **Networking** タブ
   - **Public Domain** セクションにURLが表示されます

   例:
   - バックエンド: `https://poke-sup-backend-production.up.railway.app`
   - フロントエンド: `https://poke-sup-frontend-production.up.railway.app`

### 方法2: Railway CLIで確認

```bash
# プロジェクトにリンク
railway link

# サービスのURLを確認
railway domain

# または、環境変数で確認
railway variables
```

### 方法3: デプロイログで確認

デプロイが完了すると、ログにURLが表示される場合があります：

```bash
railway logs
```

## 📋 URLの形式

RailwayのデフォルトURLは以下の形式です：

```
https://[サービス名]-[環境名].up.railway.app
```

例:
- `https://poke-sup-backend-production.up.railway.app`
- `https://poke-sup-frontend-production.up.railway.app`

## 🌐 カスタムドメインの設定

### カスタムドメインを追加する方法

1. **Railwayダッシュボード**
   - サービス → Settings → Networking
   - **Custom Domain** セクション
   - **Generate Domain** をクリック（自動生成）
   - または、**Add Custom Domain** で独自ドメインを追加

2. **DNS設定**
   - カスタムドメインを使用する場合、DNSレコードを設定する必要があります
   - Railwayが提供するCNAMEレコードをDNSプロバイダーに設定

## 🔧 環境変数の設定

フロントエンドの環境変数で、バックエンドのURLを設定：

```
NEXT_PUBLIC_API_URL=https://[バックエンドのRailway URL]
```

例:
```
NEXT_PUBLIC_API_URL=https://poke-sup-backend-production.up.railway.app
```

## 📱 アクセステスト

### バックエンドのヘルスチェック

```bash
curl https://[バックエンドURL]/api/health
```

正常な応答:
```json
{
  "status": "ok",
  "database": "healthy",
  "service": "poke-sup-backend"
}
```

### フロントエンドのアクセス

ブラウザで以下にアクセス：
```
https://[フロントエンドURL]
```

## 🔍 URLが見つからない場合

1. **デプロイが完了しているか確認**
   - Railwayダッシュボード → デプロイメント
   - 最新のデプロイメントが成功しているか確認

2. **サービスが起動しているか確認**
   - サービス → Deployments
   - 最新のデプロイメントのステータスを確認

3. **Public Domainが有効になっているか確認**
   - Settings → Networking
   - Public Domain が有効になっているか確認

## 📝 メモ

- Railwayの無料プランでも、デフォルトのURLが提供されます
- URLはデプロイが成功すると自動的に生成されます
- カスタムドメインは有料プランで利用可能です（無料プランでも一部利用可能）

---

*URLが見つからない場合は、RailwayダッシュボードのSettings → Networkingで確認してください。*

