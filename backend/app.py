from flask import Flask, jsonify, request, send_from_directory, send_file
from flask_cors import CORS
from flask_socketio import SocketIO
from flask_jwt_extended import JWTManager
from config import Config
from extensions import db
from routes import register_routes
from utils.logging import log_info, log_error, log_warn
import eventlet
import os
import sys

eventlet.monkey_patch()

app = Flask(__name__)
app.config.from_object(Config)

# Initialize extensions
CORS(app, resources={r"/*": {"origins": "*"}})
db.init_app(app)
jwt = JWTManager(app)
socketio = SocketIO(app, cors_allowed_origins="*", async_mode='eventlet')

# Register routes
register_routes(app, socketio)

# フロントエンドの静的ファイルディレクトリ
FRONTEND_DIR = os.path.join(os.path.dirname(os.path.dirname(__file__)), 'frontend', 'out')
INDEX_HTML = 'index.html'

def serve_frontend_file(path):
    """フロントエンドの静的ファイルを配信"""
    try:
        # パスを正規化
        if path == '' or path == '/':
            path = INDEX_HTML
        
        # ファイルパスを構築
        file_path = os.path.join(FRONTEND_DIR, path)
        
        # セキュリティチェック（ディレクトリトラバーサル防止）
        frontend_abs = os.path.abspath(FRONTEND_DIR)
        file_abs = os.path.abspath(file_path)
        if not file_abs.startswith(frontend_abs):
            log_warn("Invalid file path requested", path=path)
            return jsonify({'error': 'Invalid path'}), 403
        
        # ファイルが存在するか確認
        if os.path.isfile(file_path):
            return send_file(file_path)
        elif os.path.isdir(file_path):
            # ディレクトリの場合はindex.htmlを返す
            index_path = os.path.join(file_path, INDEX_HTML)
            if os.path.isfile(index_path):
                return send_file(index_path)
        
        # ファイルが見つからない場合は、index.htmlを返す（SPAのルーティング用）
        index_html = os.path.join(FRONTEND_DIR, INDEX_HTML)
        if os.path.isfile(index_html):
            return send_file(index_html)
        
        log_warn("Frontend file not found", path=path)
        return jsonify({'error': 'File not found'}), 404
    except Exception as e:
        log_error("Failed to serve frontend file", error=e, path=path)
        return jsonify({'error': 'Internal server error'}), 500

# ルートパスとAPI以外のパスをフロントエンドの静的ファイルとして配信
# 注意: このルートは最後に定義する必要があります（APIルートの後に）
@app.route('/', defaults={'path': ''}, methods=['GET'])
@app.route('/<path:path>', methods=['GET'])
def catch_all(path):
    """API以外のリクエストをフロントエンドの静的ファイルとして配信"""
    # APIパスは除外（既に登録されたルートで処理される）
    if path.startswith('api/'):
        # ここに到達した場合、APIルートが見つからなかったことを意味する
        log_warn("API endpoint not found", path=request.path)
        return jsonify({'error': 'API endpoint not found'}), 404
    
    # 静的ファイルを配信
    return serve_frontend_file(path)

# エラーハンドラー
@app.errorhandler(404)
def not_found(error):
    log_warn("Resource not found", path=request.path)
    return jsonify({'error': 'Resource not found'}), 404

@app.errorhandler(500)
def internal_error(error):
    log_error("Internal server error", error=error)
    return jsonify({'error': 'Internal server error'}), 500

@app.errorhandler(Exception)
def handle_exception(e):
    log_error("Unhandled exception", error=e)
    return jsonify({'error': 'An unexpected error occurred'}), 500

# 定数
DATABASE_URL_NOT_SET = 'not set'

# 起動時のログ
def startup_log():
    """アプリケーション起動時の情報をログ出力"""
    port = int(os.environ.get('PORT', 5000))
    env = os.environ.get('FLASK_ENV', 'development')
    database_url = os.environ.get('DATABASE_URL', DATABASE_URL_NOT_SET)
    
    log_info(
        "Application starting",
        port=port,
        environment=env,
        database_configured=bool(database_url and database_url != DATABASE_URL_NOT_SET)
    )

if __name__ == '__main__':
    try:
        startup_log()
        
        database_connected = False
        with app.app_context():
            try:
                # データベース接続文字列の検証
                database_url = os.environ.get('DATABASE_URL', DATABASE_URL_NOT_SET)
                if database_url and database_url != DATABASE_URL_NOT_SET:
                    # 接続文字列の基本情報をログに記録（機密情報は除く）
                    try:
                        if '@' in database_url:
                            parts = database_url.split('@')
                            if len(parts) == 2:
                                host_part = parts[1].split('/')[0]
                                db_name = parts[1].split('/')[1] if '/' in parts[1] else 'unknown'
                                log_info(
                                    "Attempting database connection",
                                    host=host_part,
                                    database=db_name,
                                    url_configured=True
                                )
                    except Exception:
                        pass
                
                # データベース接続をテスト（タイムアウト付き）
                log_info("Testing database connection...")
                db.session.execute(db.text('SELECT 1'))
                log_info("Database connection successful")
                
                # テーブルを作成
                log_info("Creating database tables...")
                db.create_all()
                database_connected = True
                log_info("Database tables created/verified", status="success")
            except Exception as e:
                database_url = os.environ.get('DATABASE_URL', DATABASE_URL_NOT_SET)
                error_type_name = type(e).__name__
                error_msg = str(e)
                
                # 接続エラーの種類を判定
                is_connection_error = (
                    'Connection refused' in error_msg or 
                    'OperationalError' in error_type_name or
                    'timeout' in error_msg.lower() or
                    'could not connect' in error_msg.lower() or
                    'connection' in error_msg.lower()
                )
                is_ssl_error = 'ssl' in error_msg.lower() or 'SSL' in error_msg
                is_auth_error = 'password' in error_msg.lower() or 'authentication' in error_msg.lower()
                
                # エラーの詳細をログに記録
                if len(error_msg) > 500:
                    error_msg = error_msg[:500] + "..."
                
                log_error(
                    "Failed to create database tables",
                    error_type=error_type_name,
                    error_message=error_msg,
                    database_url_configured=bool(database_url and database_url != DATABASE_URL_NOT_SET),
                    is_connection_error=is_connection_error,
                    is_ssl_error=is_ssl_error,
                    is_auth_error=is_auth_error,
                    traceback=True
                )
                
                # データベース接続エラーの場合は、解決方法を明確に表示
                if is_connection_error:
                    separator = "=" * 80
                    print("\n" + separator, file=sys.stderr)
                    print("DATABASE CONNECTION ERROR - ACTION REQUIRED", file=sys.stderr)
                    print(separator, file=sys.stderr)
                    print("", file=sys.stderr)
                    print("The application cannot connect to the database.", file=sys.stderr)
                    print("", file=sys.stderr)
                    
                    # エラーの種類に応じた解決方法を表示
                    if is_ssl_error:
                        print("⚠️  SSL接続エラーが検出されました", file=sys.stderr)
                        print("   config.pyでSSL設定が正しく適用されているか確認してください。", file=sys.stderr)
                        print("", file=sys.stderr)
                    elif is_auth_error:
                        print("⚠️  認証エラーが検出されました", file=sys.stderr)
                        print("   接続文字列のパスワードが正しいか確認してください。", file=sys.stderr)
                        print("", file=sys.stderr)
                    
                    print("SOLUTION:", file=sys.stderr)
                    print("", file=sys.stderr)
                    print("1. Railwayダッシュボードにアクセス: https://railway.app", file=sys.stderr)
                    print("2. プロジェクトを選択", file=sys.stderr)
                    print("3. バックエンドサービス → Settings → Variables", file=sys.stderr)
                    print("4. DATABASE_URL環境変数を確認・設定:", file=sys.stderr)
                    print("   - 変数名: DATABASE_URL", file=sys.stderr)
                    print("   - 値: PostgreSQLサービスの接続文字列", file=sys.stderr)
                    print("   - または: ${{Postgres.DATABASE_URL}} (PostgreSQLサービス名に合わせて調整)", file=sys.stderr)
                    print("", file=sys.stderr)
                    print("5. 接続文字列の形式を確認:", file=sys.stderr)
                    print("   postgresql://[ユーザー名]:[パスワード]@[ホスト]:[ポート]/[データベース名]", file=sys.stderr)
                    print("", file=sys.stderr)
                    print("6. 環境変数を保存後、サービスを再デプロイ", file=sys.stderr)
                    print("", file=sys.stderr)
                    print("Current DATABASE_URL status:", file=sys.stderr)
                    if database_url == DATABASE_URL_NOT_SET:
                        print("  ❌ DATABASE_URL is NOT SET", file=sys.stderr)
                        print("  → Railwayダッシュボードで環境変数を設定してください", file=sys.stderr)
                    else:
                        print("  ⚠️  DATABASE_URL is set but connection failed", file=sys.stderr)
                        # 接続文字列の詳細情報を表示（機密情報は除く）
                        try:
                            if '@' in database_url:
                                host_part = database_url.split('@')[1].split('/')[0]
                                db_name = database_url.split('/')[-1] if '/' in database_url else 'unknown'
                                print(f"  Connection target: {host_part}", file=sys.stderr)
                                print(f"  Database name: {db_name}", file=sys.stderr)
                                # 接続文字列の形式を検証
                                if not database_url.startswith('postgresql://'):
                                    print("  ⚠️  Warning: Connection string should start with 'postgresql://'", file=sys.stderr)
                        except Exception as parse_error:
                            print(f"  ⚠️  Could not parse connection string: {parse_error}", file=sys.stderr)
                    print("", file=sys.stderr)
                    print(separator, file=sys.stderr)
                    print("", file=sys.stderr)
                    
                    log_error(
                        "Database connection failed",
                        action_required="Configure DATABASE_URL in Railway",
                        error_category="connection" if not is_ssl_error and not is_auth_error else ("ssl" if is_ssl_error else "authentication"),
                        steps=[
                            "1. Railway dashboard -> Backend service -> Settings -> Variables",
                            "2. Set DATABASE_URL to PostgreSQL connection string",
                            "3. Verify connection string format: postgresql://user:pass@host:port/dbname",
                            "4. Redeploy the backend service"
                        ],
                        traceback=True
                    )
                    
                    # データベース接続エラーでもアプリケーションは起動を続行（警告のみ）
                    log_warn(
                        "Application starting without database connection",
                        warning="API endpoints will return errors until database is connected"
                    )
                else:
                    # その他のエラーの場合は停止
                    log_error("Critical error - application cannot start", error=e)
                    sys.exit(1)
        
        # Railway用のポート設定
        port = int(os.environ.get('PORT', 5000))
        debug = os.environ.get('FLASK_ENV') != 'production'
        
        if database_connected:
            log_info("Starting server", host='0.0.0.0', port=port, debug=debug, database="connected")
        else:
            log_warn("Starting server without database", host='0.0.0.0', port=port, debug=debug, database="disconnected")
        
        socketio.run(app, host='0.0.0.0', port=port, debug=debug)
    except Exception as e:
        log_error("Failed to start application", error=e, error_type=type(e).__name__)
        sys.exit(1)

