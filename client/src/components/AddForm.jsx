import React, { useState } from 'react'
import { CATS } from '../constants'

const today = new Date().toISOString().slice(0, 10)

const inputStyle = {
  width: '100%',
  border: '0.5px solid #D3D1C7',
  borderRadius: 9,
  padding: '8px 10px',
  fontSize: 13,
  background: '#F8F7F6',
  color: '#2C2C2A',
  outline: 'none',
}

export default function AddForm({ onAdd }) {
  const [form, setForm] = useState({ desc: '', amount: '', cat: '', type: 'expense', date: today })
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  const set = (k, v) => setForm(f => ({ ...f, [k]: v }))

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (!form.desc || !form.amount || !form.cat || !form.date) {
      setError('Rellena todos los campos')
      return
    }
    setError('')
    setLoading(true)
    try {
      await onAdd({ ...form, amount: parseFloat(form.amount) })
      setForm({ desc: '', amount: '', cat: '', type: 'expense', date: today })
    } catch (err) {
      setError('Error al guardar. Inténtalo de nuevo.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div style={{
      background: '#fff',
      border: '0.5px solid #D3D1C7',
      borderRadius: 14,
      padding: '1rem 1.25rem',
      marginBottom: '1.25rem',
    }}>
      <h3 style={{ fontSize: 14, fontWeight: 500, marginBottom: '0.85rem' }}>＋ Añadir movimiento</h3>

      <form onSubmit={handleSubmit}>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8, marginBottom: 8 }}>
          <input style={inputStyle} placeholder="Descripción"
            value={form.desc} onChange={e => set('desc', e.target.value)} />
          <input style={inputStyle} type="number" placeholder="Importe (€)" min="0" step="0.01"
            value={form.amount} onChange={e => set('amount', e.target.value)} />
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8, marginBottom: 8 }}>
          <select style={inputStyle} value={form.cat} onChange={e => set('cat', e.target.value)}>
            <option value="">Categoría...</option>
            {CATS.map(c => <option key={c.id} value={c.id}>{c.icon} {c.name}</option>)}
          </select>
          <select style={inputStyle} value={form.type} onChange={e => set('type', e.target.value)}>
            <option value="expense">Gasto</option>
            <option value="income">Ingreso</option>
          </select>
        </div>

        <input style={{ ...inputStyle, marginBottom: 8 }} type="date"
          value={form.date} onChange={e => set('date', e.target.value)} />

        {error && <p style={{ fontSize: 12, color: '#993556', marginBottom: 8 }}>{error}</p>}

        <button type="submit" disabled={loading} style={{
          width: '100%', padding: '9px', borderRadius: 9, border: 'none',
          background: loading ? '#F2A8C8' : '#D4537E',
          color: 'white', fontWeight: 500, fontSize: 13,
          cursor: loading ? 'not-allowed' : 'pointer',
          transition: 'background 0.15s',
        }}>
          {loading ? 'Guardando...' : '✓ Añadir'}
        </button>
      </form>
    </div>
  )
}
