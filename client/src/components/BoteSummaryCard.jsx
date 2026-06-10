import React from 'react'

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
  const pct = totalPresupuesto > 0 ? Math.min(100, Math.round(totalReal / totalPresupuesto * 100)) : 0

  const ingP = parseFloat(boteSettings?.ingPaula)  || 0
  const ingA = parseFloat(boteSettings?.ingAgueda) || 0
  const totalIng = ingP + ingA
  const pctP = totalIng > 0 ? ingP / totalIng : 0.5
  const pctA = 1 - pctP
  const paulaCuota  = Math.round(totalPresupuesto * pctP)
  const aguedaCuota = Math.round(totalPresupuesto) - paulaCuota
  const hasSueldos = ingP > 0 && ingA > 0

  const status = totalReal > totalPresupuesto ? 'over' : pct > 80 ? 'warn' : 'ok'
  const statusColors = {
    ok:   { bg: '#EAF3DE', border: '#C0DD97', text: '#3B6D11', bar: '#639922', label: '✓ Bote bajo control' },
    warn: { bg: '#FAEEDA', border: '#FAC775', text: '#854F0B', bar: '#EF9F27', label: '⚠️ Casi al límite del bote' },
    over: { bg: '#FCEBEB', border: '#F7C1C1', text: '#A32D2D', bar: '#E24B4A', label: '🔴 Os habéis pasado del bote' },
  }
  const sc = statusColors[status]

  if (totalPresupuesto === 0) return (
    <div style={{ background:'#fff', border:'0.5px solid #D3D1C7', borderRadius:16, padding:'1.25rem', marginBottom:'1.25rem', textAlign:'center' }}>
      <div style={{ fontSize:28, marginBottom:8 }}>🫙</div>
      <div style={{ fontSize:13, color:'#888780', marginBottom:8 }}>Añade gastos fijos en 🔁 Fijos para activar el bote</div>
      <button onClick={onNavigate} style={{ fontSize:12, color:'#D4537E', background:'#FDF2F6', border:'0.5px solid #F2A8C8', borderRadius:8, padding:'5px 14px', cursor:'pointer', fontWeight:500 }}>Ir al Bote →</button>
    </div>
  )

  return (
    <div style={{ background: sc.bg, border: `1px solid ${sc.border}`, borderRadius:16, padding:'1.25rem', marginBottom:'1.25rem' }}>
      <div style={{ display:'flex', alignItems:'center', justifyContent:'space-between', marginBottom:12 }}>
        <div>
          <div style={{ fontSize:12, fontWeight:600, color: sc.text, marginBottom:2 }}>{sc.label}</div>
          <div style={{ fontSize:11, color: sc.text, opacity:0.7 }}>Bote común del mes</div>
        </div>
        <button onClick={onNavigate} style={{ fontSize:11, color: sc.text, background:'rgba(255,255,255,0.6)', border:`0.5px solid ${sc.border}`, borderRadius:8, padding:'4px 10px', cursor:'pointer', fontWeight:500 }}>
          Ver detalle →
        </button>
      </div>

      <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:10, marginBottom:12 }}>
        <div style={{ background:'rgba(255,255,255,0.6)', borderRadius:10, padding:'10px 14px' }}>
          <div style={{ fontSize:10, color: sc.text, opacity:0.7, marginBottom:3 }}>Presupuesto bote</div>
          <div style={{ fontSize:22, fontWeight:700, color: sc.text }}>{fmt(totalPresupuesto)}</div>
        </div>
        <div style={{ background:'rgba(255,255,255,0.6)', borderRadius:10, padding:'10px 14px' }}>
          <div style={{ fontSize:10, color: sc.text, opacity:0.7, marginBottom:3 }}>Gastado real</div>
          <div style={{ fontSize:22, fontWeight:700, color: sc.text }}>{fmt(totalReal)}</div>
          <div style={{ fontSize:11, fontWeight:600, color: sc.text, marginTop:2 }}>
            {sobra >= 0 ? `sobran ${fmt(sobra)}` : `+${fmt(Math.abs(sobra))}`}
          </div>
        </div>
      </div>

      <div style={{ height:8, background:'rgba(0,0,0,0.08)', borderRadius:4, overflow:'hidden', marginBottom:10 }}>
        <div style={{ height:'100%', width:`${pct}%`, background: sc.bar, borderRadius:4, transition:'width 0.5s' }} />
      </div>
      <div style={{ fontSize:11, color: sc.text, opacity:0.7, textAlign:'right', marginBottom:12 }}>{pct}% del bote usado</div>

      {hasSueldos && (
        <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:8 }}>
          <div style={{ background:'rgba(255,255,255,0.5)', borderRadius:10, padding:'8px 12px' }}>
            <div style={{ fontSize:10, color: sc.text, opacity:0.7, fontWeight:600, marginBottom:3 }}>👩 Paula · {Math.round(pctP*100)}%</div>
            <div style={{ fontSize:18, fontWeight:700, color: sc.text }}>{fmt(paulaCuota)}</div>
            <div style={{ fontSize:10, color: sc.text, opacity:0.6 }}>al bote</div>
          </div>
          <div style={{ background:'rgba(255,255,255,0.5)', borderRadius:10, padding:'8px 12px' }}>
            <div style={{ fontSize:10, color: sc.text, opacity:0.7, fontWeight:600, marginBottom:3 }}>👩 Águeda · {Math.round(pctA*100)}%</div>
            <div style={{ fontSize:18, fontWeight:700, color: sc.text }}>{fmt(aguedaCuota)}</div>
            <div style={{ fontSize:10, color: sc.text, opacity:0.6 }}>al bote</div>
          </div>
        </div>
      )}

      {!hasSueldos && (
        <div style={{ fontSize:11, color: sc.text, opacity:0.7, textAlign:'center' }}>
          Añade los ingresos en 🫙 Bote para ver las cuotas de cada una
        </div>
      )}
    </div>
  )
}
