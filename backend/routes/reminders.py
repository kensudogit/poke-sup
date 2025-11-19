from flask import Blueprint, request, jsonify
from flask_jwt_extended import jwt_required, get_jwt_identity
from extensions import db
from models import Reminder, User
from datetime import datetime

reminders_bp = Blueprint('reminders', __name__)

@reminders_bp.route('', methods=['GET'])
@jwt_required()
def get_reminders():
    user_id = get_jwt_identity()
    is_completed = request.args.get('is_completed')
    
    query = Reminder.query.filter_by(user_id=user_id)
    
    if is_completed is not None:
        query = query.filter_by(is_completed=is_completed.lower() == 'true')
    
    # Get upcoming reminders by default
    upcoming_only = request.args.get('upcoming_only', 'false').lower() == 'true'
    if upcoming_only:
        query = query.filter(Reminder.scheduled_at >= datetime.utcnow())
    
    reminders = query.order_by(Reminder.scheduled_at).all()
    
    return jsonify([reminder.to_dict() for reminder in reminders]), 200

@reminders_bp.route('', methods=['POST'])
@jwt_required()
def create_reminder():
    user_id = get_jwt_identity()
    data = request.get_json()
    
    required_fields = ['title', 'scheduled_at']
    if not all(field in data for field in required_fields):
        return jsonify({'error': 'title and scheduled_at are required'}), 400
    
    reminder = Reminder(
        user_id=user_id,
        title=data['title'],
        description=data.get('description'),
        reminder_type=data.get('reminder_type'),
        scheduled_at=datetime.fromisoformat(data['scheduled_at']),
        repeat_type=data.get('repeat_type', 'none'),
        repeat_interval=data.get('repeat_interval', 1),
        end_date=datetime.fromisoformat(data['end_date']) if data.get('end_date') else None
    )
    
    db.session.add(reminder)
    db.session.commit()
    
    return jsonify(reminder.to_dict()), 201

@reminders_bp.route('/<int:reminder_id>', methods=['PUT'])
@jwt_required()
def update_reminder(reminder_id):
    user_id = get_jwt_identity()
    reminder = Reminder.query.get(reminder_id)
    
    if not reminder:
        return jsonify({'error': 'Reminder not found'}), 404
    
    if reminder.user_id != user_id:
        return jsonify({'error': 'Unauthorized'}), 403
    
    data = request.get_json()
    
    if 'title' in data:
        reminder.title = data['title']
    if 'description' in data:
        reminder.description = data['description']
    if 'reminder_type' in data:
        reminder.reminder_type = data['reminder_type']
    if 'scheduled_at' in data:
        reminder.scheduled_at = datetime.fromisoformat(data['scheduled_at'])
    if 'is_completed' in data:
        reminder.is_completed = data['is_completed']
    if 'repeat_type' in data:
        reminder.repeat_type = data['repeat_type']
    if 'repeat_interval' in data:
        reminder.repeat_interval = data['repeat_interval']
    if 'end_date' in data:
        reminder.end_date = datetime.fromisoformat(data['end_date']) if data['end_date'] else None
    
    db.session.commit()
    
    return jsonify(reminder.to_dict()), 200

@reminders_bp.route('/<int:reminder_id>', methods=['DELETE'])
@jwt_required()
def delete_reminder(reminder_id):
    user_id = get_jwt_identity()
    reminder = Reminder.query.get(reminder_id)
    
    if not reminder:
        return jsonify({'error': 'Reminder not found'}), 404
    
    if reminder.user_id != user_id:
        return jsonify({'error': 'Unauthorized'}), 403
    
    db.session.delete(reminder)
    db.session.commit()
    
    return jsonify({'message': 'Reminder deleted'}), 200

@reminders_bp.route('/<int:reminder_id>/complete', methods=['PUT'])
@jwt_required()
def complete_reminder(reminder_id):
    user_id = get_jwt_identity()
    reminder = Reminder.query.get(reminder_id)
    
    if not reminder:
        return jsonify({'error': 'Reminder not found'}), 404
    
    if reminder.user_id != user_id:
        return jsonify({'error': 'Unauthorized'}), 403
    
    reminder.is_completed = True
    db.session.commit()
    
    return jsonify(reminder.to_dict()), 200

