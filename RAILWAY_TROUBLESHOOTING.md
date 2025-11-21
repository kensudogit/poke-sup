# Railway トラブルシューティングガイド

## 📋 概要

このガイドでは、Railwayにデプロイしたアプリケーションで発生する一般的なエラーとその解決方法を説明します。

参考: [Railway Logs Documentation](https://docs.railway.com/guides/logs)

---

## 🔍 ログの確認方法

### 方法1: Railwayダッシュボード（推奨）

1. **Deploy Logs（デプロイログ）**
   - Railwayダッシュボードにログイン
   - プロジェクトを選択
   - サービスを選択
   - デプロイメントをクリック
   - 「Deploy Logs」タブでログを確認

2. **Log Explorer（ログエクスプローラー）**
   - ダッシュボード上部の「Observability」タブをクリック
   - 環境全体のログを一括で確認可能
   - 日付範囲の選択や列の表示/非表示が可能

### 方法2: Railway CLI

```bash
# 最新のデプロイログを確認
railway logs

# 特定のサービスのログを確認
railway logs --service <service-name>

# リアルタイムでログを監視
railway logs --follow

# 特定の期間のログを確認
railway logs --since 1h
```

### 方法3: ログフィルタリング

Railwayのログエクスプローラーでは、以下のフィルタ構文を使用できます：

#### 基本的な検索
```
"error message"
"POST /api"
```

#### レベル別フィルタ
```
@level:error
@level:warn
@level:info
```

#### 組み合わせ検索
```
@level:error AND "failed to connect"
@level:warn OR @level:error
```

#### HTTPログのフィルタ
```
@path:/api/v1/users
@httpStatus:500
@method:POST
```

---

## ❌ よくあるエラーと解決方法

### 1. "Application failed to respond"

**症状:**
- Railwayダッシュボードに「Application failed to respond」エラーが表示される
- アプリケーションが起動しない

**原因:**
- アプリケーションが指定されたポートでリッスンしていない
- 起動コマンドが正しくない
- 環境変数が設定されていない
- データベース接続エラー

**解決方法:**

#### ステップ1: ログを確認
```bash
railway logs
```

または、Railwayダッシュボードでデプロイログを確認

#### ステップ2: ポート設定を確認

**バックエンド（Flask）の場合:**
```python
# app.py
port = int(os.environ.get('PORT', 5000))
socketio.run(app, host='0.0.0.0', port=port)
```

**環境変数の確認:**
- Railwayダッシュボード → サービス → Variables
- `PORT` が設定されているか確認（Railwayが自動設定）

#### ステップ3: 起動コマンドを確認

**railway.toml または Railway設定:**
```toml
[deploy]
startCommand = "python app.py"
```

**Dockerfileの場合:**
```dockerfile
CMD ["python", "app.py"]
```

#### ステップ4: データベース接続を確認

```python
# config.py で DATABASE_URL を確認
DATABASE_URL = os.getenv('DATABASE_URL')
```

RailwayでPostgreSQLサービスを追加し、`DATABASE_URL` が自動設定されているか確認

#### ステップ5: ヘルスチェックエンドポイントを追加

```python
# routes/health.py
from flask import Blueprint, jsonify

health_bp = Blueprint('health', __name__)

@health_bp.route('/health', methods=['GET'])
def health_check():
    return jsonify({
        'status': 'ok',
        'service': 'poke-sup-backend'
    }), 200
```

---

### 2. データベース接続エラー

**症状:**
```
sqlalchemy.exc.OperationalError: could not connect to server
```

**解決方法:**

#### ステップ1: DATABASE_URLの確認
```bash
railway variables
```

または、Railwayダッシュボードで確認

#### ステップ2: PostgreSQLサービスの確認
- RailwayダッシュボードでPostgreSQLサービスが起動しているか確認
- サービスが停止している場合は再起動

#### ステップ3: 接続文字列の変換
```python
# config.py
database_url = os.getenv('DATABASE_URL')
if database_url.startswith('postgres://'):
    database_url = database_url.replace('postgres://', 'postgresql://', 1)
```

---

### 3. ビルドエラー

**症状:**
- ビルドが失敗する
- 依存関係のインストールエラー

**解決方法:**

#### requirements.txtの確認
```bash
# ローカルでテスト
pip install -r requirements.txt
```

#### Dockerfileの確認
```dockerfile
# バックエンドの依存関係をインストール
COPY backend/requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt
```

#### ビルドログの確認
- Railwayダッシュボード → デプロイメント → 「Build Logs」タブ

---

### 4. 環境変数エラー

**症状:**
```
KeyError: 'SECRET_KEY'
```

**解決方法:**

#### 必要な環境変数を設定
Railwayダッシュボード → サービス → Variables:

```
SECRET_KEY=<ランダムな32文字以上の文字列>
JWT_SECRET_KEY=<ランダムな32文字以上の文字列>
DATABASE_URL=${{Postgres.DATABASE_URL}}
FLASK_ENV=production
PORT=5000
```

#### 環境変数の生成
```bash
# SECRET_KEYの生成
python -c "import secrets; print(secrets.token_urlsafe(32))"

# JWT_SECRET_KEYの生成
python -c "import secrets; print(secrets.token_urlsafe(32))"
```

---

### 5. メモリ不足エラー

**症状:**
```
Out of memory
Killed
```

**解決方法:**

#### Railwayプランの確認
- Railwayダッシュボード → サービス → Settings → Resources
- メモリ制限を確認

#### Dockerfileの最適化
```dockerfile
# マルチステージビルドを使用
FROM python:3.11-slim as builder
# ... ビルドステージ

FROM python:3.11-slim
# ... 本番ステージ（軽量）
```

---

## 🔧 デバッグのベストプラクティス

### 1. 構造化ログの実装

```python
import json
import logging

def log_structured(level, message, **kwargs):
    """構造化ログを出力"""
    log_data = {
        "level": level,
        "message": message,
        **kwargs
    }
    print(json.dumps(log_data))

# 使用例
log_structured("info", "Application started", port=5000)
log_structured("error", "Database connection failed", error=str(e))
```

### 2. ヘルスチェックエンドポイント

```python
@health_bp.route('/health', methods=['GET'])
def health_check():
    try:
        # データベース接続チェック
        db.session.execute('SELECT 1')
        db_status = 'healthy'
    except Exception as e:
        db_status = f'unhealthy: {str(e)}'
    
    return jsonify({
        'status': 'ok',
        'database': db_status,
        'service': 'poke-sup-backend'
    }), 200
```

### 3. エラーハンドリング

```python
@app.errorhandler(500)
def internal_error(error):
    log_structured("error", "Internal server error", error=str(error))
    return jsonify({'error': 'Internal server error'}), 500
```

---

## 📊 ログの分析

### エラーログの検索

```
@level:error
```

### 特定のパスのエラー

```
@path:/api/v1/users AND @httpStatus:500
```

### データベース関連のエラー

```
"database" AND @level:error
```

### 起動時のログ

```
"Application started" OR "Server running"
```

---

## 🚀 パフォーマンスの監視

### レスポンスタイムの確認

```
@httpStatus:200
```

### スロークエリの検索

```
"slow query" OR "query time"
```

### メモリ使用量の監視

```
"memory" OR "out of memory"
```

---

## 📞 サポート

### Railwayサポート

- **Help Station**: [Railway Help Station](https://railway.app/help)
- **Documentation**: [Railway Docs](https://docs.railway.com)
- **Discord**: Railway Discord Community

### ログの共有

問題を報告する際は、以下の情報を含めてください：

1. エラーメッセージ
2. デプロイログ（関連部分）
3. 環境変数（機密情報を除く）
4. Request ID（エラーページに表示）

---

## ✅ チェックリスト

デプロイ前の確認事項：

- [ ] 環境変数がすべて設定されている
- [ ] DATABASE_URLが正しく設定されている
- [ ] PORT環境変数が使用されている（Railwayが自動設定）
- [ ] アプリケーションが `0.0.0.0` でリッスンしている
- [ ] ヘルスチェックエンドポイントが実装されている
- [ ] 構造化ログが実装されている（オプション）
- [ ] エラーハンドリングが実装されている

---

## 🔗 参考リンク

- [Railway Logs Documentation](https://docs.railway.com/guides/logs)
- [Railway Common Errors](https://docs.railway.com/reference/errors)
- [Railway Production Readiness](https://docs.railway.com/reference/production-readiness-checklist)

---

*最終更新: 2025年11月*

