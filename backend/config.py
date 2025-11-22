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
    
    # 接続プールの設定（Railway用に最適化）
    SQLALCHEMY_ENGINE_OPTIONS = {
        'pool_pre_ping': True,  # 接続の有効性を確認（接続が切れている場合に自動的に再接続）
        'pool_recycle': 300,    # 5分ごとに接続を再利用
        'connect_args': {
            'connect_timeout': 10,  # 接続タイムアウト（秒）
            'sslmode': 'require'    # SSL接続を要求（RailwayのPostgreSQLはSSL必須）
        }
    }
    
    SECRET_KEY = os.getenv('SECRET_KEY', 'dev-secret-key-change-in-production')
    JWT_SECRET_KEY = os.getenv('JWT_SECRET_KEY', 'jwt-secret-key-change-in-production')
    JWT_ACCESS_TOKEN_EXPIRES = timedelta(hours=24)
    CORS_ORIGINS = "*"
    
    # Railway用の設定
    PORT = int(os.getenv('PORT', 5000))

