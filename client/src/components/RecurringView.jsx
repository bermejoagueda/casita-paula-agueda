import React, { useState } from 'react'
import { CATS, catById, MONTHS } from '../constants'

const PERSON_LABEL = { paula: '👩 Paula', agueda: '👩 Águeda', ambas: '🏠 Ambas' }
const inp = { border: '0.5px solid #D3D1C7', borderRadius: 8, padding: '7px 10px', fontSize: 13, background: '#F8F7F6', color: '#2C2C2A', width: '100%' }

function RecurringForm({ initial, onSave, onCancel }) {
  const [form, setForm] = useState(initial || { description: '', amount: '', cat: '', person: 'ambas', day_of_month: 1 })
  const set = (k, v) => setForm(f => ({ ...f, [k]: v }))

  return (
    <div style={{ background: '#FDF2F6', border: '0.5px solid #F2A8C8', borderRadius: 12, padding: '1rem', marginBottom: 10 }}>
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8, marginBottom: 8 }}>
        <input style={inp} placeholder="Nombre del gasto" value={form.description} onChange={e => set('description', e.target.value)} />
        <input style={inp} type="number" placeholder="Importe (€)" value={form.amount} onChange={e => set('amount', e.target.value)} />
      </div>
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 8, marginBottom: 10 }}>
        <select style={inp} value={form.cat} onChange={e => set('cat', e.target.value)}>
          <option value="">Categoría...</option>
          {CATS.map(c => <option key={c.id} value={c.id}>{c.icon} {c.name}</option>)}
        </select>
        <select style={inp} value={form.person} onChange={e => set('person', e.target.value)}>
          <option value="ambas">🏠 Ambas</option>
          <option value="paula">👩 Paula</option>
          <option value="agueda">👩 Águeda</option>
        </select>
        <select style={inp} value={form.day_of_month} onChange={e => set('day_of_month', parseInt(e.target.value))}>
          {Array.from({length: 28}, (_, i) => i + 1).map(d => (
            <option key={d} value={d}>Día {d}</option>
          ))}
        </select>
      </div>
      <div style={{ display: 'flex', gap: 8 }}>
        <button onClick={onCancel} style={{ flex: 1, padding: '7px', borderRadius: 9, border: '0.5px solid #D3D1C7', background: '#fff', cursor: 'pointer', fontSize: 13 }}>Cancelar</button>
        <button onClick={() => { if (form.description && form.amount && form.cat) onSave(form) }} style={{ flex: 2, padding: '7px', borderRadius: 9, border: 'none', background: '#D4537E', color: 'white', cursor: 'pointer', fontSize: 13, fontWeight: 500 }}>
          Guardar gasto fijo
        </button>
      </div>
    </div>
  )
}

export default function RecurringView({ recurring, onAdd, onUpdate, onDelete, onGenerate, year, month, monthTxs }) {
  const [showForm, setShowForm] = useState(false)
  const [editing, setEditing] = useState(null)
  const [generating, setGenerating] = useState(false)
  const [generated, setGenerated] = useState(null)

  const MONTHS_ES = ['Enero','Febrero','Marzo','Abril','Mayo','Junio','Julio','Agosto','Septiembre','Octubre','Noviembre','Diciembre']

  const totalMonthly = recurring.filter(r => r.active).reduce((a, r) => a + Number(r.amount), 0)

  const isAddedThisMonth = (r) => {
    return monthTxs.some(t =>
      t.description === r.description &&
      Math.abs(Number(t.amount) - Number(r.amount)) < 0.01
    )
  }

  const handleGenerate = async () => {
    setGenerating(true)
    try {
      const res = await onGenerate()
      setGenerated(res.generated)
      setTimeout(() => setGenerated(null), 4000)
    } finally { setGenerating(false) }
  }

  return (
    <div>
      {/* Header card */}
      <div style={{ background: '#fff', border: '0.5px solid #D3D1C7', borderRadius: 14, padding: '1rem 1.25rem', marginBottom: '1.25rem' }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '0.75rem' }}>
          <div>
            <h3 style={{ fontSize: 14, fontWeight: 600, marginBottom: 2 }}>🔁 Gastos fijos activos</h3>
            <p style={{ fontSize: 12, color: '#888780' }}>{recurring.filter(r => r.active).length} gastos · €{totalMonthly.toFixed(0)}/mes</p>
          </div>
          <button onClick={handleGenerate} disabled={generating} style={{
            background: generating ? '#F2A8C8' : '#D4537E', color: 'white', border: 'none',
            borderRadius: 10, padding: '8px 14px', cursor: generating ? 'not-allowed' : 'pointer',
            fontSize: 13, fontWeight: 500,
          }}>
            {generating ? 'Generando...' : `⚡ Generar en ${MONTHS_ES[month].slice(0,3)}`}
          </button>
        </div>

        {generated !== null && (
          <div style={{ background: '#EAF3DE', borderRadius: 9, padding: '8px 12px', fontSize: 13, color: '#3B6D11', marginBottom: 8 }}>
            {generated === 0 ? '✓ Todos los gastos fijos ya estaban añadidos este mes' : `✓ ${generated} gasto${generated > 1 ? 's' : ''} añadido${generated > 1 ? 's' : ''} a ${MONTHS_ES[month]}`}
          </div>
        )}

        <div style={{ height: '0.5px', background: '#F1EFE8', margin: '0.75rem 0' }} />

        <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
          {recurring.length === 0 && <p style={{ fontSize: 13, color: '#888780', textAlign: 'center', padding: '0.5rem' }}>Sin gastos fijos todavía</p>}
          {recurring.map(r => {
            const cat = catById(r.cat)
            const added = isAddedThisMonth(r)
            return editing?.id === r.id ? (
              <RecurringForm key={r.id} initial={{ ...r, amount: r.amount }} onSave={async (form) => { await onUpdate(r.id, { ...form, active: r.active }); setEditing(null) }} onCancel={() => setEditing(null)} />
            ) : (
              <div key={r.id} style={{
                display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                padding: '8px 10px', borderRadius: 10,
                background: r.active ? '#F8F7F6' : '#F1EFE8',
                border: '0.5px solid #E8E6E2',
                opacity: r.active ? 1 : 0.6,
              }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                  <div style={{ width: 32, height: 32, borderRadius: 8, background: cat.bg, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 16 }}>{cat.icon}</div>
                  <div>
                    <div style={{ fontSize: 13, fontWeight: 500 }}>{r.description}</div>
                    <div style={{ display: 'flex', gap: 5, alignItems: 'center', marginTop: 2 }}>
                      <span style={{ fontSize: 11, color: '#888780' }}>Día {r.day_of_month} · {PERSON_LABEL[r.person]}</span>
                      {added && <span style={{ fontSize: 10, padding: '1px 6px', borderRadius: 99, background: '#EAF3DE', color: '#3B6D11', fontWeight: 500 }}>✓ añadido</span>}
                      {!added && r.active && <span style={{ fontSize: 10, padding: '1px 6px', borderRadius: 99, background: '#FDF2F6', color: '#993556', fontWeight: 500 }}>pendiente</span>}
                    </div>
                  </div>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                  <span style={{ fontSize: 14, fontWeight: 600, color: '#993556' }}>€{Number(r.amount).toFixed(0)}</span>
                  <button onClick={() => onUpdate(r.id, { ...r, active: !r.active })} style={{ border: 'none', background: 'none', cursor: 'pointer', fontSize: 14, color: r.active ? '#3B6D11' : '#888780' }} title={r.active ? 'Desactivar' : 'Activar'}>
                    {r.active ? '✅' : '⭕'}
                  </button>
                  <button onClick={() => setEditing(r)} style={{ border: 'none', background: 'none', cursor: 'pointer', fontSize: 13, color: '#D3D1C7' }}
                    onMouseEnter={e => e.target.style.color = '#D4537E'} onMouseLeave={e => e.target.style.color = '#D3D1C7'}>✏️</button>
                  <button onClick={() => onDelete(r.id)} style={{ border: 'none', background: 'none', cursor: 'pointer', fontSize: 13, color: '#D3D1C7' }}
                    onMouseEnter={e => e.target.style.color = '#E24B4A'} onMouseLeave={e => e.target.style.color = '#D3D1C7'}>✕</button>
                </div>
              </div>
            )
          })}
        </div>
      </div>

      {/* Add new */}
      {showForm ? (
        <RecurringForm onSave={async (form) => { await onAdd(form); setShowForm(false) }} onCancel={() => setShowForm(false)} />
      ) : (
        <button onClick={() => setShowForm(true)} style={{
          width: '100%', padding: '10px', borderRadius: 12, border: '0.5px dashed #D4537E',
          background: 'transparent', color: '#D4537E', cursor: 'pointer', fontSize: 13, fontWeight: 500,
        }}>
          + Añadir gasto fijo
        </button>
      )}
    </div>
  )
}
