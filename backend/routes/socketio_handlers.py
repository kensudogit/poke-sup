from flask_socketio import SocketIO, emit, join_room, leave_room
from flask_jwt_extended import decode_token
from flask import request
from extensions import db
from models import Message, Conversation

# Store user sessions
user_sessions = {}

def register_socketio_handlers(socketio: SocketIO):
    
    @socketio.on('connect')
    def handle_connect(auth):
        try:
            if not auth or 'token' not in auth:
                return False
            
            token = auth['token']
            decoded = decode_token(token)
            user_id = decoded['sub']
            
            # Store user_id in session
            user_sessions[request.sid] = user_id
            
            return True
        except Exception as e:
            print(f"Connection error: {e}")
            return False
    
    @socketio.on('disconnect')
    def handle_disconnect():
        # Remove user session
        if request.sid in user_sessions:
            del user_sessions[request.sid]
        print('Client disconnected')
    
    @socketio.on('join_conversation')
    def handle_join_conversation(data):
        try:
            user_id = user_sessions.get(request.sid)
            if not user_id:
                emit('error', {'message': 'Not authenticated'})
                return
            
            conversation_id = data.get('conversation_id')
            if not conversation_id:
                emit('error', {'message': 'conversation_id is required'})
                return
            
            conversation = Conversation.query.get(conversation_id)
            if not conversation:
                emit('error', {'message': 'Conversation not found'})
                return
            
            if conversation.patient_id != user_id and conversation.provider_id != user_id:
                emit('error', {'message': 'Unauthorized'})
                return
            
            room = f'conversation_{conversation_id}'
            join_room(room)
            emit('joined', {'conversation_id': conversation_id})
        except Exception as e:
            emit('error', {'message': str(e)})
    
    @socketio.on('leave_conversation')
    def handle_leave_conversation(data):
        try:
            conversation_id = data.get('conversation_id')
            if conversation_id:
                room = f'conversation_{conversation_id}'
                leave_room(room)
                emit('left', {'conversation_id': conversation_id})
        except Exception as e:
            emit('error', {'message': str(e)})
    
    @socketio.on('send_message')
    def handle_send_message(data):
        try:
            user_id = user_sessions.get(request.sid)
            if not user_id:
                emit('error', {'message': 'Not authenticated'})
                return
            
            conversation_id = data.get('conversation_id')
            content = data.get('content')
            
            if not conversation_id or not content:
                emit('error', {'message': 'conversation_id and content are required'})
                return
            
            conversation = Conversation.query.get(conversation_id)
            if not conversation:
                emit('error', {'message': 'Conversation not found'})
                return
            
            if conversation.patient_id != user_id and conversation.provider_id != user_id:
                emit('error', {'message': 'Unauthorized'})
                return
            
            message = Message(
                conversation_id=conversation_id,
                user_id=user_id,
                content=content
            )
            
            db.session.add(message)
            from datetime import datetime
            conversation.updated_at = datetime.utcnow()
            db.session.commit()
            
            room = f'conversation_{conversation_id}'
            emit('new_message', message.to_dict(), room=room)
            
        except Exception as e:
            emit('error', {'message': str(e)})

