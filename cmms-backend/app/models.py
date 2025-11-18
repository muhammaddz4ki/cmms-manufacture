# /cmms-backend/app/models.py
from . import db, bcrypt # Import bcrypt dari init
import datetime

# --- Sub-dokumen untuk Komponen ---
class Component(db.EmbeddedDocument):
# ... (Kode tetap sama) ...
    name = db.StringField(required=True)
    part_number = db.StringField()
    last_checked = db.DateTimeField()

# --- Model Utama Aset (Mesin Anda) ---
class Asset(db.Document):
# ... (Kode tetap sama) ...
    name = db.StringField(required=True)
    machine_id = db.StringField(unique=True, required=True)
    location = db.StringField()
    status = db.StringField(default='running')
    
    components = db.ListField(db.EmbeddedDocumentField(Component))
    maintenance_history = db.ListField(db.ReferenceField('WorkOrder'))
    
    def to_json(self):
        return {
            "id": str(self.id),
            "name": self.name,
            "machine_id": self.machine_id,
            "location": self.location,
            "status": self.status,
            "components": [c.name for c in self.components]
        }

# --- Model User (Diperbarui untuk Password) ---
class User(db.Document):
    name = db.StringField(required=True)
    email = db.StringField(unique=True, required=True)
    password = db.StringField(required=True) # <-- FIELD BARU
    role = db.StringField(default='technician')

    # Fungsi untuk melakukan hashing pada password sebelum disimpan
    def set_password(self, password):
        self.password = bcrypt.generate_password_hash(password).decode('utf-8')
    
    # Fungsi untuk memverifikasi password
    def check_password(self, password):
        return bcrypt.check_password_hash(self.password, password)

    def to_json(self):
        return {
            "id": str(self.id),
            "name": self.name,
            "email": self.email,
            "role": self.role
        }

# ... (Kode WorkOrder, MaintenanceSchedule, ComplianceLog tetap sama) ...
class WorkOrder(db.Document):
# ...
    title = db.StringField(required=True)
    description = db.StringField()
    status = db.StringField(default='open')
    priority = db.StringField(default='medium')
    type = db.StringField()
    component = db.StringField()
    asset = db.ReferenceField(Asset, required=True)
    assigned_to = db.ReferenceField(User)
    created_at = db.DateTimeField(default=datetime.datetime.utcnow)
    due_date = db.DateTimeField()
    completed_at = db.DateTimeField()

    def to_json(self):
        user_name = self.assigned_to.name if self.assigned_to else ""
        asset_name = self.asset.name if self.asset else "Aset Tidak Ditemukan"
        asset_id = str(self.asset.id) if self.asset else None
        
        return {
            "id": str(self.id),
            "title": self.title,
            "description": self.description,
            "status": self.status,
            "priority": self.priority,
            "type": self.type,
            "component": self.component,
            "asset_id": asset_id,
            "asset_name": asset_name,
            "assigned_to": user_name,
            "created_at": self.created_at.isoformat() if self.created_at else None,
            "due_date": self.due_date.isoformat() if self.due_date else None,
            "completed_at": self.completed_at.isoformat() if self.completed_at else None,
        }

class MaintenanceSchedule(db.Document):
    asset = db.ReferenceField(Asset, required=True)
    task_name = db.StringField()
    frequency = db.StringField()
    frequency_days = db.IntField()
    next_due_date = db.DateTimeField()
    description_template = db.StringField()
    component = db.StringField()

    def to_json(self):
        asset_name = self.asset.name if self.asset else "Aset Tidak Ditemukan"
        return {
            "id": str(self.id),
            "asset_id": str(self.asset.id),
            "asset_name": asset_name,
            "task_name": self.task_name,
            "frequency": self.frequency,
            "frequency_days": self.frequency_days,
            "next_due_date": self.next_due_date.isoformat() if self.next_due_date else None,
            "description_template": self.description_template,
            "component": self.component
        }

class ComplianceLog(db.Document):
    asset = db.ReferenceField(Asset, required=True)
    regulation_name = db.StringField()
    status = db.StringField(default='pending')
    next_check_due = db.DateTimeField()
    evidence_document_url = db.StringField()
    
    def to_json(self):
        asset_name = self.asset.name if self.asset else "Aset Tidak Ditemukan"
        return {
            "id": str(self.id),
            "asset_id": str(self.asset.id),
            "asset_name": asset_name,
            "regulation_name": self.regulation_name,
            "status": self.status,
            "next_check_due": self.next_check_due.isoformat() if self.next_check_due else None,
            "evidence_document_url": self.evidence_document_url,
        }