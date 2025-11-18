# /cmms-backend/app/api/asset_routes.py
from flask import Blueprint, request, jsonify
# PERBAIKAN: Impor ComponentItem (bukan Component)
from app.models import Asset, ComponentItem
from mongoengine.errors import NotUniqueError, DoesNotExist

assets_bp = Blueprint('assets_bp', __name__)

# --- GET: Mendapatkan SEMUA Aset ---
# Rute ini sekarang akan mengambil Aset DAN komponen-komponennya dari gudang
@assets_bp.route('/assets', methods=['GET'])
def get_assets():
    try:
        assets = Asset.objects()
        # .to_json() di models.py akan menangani populasi data komponen
        return jsonify([asset.to_json() for asset in assets]), 200
    except Exception as e:
        return jsonify({"error": str(e)}), 500

# --- POST: Membuat Aset BARU (Logika Baru) ---
# Rute ini sekarang menerima daftar ID Komponen dari frontend
@assets_bp.route('/assets', methods=['POST'])
def create_asset():
    try:
        data = request.get_json()
        
        if not data.get('name') or not data.get('machine_id'):
            return jsonify({"error": "Nama Mesin dan ID Mesin diperlukan"}), 400

        # --- LOGIKA BARU: Menghubungkan Komponen ---
        # Frontend sekarang mengirimkan 'component_ids' (array of string IDs)
        component_list = []
        if 'component_ids' in data and isinstance(data['component_ids'], list):
            for comp_id in data['component_ids']:
                try:
                    # Cari komponen di gudang
                    comp_item = ComponentItem.objects.get(id=comp_id)
                    component_list.append(comp_item) # Tambahkan referensi
                except DoesNotExist:
                    # Jika frontend mengirim ID komponen yang tidak ada di gudang
                    return jsonify({"error": f"Komponen dengan ID {comp_id} tidak ditemukan di gudang."}), 404
        # ----------------------------------------

        new_asset = Asset(
            name=data['name'],
            machine_id=data['machine_id'],
            location=data.get('location', ''),
            components=component_list # Simpan daftar referensi ke ComponentItem
        )
        
        new_asset.save()
        
        # Kembalikan Aset yang baru dibuat (to_json() akan mengisinya)
        return jsonify(new_asset.to_json()), 201 
        
    except NotUniqueError:
        return jsonify({"error": "ID Mesin sudah ada. Gunakan ID unik."}), 400
    except Exception as e:
        return jsonify({"error": str(e)}), 400