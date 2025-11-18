# /cmms-backend/app/api/schedule_routes.py
from flask import Blueprint, request, jsonify
from app.models import MaintenanceSchedule, Asset
from mongoengine.errors import DoesNotExist
import datetime

# Buat Blueprint baru
schedule_bp = Blueprint('schedule_bp', __name__)

# --- GET: Mendapatkan SEMUA Jadwal (dengan Iterasi Aman) ---
@schedule_bp.route('/schedules', methods=['GET'])
def get_schedules():
    try:
        schedules_raw = MaintenanceSchedule.objects().order_by('next_due_date')
        
        safe_schedules = []
        for s in schedules_raw:
            try:
                # Periksa apakah to_json() berhasil. Jika tidak, blok except akan menangkapnya.
                safe_schedules.append(s.to_json())
            except Exception:
                # Jika satu jadwal korup (misal: referensi aset hilang), kita lewati
                print(f"SKIPPING corrupted schedule: {s.id}")
                continue 
                
        return jsonify(safe_schedules), 200
    except Exception as e:
        return jsonify({"error": str(e)}), 500

# --- POST: Membuat Jadwal BARU ---
@schedule_bp.route('/schedules', methods=['POST'])
def create_schedule():
    try:
        data = request.get_json()
        
        if not data.get('asset_id') or not data.get('task_name') or not data.get('frequency_days'):
            return jsonify({"error": "Input tidak lengkap: asset_id, task_name, dan frequency_days diperlukan"}), 400

        # Cari Aset
        try:
            asset = Asset.objects.get(id=data['asset_id'])
        except DoesNotExist:
            return jsonify({"error": "Aset tidak ditemukan"}), 404

        # Validasi Frekuensi
        try:
            days = int(data['frequency_days'])
            if days <= 0:
                raise ValueError("Hari harus lebih dari 0")
        except (ValueError, TypeError):
             return jsonify({"error": "frequency_days harus angka positif"}), 400
        
        # Hitung Tanggal Jatuh Tempo
        start_date_str = data.get('start_date')
        if start_date_str:
             start_date = datetime.datetime.fromisoformat(start_date_str)
        else:
             start_date = datetime.datetime.utcnow()

        next_due = start_date + datetime.timedelta(days=days)

        # Buat objek Jadwal baru
        new_schedule = MaintenanceSchedule(
            asset=asset,
            task_name=data['task_name'],
            frequency=data.get('frequency', f'Setiap {days} hari'), # Teks deskriptif
            frequency_days=days,
            next_due_date=next_due,
            description_template=data.get('description_template', ''),
            component=data.get('component', '') # Simpan komponen yang dipilih
        )
        
        new_schedule.save()
        
        return jsonify(new_schedule.to_json()), 201

    except Exception as e:
        return jsonify({"error": str(e)}), 400

# --- DELETE schedule tetap sama ---
@schedule_bp.route('/schedules/<schedule_id>', methods=['DELETE'])
def delete_schedule(schedule_id):
    try:
        schedule = MaintenanceSchedule.objects.get(id=schedule_id)
        schedule.delete()
        return jsonify({"message": f"Jadwal '{schedule.task_name}' berhasil dihapus."}), 200

    except DoesNotExist:
        return jsonify({"error": "Jadwal tidak ditemukan"}), 404
    except Exception as e:
        return jsonify({"error": str(e)}), 500