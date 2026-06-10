import React from 'react'

export default function SummaryCards({ transactions }) {
  const expense = transactions.filter(t => t.type === 'expense').reduce((a, t) => a + Number(t.amount_eur || t.amount || 0), 0)
  const mxnExp  = transactions.filter(t => t.type === 'expense' && t.currency === 'MXN').reduce((a, t) => a + Number(t.amount_orig || 0), 0)
  const eurExp  = transactions.filter(t => t.type === 'expense' && t.currency !== 'MXN').reduce((a, t) => a + Number(t.amount_eur || t.amount || 0), 0)
  const count   = transactions.filter(t => t.type === 'expense').length

  return (
    <div style={{ background: '#fff', border: '0.5px solid #D3D1C7', borderRadius: 14, padding: '1.1rem 1.25rem', marginBottom: '1.25rem' }}>
      <div style={{ fontSize: 12, color: '#888780', marginBottom: 6 }}>💸 Gastos del mes</div>
      <div style={{ fontSize: 32, fontWeight: 700, color: '#993556' }}>
        €{expense.toLocaleString('es-ES', { minimumFractionDigits: 0, maximumFractionDigits: 0 })}
      </div>
      <div style={{ fontSize: 11, color: '#B4B2A9', marginTop: 4, display: 'flex', gap: 8, flexWrap: 'wrap' }}>
        {eurExp > 0 && mxnExp > 0 && <span>€{eurExp.toFixed(0)} + ${Math.round(mxnExp).toLocaleString('es-MX')} MXN</span>}
        {eurExp > 0 && mxnExp === 0 && <span>en EUR</span>}
        {eurExp === 0 && mxnExp > 0 && <span>en MXN</span>}
        <span style={{ color: '#D3D1C7' }}>·</span>
        <span>{count} movimiento{count !== 1 ? 's' : ''}</span>
      </div>
    </div>
  )
}
