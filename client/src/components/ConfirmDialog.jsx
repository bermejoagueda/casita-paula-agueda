import React from 'react'

export default function ConfirmDialog({ message, onConfirm, onCancel, confirmLabel = 'Eliminar', danger = true }) {
  return (
    <div style={{
      position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.3)',
      display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 200
    }}>
      <div style={{
        background: '#fff', borderRadius: 16, padding: '1.5rem', width: 300,
        border: '0.5px solid #D3D1C7', textAlign: 'center',
      }}>
        <div style={{ fontSize: 28, marginBottom: 8 }}>🗑️</div>
        <p style={{ fontSize: 14, color: '#2C2C2A', marginBottom: '1.25rem', lineHeight: 1.5 }}>{message}</p>
        <div style={{ display: 'flex', gap: 8 }}>
          <button onClick={onCancel} style={{
            flex: 1, padding: '9px', borderRadius: 10, border: '0.5px solid #D3D1C7',
            background: '#F8F7F6', cursor: 'pointer', fontSize: 13, fontWeight: 500, color: '#5F5E5A'
          }}>Cancelar</button>
          <button onClick={onConfirm} style={{
            flex: 1, padding: '9px', borderRadius: 10, border: 'none',
            background: danger ? '#E24B4A' : '#D4537E', color: 'white',
            cursor: 'pointer', fontSize: 13, fontWeight: 500
          }}>{confirmLabel}</button>
        </div>
      </div>
    </div>
  )
}
