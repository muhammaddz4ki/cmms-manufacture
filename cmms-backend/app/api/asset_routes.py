# /cmms-backend/app/api/asset_routes.py
from flask import Blueprint, request, jsonify
from app.models import Asset, ComponentItem
from mongoengine.errors import NotUniqueError, DoesNotExist

assets_bp = Blueprint('assets_bp', __name__)

# --- GET: Mendapatkan SEMUA Aset ---
@assets_bp.route('/assets', methods=['GET'])
def get_assets():
    try:
        assets = Asset.objects()
        return jsonify([asset.to_json() for asset in assets]), 200
    except Exception as e:
        return jsonify({"error": str(e)}), 500

# --- POST: Membuat Aset BARU ---
@assets_bp.route('/assets', methods=['POST'])
def create_asset():
    try:
        data = request.get_json()
        
        if not data.get('name') or not data.get('machine_id'):
            return jsonify({"error": "Nama Mesin dan ID Mesin diperlukan"}), 400

        component_list = []
        if 'component_ids' in data and isinstance(data['component_ids'], list):
            for comp_id in data['component_ids']:
                try:
                    comp_item = ComponentItem.objects.get(id=comp_id)
                    component_list.append(comp_item)
                except DoesNotExist:
                    return jsonify({"error": f"Komponen dengan ID {comp_id} tidak ditemukan."}), 404

        new_asset = Asset(
            name=data['name'],
            machine_id=data['machine_id'],
            location=data.get('location', ''),
            # --- SIMPAN GAMBAR ---
            image=data.get('image', ''), 
            # ---------------------
            components=component_list
        )
        
        new_asset.save()
        return jsonify(new_asset.to_json()), 201 
        
    except NotUniqueError:
        return jsonify({"error": "ID Mesin sudah ada. Gunakan ID unik."}), 400
    except Exception as e:
        return jsonify({"error": str(e)}), 400

# --- PATCH (Edit) Aset ---
@assets_bp.route('/assets/<asset_id>', methods=['PATCH'])
def update_asset(asset_id):
    try:
        data = request.get_json()
        asset = Asset.objects.get(id=asset_id)

        if 'name' in data:
            asset.name = data['name']
        if 'machine_id' in data:
            if data['machine_id'] != asset.machine_id:
                if Asset.objects(machine_id=data['machine_id']).first():
                    return jsonify({"error": "ID Mesin sudah digunakan."}), 400
            asset.machine_id = data['machine_id']
        if 'location' in data:
            asset.location = data['location']
        if 'status' in data:
            asset.status = data['status']
        
        # --- UPDATE GAMBAR ---
        if 'image' in data:
            asset.image = data['image']
        # ---------------------
        
        # Update Komponen
        if 'component_ids' in data:
            component_list = []
            for comp_id in data['component_ids']:
                try:
                    comp_item = ComponentItem.objects.get(id=comp_id)
                    component_list.append(comp_item)
                except DoesNotExist:
                    continue 
            asset.components = component_list

        asset.save()
        return jsonify(asset.to_json()), 200

    except DoesNotExist:
        return jsonify({"error": "Aset tidak ditemukan"}), 404
    except Exception as e:
        return jsonify({"error": str(e)}), 500

# --- DELETE (Hapus) Aset ---
@assets_bp.route('/assets/<asset_id>', methods=['DELETE'])
def delete_asset(asset_id):
    try:
        asset = Asset.objects.get(id=asset_id)
        asset.delete()
        return jsonify({"message": f"Aset '{asset.name}' berhasil dihapus."}), 200
    except DoesNotExist:
        return jsonify({"error": "Aset tidak ditemukan"}), 404
    except Exception as e:
        return jsonify({"error": str(e)}), 500