from flask import Flask, jsonify, request
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
                # データベース接続をテスト
                db.session.execute(db.text('SELECT 1'))
                db.create_all()
                database_connected = True
                log_info("Database tables created/verified")
            except Exception as e:
                database_url = os.environ.get('DATABASE_URL', DATABASE_URL_NOT_SET)
                is_connection_error = 'Connection refused' in str(e) or 'OperationalError' in str(type(e).__name__)
                
                # エラーの詳細をログに記録
                error_msg = str(e)
                if len(error_msg) > 300:
                    error_msg = error_msg[:300] + "..."
                
                log_error(
                    "Failed to create database tables",
                    error_type=type(e).__name__,
                    error_message=error_msg,
                    database_url_configured=bool(database_url and database_url != DATABASE_URL_NOT_SET),
                    is_connection_error=is_connection_error
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
                    print("SOLUTION:", file=sys.stderr)
                    print("1. Go to Railway dashboard: https://railway.app", file=sys.stderr)
                    print("2. Select your project", file=sys.stderr)
                    print("3. Click 'New' -> 'Database' -> 'Add PostgreSQL'", file=sys.stderr)
                    print("4. Go to your backend service -> Variables", file=sys.stderr)
                    print("5. Ensure DATABASE_URL=${{Postgres.DATABASE_URL}} is set", file=sys.stderr)
                    print("   (Replace 'Postgres' with your PostgreSQL service name if different)", file=sys.stderr)
                    print("", file=sys.stderr)
                    print("Current DATABASE_URL status:", file=sys.stderr)
                    if database_url == DATABASE_URL_NOT_SET:
                        print("  ❌ DATABASE_URL is NOT SET", file=sys.stderr)
                    else:
                        print("  ⚠️  DATABASE_URL is set but connection failed", file=sys.stderr)
                        # ホスト情報のみ表示（機密情報を除く）
                        try:
                            if '@' in database_url:
                                host_part = database_url.split('@')[1].split('/')[0]
                                print(f"  Connection target: {host_part}", file=sys.stderr)
                        except Exception:
                            pass
                    print("", file=sys.stderr)
                    print(separator, file=sys.stderr)
                    print("", file=sys.stderr)
                    
                    log_error(
                        "Database connection failed",
                        action_required="Add PostgreSQL service in Railway",
                        steps=[
                            "1. Railway dashboard -> Project -> New -> Database -> Add PostgreSQL",
                            "2. Backend service -> Variables -> Set DATABASE_URL=${{Postgres.DATABASE_URL}}",
                            "3. Redeploy the backend service"
                        ]
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

