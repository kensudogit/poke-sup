from flask import Blueprint, jsonify
from extensions import db
from sqlalchemy import text
from utils.logging import log_info, log_error
import requests
import os

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
    
    # Check frontend availability
    frontend_url = os.environ.get('FRONTEND_URL', 'http://localhost:3000')
    frontend_status = 'unknown'
    try:
        response = requests.get(frontend_url, timeout=2)
        if response.status_code == 200:
            frontend_status = 'healthy'
        else:
            frontend_status = f'unhealthy: status {response.status_code}'
    except requests.exceptions.ConnectionError:
        frontend_status = 'unhealthy: connection refused'
    except requests.exceptions.Timeout:
        frontend_status = 'unhealthy: timeout'
    except Exception as e:
        frontend_status = f'unhealthy: {str(e)}'
    
    return jsonify({
        'status': 'ok',
        'database': db_status,
        'frontend': frontend_status,
        'frontend_url': frontend_url,
        'service': 'poke-sup-backend'
    }), 200


