import React from 'react'
import { Bar } from 'react-chartjs-2'
import { Chart as ChartJS, CategoryScale, LinearScale, BarElement, Tooltip } from 'chart.js'

ChartJS.register(CategoryScale, LinearScale, BarElement, Tooltip)

const MONTHS_SHORT = ['Ene','Feb','Mar','Abr','May','Jun','Jul','Ago','Sep','Oct','Nov','Dic']

export default function MonthlyChart({ summary, year }) {
  const expenseData = Array(12).fill(0)
  summary.forEach(row => {
    if (row.type === 'expense') expenseData[row.month - 1] = Number(row.total)
  })

  const hasData = expenseData.some(v => v > 0)
  if (!hasData) return null

  return (
    <div style={{ background: '#fff', border: '0.5px solid #D3D1C7', borderRadius: 14, padding: '1rem 1.25rem', marginBottom: '1.25rem' }}>
      <h3 style={{ fontSize: 14, fontWeight: 500, marginBottom: '0.85rem' }}>📈 Evolución de gastos {year}</h3>
      <div style={{ position: 'relative', width: '100%', height: 160 }}>
        <Bar
          data={{
            labels: MONTHS_SHORT,
            datasets: [{
              label: 'Gastos',
              data: expenseData,
              backgroundColor: expenseData.map((v, i) => {
                const max = Math.max(...expenseData)
                return v === max && v > 0 ? '#993556' : '#F2A8C8'
              }),
              borderRadius: 4,
              borderSkipped: false,
            }]
          }}
          options={{
            responsive: true,
            maintainAspectRatio: false,
            plugins: {
              legend: { display: false },
              tooltip: { callbacks: { label: ctx => ` €${ctx.parsed.y.toFixed(0)}` } }
            },
            scales: {
              x: { grid: { display: false }, ticks: { font: { size: 10 }, color: '#888780' } },
              y: { grid: { color: '#F1EFE8' }, ticks: { font: { size: 10 }, color: '#888780', callback: v => '€' + v } },
            },
          }}
        />
      </div>
    </div>
  )
}
