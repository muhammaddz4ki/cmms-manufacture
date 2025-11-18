# /cmms-backend/app/api/asset_routes.py
from flask import Blueprint, request, jsonify
from app.models import Asset, Component
import json
from mongoengine.errors import NotUniqueError # Import error

# Buat 'Blueprint' (sekelompok rute)
assets_bp = Blueprint('assets_bp', __name__)

# --- GET: Mendapatkan SEMUA Aset ---
# Rute ini menjadi /api/assets (karena prefix '/api' + rute '/assets')
@assets_bp.route('/assets', methods=['GET'])
def get_assets():
    try:
        assets = Asset.objects()
        # Konversi setiap aset ke format JSON pakai method to_json()
        return jsonify([asset.to_json() for asset in assets]), 200
    except Exception as e:
        return jsonify({"error": str(e)}), 500

# --- POST: Membuat Aset BARU ---
# Rute ini menjadi /api/assets
@assets_bp.route('/assets', methods=['POST'])
def create_asset():
    try:
        # Ambil data JSON yang dikirim oleh React
        data = request.get_json()
        
        # Siapkan daftar komponen (jika dikirim)
        component_list = []
        if 'components' in data and isinstance(data['components'], list):
            for comp_data in data['components']:
                component_list.append(Component(name=comp_data['name']))

        # Buat objek Aset baru
        new_asset = Asset(
            name=data['name'],
            machine_id=data['machine_id'],
            location=data['location'],
            components=component_list
        )
        
        # Simpan ke database MongoDB
        new_asset.save()
        
        return jsonify(new_asset.to_json()), 201 # 201 = Created
        
    except NotUniqueError:
        # Error jika machine_id sudah ada (duplikat)
        return jsonify({"error": "ID Mesin sudah ada. Gunakan ID unik."}), 400
    except Exception as e:
        return jsonify({"error": str(e)}), 400