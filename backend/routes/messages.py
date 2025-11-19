from flask import Blueprint, request, jsonify
from flask_jwt_extended import jwt_required, get_jwt_identity
from extensions import db
from models import Message, Conversation, User
from datetime import datetime

messages_bp = Blueprint('messages', __name__)

@messages_bp.route('/conversation/<int:conversation_id>', methods=['GET'])
@jwt_required()
def get_messages(conversation_id):
    user_id = get_jwt_identity()
    conversation = Conversation.query.get(conversation_id)
    
    if not conversation:
        return jsonify({'error': 'Conversation not found'}), 404
    
    if conversation.patient_id != user_id and conversation.provider_id != user_id:
        return jsonify({'error': 'Unauthorized'}), 403
    
    messages = Message.query.filter_by(conversation_id=conversation_id).order_by(Message.created_at).all()
    
    return jsonify([msg.to_dict() for msg in messages]), 200

@messages_bp.route('', methods=['POST'])
@jwt_required()
def create_message():
    user_id = get_jwt_identity()
    data = request.get_json()
    
    conversation_id = data.get('conversation_id')
    content = data.get('content')
    
    if not conversation_id or not content:
        return jsonify({'error': 'conversation_id and content are required'}), 400
    
    conversation = Conversation.query.get(conversation_id)
    
    if not conversation:
        return jsonify({'error': 'Conversation not found'}), 404
    
    if conversation.patient_id != user_id and conversation.provider_id != user_id:
        return jsonify({'error': 'Unauthorized'}), 403
    
    message = Message(
        conversation_id=conversation_id,
        user_id=user_id,
        content=content
    )
    
    db.session.add(message)
    conversation.updated_at = datetime.utcnow()
    db.session.commit()
    
    return jsonify(message.to_dict()), 201

@messages_bp.route('/<int:message_id>', methods=['PUT'])
@jwt_required()
def update_message(message_id):
    user_id = get_jwt_identity()
    message = Message.query.get(message_id)
    
    if not message:
        return jsonify({'error': 'Message not found'}), 404
    
    if message.user_id != user_id:
        return jsonify({'error': 'Unauthorized'}), 403
    
    data = request.get_json()
    content = data.get('content')
    
    if not content:
        return jsonify({'error': 'content is required'}), 400
    
    message.content = content
    db.session.commit()
    
    return jsonify(message.to_dict()), 200

@messages_bp.route('/<int:message_id>', methods=['DELETE'])
@jwt_required()
def delete_message(message_id):
    user_id = get_jwt_identity()
    message = Message.query.get(message_id)
    
    if not message:
        return jsonify({'error': 'Message not found'}), 404
    
    if message.user_id != user_id:
        return jsonify({'error': 'Unauthorized'}), 403
    
    db.session.delete(message)
    db.session.commit()
    
    return jsonify({'message': 'Message deleted'}), 200

@messages_bp.route('/<int:message_id>/read', methods=['PUT'])
@jwt_required()
def mark_as_read(message_id):
    user_id = get_jwt_identity()
    message = Message.query.get(message_id)
    
    if not message:
        return jsonify({'error': 'Message not found'}), 404
    
    conversation = message.conversation
    if conversation.patient_id != user_id and conversation.provider_id != user_id:
        return jsonify({'error': 'Unauthorized'}), 403
    
    message.is_read = True
    db.session.commit()
    
    return jsonify(message.to_dict()), 200
