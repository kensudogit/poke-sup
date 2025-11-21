from flask import Blueprint, jsonify
from extensions import db
from sqlalchemy import text
from utils.logging import log_info, log_error

health_bp = Blueprint('health', __name__)

@health_bp.route('', methods=['GET'])
def health_check():
    """Health check endpoint for Railway and monitoring"""
    try:
        # Check database connection
        db.session.execute(text('SELECT 1'))
        db_status = 'healthy'
        log_info("Health check passed", database="healthy")
    except Exception as e:
        db_status = f'unhealthy: {str(e)}'
        log_error("Health check failed", error=e, database="unhealthy")
    
    return jsonify({
        'status': 'ok',
        'database': db_status,
        'service': 'poke-sup-backend'
    }), 200


