from flask import Blueprint, request, jsonify
from extensions import db
from models import HealthData, User
from datetime import datetime
from utils import get_default_user_id

health_data_bp = Blueprint('health_data', __name__)

@health_data_bp.route('', methods=['GET'])
def get_health_data():
    user_id = get_default_user_id()
    data_type = request.args.get('data_type')
    
    query = HealthData.query.filter_by(user_id=user_id)
    
    if data_type:
        query = query.filter_by(data_type=data_type)
    
    # Get date range if provided
    start_date = request.args.get('start_date')
    end_date = request.args.get('end_date')
    
    if start_date:
        query = query.filter(HealthData.recorded_at >= datetime.fromisoformat(start_date))
    if end_date:
        query = query.filter(HealthData.recorded_at <= datetime.fromisoformat(end_date))
    
    health_data = query.order_by(HealthData.recorded_at.desc()).all()
    
    return jsonify([data.to_dict() for data in health_data]), 200

@health_data_bp.route('', methods=['POST'])
def create_health_data():
    user_id = get_default_user_id()
    data = request.get_json()
    
    required_fields = ['data_type', 'value']
    if not all(field in data for field in required_fields):
        return jsonify({'error': 'data_type and value are required'}), 400
    
    health_data = HealthData(
        user_id=user_id,
        data_type=data['data_type'],
        value=data['value'],
        unit=data.get('unit'),
        notes=data.get('notes'),
        recorded_at=datetime.fromisoformat(data['recorded_at']) if data.get('recorded_at') else datetime.utcnow()
    )
    
    db.session.add(health_data)
    db.session.commit()
    
    return jsonify(health_data.to_dict()), 201

@health_data_bp.route('/<int:data_id>', methods=['PUT'])
def update_health_data(data_id):
    user_id = get_default_user_id()
    health_data = HealthData.query.get(data_id)
    
    if not health_data:
        return jsonify({'error': 'Health data not found'}), 404
    
    if health_data.user_id != user_id:
        return jsonify({'error': 'Unauthorized'}), 403
    
    data = request.get_json()
    
    if 'value' in data:
        health_data.value = data['value']
    if 'unit' in data:
        health_data.unit = data['unit']
    if 'notes' in data:
        health_data.notes = data['notes']
    if 'recorded_at' in data:
        health_data.recorded_at = datetime.fromisoformat(data['recorded_at'])
    
    db.session.commit()
    
    return jsonify(health_data.to_dict()), 200

@health_data_bp.route('/<int:data_id>', methods=['DELETE'])
def delete_health_data(data_id):
    user_id = get_default_user_id()
    health_data = HealthData.query.get(data_id)
    
    if not health_data:
        return jsonify({'error': 'Health data not found'}), 404
    
    if health_data.user_id != user_id:
        return jsonify({'error': 'Unauthorized'}), 403
    
    db.session.delete(health_data)
    db.session.commit()
    
    return jsonify({'message': 'Health data deleted'}), 200


