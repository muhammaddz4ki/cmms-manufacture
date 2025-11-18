// src/components/StatusChart.jsx
import React from 'react';
import { Doughnut } from 'react-chartjs-2';
import { Chart as ChartJS, ArcElement, Tooltip, Legend } from 'chart.js';

// Daftarkan komponen Chart.js yang dibutuhkan
ChartJS.register(ArcElement, Tooltip, Legend);

export default function StatusChart({ open, inProgress, completed }) {
    const total = open + inProgress + completed;

    // Data untuk Doughnut Chart
    const data = {
        labels: ['Open', 'In Progress', 'Completed'],
        datasets: [
            {
                data: [open, inProgress, completed],
                backgroundColor: [
                    '#EF4444', // Red-500 (Open)
                    '#F59E0B', // Amber-500 (In Progress)
                    '#10B981', // Green-500 (Completed)
                ],
                borderColor: [
                    '#fff',
                    '#fff',
                    '#fff',
                ],
                borderWidth: 2,
            },
        ],
    };

    // Opsi Chart
    const options = {
        responsive: true,
        plugins: {
            legend: {
                position: 'right',
                labels: {
                    usePointStyle: true,
                    boxWidth: 8,
                }
            },
            title: {
                display: true,
                text: 'Persentase Status Work Order',
                padding: {
                    top: 10,
                    bottom: 10
                },
                font: {
                    size: 16
                }
            }
        }
    };

    return (
        <div className="p-4">
            <div className="mb-4 text-center">
                <p className="text-sm text-slate-500">Total Work Order</p>
                <p className="text-4xl font-extrabold text-slate-700">{total}</p>
            </div>
            {total > 0 ? (
                // Tampilkan chart jika ada data
                <Doughnut data={data} options={options} />
            ) : (
                // Tampilkan pesan jika tidak ada data
                <div className="h-64 flex items-center justify-center text-slate-500 border border-dashed rounded-lg">
                    Tidak ada Work Order untuk dianalisis.
                </div>
            )}
        </div>
    );
}