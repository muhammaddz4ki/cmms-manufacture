# /cmms-backend/app/api/dashboard_routes.py
from flask import Blueprint, jsonify
from app.models import Asset, WorkOrder, MaintenanceSchedule, ComponentItem
import datetime

dashboard_bp = Blueprint('dashboard_bp', __name__)

@dashboard_bp.route('/stats', methods=['GET'])
def get_dashboard_stats():
    try:
        # --- 1. Statistik Aset ---
        total_assets = Asset.objects.count()
        down_assets = Asset.objects(status='down').count()
        
        # --- 2. Statistik Inventaris (NEW) ---
        total_components = ComponentItem.objects.count()
        # Hitung komponen dengan stok < 5
        low_stock_components = ComponentItem.objects(stock_quantity__lt=5).count()
        
        # --- 3. Statistik WO ---
        open_wo = WorkOrder.objects(status='open').count()
        in_progress_wo = WorkOrder.objects(status='in_progress').count()
        pending_verif_wo = WorkOrder.objects(status='pending_verification').count()
        completed_wo = WorkOrder.objects(status='completed').count()
        
        # --- 4. Jadwal Perawatan Mendekati (7 Hari Kedepan) ---
        today = datetime.datetime.utcnow()
        next_week = today + datetime.timedelta(days=7)
        
        upcoming_schedules_raw = MaintenanceSchedule.objects(
            next_due_date__gte=today, 
            next_due_date__lte=next_week
        ).order_by('next_due_date')
        
        upcoming_schedules = []
        for sch in upcoming_schedules_raw:
            delta = sch.next_due_date - today
            days_left = delta.days + 1 
            
            upcoming_schedules.append({
                "id": str(sch.id),
                "task_name": sch.task_name,
                "asset_name": sch.asset.name if sch.asset else "Unknown Asset",
                "due_date": sch.next_due_date.isoformat(),
                "days_left": days_left,
                "priority": "high" if days_left <= 3 else "medium"
            })

        # --- 5. List WO Verifikasi ---
        verification_list_raw = WorkOrder.objects(status='pending_verification').order_by('created_at').limit(5)
        verification_list = []
        for wo in verification_list_raw:
            verification_list.append({
                "id": str(wo.id),
                "title": wo.title,
                "asset_name": wo.asset.name if wo.asset else "Unknown",
                "technician": wo.assigned_to.name if wo.assigned_to else "Unassigned",
                "completed_at": wo.completed_at.isoformat() if wo.completed_at else None
            })

        stats = {
            "total_assets": total_assets,
            "down_assets": down_assets,
            
            # Inventory Data (NEW)
            "total_components": total_components,
            "low_stock_components": low_stock_components,

            "open_work_orders": open_wo,
            "in_progress_work_orders": in_progress_wo,
            "pending_verification_orders": pending_verif_wo,
            "completed_work_orders": completed_wo,
            "total_work_orders": open_wo + in_progress_wo + pending_verif_wo + completed_wo,

            "upcoming_schedules": upcoming_schedules,
            "verification_needed_list": verification_list
        }
        
        return jsonify(stats), 200
    
    except Exception as e:
        return jsonify({"error": str(e)}), 500