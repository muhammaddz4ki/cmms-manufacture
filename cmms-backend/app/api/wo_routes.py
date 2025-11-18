# /cmms-backend/app/api/wo_routes.py
from flask import Blueprint, request, jsonify, make_response
from app.models import WorkOrder, Asset, User
from mongoengine.errors import DoesNotExist
import datetime
import csv 
from io import StringIO, BytesIO
from reportlab.lib.pagesizes import letter
from reportlab.platypus import SimpleDocTemplate, Table, TableStyle, Paragraph
from reportlab.lib import colors
from reportlab.lib.styles import getSampleStyleSheet 

# Buat Blueprint baru
wo_bp = Blueprint('wo_bp', __name__)

# --- Fungsi Helper untuk mengambil data laporan ---
def calculate_asset_report_data():
    """Menghitung data statistik WO per aset."""
    all_wos = WorkOrder.objects().all()
    report_data = {}
    
    for wo in all_wos:
        # PERBAIKAN: Gunakan try/except untuk melewati WO yang tidak bisa diproses
        try:
            if not wo.asset: continue # Lewati jika aset hilang
            
            asset_id = str(wo.asset.id)
            asset_name = wo.asset.name
            status = wo.status
            
            if asset_id not in report_data:
                report_data[asset_id] = {
                    "asset_id": asset_id,
                    "asset_name": asset_name,
                    "open": 0,
                    "in_progress": 0,
                    "completed": 0,
                    "total_wo": 0
                }
            
            stats = report_data[asset_id]
            stats["total_wo"] += 1
            
            if status == 'open':
                stats["open"] += 1
            elif status == 'in_progress':
                stats["in_progress"] += 1
            elif status == 'completed':
                stats["completed"] += 1
        
        except Exception as e:
            # Jika WO tersebut korup, kita lewati dan lanjutkan
            print(f"Skipping corrupt WO in report calculation: {e}")
            continue

    return list(report_data.values())

# --- GET: Mendapatkan SEMUA Work Order (Hanya yang Aktif) ---
@wo_bp.route('/workorders', methods=['GET'])
def get_work_orders():
    try:
        wos_raw = WorkOrder.objects(status__ne='completed').order_by('status', '-created_at')
        
        safe_wos = []
        for wo in wos_raw:
            try:
                safe_wos.append(wo.to_json())
            except Exception:
                print(f"SKIPPING corrupted WO: {wo.id}")
                continue 
                
        return jsonify(safe_wos), 200
    except Exception as e:
        return jsonify({"error": str(e)}), 500

# --- GET: Mendapatkan History (WO Selesai) ---
@wo_bp.route('/workorders/history', methods=['GET'])
def get_work_order_history():
    try:
        wos_raw = WorkOrder.objects(status='completed').order_by('-completed_at')
        
        safe_wos = []
        for wo in wos_raw:
            try:
                safe_wos.append(wo.to_json())
            except Exception:
                print(f"SKIPPING corrupted history WO: {wo.id}")
                continue
                
        return jsonify(safe_wos), 200
    except Exception as e:
        return jsonify({"error": str(e)}), 500

# --- POST: Membuat Work Order BARU ---
@wo_bp.route('/workorders', methods=['POST'])
def create_work_order():
    try:
        data = request.get_json()
        
        if not data.get('title') or not data.get('asset_id') or not data.get('type'):
            return jsonify({"error": "Input tidak lengkap: title, asset_id, dan type diperlukan"}), 400

        try:
            asset = Asset.objects.get(id=data['asset_id'])
        except DoesNotExist:
            return jsonify({"error": "Aset tidak ditemukan"}), 404
        
        assigned_user = None
        if data.get('assigned_to_id'):
            try:
                assigned_user = User.objects.get(id=data['assigned_to_id'])
            except DoesNotExist:
                pass 

        new_wo = WorkOrder(
            title=data['title'],
            description=data.get('description', ''),
            priority=data.get('priority', 'medium'),
            type=data['type'],
            asset=asset,
            assigned_to=assigned_user,
            component=data.get('component', '') 
        )
        
        if data.get('due_date'):
            try:
                new_wo.due_date = datetime.datetime.fromisoformat(data['due_date'])
            except ValueError:
                return jsonify({"error": "Format due_date salah. Gunakan ISO format."}), 400

        new_wo.save()
        
        return jsonify(new_wo.to_json()), 201

    except Exception as e:
        return jsonify({"error": str(e)}), 400

# --- PATCH (Update) Work Order ---
@wo_bp.route('/workorders/<wo_id>', methods=['PATCH'])
def update_work_order(wo_id):
    try:
        data = request.get_json()
        
        wo = WorkOrder.objects.get(id=wo_id)
        
        # Izinkan update field umum
        if 'title' in data:
            wo.title = data['title']
        if 'description' in data:
            wo.description = data['description']
        if 'type' in data:
            wo.type = data['type']
        if 'priority' in data:
            wo.priority = data['priority']
        if 'component' in data:
            wo.component = data['component']
        
        if 'status' in data:
            allowed_statuses = ['open', 'in_progress', 'completed']
            if data['status'] not in allowed_statuses:
                return jsonify({"error": "Status tidak valid"}), 400
                
            wo.status = data['status']
            
            if data['status'] == 'completed':
                wo.completed_at = datetime.datetime.utcnow()
            elif wo.completed_at: 
                wo.completed_at = None 

        wo.save()
        
        return jsonify(wo.to_json()), 200

    except DoesNotExist:
        return jsonify({"error": "Work Order tidak ditemukan"}), 404
    except Exception as e:
        return jsonify({"error": str(e)}), 400

# --- DELETE (Hapus) Work Order ---
@wo_bp.route('/workorders/<wo_id>', methods=['DELETE'])
def delete_work_order(wo_id):
    try:
        wo = WorkOrder.objects.get(id=wo_id)
        wo.delete()
        return jsonify({"message": f"Work Order '{wo.title}' berhasil dihapus."}), 200
    except DoesNotExist:
        return jsonify({"error": "Work Order tidak ditemukan"}), 404
    except Exception as e:
        return jsonify({"error": str(e)}), 500

# --- GET Laporan Kinerja per Aset (Untuk Tampilan) ---
@wo_bp.route('/workorders/report/asset_stats', methods=['GET'])
def get_asset_report_stats():
    try:
        final_report = calculate_asset_report_data()
        return jsonify(final_report), 200

    except Exception as e:
        return jsonify({"error": str(e)}), 500

# --- Export Laporan ke CSV ---
@wo_bp.route('/workorders/report/export/csv', methods=['GET'])
def export_asset_report_csv():
    try:
        report_data = calculate_asset_report_data()
        
        if not report_data:
            return jsonify({"error": "Tidak ada data untuk diekspor"}), 404

        si = StringIO()
        cw = csv.writer(si)
        
        header = ['Asset_ID', 'Asset_Name', 'Total_WO', 'WO_Open', 'WO_In_Progress', 'WO_Completed']
        cw.writerow(header)
        
        for row in report_data:
            cw.writerow([
                row['asset_id'],
                row['asset_name'],
                row['total_wo'],
                row['open'],
                row['in_progress'],
                row['completed']
            ])

        response = make_response(si.getvalue())
        response.headers['Content-Disposition'] = 'attachment; filename=Laporan_Kinerja_Aset.csv'
        response.headers['Content-type'] = 'text/csv'
        
        return response

    except Exception as e:
        return jsonify({"error": str(e)}), 500
        
# --- Export Laporan ke PDF ---
@wo_bp.route('/workorders/report/export/pdf', methods=['GET'])
def export_asset_report_pdf():
    try:
        report_data = calculate_asset_report_data()
        
        if not report_data:
            return jsonify({"error": "Tidak ada data untuk diekspor"}), 404

        buffer = BytesIO()
        doc = SimpleDocTemplate(buffer, pagesize=letter)
        styles = getSampleStyleSheet()
        story = []

        story.append(Paragraph("Laporan Kinerja Work Order Per Aset", styles['Title']))
        story.append(Paragraph(f"Tanggal: {datetime.date.today().strftime('%d %B %Y')}", styles['Normal']))
        story.append(Paragraph("<br/>", styles['Normal']))

        data = [
            ['Nama Aset', 'Total WO', 'Open', 'In Progress', 'Completed']
        ]
        
        for row in report_data:
            data.append([
                row['asset_name'],
                row['total_wo'],
                row['open'],
                row['in_progress'],
                row['completed']
            ])

        table = Table(data)
        table.setStyle(TableStyle([
            ('BACKGROUND', (0, 0), (-1, 0), colors.HexColor('#F3F4F6')), 
            ('TEXTCOLOR', (0, 0), (-1, 0), colors.HexColor('#1F2937')), 
            ('ALIGN', (0, 0), (-1, -1), 'CENTER'),
            ('ALIGN', (0, 0), (0, -1), 'LEFT'), 
            ('GRID', (0, 0), (-1, -1), 0.5, colors.HexColor('#E5E7EB')),
            ('FONTNAME', (0, 0), (-1, 0), 'Helvetica-Bold'),
            ('BOTTOMPADDING', (0, 0), (-1, 0), 12),
            ('BACKGROUND', (0, 1), (-1, -1), colors.white),
        ]))
        
        story.append(table)
        
        doc.build(story)
        pdf_value = buffer.getvalue()
        buffer.close()
        
        response = make_response(pdf_value)
        response.headers['Content-Disposition'] = 'attachment; filename=Laporan_Kinerja_Aset.pdf'
        response.headers['Content-type'] = 'application/pdf'
        
        return response

    except Exception as e:
        return jsonify({"error": str(e)}), 500