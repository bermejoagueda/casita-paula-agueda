import React from 'react'
import { catById, MONTHS } from '../constants'

const PERSON_LABEL = { paula: '👩 Paula', agueda: '👩 Águeda', ambas: '🏠 Ambas' }
const PERSON_COLOR = { paula: '#F2A8C8', agueda: '#D3D1C7', ambas: '#F9D6E7' }

export default function TxList({ transactions, onDelete }) {
  const sorted = [...transactions].sort((a, b) => new Date(b.date) - new Date(a.date)).slice(0, 25)

  if (sorted.length === 0)
    return <p style={{ fontSize: 13, color: '#888780', textAlign: 'center', padding: '1rem' }}>Sin movimientos este mes</p>

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
      {sorted.map(t => {
        const cat = catById(t.cat)
        const d = new Date(t.date)
        const dateStr = `${d.getDate()} ${MONTHS[d.getMonth()].slice(0, 3)}`
        const isIncome = t.type === 'income'
        const person = t.person || 'ambas'

        return (
          <div key={t.id} style={{
            background: '#fff', border: '0.5px solid #D3D1C7',
            borderRadius: 10, padding: '0.6rem 1rem',
          }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                <div style={{ width: 8, height: 8, borderRadius: '50%', flexShrink: 0, background: isIncome ? '#3B6D11' : cat.color }} />
                <div>
                  <div style={{ fontSize: 13, fontWeight: 500 }}>{t.description}</div>
                  <div style={{ display: 'flex', gap: 6, alignItems: 'center', marginTop: 2 }}>
                    <span style={{ fontSize: 11, color: '#888780' }}>{cat.name}</span>
                    <span style={{ fontSize: 10, padding: '1px 6px', borderRadius: 99, background: PERSON_COLOR[person], color: '#5F5E5A', fontWeight: 500 }}>
                      {PERSON_LABEL[person]}
                    </span>
                    {t.notes && <span style={{ fontSize: 11, color: '#B4B2A9', fontStyle: 'italic' }}>"{t.notes}"</span>}
                  </div>
                </div>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                <div style={{ textAlign: 'right' }}>
                  <div style={{ fontSize: 13, fontWeight: 600, color: isIncome ? '#3B6D11' : '#993556' }}>
                    {isIncome ? '+' : '-'}€{Number(t.amount).toFixed(0)}
                  </div>
                  <div style={{ fontSize: 11, color: '#888780' }}>{dateStr}</div>
                </div>
                <button onClick={() => onDelete(t.id)} style={{
                  border: 'none', background: 'none', cursor: 'pointer',
                  fontSize: 14, color: '#D3D1C7', padding: '2px 4px', borderRadius: 4,
                }} onMouseEnter={e => e.target.style.color = '#E24B4A'} onMouseLeave={e => e.target.style.color = '#D3D1C7'}>✕</button>
              </div>
            </div>
          </div>
        )
      })}
    </div>
  )
}
