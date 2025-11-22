import os
from dotenv import load_dotenv
from datetime import timedelta

load_dotenv()

class Config:
    # RailwayのPostgreSQL URLをサポート（postgres://をpostgresql://に変換）
    database_url = os.getenv('DATABASE_URL', 'postgresql://poke_sup:poke_sup_password@localhost:5432/poke_sup_db')
    if database_url.startswith('postgres://'):
        database_url = database_url.replace('postgres://', 'postgresql://', 1)
    
    SQLALCHEMY_DATABASE_URI = database_url
    SQLALCHEMY_TRACK_MODIFICATIONS = False
    
    # SSL設定を環境に応じて決定
    # Railwayや本番環境ではSSLが必要、ローカル開発環境では不要な場合が多い
    is_production = os.getenv('FLASK_ENV') == 'production' or os.getenv('RAILWAY_ENVIRONMENT') is not None
    is_railway = 'railway.app' in database_url or 'up.railway.app' in database_url or os.getenv('RAILWAY_ENVIRONMENT') is not None
    
    # DATABASE_URLにsslmodeが含まれている場合はそれを使用
    if 'sslmode=' in database_url:
        # URLに既にSSL設定が含まれている場合は、connect_argsから除外
        # psycopg2がURLパラメータから自動的にSSL設定を読み取る
        sslmode = None
    elif is_railway or is_production:
        # Railwayや本番環境ではSSLを要求
        sslmode = 'require'
    else:
        # ローカル開発環境ではSSLを無効化（データベースがSSLをサポートしていない場合）
        sslmode = 'disable'  # SSLを無効化
    
    # 接続プールの設定
    connect_args = {
        'connect_timeout': 10,  # 接続タイムアウト（秒）
    }
    
    # SSL設定を追加（sslmodeが設定されている場合のみ）
    if sslmode:
        connect_args['sslmode'] = sslmode
    
    SQLALCHEMY_ENGINE_OPTIONS = {
        'pool_pre_ping': True,  # 接続の有効性を確認（接続が切れている場合に自動的に再接続）
        'pool_recycle': 300,    # 5分ごとに接続を再利用
        'connect_args': connect_args
    }
    
    SECRET_KEY = os.getenv('SECRET_KEY', 'dev-secret-key-change-in-production')
    JWT_SECRET_KEY = os.getenv('JWT_SECRET_KEY', 'jwt-secret-key-change-in-production')
    JWT_ACCESS_TOKEN_EXPIRES = timedelta(hours=24)
    CORS_ORIGINS = "*"
    
    # Railway用の設定
    PORT = int(os.getenv('PORT', 5000))

