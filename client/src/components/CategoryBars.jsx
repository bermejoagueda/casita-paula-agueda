import React from 'react'
import { CATS } from '../constants'

export default function CategoryBars({ transactions }) {
  const expenses = transactions.filter(t => t.type === 'expense')
  const rows = CATS.map(cat => {
    const spent = expenses.filter(t => t.cat === cat.id).reduce((a, t) => a + Number(t.amount_eur || t.amount || 0), 0)
    return { ...cat, spent }
  }).filter(r => r.spent > 0)

  const maxSpent = Math.max(...rows.map(r => r.spent), 1)

  if (rows.length === 0)
    return <p style={{ fontSize:13, color:'#888780', textAlign:'center', padding:'1rem' }}>Sin gastos este mes</p>

  return (
    <div style={{ display:'flex', flexDirection:'column', gap:8, marginBottom:'1.25rem' }}>
      {rows.map(cat => {
        const pct = Math.round(cat.spent / maxSpent * 100)
        return (
          <div key={cat.id} style={{ background:'#fff', border:'0.5px solid #D3D1C7', borderRadius:14, padding:'0.85rem 1rem', transition:'border-color 0.15s' }}
            onMouseEnter={e => e.currentTarget.style.borderColor='#F2A8C8'}
            onMouseLeave={e => e.currentTarget.style.borderColor='#D3D1C7'}
          >
            <div style={{ display:'flex', alignItems:'center', justifyContent:'space-between', marginBottom:8 }}>
              <div style={{ display:'flex', alignItems:'center', gap:10 }}>
                <div style={{ width:34, height:34, borderRadius:9, background:cat.bg, display:'flex', alignItems:'center', justifyContent:'center', fontSize:17 }}>{cat.icon}</div>
                <div style={{ fontWeight:500, fontSize:14 }}>{cat.name}</div>
              </div>
              <div style={{ fontWeight:600, fontSize:15, color:cat.color }}>€{cat.spent.toFixed(0)}</div>
            </div>
            <div style={{ height:6, background:'#E8E6E2', borderRadius:3, overflow:'hidden' }}>
              <div style={{ height:'100%', width:`${pct}%`, background:cat.color, borderRadius:3, transition:'width 0.4s' }} />
            </div>
          </div>
        )
      })}
    </div>
  )
}
