import React, { useState } from 'react'
import { CATS } from '../constants'

export default function BudgetEditor({ budgets, onUpdate }) {
  const [editing, setEditing] = useState(null)
  const [val, setVal] = useState('')

  const save = async (catId) => {
    if (!val || isNaN(val)) return
    await onUpdate(catId, parseFloat(val))
    setEditing(null)
  }

  return (
    <div style={{
      background: '#fff', border: '0.5px solid #D3D1C7',
      borderRadius: 14, padding: '1rem 1.25rem', marginBottom: '1.25rem',
    }}>
      <h3 style={{ fontSize: 14, fontWeight: 500, marginBottom: '0.85rem' }}>⚙️ Presupuestos mensuales</h3>
      <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
        {CATS.map(cat => (
          <div key={cat.id} style={{
            display: 'flex', alignItems: 'center', justifyContent: 'space-between',
            padding: '6px 0', borderBottom: '0.5px solid #F1EFE8',
          }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
              <span style={{ fontSize: 16 }}>{cat.icon}</span>
              <span style={{ fontSize: 13, fontWeight: 500 }}>{cat.name}</span>
            </div>
            {editing === cat.id ? (
              <div style={{ display: 'flex', gap: 6, alignItems: 'center' }}>
                <input
                  type="number" autoFocus value={val}
                  onChange={e => setVal(e.target.value)}
                  onKeyDown={e => { if (e.key === 'Enter') save(cat.id); if (e.key === 'Escape') setEditing(null) }}
                  style={{ width: 80, border: '0.5px solid #F2A8C8', borderRadius: 6, padding: '4px 8px', fontSize: 13 }}
                />
                <button onClick={() => save(cat.id)} style={{
                  background: '#D4537E', color: 'white', border: 'none',
                  borderRadius: 6, padding: '4px 10px', fontSize: 12, cursor: 'pointer',
                }}>✓</button>
                <button onClick={() => setEditing(null)} style={{
                  background: '#F1EFE8', color: '#5F5E5A', border: 'none',
                  borderRadius: 6, padding: '4px 8px', fontSize: 12, cursor: 'pointer',
                }}>✕</button>
              </div>
            ) : (
              <button onClick={() => { setEditing(cat.id); setVal(budgets[cat.id] || '') }} style={{
                background: 'none', border: '0.5px solid #D3D1C7', borderRadius: 6,
                padding: '3px 10px', fontSize: 13, cursor: 'pointer', color: '#5F5E5A',
              }}>
                €{budgets[cat.id] || 0} ✏️
              </button>
            )}
          </div>
        ))}
      </div>
    </div>
  )
}
