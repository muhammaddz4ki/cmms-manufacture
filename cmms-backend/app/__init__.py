# /cmms-backend/app/__init__.py
from flask import Flask
from flask_mongoengine import MongoEngine
from flask_cors import CORS
from flask_bcrypt import Bcrypt # <-- IMPOR BARU
import os

# Inisialisasi Database
db = MongoEngine()
bcrypt = Bcrypt() # <-- INISIALISASI BARU

def create_app():
    app = Flask(__name__)
    
    # --- KONFIGURASI KONEKSI MONGODB LOKAL ---
    DB_USERNAME = "dzakiAdmin"
    DB_PASSWORD = "admin123"
    DB_NAME = "cmms_db"
    AUTH_DB = "admin"
    
    # SECRET_KEY diperlukan untuk Bcrypt dan session (gunakan string random yang panjang)
    app.config['SECRET_KEY'] = os.environ.get('SECRET_KEY', 'default_insecure_key_anda_harus_menggantinya')
    
    app.config['MONGODB_SETTINGS'] = {
        'db': DB_NAME,
        'host': f'mongodb://{DB_USERNAME}:{DB_PASSWORD}@localhost:27017/{DB_NAME}?authSource={AUTH_DB}'
    }
    
    # Inisialisasi DB dan Bcrypt dengan aplikasi Flask
    db.init_app(app)
    bcrypt.init_app(app) # <-- INISIALISASI BARU
    
    # Izinkan CORS dari React (port 3000 dan 5173)
    CORS(app, resources={r"/api/*": {"origins": ["http://localhost:3000", "http://localhost:5173"]}})

    # Daftarkan blueprint (rute) Anda
    
    # Rute Aset
    from .api.asset_routes import assets_bp
    app.register_blueprint(assets_bp, url_prefix='/api')
    
    # Rute Work Order
    from .api.wo_routes import wo_bp
    app.register_blueprint(wo_bp, url_prefix='/api')
    
    # Rute Schedule
    from .api.schedule_routes import schedule_bp
    app.register_blueprint(schedule_bp, url_prefix='/api')
    
    # Rute Dashboard
    from .api.dashboard_routes import dashboard_bp
    app.register_blueprint(dashboard_bp, url_prefix='/api/dashboard')
    
    # Rute Compliance
    from .api.compliance_routes import compliance_bp
    app.register_blueprint(compliance_bp, url_prefix='/api/compliance')
    
    # Rute User
    from .api.user_routes import user_bp
    app.register_blueprint(user_bp, url_prefix='/api')
    
    # --- RUTE AUTH BARU ---
    from .api.auth_routes import auth_bp
    app.register_blueprint(auth_bp, url_prefix='/api/auth')

    return app