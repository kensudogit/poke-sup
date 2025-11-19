from flask import Flask
from flask_cors import CORS
from flask_socketio import SocketIO
from flask_jwt_extended import JWTManager
from config import Config
from extensions import db
from routes import register_routes
import eventlet
import os

eventlet.monkey_patch()

app = Flask(__name__)
app.config.from_object(Config)

# Initialize extensions
CORS(app, resources={r"/*": {"origins": "*"}})
db.init_app(app)
jwt = JWTManager(app)
socketio = SocketIO(app, cors_allowed_origins="*", async_mode='eventlet')

# Register routes
register_routes(app, socketio)

if __name__ == '__main__':
    with app.app_context():
        db.create_all()
    
    # Railway用のポート設定
    port = int(os.environ.get('PORT', 5000))
    debug = os.environ.get('FLASK_ENV') != 'production'
    
    socketio.run(app, host='0.0.0.0', port=port, debug=debug)

