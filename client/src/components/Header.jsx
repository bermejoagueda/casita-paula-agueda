import React from 'react'

export default function Header({ onLock, exchangeRate, rateUpdatedAt }) {
  const hour = new Date().getHours()
  const greeting = hour < 13 ? '¡Buenos días' : hour < 20 ? '¡Buenas tardes' : '¡Buenas noches'

  const timeAgo = (date) => {
    if (!date) return 'cargando...'
    const mins = Math.round((Date.now() - new Date(date)) / 60000)
    if (mins < 2) return 'ahora mismo'
    if (mins < 60) return `hace ${mins} min`
    return `hace ${Math.round(mins/60)}h`
  }

  return (
    <header style={{
      background: 'linear-gradient(135deg, #F9D6E7 0%, #F1EFE8 100%)',
      border: '0.5px solid #F2A8C8', borderRadius: 18,
      padding: '1.1rem 1.5rem', marginBottom: '1.25rem',
    }}>
      <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', marginBottom: 8 }}>
        <div>
          <p style={{ fontSize: 11, color: '#D4537E', fontWeight: 500, marginBottom: 2 }}>{greeting} chicas! 👋</p>
          <h1 style={{ fontSize: 20, fontWeight: 700, color: '#993556' }}>🏠 Casita de Paula & Águeda</h1>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          <div style={{ display: 'flex' }}>
            {[{l:'P',i:0},{l:'Á',i:1}].map(({l,i}) => (
              <div key={l} style={{
                width: 36, height: 36, borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center',
                fontWeight: 700, fontSize: 13, border: '2px solid white',
                background: i === 0 ? '#F2A8C8' : '#D3D1C7', color: i === 0 ? '#993556' : '#5F5E5A',
                marginLeft: i > 0 ? -8 : 0,
              }}>{l}</div>
            ))}
          </div>
          {onLock && (
            <button onClick={onLock} title="Bloquear" style={{ background: 'rgba(255,255,255,0.7)', border: '0.5px solid #D3D1C7', borderRadius: 9, padding: '5px 8px', cursor: 'pointer', fontSize: 13, color: '#888780' }}>🔒</button>
          )}
        </div>
      </div>

      {exchangeRate && (
        <div style={{ display: 'inline-flex', alignItems: 'center', gap: 6, background: '#fff', border: '0.5px solid #F2A8C8', borderRadius: 99, padding: '4px 12px' }}>
          <span style={{ width: 6, height: 6, borderRadius: '50%', background: '#3B6D11', display: 'inline-block' }}></span>
          <span style={{ fontSize: 11, color: '#993556', fontWeight: 600 }}>1 EUR = ${exchangeRate.toFixed(1)} MXN</span>
          <span style={{ fontSize: 10, color: '#B4B2A9' }}>· {timeAgo(rateUpdatedAt)}</span>
        </div>
      )}
    </header>
  )
}
