import React, { useEffect, useState } from 'react'

const messages = [
  'Preparando la casita... 🏠',
  'Revisando las cuentas... 📊',
  'Casi lista... ✨',
]

export default function LoadingScreen() {
  const [msgIdx, setMsgIdx] = useState(0)
  const [dots, setDots] = useState(0)

  useEffect(() => {
    const t1 = setInterval(() => setMsgIdx(i => (i + 1) % messages.length), 1200)
    const t2 = setInterval(() => setDots(d => (d + 1) % 4), 400)
    return () => { clearInterval(t1); clearInterval(t2) }
  }, [])

  return (
    <div style={{
      display: 'flex', flexDirection: 'column', alignItems: 'center',
      justifyContent: 'center', padding: '4rem 1rem', gap: 16,
    }}>
      <div style={{ fontSize: 48, animation: 'pulse 1.5s infinite' }}>🏠</div>
      <div style={{ fontSize: 14, color: '#D4537E', fontWeight: 500 }}>
        {messages[msgIdx]}{'·'.repeat(dots)}
      </div>
      <div style={{ display: 'flex', gap: 6 }}>
        {[0,1,2].map(i => (
          <div key={i} style={{
            width: 6, height: 6, borderRadius: '50%',
            background: '#F2A8C8',
            animation: `bounce 1.2s ${i * 0.2}s infinite`,
          }} />
        ))}
      </div>
      <style>{`
        @keyframes pulse { 0%,100%{transform:scale(1)} 50%{transform:scale(1.08)} }
        @keyframes bounce { 0%,100%{transform:translateY(0);background:#F2A8C8} 50%{transform:translateY(-6px);background:#D4537E} }
      `}</style>
    </div>
  )
}
