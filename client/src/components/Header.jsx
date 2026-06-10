import React from 'react'

export default function Header({ onLock }) {
  const hour = new Date().getHours()
  const greeting = hour < 13 ? '¡Buenos días' : hour < 20 ? '¡Buenas tardes' : '¡Buenas noches'

  return (
    <header style={{
      background: 'linear-gradient(135deg, #F9D6E7 0%, #F1EFE8 100%)',
      border: '0.5px solid #F2A8C8', borderRadius: 18,
      padding: '1.1rem 1.5rem', marginBottom: '1.25rem',
      display: 'flex', alignItems: 'center', justifyContent: 'space-between',
    }}>
      <div>
        <p style={{ fontSize: 11, color: '#D4537E', fontWeight: 500, marginBottom: 2 }}>{greeting} chicas! 👋</p>
        <h1 style={{ fontSize: 20, fontWeight: 700, color: '#993556', marginBottom: 1 }}>🏠 Casita de Paula & Águeda</h1>
        <p style={{ fontSize: 12, color: '#888780' }}>Gestión de gastos del hogar</p>
      </div>
      <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
        <div style={{ display: 'flex' }}>
          {[{l:'P',i:0},{l:'Á',i:1}].map(({l,i}) => (
            <div key={l} style={{
              width: 36, height: 36, borderRadius: '50%',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              fontWeight: 700, fontSize: 13, border: '2px solid white',
              background: i === 0 ? '#F2A8C8' : '#D3D1C7',
              color: i === 0 ? '#993556' : '#5F5E5A',
              marginLeft: i > 0 ? -8 : 0,
            }}>{l}</div>
          ))}
        </div>
        {onLock && (
          <button onClick={onLock} title="Bloquear app" style={{
            background: 'rgba(255,255,255,0.7)', border: '0.5px solid #D3D1C7',
            borderRadius: 9, padding: '5px 8px', cursor: 'pointer', fontSize: 14,
            color: '#888780', transition: 'all 0.15s',
          }}
            onMouseEnter={e => { e.currentTarget.style.background = '#fff'; e.currentTarget.style.color = '#993556' }}
            onMouseLeave={e => { e.currentTarget.style.background = 'rgba(255,255,255,0.7)'; e.currentTarget.style.color = '#888780' }}
          >🔒</button>
        )}
      </div>
    </header>
  )
}
