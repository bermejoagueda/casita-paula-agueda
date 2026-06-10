import React from 'react'
import { CATS } from '../constants'

const MONTHS_SHORT = ['Ene','Feb','Mar','Abr','May','Jun','Jul','Ago','Sep','Oct','Nov','Dic']

export default function AnnualView({ annual, year }) {
  // Build matrix: month -> { income, expense, bycat }
  const months = Array.from({ length: 12 }, (_, i) => {
    const rows = annual.filter(r => r.month === i + 1)
    const income  = rows.filter(r => r.type === 'income').reduce((a, r) => a + Number(r.total), 0)
    const expense = rows.filter(r => r.type === 'expense').reduce((a, r) => a + Number(r.total), 0)
    const byCat = {}
    rows.filter(r => r.type === 'expense').forEach(r => { byCat[r.cat] = (byCat[r.cat] || 0) + Number(r.total) })
    return { month: i + 1, label: MONTHS_SHORT[i], income, expense, balance: income - expense, byCat }
  })

  const maxExpense = Math.max(...months.map(m => m.expense), 1)
  const totalIncome  = months.reduce((a, m) => a + m.income, 0)
  const totalExpense = months.reduce((a, m) => a + m.expense, 0)
  const worstMonth   = months.reduce((a, m) => m.expense > a.expense ? m : a, months[0])
  const bestMonth    = months.filter(m => m.balance > 0).reduce((a, m) => m.balance > a.balance ? m : a, months[0])

  return (
    <div>
      {/* Year summary pills */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3,1fr)', gap: 10, marginBottom: '1.25rem' }}>
        {[
          { label: 'Ingresos totales', value: `€${totalIncome.toFixed(0)}`, color: '#3B6D11' },
          { label: 'Gastos totales', value: `€${totalExpense.toFixed(0)}`, color: '#993556' },
          { label: 'Mes más caro', value: worstMonth.label, color: '#888780' },
        ].map(c => (
          <div key={c.label} style={{ background: '#fff', border: '0.5px solid #D3D1C7', borderRadius: 12, padding: '0.85rem 1rem' }}>
            <div style={{ fontSize: 11, color: '#888780', marginBottom: 3 }}>{c.label}</div>
            <div style={{ fontSize: 18, fontWeight: 600, color: c.color }}>{c.value}</div>
          </div>
        ))}
      </div>

      {/* Bar chart */}
      <div style={{ background: '#fff', border: '0.5px solid #D3D1C7', borderRadius: 14, padding: '1rem 1.25rem', marginBottom: '1.25rem' }}>
        <h3 style={{ fontSize: 14, fontWeight: 500, marginBottom: '1rem' }}>Gastos por mes — {year}</h3>
        <div style={{ display: 'flex', alignItems: 'flex-end', gap: 6, height: 140, paddingBottom: 24, position: 'relative' }}>
          {months.map((m, i) => {
            const h = m.expense > 0 ? Math.max(8, Math.round(m.expense / maxExpense * 110)) : 0
            const isWorst = m.expense === maxExpense && m.expense > 0
            return (
              <div key={i} style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 4, position: 'relative' }}>
                {m.expense > 0 && (
                  <div style={{ fontSize: 9, color: '#993556', fontWeight: 500, whiteSpace: 'nowrap' }}>
                    €{m.expense >= 1000 ? (m.expense/1000).toFixed(1)+'k' : m.expense.toFixed(0)}
                  </div>
                )}
                <div style={{
                  width: '100%', height: h, borderRadius: '4px 4px 0 0',
                  background: isWorst ? '#993556' : '#F2A8C8',
                  transition: 'height 0.4s',
                  minHeight: m.expense > 0 ? 4 : 0,
                }} />
                <div style={{ position: 'absolute', bottom: 0, fontSize: 10, color: '#888780' }}>{m.label}</div>
              </div>
            )
          })}
        </div>
      </div>

      {/* Month detail table */}
      <div style={{ background: '#fff', border: '0.5px solid #D3D1C7', borderRadius: 14, overflow: 'hidden', marginBottom: '1.25rem' }}>
        <div style={{ padding: '0.85rem 1rem', borderBottom: '0.5px solid #F1EFE8' }}>
          <h3 style={{ fontSize: 14, fontWeight: 500 }}>Detalle mensual</h3>
        </div>
        <div style={{ overflowX: 'auto' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 12 }}>
            <thead>
              <tr style={{ background: '#F8F7F6' }}>
                <th style={{ padding: '8px 12px', textAlign: 'left', color: '#888780', fontWeight: 500 }}>Mes</th>
                <th style={{ padding: '8px 12px', textAlign: 'right', color: '#3B6D11', fontWeight: 500 }}>Ingresos</th>
                <th style={{ padding: '8px 12px', textAlign: 'right', color: '#993556', fontWeight: 500 }}>Gastos</th>
                <th style={{ padding: '8px 12px', textAlign: 'right', fontWeight: 500 }}>Balance</th>
              </tr>
            </thead>
            <tbody>
              {months.map((m, i) => (
                <tr key={i} style={{ borderTop: '0.5px solid #F1EFE8', background: m.expense === maxExpense && m.expense > 0 ? '#FDF2F6' : 'transparent' }}>
                  <td style={{ padding: '8px 12px', fontWeight: m.expense === maxExpense && m.expense > 0 ? 600 : 400 }}>
                    {m.label} {m.expense === maxExpense && m.expense > 0 ? '🔴' : ''}
                  </td>
                  <td style={{ padding: '8px 12px', textAlign: 'right', color: '#3B6D11' }}>{m.income > 0 ? `€${m.income.toFixed(0)}` : '—'}</td>
                  <td style={{ padding: '8px 12px', textAlign: 'right', color: '#993556' }}>{m.expense > 0 ? `€${m.expense.toFixed(0)}` : '—'}</td>
                  <td style={{ padding: '8px 12px', textAlign: 'right', color: m.balance >= 0 ? '#3B6D11' : '#993556', fontWeight: 500 }}>
                    {m.income + m.expense > 0 ? `${m.balance >= 0 ? '+' : ''}€${m.balance.toFixed(0)}` : '—'}
                  </td>
                </tr>
              ))}
              <tr style={{ borderTop: '2px solid #D3D1C7', background: '#F8F7F6', fontWeight: 600 }}>
                <td style={{ padding: '8px 12px' }}>Total {year}</td>
                <td style={{ padding: '8px 12px', textAlign: 'right', color: '#3B6D11' }}>€{totalIncome.toFixed(0)}</td>
                <td style={{ padding: '8px 12px', textAlign: 'right', color: '#993556' }}>€{totalExpense.toFixed(0)}</td>
                <td style={{ padding: '8px 12px', textAlign: 'right', color: totalIncome-totalExpense >= 0 ? '#3B6D11' : '#993556' }}>
                  {totalIncome+totalExpense > 0 ? `${totalIncome-totalExpense >= 0 ? '+' : ''}€${(totalIncome-totalExpense).toFixed(0)}` : '—'}
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )
}
