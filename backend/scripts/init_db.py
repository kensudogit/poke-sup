"""
Initialize database with sample data
"""
import sys
import os

# Add parent directory to path
sys.path.insert(0, os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

from app import app
from extensions import db
from models import (
    User, UserRole, Conversation, Message, 
    HealthData, Reminder, HealthGoal
)
from datetime import datetime, timedelta

def init_database():
    with app.app_context():
        # Create all tables
        db.create_all()
        
        # Check if users already exist
        if User.query.count() > 0:
            print("Database already initialized. Skipping...")
            return
        
        # Create sample patients
        patient1 = User(
            email='patient@example.com',
            name='テスト患者',
            role=UserRole.PATIENT,
            language='ja'
        )
        patient1.set_password('password123')
        db.session.add(patient1)
        
        patient2 = User(
            email='patient2@example.com',
            name='山田太郎',
            role=UserRole.PATIENT,
            language='ja'
        )
        patient2.set_password('password123')
        db.session.add(patient2)
        
        # Create sample healthcare providers
        provider1 = User(
            email='provider@example.com',
            name='テスト医療従事者',
            role=UserRole.HEALTHCARE_PROVIDER,
            language='ja'
        )
        provider1.set_password('password123')
        db.session.add(provider1)
        
        provider2 = User(
            email='doctor@example.com',
            name='佐藤医師',
            role=UserRole.HEALTHCARE_PROVIDER,
            language='ja'
        )
        provider2.set_password('password123')
        db.session.add(provider2)
        
        provider3 = User(
            email='nurse@example.com',
            name='鈴木看護師',
            role=UserRole.HEALTHCARE_PROVIDER,
            language='ja'
        )
        provider3.set_password('password123')
        db.session.add(provider3)
        
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
        
        # Create conversations
        conversation1 = Conversation(
            patient_id=patient1.id,
            provider_id=provider1.id
        )
        db.session.add(conversation1)
        
        conversation2 = Conversation(
            patient_id=patient1.id,
            provider_id=provider2.id
        )
        db.session.add(conversation2)
        
        db.session.commit()
        
        # Create messages
        messages_data = [
            {
                'conversation_id': conversation1.id,
                'user_id': patient1.id,
                'content': 'こんにちは、体調について相談があります。',
                'created_at': datetime.utcnow() - timedelta(days=2)
            },
            {
                'conversation_id': conversation1.id,
                'user_id': provider1.id,
                'content': 'はい、どのような症状でしょうか？',
                'created_at': datetime.utcnow() - timedelta(days=2, hours=1),
                'is_read': True
            },
            {
                'conversation_id': conversation1.id,
                'user_id': patient1.id,
                'content': '最近、頭痛が続いています。',
                'created_at': datetime.utcnow() - timedelta(days=1)
            },
            {
                'conversation_id': conversation2.id,
                'user_id': patient1.id,
                'content': '定期健診の予約をお願いします。',
                'created_at': datetime.utcnow() - timedelta(days=3)
            },
            {
                'conversation_id': conversation2.id,
                'user_id': provider2.id,
                'content': '承知いたしました。来週の火曜日はいかがでしょうか？',
                'created_at': datetime.utcnow() - timedelta(days=2),
                'is_read': False
            }
        ]
        
        for msg_data in messages_data:
            message = Message(
                conversation_id=msg_data['conversation_id'],
                user_id=msg_data['user_id'],
                content=msg_data['content'],
                is_read=msg_data.get('is_read', False),
                created_at=msg_data.get('created_at', datetime.utcnow())
            )
            db.session.add(message)
        
        db.session.commit()
        
        # Create health data
        health_data_list = [
            {
                'user_id': patient1.id,
                'data_type': 'blood_pressure',
                'value': 120.0,
                'unit': 'mmHg',
                'notes': '朝の測定',
                'recorded_at': datetime.utcnow() - timedelta(days=1)
            },
            {
                'user_id': patient1.id,
                'data_type': 'blood_pressure',
                'value': 118.0,
                'unit': 'mmHg',
                'notes': '夜の測定',
                'recorded_at': datetime.utcnow() - timedelta(days=1, hours=12)
            },
            {
                'user_id': patient1.id,
                'data_type': 'weight',
                'value': 65.5,
                'unit': 'kg',
                'notes': '朝の体重',
                'recorded_at': datetime.utcnow() - timedelta(days=2)
            },
            {
                'user_id': patient1.id,
                'data_type': 'weight',
                'value': 65.2,
                'unit': 'kg',
                'notes': '朝の体重',
                'recorded_at': datetime.utcnow() - timedelta(days=1)
            },
            {
                'user_id': patient1.id,
                'data_type': 'blood_sugar',
                'value': 95.0,
                'unit': 'mg/dL',
                'notes': '空腹時',
                'recorded_at': datetime.utcnow() - timedelta(days=1, hours=8)
            },
            {
                'user_id': patient1.id,
                'data_type': 'temperature',
                'value': 36.5,
                'unit': '°C',
                'notes': '朝の体温',
                'recorded_at': datetime.utcnow() - timedelta(days=1, hours=7)
            },
            {
                'user_id': patient1.id,
                'data_type': 'blood_pressure',
                'value': 125.0,
                'unit': 'mmHg',
                'notes': '朝の測定',
                'recorded_at': datetime.utcnow() - timedelta(hours=2)
            }
        ]
        
        for data in health_data_list:
            health_data = HealthData(
                user_id=data['user_id'],
                data_type=data['data_type'],
                value=data['value'],
                unit=data.get('unit'),
                notes=data.get('notes'),
                recorded_at=data.get('recorded_at', datetime.utcnow())
            )
            db.session.add(health_data)
        
        db.session.commit()
        
        # Create reminders
        reminders_data = [
            {
                'user_id': patient1.id,
                'title': '薬を飲む',
                'description': '朝食後に血圧の薬を飲む',
                'reminder_type': 'medication',
                'scheduled_at': datetime.utcnow() + timedelta(hours=2),
                'is_completed': False,
                'repeat_type': 'daily',
                'repeat_interval': 1
            },
            {
                'user_id': patient1.id,
                'title': '定期健診',
                'description': '病院での定期健診',
                'reminder_type': 'appointment',
                'scheduled_at': datetime.utcnow() + timedelta(days=7),
                'is_completed': False,
                'repeat_type': 'none'
            },
            {
                'user_id': patient1.id,
                'title': '運動する',
                'description': '30分のウォーキング',
                'reminder_type': 'exercise',
                'scheduled_at': datetime.utcnow() + timedelta(hours=18),
                'is_completed': False,
                'repeat_type': 'daily',
                'repeat_interval': 1
            },
            {
                'user_id': patient1.id,
                'title': '血圧を測定する',
                'description': '朝と夜の血圧測定',
                'reminder_type': 'other',
                'scheduled_at': datetime.utcnow() + timedelta(hours=12),
                'is_completed': False,
                'repeat_type': 'daily',
                'repeat_interval': 1
            }
        ]
        
        for reminder_data in reminders_data:
            reminder = Reminder(
                user_id=reminder_data['user_id'],
                title=reminder_data['title'],
                description=reminder_data.get('description'),
                reminder_type=reminder_data.get('reminder_type'),
                scheduled_at=reminder_data['scheduled_at'],
                is_completed=reminder_data.get('is_completed', False),
                repeat_type=reminder_data.get('repeat_type', 'none'),
                repeat_interval=reminder_data.get('repeat_interval', 1)
            )
            db.session.add(reminder)
        
        db.session.commit()
        
        # Create health goals
        goals_data = [
            {
                'user_id': patient1.id,
                'data_type': 'weight',
                'target_value': 60.0,
                'current_value': 65.2,
                'unit': 'kg',
                'deadline': datetime.utcnow() + timedelta(days=90),
                'is_achieved': False
            },
            {
                'user_id': patient1.id,
                'data_type': 'blood_pressure',
                'target_value': 120.0,
                'current_value': 125.0,
                'unit': 'mmHg',
                'deadline': datetime.utcnow() + timedelta(days=60),
                'is_achieved': False
            },
            {
                'user_id': patient1.id,
                'data_type': 'blood_sugar',
                'target_value': 100.0,
                'current_value': 95.0,
                'unit': 'mg/dL',
                'deadline': datetime.utcnow() + timedelta(days=30),
                'is_achieved': True
            }
        ]
        
        for goal_data in goals_data:
            goal = HealthGoal(
                user_id=goal_data['user_id'],
                data_type=goal_data['data_type'],
                target_value=goal_data['target_value'],
                current_value=goal_data.get('current_value'),
                unit=goal_data.get('unit'),
                deadline=goal_data.get('deadline'),
                is_achieved=goal_data.get('is_achieved', False)
            )
            db.session.add(goal)
        
        db.session.commit()
        
        print("Database initialized successfully!")
        print("\nSample users created:")
        print("  Patient 1: patient@example.com / password123")
        print("  Patient 2: patient2@example.com / password123")
        print("  Provider 1: provider@example.com / password123")
        print("  Provider 2: doctor@example.com / password123")
        print("  Provider 3: nurse@example.com / password123")
        print("  Admin: admin@example.com / password123")
        print("\nSample data created:")
        print(f"  - {Conversation.query.count()} conversations")
        print(f"  - {Message.query.count()} messages")
        print(f"  - {HealthData.query.count()} health data entries")
        print(f"  - {Reminder.query.count()} reminders")
        print(f"  - {HealthGoal.query.count()} health goals")

if __name__ == '__main__':
    init_database()

