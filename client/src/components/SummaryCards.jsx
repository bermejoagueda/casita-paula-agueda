import React from 'react'

export default function SummaryCards({ transactions }) {
  const income  = transactions.filter(t => t.type === 'income').reduce((a, t) => a + Number(t.amount_eur), 0)
  const expense = transactions.filter(t => t.type === 'expense').reduce((a, t) => a + Number(t.amount_eur), 0)
  const balance = income - expense

  const mxnExpense = transactions.filter(t => t.type === 'expense' && t.currency === 'MXN').reduce((a, t) => a + Number(t.amount_orig), 0)
  const eurExpense = transactions.filter(t => t.type === 'expense' && t.currency !== 'MXN').reduce((a, t) => a + Number(t.amount_eur), 0)

  const fmt = n => '€' + Math.abs(n).toLocaleString('es-ES', { minimumFractionDigits: 0 })

  return (
    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3,1fr)', gap: 10, marginBottom: '1.25rem' }}>
      <div style={{ background: '#fff', border: '0.5px solid #D3D1C7', borderRadius: 12, padding: '0.9rem 1rem' }}>
        <div style={{ fontSize: 12, color: '#888780', marginBottom: 4 }}>💰 Ingresos</div>
        <div style={{ fontSize: 22, fontWeight: 600, color: '#3B6D11' }}>{fmt(income)}</div>
        <div style={{ fontSize: 11, color: '#B4B2A9', marginTop: 2 }}>{transactions.filter(t=>t.type==='income').length} movimientos</div>
      </div>
      <div style={{ background: '#fff', border: '0.5px solid #D3D1C7', borderRadius: 12, padding: '0.9rem 1rem' }}>
        <div style={{ fontSize: 12, color: '#888780', marginBottom: 4 }}>💸 Gastos</div>
        <div style={{ fontSize: 22, fontWeight: 600, color: '#993556' }}>{fmt(expense)}</div>
        <div style={{ fontSize: 10, color: '#B4B2A9', marginTop: 2 }}>
          {eurExpense > 0 && mxnExpense > 0 && `€${eurExpense.toFixed(0)} + $${Math.round(mxnExpense).toLocaleString('es-MX')} MXN`}
          {eurExpense > 0 && mxnExpense === 0 && 'en EUR'}
          {eurExpense === 0 && mxnExpense > 0 && 'en MXN'}
        </div>
      </div>
      <div style={{ background: '#fff', border: '0.5px solid #D3D1C7', borderRadius: 12, padding: '0.9rem 1rem' }}>
        <div style={{ fontSize: 12, color: '#888780', marginBottom: 4 }}>⚖️ Balance</div>
        <div style={{ fontSize: 22, fontWeight: 600, color: balance >= 0 ? '#3B6D11' : '#993556' }}>
          {(balance >= 0 ? '+' : '-')}{fmt(balance)}
        </div>
        <div style={{ fontSize: 11, color: '#B4B2A9', marginTop: 2 }}>{transactions.length} movimientos</div>
      </div>
    </div>
  )
}
