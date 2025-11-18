# /cmms-backend/app/api/dashboard_routes.py
from flask import Blueprint, jsonify
from app.models import Asset, WorkOrder  # Impor model yang kita butuhkan

# Buat Blueprint baru
dashboard_bp = Blueprint('dashboard_bp', __name__)

# Rute ini akan menjadi /api/dashboard/stats
@dashboard_bp.route('/stats', methods=['GET'])
def get_dashboard_stats():
    try:
        # 1. Hitung total semua dokumen Aset
        total_assets = Asset.objects.count()
        
        # 2. Hitung semua WorkOrder yang statusnya 'open'
        open_work_orders = WorkOrder.objects(status='open').count()
        
        # 3. Hitung semua Aset yang statusnya 'down'
        down_assets = Asset.objects(status='down').count()
        
        # Siapkan data untuk dikirim sebagai JSON
        stats = {
            "total_assets": total_assets,
            "open_work_orders": open_work_orders,
            "down_assets": down_assets
        }
        
        return jsonify(stats), 200
    
    except Exception as e:
        # Tangani jika ada error saat query database
        return jsonify({"error": str(e)}), 500