import React, { useState, useEffect } from 'react'
import { api } from '../api'
import { CATS } from '../constants'

const fmt = n => '€' + Math.round(n).toLocaleString('es-ES')
const catIcon = id => CATS.find(c => c.id === id)?.icon || '📦'
const catName = id => CATS.find(c => c.id === id)?.name || id
const catColor = id => CATS.find(c => c.id === id)?.color || '#D4537E'

export default function BoteView({ recurring, exchangeRate, transactions }) {
  const [ingPaula,  setIngPaula]  = useState('')
  const [ingAgueda, setIngAgueda] = useState('')
  const [saved, setSaved]         = useState(false)
  const [loading, setLoading]     = useState(true)

  useEffect(() => {
    api.getBoteSettings().then(s => {
      if (s.ingPaula)  setIngPaula(s.ingPaula)
      if (s.ingAgueda) setIngAgueda(s.ingAgueda)
    }).finally(() => setLoading(false))
  }, [])

  const handleSave = async () => {
    await api.updateBoteSettings({ ingPaula, ingAgueda })
    setSaved(true)
    setTimeout(() => setSaved(false), 2000)
  }

  const rate = exchangeRate || 20
  const activeRec = recurring.filter(r => r.active)

  // Total presupuesto bote en EUR
  const totalPresupuesto = activeRec.reduce((acc, r) => {
    return acc + (r.currency === 'MXN' ? r.amount / rate : Number(r.amount))
  }, 0)

  // Gasto real por categoría del mes (de transactions)
  const expenses = (transactions || []).filter(t => t.type === 'expense')
  const gastoRealPorCat = {}
  expenses.forEach(t => {
    const amt = Number(t.amount_eur || t.amount || 0)
    gastoRealPorCat[t.cat] = (gastoRealPorCat[t.cat] || 0) + amt
  })

  // Total gastado real
  const totalReal = Object.values(gastoRealPorCat).reduce((a, v) => a + v, 0)
  const sobra = totalPresupuesto - totalReal

  // Split proporcional
  const ingP = parseFloat(ingPaula)  || 0
  const ingA = parseFloat(ingAgueda) || 0
  const totalIng = ingP + ingA
  const pctP = totalIng > 0 ? ingP / totalIng : 0.5
  const pctA = 1 - pctP
  const paulaCuota  = Math.round(totalPresupuesto * pctP)
  const aguedaCuota = Math.round(totalPresupuesto) - paulaCuota

  const inp = { border:'0.5px solid #D3D1C7', borderRadius:9, padding:'8px 10px', fontSize:13, background:'#F8F7F6', color:'#2C2C2A', outline:'none', width:'100%' }

  const whatsapp = () => {
    const msg = `🫙 *Bote común · este mes*\n\nPresupuesto: ${fmt(totalPresupuesto)}\nGastado: ${fmt(totalReal)}\n${sobra >= 0 ? `Sobran: ${fmt(sobra)}` : `Nos hemos pasado: ${fmt(Math.abs(sobra))}`}\n\nPaula (${Math.round(pctP*100)}%): ${fmt(paulaCuota)}\nÁgueda (${Math.round(pctA*100)}%): ${fmt(aguedaCuota)}\n\n¡A transferir! 💸`
    navigator.clipboard.writeText(msg).catch(() => {})
    alert('¡Copiado! Pégalo en WhatsApp 💬')
  }

  if (loading) return <div style={{ textAlign:'center', padding:'2rem', color:'#D4537E', fontSize:13 }}>Cargando...</div>

  return (
    <div>
      {/* Resumen global */}
      <div style={{ background:'#fff', border:'0.5px solid #D3D1C7', borderRadius:14, padding:'1rem 1.25rem', marginBottom:10 }}>
        <div style={{ fontSize:14, fontWeight:700, color:'#2C2C2A', marginBottom:4 }}>🫙 Bote común del mes</div>
        <div style={{ fontSize:11, color:'#888780', marginBottom:12 }}>Presupuesto fijo vs gasto real</div>

        <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:8, marginBottom:12 }}>
          <div style={{ background:'#F8F7F6', borderRadius:10, padding:'10px 12px' }}>
            <div style={{ fontSize:10, color:'#888780', marginBottom:3 }}>💰 Presupuesto bote</div>
            <div style={{ fontSize:20, fontWeight:700, color:'#2C2C2A' }}>{fmt(totalPresupuesto)}</div>
            {ingP > 0 && ingA > 0 && (
              <div style={{ fontSize:10, color:'#B4B2A9', marginTop:2 }}>
                Paula {fmt(paulaCuota)} · Águeda {fmt(aguedaCuota)}
              </div>
            )}
          </div>
          <div style={{ background:'#F8F7F6', borderRadius:10, padding:'10px 12px' }}>
            <div style={{ fontSize:10, color:'#888780', marginBottom:3 }}>💸 Gastado real</div>
            <div style={{ fontSize:20, fontWeight:700, color:'#993556' }}>{fmt(totalReal)}</div>
            <div style={{ fontSize:10, color: sobra >= 0 ? '#3B6D11' : '#E24B4A', marginTop:2, fontWeight:500 }}>
              {sobra >= 0 ? `Sobran ${fmt(sobra)}` : `+${fmt(Math.abs(sobra))} sobre el bote`}
            </div>
          </div>
        </div>

        {totalPresupuesto > 0 && (
          <div style={{ height:8, background:'#E8E6E2', borderRadius:4, overflow:'hidden', marginBottom:4 }}>
            <div style={{
              height:'100%',
              width: `${Math.min(100, Math.round(totalReal / totalPresupuesto * 100))}%`,
              background: totalReal > totalPresupuesto ? '#E24B4A' : totalReal / totalPresupuesto > 0.8 ? '#EF9F27' : '#D4537E',
              borderRadius:4, transition:'width 0.4s'
            }} />
          </div>
        )}
        {totalPresupuesto > 0 && (
          <div style={{ fontSize:11, color:'#888780', textAlign:'right' }}>
            {Math.round(totalReal / totalPresupuesto * 100)}% del bote usado
          </div>
        )}
      </div>

      {/* Por categoría */}
      {activeRec.length > 0 && (
        <div style={{ background:'#fff', border:'0.5px solid #D3D1C7', borderRadius:14, padding:'1rem 1.25rem', marginBottom:10 }}>
          <div style={{ fontSize:13, fontWeight:600, marginBottom:12 }}>Por categoría</div>
          <div style={{ display:'flex', flexDirection:'column', gap:12 }}>
            {activeRec.map(r => {
              const presup = r.currency === 'MXN' ? r.amount / rate : Number(r.amount)
              const real   = gastoRealPorCat[r.cat] || 0
              const pct    = presup > 0 ? Math.min(120, Math.round(real / presup * 100)) : 0
              const sobra  = presup - real
              const overBudget = real > presup
              const barColor = overBudget ? '#E24B4A' : pct > 80 ? '#EF9F27' : '#D4537E'

              return (
                <div key={r.id}>
                  <div style={{ display:'flex', justifyContent:'space-between', alignItems:'flex-start', marginBottom:6 }}>
                    <div style={{ display:'flex', alignItems:'center', gap:8 }}>
                      <div style={{ width:34, height:34, borderRadius:9, background: CATS.find(c=>c.id===r.cat)?.bg || '#FDF2F6', display:'flex', alignItems:'center', justifyContent:'center', fontSize:17 }}>
                        {catIcon(r.cat)}
                      </div>
                      <div>
                        <div style={{ fontSize:13, fontWeight:500 }}>{r.description}</div>
                        <div style={{ fontSize:10, color:'#888780' }}>
                          {r.currency === 'MXN' ? `$${Number(r.amount).toLocaleString('es-MX')} MXN → ${fmt(presup)}` : `estimado ${fmt(presup)}`}
                        </div>
                      </div>
                    </div>
                    <div style={{ textAlign:'right' }}>
                      <div style={{ fontSize:13, fontWeight:700, color: overBudget ? '#E24B4A' : '#993556' }}>
                        {fmt(real)} / {fmt(presup)}
                      </div>
                      <div style={{ fontSize:10, color: overBudget ? '#E24B4A' : '#3B6D11', fontWeight:500 }}>
                        {overBudget ? `⚠️ +${fmt(Math.abs(sobra))} sobre el estimado` : real === 0 ? 'sin gastos aún' : `sobran ${fmt(sobra)}`}
                      </div>
                    </div>
                  </div>
                  <div style={{ height:6, background:'#E8E6E2', borderRadius:3, overflow:'hidden' }}>
                    <div style={{ height:'100%', width:`${pct}%`, background:barColor, borderRadius:3, transition:'width 0.4s' }} />
                  </div>
                  {pct > 0 && (
                    <div style={{ fontSize:10, color:'#B4B2A9', marginTop:3, textAlign:'right' }}>
                      {pct}% del estimado gastado
                    </div>
                  )}
                </div>
              )
            })}
          </div>

          {sobra >= 0 ? (
            <div style={{ background:'#EAF3DE', borderRadius:9, padding:'9px 12px', fontSize:12, color:'#3B6D11', fontWeight:500, marginTop:12 }}>
              💚 Del bote ({fmt(totalPresupuesto)}) lleváis gastados {fmt(totalReal)} — sobran {fmt(sobra)}
            </div>
          ) : (
            <div style={{ background:'#FCEBEB', borderRadius:9, padding:'9px 12px', fontSize:12, color:'#A32D2D', fontWeight:500, marginTop:12 }}>
              ⚠️ Os habéis pasado del bote en {fmt(Math.abs(sobra))}
            </div>
          )}
        </div>
      )}

      {/* Ingresos */}
      <div style={{ background:'#fff', border:'0.5px solid #D3D1C7', borderRadius:14, padding:'1rem 1.25rem', marginBottom:10 }}>
        <div style={{ fontSize:13, fontWeight:600, marginBottom:4 }}>💰 Ingresos mensuales</div>
        <div style={{ fontSize:11, color:'#888780', marginBottom:10 }}>Se guarda automáticamente · actualiza cuando cambie el sueldo de Paula</div>

        <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:8, marginBottom:10 }}>
          <div>
            <div style={{ fontSize:11, color:'#888780', marginBottom:3 }}>👩 Paula · autónoma</div>
            <div style={{ position:'relative' }}>
              <span style={{ position:'absolute', left:10, top:'50%', transform:'translateY(-50%)', fontSize:13, color:'#888780' }}>€</span>
              <input style={{ ...inp, paddingLeft:22 }} type="number" value={ingPaula} onChange={e => setIngPaula(e.target.value)} placeholder="varía cada mes" />
            </div>
          </div>
          <div>
            <div style={{ fontSize:11, color:'#888780', marginBottom:3 }}>👩 Águeda · nómina</div>
            <div style={{ position:'relative' }}>
              <span style={{ position:'absolute', left:10, top:'50%', transform:'translateY(-50%)', fontSize:13, color:'#888780' }}>€</span>
              <input style={{ ...inp, paddingLeft:22 }} type="number" value={ingAgueda} onChange={e => setIngAgueda(e.target.value)} placeholder="nómina fija" />
            </div>
          </div>
        </div>

        {ingP > 0 && ingA > 0 && (
          <div style={{ background:'#FDF2F6', borderRadius:8, padding:'7px 12px', fontSize:12, color:'#993556', fontWeight:500, textAlign:'center', marginBottom:10 }}>
            Paula aporta el {Math.round(pctP*100)}% · Águeda el {Math.round(pctA*100)}%
          </div>
        )}

        {ingP > 0 && ingA > 0 && totalPresupuesto > 0 && (
          <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:8, marginBottom:10 }}>
            <div style={{ background:'#FDF2F6', border:'0.5px solid #F2A8C8', borderRadius:10, padding:'10px 12px' }}>
              <div style={{ fontSize:10, color:'#D4537E', fontWeight:600, marginBottom:4 }}>👩 Paula · {Math.round(pctP*100)}%</div>
              <div style={{ fontSize:20, fontWeight:700, color:'#993556' }}>{fmt(paulaCuota)}</div>
              <div style={{ fontSize:10, color:'#D4537E', marginTop:2 }}>mete al bote</div>
            </div>
            <div style={{ background:'#F8F7F6', border:'0.5px solid #D3D1C7', borderRadius:10, padding:'10px 12px' }}>
              <div style={{ fontSize:10, color:'#5F5E5A', fontWeight:600, marginBottom:4 }}>👩 Águeda · {Math.round(pctA*100)}%</div>
              <div style={{ fontSize:20, fontWeight:700, color:'#2C2C2A' }}>{fmt(aguedaCuota)}</div>
              <div style={{ fontSize:10, color:'#888780', marginTop:2 }}>mete al bote</div>
            </div>
          </div>
        )}

        <button onClick={handleSave} style={{ width:'100%', padding:'8px', borderRadius:9, border:'none', background: saved ? '#3B6D11' : '#D4537E', color:'white', fontWeight:600, fontSize:13, cursor:'pointer', transition:'background 0.2s' }}>
          {saved ? '✓ Guardado' : 'Guardar ingresos'}
        </button>
      </div>

      {totalPresupuesto > 0 && (
        <button onClick={whatsapp} style={{ width:'100%', padding:'9px', borderRadius:9, border:'0.5px solid #25D366', background:'#EAF3DE', color:'#3B6D11', cursor:'pointer', fontSize:12, fontWeight:600 }}>
          💬 Copiar resumen para WhatsApp
        </button>
      )}
    </div>
  )
}
