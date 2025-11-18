// src/components/AssetWOChart.jsx
import React from 'react';
import { Bar } from 'react-chartjs-2';
import { Chart as ChartJS, CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend } from 'chart.js';

// Daftarkan komponen Chart.js yang dibutuhkan
ChartJS.register(CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend);

export default function AssetWOChart({ reportData }) {
    // reportData is expected to be [{asset_name, open, completed}, ...]

    const labels = reportData.map(item => item.asset_name);
    const openData = reportData.map(item => item.open);
    const completedData = reportData.map(item => item.completed);

    const data = {
        labels,
        datasets: [
            {
                label: 'WO Open',
                data: openData,
                backgroundColor: '#EF4444', // Red (Open)
            },
            {
                label: 'WO Completed',
                data: completedData,
                backgroundColor: '#10B981', // Green (Completed)
            },
        ],
    };

    const options = {
        responsive: true,
        plugins: {
            legend: { position: 'top' },
            title: { display: true, text: 'Total WO per Aset (Open vs. Completed)' }
        },
        scales: {
            x: { stacked: true },
            y: { stacked: true }
        }
    };

    if (labels.length === 0) {
        return <p className="text-center text-slate-500 p-8">Tidak ada Work Order tercatat untuk analisis aset.</p>;
    }

    return (
        <div className="p-4">
            <Bar data={data} options={options} />
        </div>
    );
}