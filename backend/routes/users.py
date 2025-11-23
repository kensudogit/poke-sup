from flask import Blueprint, request, jsonify
from extensions import db
from models import User, UserRole

users_bp = Blueprint('users', __name__)

@users_bp.route('', methods=['GET'])
def get_users():
    role = request.args.get('role')
    
    query = User.query
    
    if role:
        try:
            # roleパラメータを正規化（healthcare_provider -> HEALTHCARE_PROVIDER）
            role_normalized = role.upper().replace('-', '_')
            # マッピング: healthcare_provider -> HEALTHCARE_PROVIDER
            role_mapping = {
                'HEALTHCARE_PROVIDER': UserRole.HEALTHCARE_PROVIDER,
                'HEALTHCARE': UserRole.HEALTHCARE_PROVIDER,
                'PROVIDER': UserRole.HEALTHCARE_PROVIDER,
                'PATIENT': UserRole.PATIENT,
                'ADMIN': UserRole.ADMIN,
            }
            
            if role_normalized in role_mapping:
                role_enum = role_mapping[role_normalized]
            else:
                role_enum = UserRole[role_normalized]
            
            query = query.filter_by(role=role_enum)
        except KeyError:
            return jsonify({'error': f'Invalid role: {role}'}), 400
    
    users = query.all()
    
    return jsonify([user.to_dict() for user in users]), 200

@users_bp.route('/<int:user_id>', methods=['GET'])
def get_user(user_id):
    user = User.query.get(user_id)
    
    if not user:
        return jsonify({'error': 'User not found'}), 404
    
    return jsonify(user.to_dict()), 200


