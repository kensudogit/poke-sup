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

# 起動時のログ
def startup_log():
    """アプリケーション起動時の情報をログ出力"""
    port = int(os.environ.get('PORT', 5000))
    env = os.environ.get('FLASK_ENV', 'development')
    database_url = os.environ.get('DATABASE_URL', 'not set')
    
    log_info(
        "Application starting",
        port=port,
        environment=env,
        database_configured=bool(database_url and database_url != 'not set')
    )

if __name__ == '__main__':
    try:
        startup_log()
        
        with app.app_context():
            try:
                db.create_all()
                log_info("Database tables created/verified")
            except Exception as e:
                log_error("Failed to create database tables", error=e)
                sys.exit(1)
        
        # Railway用のポート設定
        port = int(os.environ.get('PORT', 5000))
        debug = os.environ.get('FLASK_ENV') != 'production'
        
        log_info("Starting server", host='0.0.0.0', port=port, debug=debug)
        socketio.run(app, host='0.0.0.0', port=port, debug=debug)
    except Exception as e:
        log_error("Failed to start application", error=e)
        sys.exit(1)

