import React from 'react'
import { Line } from 'react-chartjs-2'
import {
  Chart as ChartJS, CategoryScale, LinearScale,
  PointElement, LineElement, Tooltip, Legend, Filler
} from 'chart.js'

ChartJS.register(CategoryScale, LinearScale, PointElement, LineElement, Tooltip, Legend, Filler)

const MONTHS_SHORT = ['Ene','Feb','Mar','Abr','May','Jun','Jul','Ago','Sep','Oct','Nov','Dic']

export default function MonthlyChart({ summary, year }) {
  const incomeData = Array(12).fill(0)
  const expenseData = Array(12).fill(0)

  summary.forEach(row => {
    const idx = row.month - 1
    if (row.type === 'income') incomeData[idx] = Number(row.total)
    if (row.type === 'expense') expenseData[idx] = Number(row.total)
  })

  const hasData = summary.length > 0

  if (!hasData) return null

  return (
    <div style={{ background: '#fff', border: '0.5px solid #D3D1C7', borderRadius: 14, padding: '1rem 1.25rem', marginBottom: '1.25rem' }}>
      <h3 style={{ fontSize: 14, fontWeight: 500, marginBottom: '0.85rem' }}>📈 Evolución {year}</h3>
      <div style={{ display: 'flex', gap: 16, marginBottom: 10 }}>
        {[['Ingresos', '#3B6D11'], ['Gastos', '#D4537E']].map(([label, color]) => (
          <span key={label} style={{ display: 'flex', alignItems: 'center', gap: 5, fontSize: 12, color: '#5F5E5A' }}>
            <span style={{ width: 10, height: 3, background: color, display: 'inline-block', borderRadius: 2 }} />
            {label}
          </span>
        ))}
      </div>
      <div style={{ position: 'relative', width: '100%', height: 180 }}>
        <Line
          data={{
            labels: MONTHS_SHORT,
            datasets: [
              {
                label: 'Ingresos',
                data: incomeData,
                borderColor: '#3B6D11',
                backgroundColor: 'rgba(59,109,17,0.08)',
                fill: true,
                tension: 0.4,
                pointRadius: 3,
                pointBackgroundColor: '#3B6D11',
                borderDash: [4, 3],
              },
              {
                label: 'Gastos',
                data: expenseData,
                borderColor: '#D4537E',
                backgroundColor: 'rgba(212,83,126,0.08)',
                fill: true,
                tension: 0.4,
                pointRadius: 3,
                pointBackgroundColor: '#D4537E',
              },
            ],
          }}
          options={{
            responsive: true,
            maintainAspectRatio: false,
            plugins: { legend: { display: false }, tooltip: { callbacks: { label: ctx => ` €${ctx.parsed.y.toFixed(0)}` } } },
            scales: {
              x: { grid: { display: false }, ticks: { font: { size: 11 }, color: '#888780' } },
              y: { grid: { color: '#F1EFE8' }, ticks: { font: { size: 11 }, color: '#888780', callback: v => '€' + v } },
            },
          }}
        />
      </div>
    </div>
  )
}
