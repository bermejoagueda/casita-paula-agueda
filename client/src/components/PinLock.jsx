import React, { useState } from 'react'

export default function PinLock({ onUnlock }) {
  const [pin, setPin] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  const handleKey = async (k) => {
    if (k === 'del') { setPin(p => p.slice(0, -1)); setError(''); return }
    if (pin.length >= 4) return
    const newPin = pin + k
    setPin(newPin)
    if (newPin.length === 4) {
      setLoading(true)
      try {
        const res = await fetch('/api/auth', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ pin: newPin }) })
        const data = await res.json()
        if (data.ok) { onUnlock() }
        else { setError('PIN incorrecto'); setPin('') }
      } catch { setError('Error de conexión'); setPin('') }
      finally { setLoading(false) }
    }
  }

  const keys = ['1','2','3','4','5','6','7','8','9','','0','del']

  return (
    <div style={{ minHeight: '100vh', background: '#F1EFE8', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
      <div style={{ background: '#fff', borderRadius: 20, padding: '2rem 2.5rem', border: '0.5px solid #D3D1C7', textAlign: 'center', width: 300 }}>
        <div style={{ fontSize: 32, marginBottom: 4 }}>🏠</div>
        <h1 style={{ fontSize: 18, fontWeight: 600, color: '#993556', marginBottom: 4 }}>Casita de Paula & Águeda</h1>
        <p style={{ fontSize: 13, color: '#888780', marginBottom: '1.5rem' }}>Introduce el PIN para entrar</p>

        <div style={{ display: 'flex', justifyContent: 'center', gap: 10, marginBottom: '1.5rem' }}>
          {[0,1,2,3].map(i => (
            <div key={i} style={{
              width: 14, height: 14, borderRadius: '50%',
              background: pin.length > i ? '#D4537E' : '#E8E6E2',
              transition: 'background 0.15s',
            }} />
          ))}
        </div>

        {error && <p style={{ fontSize: 12, color: '#E24B4A', marginBottom: '0.75rem' }}>{error}</p>}

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 10 }}>
          {keys.map((k, i) => k === '' ? (
            <div key={i} />
          ) : (
            <button key={i} onClick={() => handleKey(k)} disabled={loading} style={{
              height: 52, borderRadius: 12, border: '0.5px solid #D3D1C7',
              background: k === 'del' ? '#F1EFE8' : '#fff',
              fontSize: k === 'del' ? 16 : 20, fontWeight: 500,
              color: '#2C2C2A', cursor: 'pointer',
              transition: 'background 0.1s',
            }}
              onMouseDown={e => e.currentTarget.style.background = '#F9D6E7'}
              onMouseUp={e => e.currentTarget.style.background = k === 'del' ? '#F1EFE8' : '#fff'}
            >
              {k === 'del' ? '⌫' : k}
            </button>
          ))}
        </div>

        <p style={{ fontSize: 11, color: '#B4B2A9', marginTop: '1.5rem' }}>PIN por defecto: 1234</p>
      </div>
    </div>
  )
}
