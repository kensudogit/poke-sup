from flask import Blueprint, request, jsonify
from flask_jwt_extended import jwt_required, get_jwt_identity
from extensions import db
from models import User, UserRole

users_bp = Blueprint('users', __name__)

@users_bp.route('', methods=['GET'])
@jwt_required()
def get_users():
    role = request.args.get('role')
    
    query = User.query
    
    if role:
        try:
            role_enum = UserRole[role.upper()]
            query = query.filter_by(role=role_enum)
        except KeyError:
            return jsonify({'error': 'Invalid role'}), 400
    
    users = query.all()
    
    return jsonify([user.to_dict() for user in users]), 200

@users_bp.route('/<int:user_id>', methods=['GET'])
@jwt_required()
def get_user(user_id):
    user = User.query.get(user_id)
    
    if not user:
        return jsonify({'error': 'User not found'}), 404
    
    return jsonify(user.to_dict()), 200


