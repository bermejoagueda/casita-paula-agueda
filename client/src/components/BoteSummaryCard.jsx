import React from 'react'
import { CATS } from '../constants'

const fmt = n => '€' + Math.round(n).toLocaleString('es-ES')

export default function BoteSummaryCard({ recurring, exchangeRate, boteSettings, transactions, onNavigate }) {
  const rate = exchangeRate || 20
  const active = recurring.filter(r => r.active)

  const totalPresupuesto = active.reduce((acc, r) => {
    return acc + (r.currency === 'MXN' ? r.amount / rate : Number(r.amount))
  }, 0)

  const expenses = (transactions || []).filter(t => t.type === 'expense')
  const totalReal = expenses.reduce((a, t) => a + Number(t.amount_eur || t.amount || 0), 0)
  const sobra = totalPresupuesto - totalReal

  const ingP = parseFloat(boteSettings?.ingPaula)  || 0
  const ingA = parseFloat(boteSettings?.ingAgueda) || 0
  const totalIng = ingP + ingA
  const pctP = totalIng > 0 ? ingP / totalIng : 0.5
  const pctA = 1 - pctP
  const paulaCuota  = Math.round(totalPresupuesto * pctP)
  const aguedaCuota = Math.round(totalPresupuesto) - paulaCuota
  const hasSueldos = ingP > 0 && ingA > 0
  const pct = totalPresupuesto > 0 ? Math.min(100, Math.round(totalReal / totalPresupuesto * 100)) : 0
  const barColor = totalReal > totalPresupuesto ? '#E24B4A' : pct > 80 ? '#EF9F27' : '#D4537E'

  return (
    <div style={{ background:'#fff', border:'0.5px solid #D3D1C7', borderRadius:14, padding:'1rem 1.25rem', marginBottom:'1.25rem' }}>
      <div style={{ display:'flex', alignItems:'center', justifyContent:'space-between', marginBottom:10 }}>
        <h3 style={{ fontSize:14, fontWeight:600 }}>🫙 Bote común este mes</h3>
        <button onClick={onNavigate} style={{ fontSize:11, color:'#D4537E', background:'#FDF2F6', border:'0.5px solid #F2A8C8', borderRadius:7, padding:'3px 10px', cursor:'pointer', fontWeight:500 }}>
          Ver detalle →
        </button>
      </div>

      {totalPresupuesto > 0 ? (
        <>
          <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:8, marginBottom:10 }}>
            <div style={{ background:'#F8F7F6', borderRadius:9, padding:'8px 12px' }}>
              <div style={{ fontSize:10, color:'#888780', marginBottom:2 }}>Presupuesto</div>
              <div style={{ fontSize:16, fontWeight:700, color:'#2C2C2A' }}>{fmt(totalPresupuesto)}</div>
            </div>
            <div style={{ background:'#F8F7F6', borderRadius:9, padding:'8px 12px' }}>
              <div style={{ fontSize:10, color:'#888780', marginBottom:2 }}>Gastado</div>
              <div style={{ fontSize:16, fontWeight:700, color:'#993556' }}>{fmt(totalReal)}</div>
              <div style={{ fontSize:10, color: sobra >= 0 ? '#3B6D11' : '#E24B4A', fontWeight:500 }}>
                {sobra >= 0 ? `sobran ${fmt(sobra)}` : `+${fmt(Math.abs(sobra))}`}
              </div>
            </div>
          </div>

          <div style={{ height:5, background:'#E8E6E2', borderRadius:3, overflow:'hidden', marginBottom:10 }}>
            <div style={{ height:'100%', width:`${pct}%`, background:barColor, borderRadius:3, transition:'width 0.4s' }} />
          </div>

          {hasSueldos ? (
            <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:8 }}>
              <div style={{ background:'#FDF2F6', border:'0.5px solid #F2A8C8', borderRadius:10, padding:'8px 12px' }}>
                <div style={{ fontSize:10, color:'#D4537E', fontWeight:600, marginBottom:3 }}>👩 Paula · {Math.round(pctP*100)}%</div>
                <div style={{ fontSize:18, fontWeight:700, color:'#993556' }}>{fmt(paulaCuota)}</div>
              </div>
              <div style={{ background:'#F8F7F6', border:'0.5px solid #D3D1C7', borderRadius:10, padding:'8px 12px' }}>
                <div style={{ fontSize:10, color:'#5F5E5A', fontWeight:600, marginBottom:3 }}>👩 Águeda · {Math.round(pctA*100)}%</div>
                <div style={{ fontSize:18, fontWeight:700, color:'#2C2C2A' }}>{fmt(aguedaCuota)}</div>
              </div>
            </div>
          ) : (
            <div style={{ background:'#FDF2F6', borderRadius:9, padding:'7px 12px', fontSize:11, color:'#993556', textAlign:'center' }}>
              Añade los ingresos en 🫙 Bote para ver las cuotas
            </div>
          )}
        </>
      ) : (
        <div style={{ textAlign:'center', padding:'0.5rem', color:'#888780', fontSize:12 }}>
          Añade gastos fijos en 🔁 Fijos para calcular el bote
        </div>
      )}
    </div>
  )
}
