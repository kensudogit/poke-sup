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
    SECRET_KEY = os.getenv('SECRET_KEY', 'dev-secret-key-change-in-production')
    JWT_SECRET_KEY = os.getenv('JWT_SECRET_KEY', 'jwt-secret-key-change-in-production')
    JWT_ACCESS_TOKEN_EXPIRES = timedelta(hours=24)
    CORS_ORIGINS = "*"
    
    # Railway用の設定
    PORT = int(os.getenv('PORT', 5000))

