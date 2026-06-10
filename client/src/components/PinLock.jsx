import React, { useState } from 'react'

const HINTS = [
  'Vuestro hogar, vuestras cuentas 🏠',
  'Todo bajo control 💕',
  'Paula & Águeda 👩👩',
]

export default function PinLock({ onUnlock }) {
  const [pin, setPin] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const [shake, setShake] = useState(false)
  const hint = HINTS[new Date().getDate() % HINTS.length]

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
        else {
          setShake(true)
          setTimeout(() => setShake(false), 500)
          setError('PIN incorrecto, inténtalo de nuevo')
          setPin('')
        }
      } catch { setError('Error de conexión'); setPin('') }
      finally { setLoading(false) }
    }
  }

  const keys = ['1','2','3','4','5','6','7','8','9','','0','del']

  return (
    <div style={{ minHeight: '100vh', background: 'linear-gradient(160deg, #FDF2F6 0%, #F1EFE8 100%)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
      <div style={{ textAlign: 'center', width: 300 }}>
        <div style={{ fontSize: 52, marginBottom: 8 }}>🏠</div>
        <h1 style={{ fontSize: 20, fontWeight: 600, color: '#993556', marginBottom: 4 }}>Casita de Paula & Águeda</h1>
        <p style={{ fontSize: 13, color: '#888780', marginBottom: '2rem' }}>{hint}</p>

        <div style={{
          background: '#fff', borderRadius: 24, padding: '1.75rem',
          border: '0.5px solid #F2A8C8', boxShadow: '0 8px 32px rgba(212,83,126,0.08)',
        }}>
          <div style={{
            display: 'flex', justifyContent: 'center', gap: 12, marginBottom: '1.5rem',
            animation: shake ? 'shake 0.4s ease' : 'none',
          }}>
            {[0,1,2,3].map(i => (
              <div key={i} style={{
                width: 14, height: 14, borderRadius: '50%',
                background: pin.length > i ? '#D4537E' : '#F1EFE8',
                border: `2px solid ${pin.length > i ? '#D4537E' : '#D3D1C7'}`,
                transition: 'all 0.15s',
                transform: pin.length > i ? 'scale(1.1)' : 'scale(1)',
              }} />
            ))}
          </div>

          {error && <p style={{ fontSize: 12, color: '#E24B4A', marginBottom: '0.75rem', fontWeight: 500 }}>{error}</p>}

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 10 }}>
            {keys.map((k, i) => k === '' ? <div key={i} /> : (
              <button key={i} onClick={() => !loading && handleKey(k)} style={{
                height: 56, borderRadius: 14,
                border: '0.5px solid #E8E6E2',
                background: k === 'del' ? '#F8F7F6' : '#fff',
                fontSize: k === 'del' ? 18 : 22, fontWeight: 500,
                color: '#2C2C2A', cursor: loading ? 'not-allowed' : 'pointer',
                transition: 'all 0.1s', outline: 'none',
              }}
                onMouseDown={e => { e.currentTarget.style.background = '#F9D6E7'; e.currentTarget.style.transform = 'scale(0.96)' }}
                onMouseUp={e => { e.currentTarget.style.background = k === 'del' ? '#F8F7F6' : '#fff'; e.currentTarget.style.transform = 'scale(1)' }}
              >
                {k === 'del' ? '⌫' : k}
              </button>
            ))}
          </div>
        </div>
        <p style={{ fontSize: 11, color: '#B4B2A9', marginTop: '1.25rem' }}>PIN por defecto: 1234</p>
      </div>
      <style>{`@keyframes shake { 0%,100%{transform:translateX(0)} 25%{transform:translateX(-8px)} 75%{transform:translateX(8px)} }`}</style>
    </div>
  )
}
