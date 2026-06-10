import React from 'react'

export default function Header({ onLock }) {
  return (
    <header style={{
      background: 'linear-gradient(135deg, #F9D6E7 0%, #F1EFE8 100%)',
      border: '0.5px solid #F2A8C8', borderRadius: 16, padding: '1.1rem 1.5rem',
      marginBottom: '1.25rem', display: 'flex', alignItems: 'center', justifyContent: 'space-between',
    }}>
      <div>
        <h1 style={{ fontSize: 20, fontWeight: 600, color: '#993556', marginBottom: 2 }}>🏠 Casita de Paula & Águeda</h1>
        <p style={{ fontSize: 13, color: '#5F5E5A' }}>Gestión de gastos del hogar</p>
      </div>
      <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
        <div style={{ display: 'flex', gap: 6 }}>
          {['P','Á'].map((l, i) => (
            <div key={l} style={{ width: 38, height: 38, borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 600, fontSize: 13, border: '2px solid white', background: i === 0 ? '#F2A8C8' : '#D3D1C7', color: i === 0 ? '#993556' : '#5F5E5A' }}>{l}</div>
          ))}
        </div>
        {onLock && (
          <button onClick={onLock} title="Bloquear" style={{ background: 'none', border: '0.5px solid #D3D1C7', borderRadius: 8, padding: '5px 8px', cursor: 'pointer', fontSize: 14, color: '#888780' }}>🔒</button>
        )}
      </div>
    </header>
  )
}
