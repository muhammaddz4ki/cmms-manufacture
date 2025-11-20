# /cmms-backend/app/models.py
from . import db, bcrypt
import datetime

# --- Sub-dokumen untuk Komponen ---
class Component(db.EmbeddedDocument):
    name = db.StringField(required=True)
    part_number = db.StringField()
    last_checked = db.DateTimeField()

# --- Model Inventaris Gudang ---
class ComponentItem(db.Document):
    name = db.StringField(required=True, unique=True)
    part_number = db.StringField()
    stock_quantity = db.IntField(default=0)
    location = db.StringField(default='Gudang Utama')

    def to_json(self):
        return {
            "id": str(self.id),
            "name": self.name,
            "part_number": self.part_number,
            "stock_quantity": self.stock_quantity,
            "location": self.location
        }

# --- Model Utama Aset (Mesin) ---
class Asset(db.Document):
    name = db.StringField(required=True)
    machine_id = db.StringField(unique=True, required=True)
    location = db.StringField()
    status = db.StringField(default='running')
    
    # --- FIELD BARU: Gambar Aset ---
    image = db.StringField() # Base64 string
    # -----------------------------

    components = db.ListField(db.ReferenceField(ComponentItem))
    maintenance_history = db.ListField(db.ReferenceField('WorkOrder'))
    
    def to_json(self):
        component_list = []
        for comp in self.components:
            if comp: 
                component_list.append({
                    "id": str(comp.id),
                    "name": comp.name,
                    "stock_quantity": comp.stock_quantity
                })
        return {
            "id": str(self.id),
            "name": self.name,
            "machine_id": self.machine_id,
            "location": self.location,
            "status": self.status,
            "image": self.image, # <-- Sertakan gambar di JSON
            "components": component_list 
        }

# --- Model User ---
class User(db.Document):
    name = db.StringField(required=True)
    email = db.StringField(unique=True, required=True)
    password = db.StringField(required=True) 
    role = db.StringField(default='technician')

    def set_password(self, password):
        self.password = bcrypt.generate_password_hash(password).decode('utf-8')
    
    def check_password(self, password):
        return bcrypt.check_password_hash(self.password, password)

    def to_json(self):
        return {
            "id": str(self.id),
            "name": self.name,
            "email": self.email,
            "role": self.role
        }

# --- Model Work Order ---
class WorkOrder(db.Document):
    title = db.StringField(required=True)
    description = db.StringField()
    status = db.StringField(default='open') 
    priority = db.StringField(default='medium')
    type = db.StringField()
    component = db.ReferenceField(ComponentItem) 
    asset = db.ReferenceField(Asset, required=True)
    assigned_to = db.ReferenceField(User)
    created_by_role = db.StringField() 
    evidence_image = db.StringField() 
    created_at = db.DateTimeField(default=datetime.datetime.utcnow)
    due_date = db.DateTimeField()
    completed_at = db.DateTimeField()

    def to_json(self):
        user_name = self.assigned_to.name if self.assigned_to else ""
        asset_name = self.asset.name if self.asset else "Aset Tidak Ditemukan"
        asset_id = str(self.asset.id) if self.asset else None
        component_name = self.component.name if self.component else ""
        component_id = str(self.component.id) if self.component else None
        
        return {
            "id": str(self.id),
            "title": self.title,
            "description": self.description,
            "status": self.status,
            "priority": self.priority,
            "type": self.type,
            "component_id": component_id,
            "component_name": component_name,
            "asset_id": asset_id,
            "asset_name": asset_name,
            "assigned_to": user_name,
            "created_by_role": self.created_by_role,
            "evidence_image": self.evidence_image,
            "created_at": self.created_at.isoformat() if self.created_at else None,
            "due_date": self.due_date.isoformat() if self.due_date else None,
            "completed_at": self.completed_at.isoformat() if self.completed_at else None,
        }

# --- Model Maintenance Schedule ---
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

# --- Model Compliance Log ---
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

# --- Model Template Aset ---
class AssetTemplate(db.Document):
    name = db.StringField(required=True, unique=True)
    components = db.ListField(db.ReferenceField(ComponentItem))

    def to_json(self):
        component_ids = [str(comp.id) for comp in self.components if comp]
        return {
            "id": str(self.id),
            "name": self.name,
            "component_ids": component_ids
        }