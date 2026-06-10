import React from 'react'

const fmt = n => '€' + Math.round(n).toLocaleString('es-ES')

export default function BoteSummaryCard({ recurring, exchangeRate, boteSettings, onNavigate }) {
  const rate = exchangeRate || 20
  const active = recurring.filter(r => r.active)
  const totalFijos = active.reduce((acc, r) => {
    return acc + (r.currency === 'MXN' ? r.amount / rate : Number(r.amount))
  }, 0)

  const ingP = parseFloat(boteSettings?.ingPaula)  || 0
  const ingA = parseFloat(boteSettings?.ingAgueda) || 0
  const totalIng = ingP + ingA

  const pctP = totalIng > 0 ? ingP / totalIng : 0.5
  const pctA = 1 - pctP
  const paulaCuota  = Math.round(totalFijos * pctP)
  const aguedaCuota = Math.round(totalFijos) - paulaCuota

  const hasSueldos = ingP > 0 && ingA > 0

  return (
    <div style={{ background: '#fff', border: '0.5px solid #D3D1C7', borderRadius: 14, padding: '1rem 1.25rem', marginBottom: '1.25rem' }}>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 10 }}>
        <h3 style={{ fontSize: 14, fontWeight: 600 }}>🫙 Bote común este mes</h3>
        <button onClick={onNavigate} style={{ fontSize: 11, color: '#D4537E', background: '#FDF2F6', border: '0.5px solid #F2A8C8', borderRadius: 7, padding: '3px 10px', cursor: 'pointer', fontWeight: 500 }}>
          Ver detalle →
        </button>
      </div>

      {totalFijos > 0 ? (
        <>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 10 }}>
            <span style={{ fontSize: 12, color: '#888780' }}>Total fijos del mes</span>
            <span style={{ fontSize: 16, fontWeight: 700, color: '#993556' }}>{fmt(totalFijos)}</span>
          </div>

          {hasSueldos ? (
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8 }}>
              <div style={{ background: '#FDF2F6', border: '0.5px solid #F2A8C8', borderRadius: 10, padding: '10px 12px' }}>
                <div style={{ fontSize: 10, color: '#D4537E', fontWeight: 600, marginBottom: 4 }}>
                  👩 Paula · {Math.round(pctP * 100)}%
                </div>
                <div style={{ fontSize: 20, fontWeight: 700, color: '#993556' }}>{fmt(paulaCuota)}</div>
                <div style={{ fontSize: 10, color: '#D4537E', marginTop: 2 }}>al bote</div>
              </div>
              <div style={{ background: '#F8F7F6', border: '0.5px solid #D3D1C7', borderRadius: 10, padding: '10px 12px' }}>
                <div style={{ fontSize: 10, color: '#5F5E5A', fontWeight: 600, marginBottom: 4 }}>
                  👩 Águeda · {Math.round(pctA * 100)}%
                </div>
                <div style={{ fontSize: 20, fontWeight: 700, color: '#2C2C2A' }}>{fmt(aguedaCuota)}</div>
                <div style={{ fontSize: 10, color: '#888780', marginTop: 2 }}>al bote</div>
              </div>
            </div>
          ) : (
            <div style={{ background: '#FDF2F6', borderRadius: 9, padding: '8px 12px', fontSize: 12, color: '#993556', textAlign: 'center' }}>
              Añade los ingresos en 🫙 Bote para ver las cuotas
            </div>
          )}
        </>
      ) : (
        <div style={{ textAlign: 'center', padding: '0.5rem', color: '#888780', fontSize: 12 }}>
          Añade gastos fijos en 🔁 Fijos para calcular el bote
        </div>
      )}
    </div>
  )
}
