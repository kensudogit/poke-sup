# Vercel環境変数設定ガイド

## 必要な環境変数

### NEXT_PUBLIC_API_URL

バックエンドAPIのURLを設定する必要があります。

**設定方法1: Vercel CLIで設定**

```bash
# 本番環境用
vercel env add NEXT_PUBLIC_API_URL production

# プレビュー環境用
vercel env add NEXT_PUBLIC_API_URL preview

# 開発環境用
vercel env add NEXT_PUBLIC_API_URL development
```

**設定方法2: Vercelダッシュボードで設定**

1. [Vercel Dashboard](https://vercel.com/dashboard)にアクセス
2. `poke-sup`プロジェクトを選択
3. **Settings** → **Environment Variables**
4. 以下の変数を追加：
   - **Key**: `NEXT_PUBLIC_API_URL`
   - **Value**: バックエンドのURL（例: `https://poke-sup-backend.railway.app`）
   - **Environment**: Production, Preview, Development すべてにチェック

## バックエンドURLの確認

バックエンドがRailwayでデプロイされている場合：
1. Railwayダッシュボードにアクセス
2. バックエンドサービスを選択
3. **Settings** → **Networking** でURLを確認
4. そのURLを`NEXT_PUBLIC_API_URL`に設定

## デプロイ前の確認

- [ ] バックエンドが正常に動作している
- [ ] バックエンドのURLが確認できた
- [ ] 環境変数が設定された


