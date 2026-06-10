import React from 'react'

export default function SplitView({ transactions }) {
  const expenses = transactions.filter(t => t.type === 'expense')
  
  const paula = expenses.filter(t => t.person === 'paula').reduce((a, t) => a + Number(t.amount), 0)
  const agueda = expenses.filter(t => t.person === 'agueda').reduce((a, t) => a + Number(t.amount), 0)
  const ambas = expenses.filter(t => t.person === 'ambas').reduce((a, t) => a + Number(t.amount), 0)
  
  const paulaTotal = paula + ambas / 2
  const aguedaTotal = agueda + ambas / 2
  const total = paulaTotal + aguedaTotal
  const diff = Math.abs(paulaTotal - aguedaTotal)
  const whoOwes = paulaTotal > aguedaTotal ? 'Águeda' : 'Paula'
  const owesTo = paulaTotal > aguedaTotal ? 'Paula' : 'Águeda'

  const pctPaula = total > 0 ? Math.round(paulaTotal / total * 100) : 50
  const pctAgueda = 100 - pctPaula

  return (
    <div style={{ background: '#fff', border: '0.5px solid #D3D1C7', borderRadius: 14, padding: '1rem 1.25rem', marginBottom: '1.25rem' }}>
      <h3 style={{ fontSize: 14, fontWeight: 500, marginBottom: '0.85rem' }}>⚖️ Split de gastos</h3>
      
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10, marginBottom: 12 }}>
        {[
          { name: 'Paula', total: paulaTotal, direct: paula, pct: pctPaula, color: '#F2A8C8', textColor: '#993556' },
          { name: 'Águeda', total: aguedaTotal, direct: agueda, pct: pctAgueda, color: '#D3D1C7', textColor: '#5F5E5A' },
        ].map(p => (
          <div key={p.name} style={{ background: '#F8F7F6', borderRadius: 10, padding: '0.75rem 1rem', border: '0.5px solid #E8E6E2' }}>
            <div style={{ fontSize: 12, color: '#888780', marginBottom: 4 }}>👩 {p.name}</div>
            <div style={{ fontSize: 20, fontWeight: 600, color: p.textColor }}>€{p.total.toFixed(0)}</div>
            <div style={{ fontSize: 11, color: '#888780', marginTop: 2 }}>directo €{p.direct.toFixed(0)} · {p.pct}%</div>
            <div style={{ height: 4, background: '#E8E6E2', borderRadius: 2, marginTop: 8 }}>
              <div style={{ height: '100%', width: `${p.pct}%`, background: p.color, borderRadius: 2 }} />
            </div>
          </div>
        ))}
      </div>

      {diff > 0 && (
        <div style={{ background: '#FDF2F6', border: '0.5px solid #F2A8C8', borderRadius: 9, padding: '0.6rem 1rem', fontSize: 13 }}>
          <span style={{ color: '#993556', fontWeight: 500 }}>{whoOwes}</span>
          <span style={{ color: '#5F5E5A' }}> le debe </span>
          <span style={{ color: '#993556', fontWeight: 500 }}>€{diff.toFixed(0)}</span>
          <span style={{ color: '#5F5E5A' }}> a {owesTo} este mes</span>
        </div>
      )}
      {diff === 0 && total > 0 && (
        <div style={{ background: '#EAF3DE', borderRadius: 9, padding: '0.6rem 1rem', fontSize: 13, color: '#3B6D11' }}>
          ¡Estáis al 50/50 este mes! 🎉
        </div>
      )}
      <div style={{ fontSize: 11, color: '#B4B2A9', marginTop: 8, textAlign: 'center' }}>
        Los gastos compartidos se dividen a partes iguales
      </div>
    </div>
  )
}
