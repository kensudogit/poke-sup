from flask import Blueprint, request, jsonify
from flask_jwt_extended import jwt_required, get_jwt_identity
from extensions import db
from models import Conversation, User, UserRole

conversations_bp = Blueprint('conversations', __name__)

@conversations_bp.route('', methods=['GET'])
@jwt_required()
def get_conversations():
    user_id = get_jwt_identity()
    user = User.query.get(user_id)
    
    if not user:
        return jsonify({'error': 'User not found'}), 404
    
    # Get conversations where user is either patient or provider
    conversations = Conversation.query.filter(
        (Conversation.patient_id == user_id) | (Conversation.provider_id == user_id)
    ).all()
    
    # Add unread count to each conversation
    from models import Message
    result = []
    for conv in conversations:
        conv_dict = conv.to_dict()
        # Count unread messages (messages not from current user and not read)
        unread_count = Message.query.filter(
            Message.conversation_id == conv.id,
            Message.user_id != user_id,
            Message.is_read == False
        ).count()
        conv_dict['unread_count'] = unread_count
        result.append(conv_dict)
    
    return jsonify(result), 200

@conversations_bp.route('', methods=['POST'])
@jwt_required()
def create_conversation():
    user_id = get_jwt_identity()
    data = request.get_json()
    
    patient_id = data.get('patient_id')
    provider_id = data.get('provider_id')
    
    if not patient_id or not provider_id:
        return jsonify({'error': 'patient_id and provider_id are required'}), 400
    
    # Verify users exist and have correct roles
    patient = User.query.get(patient_id)
    provider = User.query.get(provider_id)
    
    if not patient or not provider:
        return jsonify({'error': 'Invalid user IDs'}), 400
    
    if patient.role != UserRole.PATIENT:
        return jsonify({'error': 'patient_id must be a patient'}), 400
    
    if provider.role != UserRole.HEALTHCARE_PROVIDER:
        return jsonify({'error': 'provider_id must be a healthcare provider'}), 400
    
    # Check if conversation already exists
    existing = Conversation.query.filter_by(
        patient_id=patient_id,
        provider_id=provider_id
    ).first()
    
    if existing:
        return jsonify(existing.to_dict()), 200
    
    conversation = Conversation(
        patient_id=patient_id,
        provider_id=provider_id
    )
    
    db.session.add(conversation)
    db.session.commit()
    
    return jsonify(conversation.to_dict()), 201

@conversations_bp.route('/<int:conversation_id>', methods=['GET'])
@jwt_required()
def get_conversation(conversation_id):
    user_id = get_jwt_identity()
    conversation = Conversation.query.get(conversation_id)
    
    if not conversation:
        return jsonify({'error': 'Conversation not found'}), 404
    
    if conversation.patient_id != user_id and conversation.provider_id != user_id:
        return jsonify({'error': 'Unauthorized'}), 403
    
    return jsonify(conversation.to_dict()), 200

