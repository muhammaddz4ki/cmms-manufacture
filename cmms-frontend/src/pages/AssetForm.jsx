// src/pages/AssetForm.jsx
import React, { useState } from 'react';
import axios from 'axios';
import { Plus, Loader2 } from 'lucide-react';

// Variabel ini kita pindahkan ke sini
const API_BASE_URL = 'http://localhost:5000/api';
const machineComponents = {
  "Wheel Balancing Machine": [
    { "name": "Spindle Shaft" }, { "name": "Vibration Sensor" }, { "name": "Motor Rotasi" }, 
    { "name": "Wheel Clamp / Cone" }, { "name": "Display Panel" }, { "name": "Calibration Weight" },
    { "name": "Drive Belt" }, { "name": "Control Unit" }, { "name": "Electrical Wiring System" },
    { "name": "Rubber Foot Support / Stabilizer" }
  ],
  "Automatic Screw Tightening Machine": [
    { "name": "Screw Feeder" }, { "name": "Screwdriver Motor" }, { "name": "Torque Sensor" },
    { "name": "Guiding Tube" }, { "name": "Air Cylinder" }, { "name": "Vibratory Bowl Feeder" },
    { "name": "Controller Unit" }, { "name": "Frame Stand" }, { "name": "Reset Button" },
    { "name": "Safety Cover" }
  ],
  "Engine Block Honing Machine": [
    { "name": "Honing Head" }, { "name": "Hydraulic Motor" }, { "name": "Coolant Pump" },
    { "name": "Linear Guide" }, { "name": "Feed Mechanism" }, { "name": "Honing Stone / Abrasive" },
    { "name": "Control Panel" }, { "name": "Pressure Regulator" }, { "name": "Flow Meter" },
    { "name": "Power Wiring System" }
  ],
  "Press Stamping 400 Ton": [
    { "name": "Main Cylinder" }, { "name": "Upper Die" }, { "name": "Lower Die" },
    { "name": "Hydraulic Pump" }, { "name": "Motor Drive" }, { "name": "Cooling Unit" },
    { "name": "Die Alignment Guide" }, { "name": "Safety Guard / Light Curtain" },
    { "name": "Pressure Sensor" }, { "name": "Electrical Cabinet" }
  ]
};

export default function AssetForm({ onAssetCreated }) {
  const [name, setName] = useState("Wheel Balancing Machine");
  const [machineId, setMachineId] = useState("");
  const [location, setLocation] = useState("");
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(null);
    setSuccess(null);
    setIsSubmitting(true);

    const assetData = {
      name: name,
      machine_id: machineId,
      location: location,
      components: machineComponents[name] || [] 
    };

    try {
      const response = await axios.post(`${API_BASE_URL}/assets`, assetData);
      onAssetCreated(response.data);
      setSuccess(`Aset "${response.data.name}" berhasil disimpan.`);
      setMachineId("");
      setLocation("");
    } catch (err) {
      if (err.response && err.response.data && err.response.data.error) {
        setError(err.response.data.error);
      } else {
        setError("Gagal menyimpan aset. Cek koneksi server.");
      }
      console.error(err);
    }
    setIsSubmitting(false);
  };

  return (
    <div className="bg-white p-6 rounded-lg shadow-md">
      <h2 className="text-2xl font-semibold mb-4">Tambah Aset Baru</h2>
      
      {error && <div className="mb-4 p-3 bg-red-100 text-red-700 rounded-md">{error}</div>}
      {success && <div className="mb-4 p-3 bg-green-100 text-green-700 rounded-md">{success}</div>}
      
      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div>
            <label htmlFor="assetName" className="block text-sm font-medium text-slate-700 mb-1">Nama Mesin</label>
            <select 
              id="assetName"
              value={name} 
              onChange={e => setName(e.target.value)} 
              className="w-full px-3 py-2 border border-slate-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
            >
              <option value="Wheel Balancing Machine">Wheel Balancing Machine</option>
              <option value="Automatic Screw Tightening Machine">Automatic Screw Tightening Machine</option>
              <option value="Engine Block Honing Machine">Engine Block Honing Machine</option>
              <option value="Press Stamping 400 Ton">Press Stamping 400 Ton</option>
            </select>
          </div>
          
          <div>
            <label htmlFor="machineId" className="block text-sm font-medium text-slate-700 mb-1">ID Mesin (Unik)</label>
            <input 
              type="text" 
              id="machineId"
              value={machineId} 
              onChange={e => setMachineId(e.target.value)} 
              placeholder="Contoh: WB-001"
              required 
              className="w-full px-3 py-2 border border-slate-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
            />
          </div>
          
          <div>
            <label htmlFor="location" className="block text-sm font-medium text-slate-700 mb-1">Lokasi</label>
            <input 
              type="text" 
              id="location"
              value={location} 
              onChange={e => setLocation(e.target.value)} 
              placeholder="Contoh: Area Balancing"
              className="w-full px-3 py-2 border border-slate-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
            />
          </div>
        </div>
        
        <div className="text-right">
          <button 
            type="submit" 
            disabled={isSubmitting}
            className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50"
          >
            {isSubmitting ? (
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            ) : (
              <Plus className="mr-2 h-4 w-4" />
            )}
            {isSubmitting ? 'Menyimpan...' : 'Simpan Aset'}
          </button>
        </div>
      </form>
    </div>
  );
}