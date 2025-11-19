from flask import Blueprint, request, jsonify
from flask_jwt_extended import jwt_required, get_jwt_identity
from extensions import db
from models import HealthGoal, HealthData
from datetime import datetime

health_goals_bp = Blueprint('health_goals', __name__)

@health_goals_bp.route('', methods=['GET'])
@jwt_required()
def get_health_goals():
    user_id = get_jwt_identity()
    goals = HealthGoal.query.filter_by(user_id=user_id).all()
    
    # Update current_value from latest health data
    for goal in goals:
        latest_data = HealthData.query.filter_by(
            user_id=user_id,
            data_type=goal.data_type
        ).order_by(HealthData.recorded_at.desc()).first()
        
        if latest_data:
            goal.current_value = latest_data.value
            # Check if goal is achieved
            goal.is_achieved = goal.current_value >= goal.target_value if goal.target_value > 0 else goal.current_value <= abs(goal.target_value)
            db.session.commit()
    
    return jsonify([goal.to_dict() for goal in goals]), 200

@health_goals_bp.route('', methods=['POST'])
@jwt_required()
def create_health_goal():
    user_id = get_jwt_identity()
    data = request.get_json()
    
    required_fields = ['data_type', 'target_value']
    if not all(field in data for field in required_fields):
        return jsonify({'error': 'data_type and target_value are required'}), 400
    
    goal = HealthGoal(
        user_id=user_id,
        data_type=data['data_type'],
        target_value=data['target_value'],
        unit=data.get('unit'),
        deadline=datetime.fromisoformat(data['deadline']) if data.get('deadline') else None
    )
    
    db.session.add(goal)
    db.session.commit()
    
    return jsonify(goal.to_dict()), 201

@health_goals_bp.route('/<int:goal_id>', methods=['PUT'])
@jwt_required()
def update_health_goal(goal_id):
    user_id = get_jwt_identity()
    goal = HealthGoal.query.get(goal_id)
    
    if not goal:
        return jsonify({'error': 'Goal not found'}), 404
    
    if goal.user_id != user_id:
        return jsonify({'error': 'Unauthorized'}), 403
    
    data = request.get_json()
    
    if 'target_value' in data:
        goal.target_value = data['target_value']
    if 'unit' in data:
        goal.unit = data['unit']
    if 'deadline' in data:
        goal.deadline = datetime.fromisoformat(data['deadline']) if data['deadline'] else None
    
    goal.updated_at = datetime.utcnow()
    db.session.commit()
    
    return jsonify(goal.to_dict()), 200

@health_goals_bp.route('/<int:goal_id>', methods=['DELETE'])
@jwt_required()
def delete_health_goal(goal_id):
    user_id = get_jwt_identity()
    goal = HealthGoal.query.get(goal_id)
    
    if not goal:
        return jsonify({'error': 'Goal not found'}), 404
    
    if goal.user_id != user_id:
        return jsonify({'error': 'Unauthorized'}), 403
    
    db.session.delete(goal)
    db.session.commit()
    
    return jsonify({'message': 'Goal deleted'}), 200


