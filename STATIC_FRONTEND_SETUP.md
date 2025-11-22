# 静的フロントエンド配信設定ガイド

## 📋 問題

統合デプロイでフロントエンドが表示されない問題を解決するため、Next.jsを静的エクスポートしてFlaskで配信する方式に変更しました。

## ✅ 実装内容

### 1. Next.jsを静的エクスポートに設定

`frontend/next.config.js`で静的エクスポートを有効化：

```javascript
output: 'export', // 静的エクスポートを有効化
trailingSlash: true, // URLの末尾にスラッシュを追加
images: {
  unoptimized: true, // 静的エクスポート時は画像最適化を無効化
}
```

### 2. Flaskで静的ファイルを配信

`backend/app.py`で静的ファイルを配信：

- ルートパス（`/`）とAPI以外のパスを静的ファイルとして配信
- ファイルが見つからない場合は`index.html`を返す（SPAのルーティング用）

### 3. Dockerfileの更新

- Next.jsのビルドで`out`ディレクトリが生成される
- `out`ディレクトリをFlaskで配信
- Next.jsサーバーは不要（静的ファイルのみ）

## 🚀 デプロイ手順

1. **コードをコミット・プッシュ**
   ```bash
   git add .
   git commit -m "Configure static frontend export"
   git push
   ```

2. **Railwayで再デプロイ**
   - Railwayダッシュボードで自動的に再デプロイが開始されます

3. **デプロイ完了を待つ**
   - ビルドログで以下を確認：
     - `npm run build`が成功している
     - `out`ディレクトリが生成されている

4. **動作確認**
   - ドメイン（例: `poke-sup-production-c4e5.up.railway.app`）にアクセス
   - フロントエンドのページが表示されることを確認

## 🔍 確認方法

### 正常な場合

1. **ルートパス（`/`）**: フロントエンドのページが表示される
2. **APIパス（`/api/*`）**: APIレスポンスが返される
3. **その他のパス**: フロントエンドのルーティングが動作する

### エラーの場合

ログで以下を確認：

```bash
# Railwayダッシュボード → デプロイメント → ログ
```

**フロントエンドファイルが見つからない場合:**
```
Frontend file not found: path=...
```

**解決方法:**
1. ビルドログで`out`ディレクトリが生成されているか確認
2. Dockerfileで`out`ディレクトリが正しくコピーされているか確認

## 📝 制限事項

Next.jsの静的エクスポートには以下の制限があります：

1. **API Routes**: 使用できません（バックエンドのFlask APIを使用）
2. **Server Components**: 使用できません（すべてClient Components）
3. **動的ルーティング**: `generateStaticParams`を使用する必要があります

現在の実装では、これらの制限は問題ありません。

## 🔧 トラブルシューティング

### 問題1: ビルドエラー

**症状:**
```
Error: Output directory "out" is not empty
```

**解決:**
- ビルド前に`out`ディレクトリを削除
- または、`.gitignore`に`out`を追加

### 問題2: フロントエンドが表示されない

**症状:**
- ルートパスでAPI情報が表示される
- フロントエンドのページが表示されない

**確認:**
1. ビルドログで`out`ディレクトリが生成されているか確認
2. Dockerfileで`out`ディレクトリが正しくコピーされているか確認
3. `backend/app.py`の`FRONTEND_DIR`が正しいパスを指しているか確認

**解決:**
- ビルドエラーを修正
- Dockerfileのパスを確認

### 問題3: ルーティングが動作しない

**症状:**
- ルートパスは表示されるが、他のパスで404が返される

**確認:**
1. `serve_frontend_file`関数が正しく動作しているか確認
2. ファイルが見つからない場合に`index.html`を返しているか確認

**解決:**
- `backend/app.py`の`serve_frontend_file`関数を確認
- SPAのルーティング用に`index.html`を返すロジックを確認

## 🔗 関連ドキュメント

- [FRONTEND_PROXY_SETUP.md](./FRONTEND_PROXY_SETUP.md) - プロキシ方式の設定（参考）
- [RAILWAY_DEPLOY_GUIDE.md](./RAILWAY_DEPLOY_GUIDE.md) - Railwayデプロイガイド

---

*この設定で、統合デプロイでもフロントエンドが正しく表示されるはずです。*


