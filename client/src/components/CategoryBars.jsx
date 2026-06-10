import React from 'react'
import { CATS } from '../constants'

export default function CategoryBars({ transactions, budgets }) {
  const expenses = transactions.filter(t => t.type === 'expense')
  const rows = CATS.map(cat => {
    const spent  = expenses.filter(t => t.cat === cat.id).reduce((a, t) => a + Number(t.amount_eur), 0)
    const budget = budgets[cat.id] || 0
    const pct    = budget > 0 ? Math.min(120, Math.round(spent / budget * 100)) : 0
    return { ...cat, spent, budget, pct }
  }).filter(r => r.spent > 0)

  if (rows.length === 0)
    return <p style={{ fontSize: 13, color: '#888780', textAlign: 'center', padding: '1rem' }}>Sin gastos este mes</p>

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 8, marginBottom: '1.25rem' }}>
      {rows.map(cat => {
        const barColor = cat.pct > 100 ? '#E24B4A' : cat.pct > 80 ? '#EF9F27' : '#D4537E'
        return (
          <div key={cat.id} style={{ background: '#fff', border: '0.5px solid #D3D1C7', borderRadius: 14, padding: '0.85rem 1rem', transition: 'border-color 0.15s' }}
            onMouseEnter={e => e.currentTarget.style.borderColor = '#F2A8C8'}
            onMouseLeave={e => e.currentTarget.style.borderColor = '#D3D1C7'}
          >
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 8 }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                <div style={{ width: 34, height: 34, borderRadius: 9, background: cat.bg, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 17 }}>{cat.icon}</div>
                <div>
                  <div style={{ fontWeight: 500, fontSize: 14 }}>{cat.name}</div>
                  <span style={{ fontSize: 11, padding: '1px 7px', borderRadius: 99, fontWeight: 500, background: cat.pct > 100 ? '#FCEBEB' : '#FDF2F6', color: cat.pct > 100 ? '#A32D2D' : '#993556' }}>
                    {cat.pct}% del presupuesto
                  </span>
                </div>
              </div>
              <div style={{ textAlign: 'right' }}>
                <div style={{ fontWeight: 600, fontSize: 14, color: cat.color }}>€{cat.spent.toFixed(0)}</div>
                <div style={{ fontSize: 12, color: '#888780' }}>de €{cat.budget}</div>
              </div>
            </div>
            <div style={{ height: 6, background: '#E8E6E2', borderRadius: 3, overflow: 'hidden' }}>
              <div style={{ height: '100%', width: `${cat.pct}%`, background: barColor, borderRadius: 3, transition: 'width 0.4s' }} />
            </div>
          </div>
        )
      })}
    </div>
  )
}
