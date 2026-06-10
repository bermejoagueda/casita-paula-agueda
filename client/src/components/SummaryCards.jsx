import React from 'react'

export default function SummaryCards({ transactions }) {
  const now = new Date()
  const expenses = transactions.filter(t => t.type === 'expense')
  const total = expenses.reduce((a, t) => a + Number(t.amount_eur || t.amount || 0), 0)

  const mxnExp = expenses.filter(t => t.currency === 'MXN').reduce((a, t) => a + Number(t.amount_orig || 0), 0)
  const eurExp = expenses.filter(t => t.currency !== 'MXN').reduce((a, t) => a + Number(t.amount_eur || t.amount || 0), 0)
  const count  = expenses.length

  // Esta semana
  const startOfWeek = new Date(now)
  startOfWeek.setDate(now.getDate() - now.getDay() + (now.getDay() === 0 ? -6 : 1))
  startOfWeek.setHours(0, 0, 0, 0)
  const weekExpenses = expenses.filter(t => new Date(t.date) >= startOfWeek)
  const weekTotal = weekExpenses.reduce((a, t) => a + Number(t.amount_eur || t.amount || 0), 0)

  const fmt = n => '€' + Math.round(n).toLocaleString('es-ES')

  return (
    <div style={{ background:'#fff', border:'0.5px solid #D3D1C7', borderRadius:14, padding:'1rem 1.25rem', marginBottom:'1.25rem' }}>
      <div style={{ display:'flex', alignItems:'flex-start', justifyContent:'space-between' }}>
        <div>
          <div style={{ fontSize:12, color:'#888780', marginBottom:4 }}>💸 Gastos del mes</div>
          <div style={{ fontSize:30, fontWeight:700, color:'#993556' }}>{fmt(total)}</div>
          <div style={{ fontSize:11, color:'#B4B2A9', marginTop:4 }}>
            {eurExp > 0 && mxnExp > 0 && `€${eurExp.toFixed(0)} + $${Math.round(mxnExp).toLocaleString('es-MX')} MXN · `}
            {count} movimiento{count !== 1 ? 's' : ''}
          </div>
        </div>
        {weekTotal > 0 && (
          <div style={{ textAlign:'right', background:'#F8F7F6', borderRadius:10, padding:'8px 12px' }}>
            <div style={{ fontSize:10, color:'#888780', marginBottom:2 }}>Esta semana</div>
            <div style={{ fontSize:16, fontWeight:700, color:'#993556' }}>{fmt(weekTotal)}</div>
            <div style={{ fontSize:10, color:'#B4B2A9' }}>{weekExpenses.length} gastos</div>
          </div>
        )}
      </div>
    </div>
  )
}
