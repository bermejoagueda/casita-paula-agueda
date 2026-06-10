import React from 'react'
import { Doughnut } from 'react-chartjs-2'
import { Chart as ChartJS, ArcElement, Tooltip, Legend } from 'chart.js'
import { CATS } from '../constants'

ChartJS.register(ArcElement, Tooltip, Legend)

export default function SpendingChart({ transactions }) {
  const expenses = transactions.filter(t => t.type === 'expense')

  const data = CATS.map(cat => ({
    label: cat.name,
    value: expenses.filter(t => t.cat === cat.id).reduce((a, t) => a + Number(t.amount), 0),
    color: cat.color,
  })).filter(d => d.value > 0)

  if (data.length === 0) return null

  return (
    <div style={{ marginBottom: '1.25rem' }}>
      <div style={{ display: 'flex', flexWrap: 'wrap', gap: 10, marginBottom: 10 }}>
        {data.map(d => (
          <span key={d.label} style={{ display: 'flex', alignItems: 'center', gap: 5, fontSize: 12, color: '#5F5E5A' }}>
            <span style={{ width: 10, height: 10, borderRadius: 2, background: d.color, display: 'inline-block' }} />
            {d.label} €{d.value.toFixed(0)}
          </span>
        ))}
      </div>
      <div style={{ position: 'relative', width: '100%', height: 200 }}>
        <Doughnut
          data={{
            labels: data.map(d => d.label),
            datasets: [{
              data: data.map(d => d.value),
              backgroundColor: data.map(d => d.color),
              borderWidth: 2,
              borderColor: '#fff',
            }]
          }}
          options={{
            responsive: true,
            maintainAspectRatio: false,
            cutout: '62%',
            plugins: {
              legend: { display: false },
              tooltip: { callbacks: { label: ctx => ` €${ctx.parsed.toFixed(0)} — ${ctx.label}` } }
            }
          }}
        />
      </div>
    </div>
  )
}
