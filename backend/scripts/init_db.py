"""
Initialize database with sample data
"""
import sys
import os

# Add parent directory to path
sys.path.insert(0, os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

from app import app
from extensions import db
from models import User, UserRole
from datetime import datetime, timedelta

def init_database():
    with app.app_context():
        # Create all tables
        db.create_all()
        
        # Check if users already exist
        if User.query.count() > 0:
            print("Database already initialized. Skipping...")
            return
        
        # Create sample patient
        patient = User(
            email='patient@example.com',
            name='テスト患者',
            role=UserRole.PATIENT,
            language='ja'
        )
        patient.set_password('password123')
        db.session.add(patient)
        
        # Create sample healthcare provider
        provider = User(
            email='provider@example.com',
            name='テスト医療従事者',
            role=UserRole.HEALTHCARE_PROVIDER,
            language='ja'
        )
        provider.set_password('password123')
        db.session.add(provider)
        
        # Create admin user
        admin = User(
            email='admin@example.com',
            name='管理者',
            role=UserRole.ADMIN,
            language='ja'
        )
        admin.set_password('password123')
        db.session.add(admin)
        
        db.session.commit()
        
        print("Database initialized successfully!")
        print("\nSample users created:")
        print("  Patient: patient@example.com / password123")
        print("  Provider: provider@example.com / password123")
        print("  Admin: admin@example.com / password123")

if __name__ == '__main__':
    init_database()

