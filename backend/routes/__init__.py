from flask_socketio import SocketIO
from .auth import auth_bp
from .conversations import conversations_bp
from .messages import messages_bp
from .health_data import health_data_bp
from .reminders import reminders_bp
from .users import users_bp
from .health import health_bp
from .health_goals import health_goals_bp

def register_routes(app, socketio: SocketIO):
    app.register_blueprint(health_bp, url_prefix='/api/health')
    app.register_blueprint(auth_bp, url_prefix='/api/auth')
    app.register_blueprint(conversations_bp, url_prefix='/api/conversations')
    app.register_blueprint(messages_bp, url_prefix='/api/messages')
    app.register_blueprint(health_data_bp, url_prefix='/api/health-data')
    app.register_blueprint(reminders_bp, url_prefix='/api/reminders')
    app.register_blueprint(users_bp, url_prefix='/api/users')
    app.register_blueprint(health_goals_bp, url_prefix='/api/health-goals')
    
    # Register socketio handlers
    from .socketio_handlers import register_socketio_handlers
    register_socketio_handlers(socketio)

