import React, { useState, useEffect } from 'react'
import { api } from '../api'
import { CATS } from '../constants'

const PISO_MXN = 16163
const catIcon = id => CATS.find(c => c.id === id)?.icon || '📦'
const fmt = n => '€' + Math.round(n).toLocaleString('es-ES')

export default function BoteView({ recurring, exchangeRate }) {
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

  const rate     = exchangeRate || 20
  const activeRec = recurring.filter(r => r.active)

  // Calcular total fijos en EUR
  const totalFijosEur = activeRec.reduce((acc, r) => {
    const amtEur = r.currency === 'MXN' ? r.amount / rate : Number(r.amount)
    return acc + amtEur
  }, 0)

  // Split proporcional
  const ingP = parseFloat(ingPaula)  || 0
  const ingA = parseFloat(ingAgueda) || 0
  const totalIng = ingP + ingA
  const pctP = totalIng > 0 ? ingP / totalIng : 0.5
  const pctA = 1 - pctP
  const pctPLabel = Math.round(pctP * 100) + '%'
  const pctALabel = Math.round(pctA * 100) + '%'
  const paulaCuota  = Math.round(totalFijosEur * pctP)
  const aguedaCuota = Math.round(totalFijosEur) - paulaCuota

  const inp = { border: '0.5px solid #D3D1C7', borderRadius: 9, padding: '8px 10px', fontSize: 13, background: '#F8F7F6', color: '#2C2C2A', outline: 'none', width: '100%' }

  const whatsapp = () => {
    const msg = `🫙 *Bote común · este mes*\n\nGastos fijos: ${fmt(totalFijosEur)}\n\nPaula (${pctPLabel}): ${fmt(paulaCuota)}\nÁgueda (${pctALabel}): ${fmt(aguedaCuota)}\n\n¡A transferir! 💸`
    navigator.clipboard.writeText(msg).catch(() => {})
    alert('¡Copiado! Pégalo en WhatsApp 💬')
  }

  if (loading) return <div style={{ textAlign: 'center', padding: '2rem', color: '#D4537E', fontSize: 13 }}>Cargando...</div>

  return (
    <div>
      {/* Gastos fijos */}
      <div style={{ background: '#fff', border: '0.5px solid #D3D1C7', borderRadius: 14, padding: '1rem 1.25rem', marginBottom: 10 }}>
        <h3 style={{ fontSize: 14, fontWeight: 600, marginBottom: 10 }}>🔁 Gastos fijos del mes</h3>
        <p style={{ fontSize: 11, color: '#888780', marginBottom: 10 }}>Tomados directamente de la sección Fijos</p>

        {activeRec.length === 0 ? (
          <p style={{ fontSize: 13, color: '#888780', textAlign: 'center', padding: '1rem' }}>
            Sin gastos fijos activos — añádelos en la sección 🔁 Fijos
          </p>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 6, marginBottom: 10 }}>
            {activeRec.map(r => {
              const amtEur = r.currency === 'MXN' ? r.amount / rate : Number(r.amount)
              return (
                <div key={r.id} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', background: '#F8F7F6', borderRadius: 9, padding: '8px 12px' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                    <span style={{ fontSize: 16 }}>{catIcon(r.cat)}</span>
                    <div>
                      <div style={{ fontSize: 13, fontWeight: 500 }}>{r.description}</div>
                      {r.currency === 'MXN' && (
                        <div style={{ fontSize: 10, color: '#888780' }}>${Number(r.amount).toLocaleString('es-MX')} MXN → {fmt(amtEur)}</div>
                      )}
                    </div>
                  </div>
                  <div style={{ textAlign: 'right' }}>
                    <div style={{ fontSize: 13, fontWeight: 700, color: '#993556' }}>{fmt(amtEur)}</div>
                    {r.currency === 'MXN' && (
                      <div style={{ fontSize: 10, color: '#B4B2A9' }}>al cambio actual</div>
                    )}
                  </div>
                </div>
              )
            })}
          </div>
        )}

        <div style={{ background: '#FDF2F6', border: '0.5px solid #F2A8C8', borderRadius: 9, padding: '10px 14px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <span style={{ fontSize: 13, fontWeight: 600, color: '#993556' }}>Total fijos del mes</span>
          <span style={{ fontSize: 18, fontWeight: 700, color: '#993556' }}>{fmt(totalFijosEur)}</span>
        </div>
      </div>

      {/* Ingresos */}
      <div style={{ background: '#fff', border: '0.5px solid #D3D1C7', borderRadius: 14, padding: '1rem 1.25rem', marginBottom: 10 }}>
        <h3 style={{ fontSize: 14, fontWeight: 600, marginBottom: 4 }}>💰 Ingresos mensuales</h3>
        <p style={{ fontSize: 11, color: '#888780', marginBottom: 10 }}>Se guarda automáticamente · actualiza cuando cambie el sueldo de Paula</p>

        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8, marginBottom: 10 }}>
          <div>
            <div style={{ fontSize: 11, color: '#888780', marginBottom: 3 }}>👩 Paula · autónoma</div>
            <div style={{ position: 'relative' }}>
              <span style={{ position: 'absolute', left: 10, top: '50%', transform: 'translateY(-50%)', fontSize: 13, color: '#888780' }}>€</span>
              <input style={{ ...inp, paddingLeft: 22 }} type="number" value={ingPaula} onChange={e => setIngPaula(e.target.value)} placeholder="varía cada mes" />
            </div>
          </div>
          <div>
            <div style={{ fontSize: 11, color: '#888780', marginBottom: 3 }}>👩 Águeda · nómina</div>
            <div style={{ position: 'relative' }}>
              <span style={{ position: 'absolute', left: 10, top: '50%', transform: 'translateY(-50%)', fontSize: 13, color: '#888780' }}>€</span>
              <input style={{ ...inp, paddingLeft: 22 }} type="number" value={ingAgueda} onChange={e => setIngAgueda(e.target.value)} placeholder="nómina fija" />
            </div>
          </div>
        </div>

        <button onClick={handleSave} style={{ width: '100%', padding: '8px', borderRadius: 9, border: 'none', background: saved ? '#3B6D11' : '#D4537E', color: 'white', fontWeight: 600, fontSize: 13, cursor: 'pointer', transition: 'background 0.2s' }}>
          {saved ? '✓ Guardado' : 'Guardar ingresos'}
        </button>
      </div>

      {/* Resultado */}
      {totalIng > 0 && totalFijosEur > 0 && (
        <div style={{ background: '#fff', border: '0.5px solid #D3D1C7', borderRadius: 14, padding: '1rem 1.25rem', marginBottom: 10 }}>
          <h3 style={{ fontSize: 14, fontWeight: 600, marginBottom: 4 }}>🫙 Lo que mete cada una al bote</h3>
          <div style={{ background: '#FDF2F6', borderRadius: 8, padding: '7px 12px', fontSize: 12, color: '#993556', fontWeight: 500, textAlign: 'center', marginBottom: 12 }}>
            Paula aporta el {pctPLabel} · Águeda el {pctALabel}
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8, marginBottom: 12 }}>
            <div style={{ background: '#FDF2F6', border: '0.5px solid #F2A8C8', borderRadius: 12, padding: '14px 16px' }}>
              <div style={{ fontSize: 11, color: '#D4537E', fontWeight: 600, marginBottom: 6 }}>👩 Paula · {pctPLabel}</div>
              <div style={{ fontSize: 28, fontWeight: 700, color: '#993556' }}>{fmt(paulaCuota)}</div>
              <div style={{ fontSize: 10, color: '#D4537E', marginTop: 3 }}>mete al bote</div>
              <div style={{ height: 6, background: '#E8E6E2', borderRadius: 3, overflow: 'hidden', marginTop: 8 }}>
                <div style={{ height: '100%', width: pctPLabel, background: '#D4537E', borderRadius: 3 }} />
              </div>
            </div>
            <div style={{ background: '#F8F7F6', border: '0.5px solid #D3D1C7', borderRadius: 12, padding: '14px 16px' }}>
              <div style={{ fontSize: 11, color: '#5F5E5A', fontWeight: 600, marginBottom: 6 }}>👩 Águeda · {pctALabel}</div>
              <div style={{ fontSize: 28, fontWeight: 700, color: '#2C2C2A' }}>{fmt(aguedaCuota)}</div>
              <div style={{ fontSize: 10, color: '#888780', marginTop: 3 }}>mete al bote</div>
              <div style={{ height: 6, background: '#E8E6E2', borderRadius: 3, overflow: 'hidden', marginTop: 8 }}>
                <div style={{ height: '100%', width: pctALabel, background: '#D3D1C7', borderRadius: 3 }} />
              </div>
            </div>
          </div>

          <div style={{ background: '#F8F7F6', borderRadius: 10, padding: '12px 14px', marginBottom: 10 }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 13, fontWeight: 600, color: '#2C2C2A', marginBottom: 6 }}>
              <span>Total fijos cubiertos</span><span>{fmt(totalFijosEur)}</span>
            </div>
            <div style={{ height: '0.5px', background: '#E8E6E2', margin: '6px 0' }} />
            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 12, color: '#888780', marginBottom: 3 }}>
              <span>Paula ({pctPLabel})</span><span style={{ color: '#993556', fontWeight: 600 }}>{fmt(paulaCuota)}</span>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 12, color: '#888780' }}>
              <span>Águeda ({pctALabel})</span><span style={{ color: '#5F5E5A', fontWeight: 600 }}>{fmt(aguedaCuota)}</span>
            </div>
          </div>

          <button onClick={whatsapp} style={{ width: '100%', padding: '9px', borderRadius: 9, border: '0.5px solid #25D366', background: '#EAF3DE', color: '#3B6D11', cursor: 'pointer', fontSize: 12, fontWeight: 600 }}>
            💬 Copiar resumen para WhatsApp
          </button>
        </div>
      )}

      {(!totalIng || !totalFijosEur) && (
        <div style={{ textAlign: 'center', padding: '1.5rem', color: '#888780', fontSize: 13 }}>
          {!totalFijosEur ? 'Añade gastos fijos en la sección 🔁 Fijos para ver el cálculo' : 'Introduce los ingresos de este mes para ver el cálculo'}
        </div>
      )}
    </div>
  )
}
