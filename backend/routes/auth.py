from flask import Blueprint, request, jsonify
from flask_jwt_extended import create_access_token, jwt_required, get_jwt_identity
from extensions import db
from models import User, UserRole
from datetime import datetime
from utils.logging import log_info, log_error, log_warn

auth_bp = Blueprint('auth', __name__)

@auth_bp.route('/register', methods=['POST'])
def register():
    data = request.get_json()
    
    if not data or not data.get('email') or not data.get('password'):
        log_warn("Registration attempt with missing fields", email=data.get('email') if data else None)
        return jsonify({'error': 'Email and password are required'}), 400
    
    email = data['email']
    existing_user = User.query.filter_by(email=email).first()
    
    if existing_user:
        log_warn("Registration attempt with existing email", email=email)
        return jsonify({'error': 'User already exists'}), 400
    
    try:
        user = User(
            email=email,
            name=data.get('name', ''),
            role=UserRole[data.get('role', 'PATIENT').upper()],
            language=data.get('language', 'ja')
        )
        user.set_password(data['password'])
        
        db.session.add(user)
        db.session.commit()
        
        access_token = create_access_token(identity=user.id)
        
        log_info("User registered successfully", userId=user.id, email=email, role=user.role.value)
        
        return jsonify({
            'access_token': access_token,
            'user': user.to_dict()
        }), 201
    except Exception as e:
        log_error("Registration failed", error=e, email=email)
        db.session.rollback()
        return jsonify({'error': 'Registration failed'}), 500

@auth_bp.route('/login', methods=['POST'])
def login():
    data = request.get_json()
    
    if not data or not data.get('email') or not data.get('password'):
        log_warn("Login attempt with missing fields", email=data.get('email') if data else None)
        return jsonify({'error': 'Email and password are required'}), 400
    
    email = data['email']
    user = User.query.filter_by(email=email).first()
    
    if not user or not user.check_password(data['password']):
        log_warn("Login failed - invalid credentials", email=email, user_exists=user is not None)
        return jsonify({'error': 'Invalid credentials'}), 401
    
    access_token = create_access_token(identity=user.id)
    
    log_info("User logged in successfully", userId=user.id, email=email, role=user.role.value)
    
    return jsonify({
        'access_token': access_token,
        'user': user.to_dict()
    }), 200

@auth_bp.route('/me', methods=['GET'])
@jwt_required()
def get_current_user():
    user_id = get_jwt_identity()
    user = User.query.get(user_id)
    
    if not user:
        log_warn("Get current user failed - user not found", userId=user_id)
        return jsonify({'error': 'User not found'}), 404
    
    return jsonify(user.to_dict()), 200

@auth_bp.route('/update-profile', methods=['PUT'])
@jwt_required()
def update_profile():
    user_id = get_jwt_identity()
    user = User.query.get(user_id)
    
    if not user:
        log_warn("Update profile failed - user not found", userId=user_id)
        return jsonify({'error': 'User not found'}), 404
    
    try:
        data = request.get_json()
        
        if 'name' in data:
            user.name = data['name']
        if 'language' in data:
            user.language = data['language']
        
        user.updated_at = datetime.utcnow()
        db.session.commit()
        
        log_info("Profile updated", userId=user_id, updated_fields=list(data.keys()) if data else [])
        
        return jsonify(user.to_dict()), 200
    except Exception as e:
        log_error("Profile update failed", error=e, userId=user_id)
        db.session.rollback()
        return jsonify({'error': 'Profile update failed'}), 500


