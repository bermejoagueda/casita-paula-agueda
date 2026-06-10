import React, { useState, useEffect } from 'react'
import { CATS } from '../constants'

const today = new Date().toISOString().slice(0, 10)
const inp = { width: '100%', border: '0.5px solid #D3D1C7', borderRadius: 9, padding: '8px 10px', fontSize: 13, background: '#F8F7F6', color: '#2C2C2A', outline: 'none' }

export default function AddForm({ onAdd, exchangeRate }) {
  const [form, setForm] = useState({ desc: '', amount: '', cat: '', type: 'expense', date: today, person: 'ambas', notes: '', currency: 'EUR' })
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const set = (k, v) => setForm(f => ({ ...f, [k]: v }))

  const amountEur = form.currency === 'MXN' && form.amount && exchangeRate
    ? (parseFloat(form.amount) / exchangeRate).toFixed(2)
    : form.amount

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (!form.desc || !form.amount || !form.cat || !form.date) { setError('Rellena todos los campos'); return }
    setError(''); setLoading(true)
    try {
      const amount_eur = form.currency === 'MXN' ? parseFloat((parseFloat(form.amount) / exchangeRate).toFixed(2)) : parseFloat(form.amount)
      await onAdd({
        desc: form.desc, amount_eur, amount_orig: parseFloat(form.amount),
        currency: form.currency, exchange_rate: form.currency === 'MXN' ? exchangeRate : 1,
        cat: form.cat, type: form.type, date: form.date, person: form.person, notes: form.notes,
      })
      setForm({ desc: '', amount: '', cat: '', type: 'expense', date: today, person: 'ambas', notes: '', currency: form.currency })
    } catch { setError('Error al guardar') } finally { setLoading(false) }
  }

  return (
    <div style={{ background: '#fff', border: '0.5px solid #D3D1C7', borderRadius: 14, padding: '1rem 1.25rem', marginBottom: '1.25rem' }}>
      <h3 style={{ fontSize: 14, fontWeight: 600, marginBottom: '0.85rem' }}>＋ Añadir movimiento</h3>
      <form onSubmit={handleSubmit}>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8, marginBottom: 8 }}>
          <input style={inp} placeholder="Descripción" value={form.desc} onChange={e => set('desc', e.target.value)} />
          <div style={{ display: 'flex', gap: 6 }}>
            <input style={{ ...inp, flex: 1 }} type="number" placeholder="Importe" min="0" step="0.01" value={form.amount} onChange={e => set('amount', e.target.value)} />
            <div style={{ display: 'flex', borderRadius: 9, overflow: 'hidden', border: '0.5px solid #D3D1C7', flexShrink: 0 }}>
              {['MXN','EUR'].map(c => (
                <button key={c} type="button" onClick={() => set('currency', c)} style={{
                  padding: '0 10px', border: 'none', cursor: 'pointer', fontSize: 11, fontWeight: 600,
                  background: form.currency === c ? '#D4537E' : '#F8F7F6',
                  color: form.currency === c ? 'white' : '#888780',
                  transition: 'all 0.15s',
                }}>{c}</button>
              ))}
            </div>
          </div>
        </div>

        {form.currency === 'MXN' && form.amount && exchangeRate && (
          <div style={{ background: '#EAF3DE', borderRadius: 8, padding: '7px 10px', fontSize: 12, color: '#3B6D11', marginBottom: 8, display: 'flex', alignItems: 'center', gap: 6 }}>
            <span>↔</span>
            <span>${parseFloat(form.amount).toLocaleString('es-MX')} MXN = <strong>€{amountEur}</strong> · 1 EUR = ${exchangeRate.toFixed(1)} MXN</span>
          </div>
        )}

        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 8, marginBottom: 8 }}>
          <select style={inp} value={form.cat} onChange={e => set('cat', e.target.value)}>
            <option value="">Categoría...</option>
            {CATS.map(c => <option key={c.id} value={c.id}>{c.icon} {c.name}</option>)}
          </select>
          <select style={inp} value={form.type} onChange={e => set('type', e.target.value)}>
            <option value="expense">Gasto</option>
            <option value="income">Ingreso</option>
          </select>
          <select style={inp} value={form.person} onChange={e => set('person', e.target.value)}>
            <option value="ambas">🏠 Ambas</option>
            <option value="paula">👩 Paula</option>
            <option value="agueda">👩 Águeda</option>
          </select>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8, marginBottom: 8 }}>
          <input style={inp} type="date" value={form.date} onChange={e => set('date', e.target.value)} />
          <input style={inp} placeholder="Nota (opcional)" value={form.notes} onChange={e => set('notes', e.target.value)} />
        </div>

        {error && <p style={{ fontSize: 12, color: '#993556', marginBottom: 8 }}>{error}</p>}
        <button type="submit" disabled={loading} style={{
          width: '100%', padding: '9px', borderRadius: 9, border: 'none',
          background: loading ? '#F2A8C8' : '#D4537E', color: 'white',
          fontWeight: 600, fontSize: 13, cursor: loading ? 'not-allowed' : 'pointer',
        }}>
          {loading ? 'Guardando...' : '✓ Añadir'}
        </button>
      </form>
    </div>
  )
}
