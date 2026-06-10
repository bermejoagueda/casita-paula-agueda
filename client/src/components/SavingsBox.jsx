import React, { useState } from 'react'

export default function SavingsBox({ savings, onUpdate }) {
  const [editGoal, setEditGoal] = useState(false)
  const [editSaved, setEditSaved] = useState(false)
  const [goalVal, setGoalVal] = useState('')
  const [savedVal, setSavedVal] = useState('')

  const goal = Number(savings.goal) || 0
  const saved = Number(savings.saved) || 0
  const pct = goal > 0 ? Math.min(100, Math.round(saved / goal * 100)) : 0
  const remaining = Math.max(0, goal - saved)

  const saveGoal = () => { onUpdate(parseFloat(goalVal) || goal, saved); setEditGoal(false) }
  const saveSaved = () => { onUpdate(goal, parseFloat(savedVal) || saved); setEditSaved(false) }

  const barColor = pct >= 100 ? '#3B6D11' : pct >= 50 ? '#D4537E' : '#ED93B1'

  return (
    <div style={{ background: '#fff', border: '0.5px solid #D3D1C7', borderRadius: 14, padding: '1rem 1.25rem', marginBottom: '1.25rem' }}>
      <h3 style={{ fontSize: 14, fontWeight: 500, marginBottom: '0.85rem' }}>🐷 Ahorro del mes</h3>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10, marginBottom: 12 }}>
        <div style={{ background: '#F8F7F6', borderRadius: 10, padding: '0.75rem 1rem', border: '0.5px solid #E8E6E2' }}>
          <div style={{ fontSize: 12, color: '#888780', marginBottom: 4 }}>Meta</div>
          {editGoal ? (
            <div style={{ display: 'flex', gap: 6 }}>
              <input autoFocus type="number" value={goalVal} onChange={e => setGoalVal(e.target.value)}
                onKeyDown={e => { if (e.key === 'Enter') saveGoal(); if (e.key === 'Escape') setEditGoal(false) }}
                style={{ width: 70, border: '0.5px solid #F2A8C8', borderRadius: 6, padding: '3px 7px', fontSize: 13 }} />
              <button onClick={saveGoal} style={{ background: '#D4537E', color: 'white', border: 'none', borderRadius: 6, padding: '3px 8px', fontSize: 12, cursor: 'pointer' }}>✓</button>
            </div>
          ) : (
            <div style={{ display: 'flex', alignItems: 'baseline', gap: 6 }}>
              <span style={{ fontSize: 20, fontWeight: 600, color: '#993556' }}>€{goal.toFixed(0)}</span>
              <button onClick={() => { setGoalVal(goal); setEditGoal(true) }} style={{ background: 'none', border: 'none', cursor: 'pointer', fontSize: 12, color: '#B4B2A9' }}>✏️</button>
            </div>
          )}
        </div>

        <div style={{ background: '#F8F7F6', borderRadius: 10, padding: '0.75rem 1rem', border: '0.5px solid #E8E6E2' }}>
          <div style={{ fontSize: 12, color: '#888780', marginBottom: 4 }}>Ahorrado</div>
          {editSaved ? (
            <div style={{ display: 'flex', gap: 6 }}>
              <input autoFocus type="number" value={savedVal} onChange={e => setSavedVal(e.target.value)}
                onKeyDown={e => { if (e.key === 'Enter') saveSaved(); if (e.key === 'Escape') setEditSaved(false) }}
                style={{ width: 70, border: '0.5px solid #F2A8C8', borderRadius: 6, padding: '3px 7px', fontSize: 13 }} />
              <button onClick={saveSaved} style={{ background: '#D4537E', color: 'white', border: 'none', borderRadius: 6, padding: '3px 8px', fontSize: 12, cursor: 'pointer' }}>✓</button>
            </div>
          ) : (
            <div style={{ display: 'flex', alignItems: 'baseline', gap: 6 }}>
              <span style={{ fontSize: 20, fontWeight: 600, color: '#3B6D11' }}>€{saved.toFixed(0)}</span>
              <button onClick={() => { setSavedVal(saved); setEditSaved(true) }} style={{ background: 'none', border: 'none', cursor: 'pointer', fontSize: 12, color: '#B4B2A9' }}>✏️</button>
            </div>
          )}
        </div>
      </div>

      <div style={{ marginBottom: 8 }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 12, color: '#888780', marginBottom: 4 }}>
          <span>{pct}% de la meta</span>
          <span>Faltan €{remaining.toFixed(0)}</span>
        </div>
        <div style={{ height: 8, background: '#E8E6E2', borderRadius: 4, overflow: 'hidden' }}>
          <div style={{ height: '100%', width: `${pct}%`, background: barColor, borderRadius: 4, transition: 'width 0.4s' }} />
        </div>
      </div>

      {pct >= 100 && (
        <div style={{ background: '#EAF3DE', borderRadius: 9, padding: '0.5rem 1rem', fontSize: 13, color: '#3B6D11', textAlign: 'center' }}>
          ¡Meta conseguida! 🎉
        </div>
      )}
    </div>
  )
}
