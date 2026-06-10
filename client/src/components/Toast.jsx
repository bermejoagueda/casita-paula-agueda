import React, { useEffect, useState } from 'react'

export default function Toast({ message, type = 'success', onDone }) {
  const [visible, setVisible] = useState(true)

  useEffect(() => {
    const t = setTimeout(() => { setVisible(false); setTimeout(onDone, 300) }, 2800)
    return () => clearTimeout(t)
  }, [])

  const colors = {
    success: { bg: '#EAF3DE', border: '#C0DD97', color: '#3B6D11', icon: '✓' },
    error:   { bg: '#FCEBEB', border: '#F7C1C1', color: '#A32D2D', icon: '✕' },
    info:    { bg: '#FDF2F6', border: '#F2A8C8', color: '#993556', icon: '🏠' },
    warning: { bg: '#FAEEDA', border: '#FAC775', color: '#854F0B', icon: '⚠️' },
  }
  const c = colors[type]

  return (
    <div style={{
      position: 'fixed', bottom: 24, left: '50%', transform: `translateX(-50%) translateY(${visible ? 0 : 20}px)`,
      opacity: visible ? 1 : 0, transition: 'all 0.3s ease',
      background: c.bg, border: `1px solid ${c.border}`, borderRadius: 12,
      padding: '10px 18px', fontSize: 13, fontWeight: 500, color: c.color,
      display: 'flex', alignItems: 'center', gap: 8,
      boxShadow: '0 4px 16px rgba(0,0,0,0.10)', zIndex: 1000, whiteSpace: 'nowrap',
    }}>
      <span>{c.icon}</span> {message}
    </div>
  )
}
