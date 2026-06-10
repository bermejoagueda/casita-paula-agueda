import React, { useState } from 'react'
import { catById, MONTHS, CATS } from '../constants'
import ConfirmDialog from './ConfirmDialog'

const PERSON_LABEL = { paula: '👩 Paula', agueda: '👩 Águeda', ambas: '🏠 Ambas' }
const PERSON_COLOR = { paula: '#F2A8C8', agueda: '#D3D1C7', ambas: '#F9D6E7' }
const inp = { border: '0.5px solid #D3D1C7', borderRadius: 8, padding: '6px 10px', fontSize: 12, background: '#F8F7F6', color: '#2C2C2A' }

function EditModal({ tx, onSave, onClose }) {
  const [form, setForm] = useState({
    desc: tx.description, amount: tx.amount, cat: tx.cat,
    type: tx.type, date: tx.date?.slice(0,10), person: tx.person || 'ambas', notes: tx.notes || ''
  })
  const set = (k, v) => setForm(f => ({ ...f, [k]: v }))
  const s = { ...inp, width: '100%', marginBottom: 8, fontSize: 13 }

  return (
    <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.35)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 100 }}>
      <div style={{ background: '#fff', borderRadius: 18, padding: '1.25rem', width: 340, border: '0.5px solid #D3D1C7', boxShadow: '0 8px 32px rgba(0,0,0,0.12)' }}>
        <h3 style={{ fontSize: 15, fontWeight: 600, marginBottom: '0.85rem', color: '#993556' }}>✏️ Editar movimiento</h3>
        <input style={s} placeholder="Descripción" value={form.desc} onChange={e => set('desc', e.target.value)} />
        <input style={s} type="number" placeholder="Importe" value={form.amount} onChange={e => set('amount', e.target.value)} />
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8, marginBottom: 8 }}>
          <select style={inp} value={form.cat} onChange={e => set('cat', e.target.value)}>
            {CATS.map(c => <option key={c.id} value={c.id}>{c.icon} {c.name}</option>)}
          </select>
          <select style={inp} value={form.type} onChange={e => set('type', e.target.value)}>
            <option value="expense">Gasto</option>
            <option value="income">Ingreso</option>
          </select>
        </div>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8, marginBottom: 8 }}>
          <select style={inp} value={form.person} onChange={e => set('person', e.target.value)}>
            <option value="ambas">🏠 Ambas</option>
            <option value="paula">👩 Paula</option>
            <option value="agueda">👩 Águeda</option>
          </select>
          <input style={inp} type="date" value={form.date} onChange={e => set('date', e.target.value)} />
        </div>
        <input style={{ ...inp, width: '100%', marginBottom: 12, fontSize: 13 }} placeholder="Nota (opcional)" value={form.notes} onChange={e => set('notes', e.target.value)} />
        <div style={{ display: 'flex', gap: 8 }}>
          <button onClick={onClose} style={{ flex: 1, padding: '9px', borderRadius: 10, border: '0.5px solid #D3D1C7', background: '#F8F7F6', cursor: 'pointer', fontSize: 13, fontWeight: 500 }}>Cancelar</button>
          <button onClick={() => onSave(form)} style={{ flex: 2, padding: '9px', borderRadius: 10, border: 'none', background: '#D4537E', color: 'white', cursor: 'pointer', fontSize: 13, fontWeight: 500 }}>Guardar cambios</button>
        </div>
      </div>
    </div>
  )
}

export default function TxList({ transactions, onDelete, onEdit, filters, onFilterChange }) {
  const [editing, setEditing] = useState(null)
  const [confirming, setConfirming] = useState(null)
  const [sortBy, setSortBy] = useState('date')
  const [sortDir, setSortDir] = useState('desc')

  const toggleSort = (col) => {
    if (sortBy === col) setSortDir(d => d === 'desc' ? 'asc' : 'desc')
    else { setSortBy(col); setSortDir('desc') }
  }

  const sorted = [...transactions].sort((a, b) => {
    let va, vb
    if (sortBy === 'date') { va = new Date(a.date); vb = new Date(b.date) }
    else if (sortBy === 'amount') { va = Number(a.amount); vb = Number(b.amount) }
    else { va = a.description?.toLowerCase(); vb = b.description?.toLowerCase() }
    return sortDir === 'desc' ? (va > vb ? -1 : 1) : (va < vb ? -1 : 1)
  })

  const SortBtn = ({ col, label }) => (
    <button onClick={() => toggleSort(col)} style={{
      background: sortBy === col ? '#F9D6E7' : '#fff',
      border: `0.5px solid ${sortBy === col ? '#F2A8C8' : '#D3D1C7'}`,
      borderRadius: 6, padding: '3px 8px', fontSize: 11, cursor: 'pointer',
      color: sortBy === col ? '#993556' : '#5F5E5A', fontWeight: sortBy === col ? 600 : 400,
    }}>
      {label} {sortBy === col ? (sortDir === 'desc' ? '↓' : '↑') : ''}
    </button>
  )

  return (
    <div>
      {editing && <EditModal tx={editing} onSave={async (form) => { await onEdit(editing.id, form); setEditing(null) }} onClose={() => setEditing(null)} />}
      {confirming && (
        <ConfirmDialog
          message={`¿Eliminar "${confirming.description}"?`}
          onConfirm={() => { onDelete(confirming.id); setConfirming(null) }}
          onCancel={() => setConfirming(null)}
        />
      )}

      <div style={{ background: '#fff', border: '0.5px solid #D3D1C7', borderRadius: 12, padding: '0.75rem 1rem', marginBottom: 10 }}>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 8, marginBottom: 8 }}>
          <input style={{ ...inp, width: '100%' }} placeholder="🔍 Buscar..." value={filters.search || ''} onChange={e => onFilterChange({ ...filters, search: e.target.value })} />
          <select style={{ ...inp, width: '100%' }} value={filters.cat || ''} onChange={e => onFilterChange({ ...filters, cat: e.target.value })}>
            <option value="">Todas las categorías</option>
            {CATS.map(c => <option key={c.id} value={c.id}>{c.icon} {c.name}</option>)}
          </select>
          <select style={{ ...inp, width: '100%' }} value={filters.person || ''} onChange={e => onFilterChange({ ...filters, person: e.target.value })}>
            <option value="">Todas las personas</option>
            <option value="paula">👩 Paula</option>
            <option value="agueda">👩 Águeda</option>
            <option value="ambas">🏠 Ambas</option>
          </select>
        </div>
        <div style={{ display: 'flex', gap: 6, alignItems: 'center' }}>
          <span style={{ fontSize: 11, color: '#888780' }}>Ordenar:</span>
          <SortBtn col="date" label="Fecha" />
          <SortBtn col="amount" label="Importe" />
          <SortBtn col="description" label="Nombre" />
          <span style={{ marginLeft: 'auto', fontSize: 11, color: '#888780' }}>{sorted.length} resultados</span>
        </div>
      </div>

      {sorted.length === 0 && (
        <div style={{ textAlign: 'center', padding: '2rem', color: '#888780' }}>
          <div style={{ fontSize: 32, marginBottom: 8 }}>🔍</div>
          <p style={{ fontSize: 13 }}>Sin resultados con estos filtros</p>
        </div>
      )}

      <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
        {sorted.map(t => {
          const cat = catById(t.cat)
          const d = new Date(t.date)
          const dateStr = `${d.getDate()} ${MONTHS[d.getMonth()].slice(0,3)}`
          const isIncome = t.type === 'income'
          const person = t.person || 'ambas'
          return (
            <div key={t.id} style={{
              background: '#fff', border: '0.5px solid #D3D1C7',
              borderRadius: 10, padding: '0.65rem 1rem',
              transition: 'border-color 0.15s',
            }}
              onMouseEnter={e => e.currentTarget.style.borderColor = '#F2A8C8'}
              onMouseLeave={e => e.currentTarget.style.borderColor = '#D3D1C7'}
            >
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                  <div style={{ width: 32, height: 32, borderRadius: 8, background: cat.bg, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 15, flexShrink: 0 }}>{cat.icon}</div>
                  <div>
                    <div style={{ fontSize: 13, fontWeight: 500 }}>{t.description}</div>
                    <div style={{ display: 'flex', gap: 5, alignItems: 'center', marginTop: 2, flexWrap: 'wrap' }}>
                      <span style={{ fontSize: 10, padding: '1px 6px', borderRadius: 99, background: PERSON_COLOR[person], color: '#5F5E5A', fontWeight: 500 }}>{PERSON_LABEL[person]}</span>
                      {t.notes && <span style={{ fontSize: 11, color: '#B4B2A9', fontStyle: 'italic' }}>"{t.notes}"</span>}
                    </div>
                  </div>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                  <div style={{ textAlign: 'right' }}>
                    <div style={{ fontSize: 14, fontWeight: 600, color: isIncome ? '#3B6D11' : '#993556' }}>{isIncome ? '+' : '-'}€{Number(t.amount).toFixed(0)}</div>
                    <div style={{ fontSize: 11, color: '#888780' }}>{dateStr}</div>
                  </div>
                  <button onClick={() => setEditing(t)} style={{ border: 'none', background: 'none', cursor: 'pointer', fontSize: 15, color: '#D3D1C7', padding: '2px 3px' }}
                    onMouseEnter={e => e.target.style.color = '#D4537E'} onMouseLeave={e => e.target.style.color = '#D3D1C7'}>✏️</button>
                  <button onClick={() => setConfirming(t)} style={{ border: 'none', background: 'none', cursor: 'pointer', fontSize: 15, color: '#D3D1C7', padding: '2px 3px' }}
                    onMouseEnter={e => e.target.style.color = '#E24B4A'} onMouseLeave={e => e.target.style.color = '#D3D1C7'}>✕</button>
                </div>
              </div>
            </div>
          )
        })}
      </div>
    </div>
  )
}
