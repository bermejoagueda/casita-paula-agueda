import React from 'react'

function Card({ label, value, color, sub }) {
  return (
    <div style={{ background: '#fff', border: '0.5px solid #D3D1C7', borderRadius: 12, padding: '0.9rem 1rem' }}>
      <div style={{ fontSize: 12, color: '#888780', marginBottom: 4 }}>{label}</div>
      <div style={{ fontSize: 22, fontWeight: 600, color }}>{value}</div>
      {sub && <div style={{ fontSize: 11, color: '#B4B2A9', marginTop: 2 }}>{sub}</div>}
    </div>
  )
}

export default function SummaryCards({ transactions }) {
  const fmt = n => '€' + Math.abs(n).toLocaleString('es-ES', { minimumFractionDigits: 0 })
  const income  = transactions.filter(t => t.type === 'income').reduce((a, t) => a + Number(t.amount), 0)
  const expense = transactions.filter(t => t.type === 'expense').reduce((a, t) => a + Number(t.amount), 0)
  const balance = income - expense
  const txCount = transactions.length

  return (
    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3,1fr)', gap: 10, marginBottom: '1.25rem' }}>
      <Card label="💰 Ingresos"  value={fmt(income)}  color="#3B6D11" sub={`${transactions.filter(t=>t.type==='income').length} movimientos`} />
      <Card label="💸 Gastos"    value={fmt(expense)} color="#993556" sub={`${transactions.filter(t=>t.type==='expense').length} movimientos`} />
      <Card label="⚖️ Balance"   value={(balance >= 0 ? '+' : '-') + fmt(balance)} color={balance >= 0 ? '#3B6D11' : '#993556'} sub={`Total: ${txCount} mov.`} />
    </div>
  )
}
