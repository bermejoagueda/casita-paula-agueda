import React, { useState, useEffect } from 'react'
import { api } from '../api'
import ConfirmDialog from './ConfirmDialog'

const TRIP_CATS = [
  { id:'vuelos', icon:'✈️', label:'Vuelos' },
  { id:'hotel', icon:'🏨', label:'Hotel' },
  { id:'comida', icon:'🍽️', label:'Comida' },
  { id:'transporte', icon:'🚗', label:'Transporte' },
  { id:'actividades', icon:'🎡', label:'Actividades' },
  { id:'compras', icon:'🛍️', label:'Compras' },
  { id:'otro', icon:'📦', label:'Otro' },
]
const catIcon = id => TRIP_CATS.find(c=>c.id===id)?.icon || '📦'

const inp = { border:'0.5px solid #D3D1C7', borderRadius:9, padding:'8px 10px', fontSize:13, background:'#F8F7F6', color:'#2C2C2A', outline:'none', width:'100%' }
const today = new Date().toISOString().slice(0,10)

function NewTripForm({ onSave, onCancel }) {
  const [form, setForm] = useState({ name:'', destination:'', start_date:'', end_date:'', budget:'' })
  const set = (k,v) => setForm(f=>({...f,[k]:v}))
  return (
    <div style={{ background:'#FDF2F6', border:'0.5px solid #F2A8C8', borderRadius:14, padding:'1rem 1.25rem', marginBottom:12 }}>
      <div style={{ fontSize:14, fontWeight:600, color:'#993556', marginBottom:10 }}>✈️ Nuevo viaje</div>
      <input style={{ ...inp, marginBottom:8 }} placeholder="Nombre del viaje (ej: Oaxaca 2026)" value={form.name} onChange={e=>set('name',e.target.value)} />
      <input style={{ ...inp, marginBottom:8 }} placeholder="Destino" value={form.destination} onChange={e=>set('destination',e.target.value)} />
      <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr 1fr', gap:8, marginBottom:10 }}>
        <div><div style={{ fontSize:11, color:'#888780', marginBottom:3 }}>Fecha inicio</div><input style={inp} type="date" value={form.start_date} onChange={e=>set('start_date',e.target.value)} /></div>
        <div><div style={{ fontSize:11, color:'#888780', marginBottom:3 }}>Fecha fin</div><input style={inp} type="date" value={form.end_date} onChange={e=>set('end_date',e.target.value)} /></div>
        <div><div style={{ fontSize:11, color:'#888780', marginBottom:3 }}>Presupuesto (€)</div><input style={inp} type="number" placeholder="opcional" value={form.budget} onChange={e=>set('budget',e.target.value)} /></div>
      </div>
      <div style={{ display:'flex', gap:8 }}>
        <button onClick={onCancel} style={{ flex:1, padding:'8px', borderRadius:9, border:'0.5px solid #D3D1C7', background:'#fff', cursor:'pointer', fontSize:13 }}>Cancelar</button>
        <button onClick={() => form.name && onSave(form)} style={{ flex:2, padding:'8px', borderRadius:9, border:'none', background:'#D4537E', color:'white', cursor:'pointer', fontSize:13, fontWeight:600 }}>Crear viaje ✈️</button>
      </div>
    </div>
  )
}

function TripDetail({ trip, exchangeRate, onBack, onArchive }) {
  const [expenses, setExpenses] = useState([])
  const [loading, setLoading] = useState(true)
  const [showForm, setShowForm] = useState(false)
  const [form, setForm] = useState({ description:'', amount:'', currency:'EUR', cat:'comida', person:'ambas', date:today, notes:'' })
  const [confirming, setConfirming] = useState(null)
  const set = (k,v) => setForm(f=>({...f,[k]:v}))

  const amountEur = form.currency === 'MXN' && form.amount && exchangeRate
    ? (parseFloat(form.amount) / exchangeRate).toFixed(2) : form.amount

  useEffect(() => {
    api.getTripExpenses(trip.id).then(setExpenses).finally(() => setLoading(false))
  }, [trip.id])

  const handleAdd = async () => {
    if (!form.description || !form.amount) return
    const amount_eur = form.currency === 'MXN' ? parseFloat((parseFloat(form.amount)/exchangeRate).toFixed(2)) : parseFloat(form.amount)
    const exp = await api.addTripExpense(trip.id, { description:form.description, amount_eur, amount_orig:parseFloat(form.amount), currency:form.currency, exchange_rate: form.currency==='MXN'?exchangeRate:1, cat:form.cat, person:form.person, date:form.date, notes:form.notes })
    setExpenses(prev => [exp, ...prev])
    setForm({ description:'', amount:'', currency:form.currency, cat:form.cat, person:'ambas', date:today, notes:'' })
    setShowForm(false)
  }

  const handleDelete = async (id) => {
    await api.deleteTripExpense(trip.id, id)
    setExpenses(prev => prev.filter(e => e.id !== id))
    setConfirming(null)
  }

  const total = expenses.reduce((a,e) => a + Number(e.amount_eur), 0)
  const paula  = expenses.filter(e=>e.person==='paula').reduce((a,e)=>a+Number(e.amount_eur),0)
  const agueda = expenses.filter(e=>e.person==='agueda').reduce((a,e)=>a+Number(e.amount_eur),0)
  const ambas  = expenses.filter(e=>e.person==='ambas').reduce((a,e)=>a+Number(e.amount_eur),0)
  const paulaTotal  = paula + ambas/2
  const aguedaTotal = agueda + ambas/2
  const diff = paulaTotal - aguedaTotal
  const whoOwes = diff > 0 ? 'Águeda' : 'Paula'
  const owesTo  = diff > 0 ? 'Paula' : 'Águeda'

  const whatsapp = () => {
    const msg = `✈️ *${trip.name}*\n\nTotal: €${total.toFixed(0)}\nPaula pagó: €${paulaTotal.toFixed(0)}\nÁgueda pagó: €${aguedaTotal.toFixed(0)}\n\n${Math.abs(diff) > 0.5 ? `${whoOwes} le debe €${Math.abs(diff).toFixed(0)} a ${owesTo} 💸` : '¡Estamos al 50/50! 🎉'}`
    navigator.clipboard.writeText(msg).catch(()=>{})
    alert('¡Copiado al portapapeles! Pégalo en WhatsApp 💬')
  }

  const daysCount = trip.start_date && trip.end_date
    ? Math.ceil((new Date(trip.end_date) - new Date(trip.start_date)) / 86400000) + 1 : null

  return (
    <div>
      {confirming && <ConfirmDialog message={`¿Eliminar "${confirming.description}"?`} onConfirm={() => handleDelete(confirming.id)} onCancel={() => setConfirming(null)} />}

      <button onClick={onBack} style={{ background:'none', border:'none', cursor:'pointer', fontSize:13, color:'#888780', marginBottom:10, display:'flex', alignItems:'center', gap:4 }}>← Volver a viajes</button>

      <div style={{ background:'linear-gradient(135deg,#F9D6E7,#F1EFE8)', border:'0.5px solid #F2A8C8', borderRadius:14, padding:'1rem 1.25rem', marginBottom:10 }}>
        <div style={{ display:'flex', justifyContent:'space-between', alignItems:'flex-start' }}>
          <div>
            <div style={{ fontSize:18, fontWeight:700, color:'#993556' }}>✈️ {trip.name}</div>
            {trip.destination && <div style={{ fontSize:12, color:'#5F5E5A', marginTop:2 }}>📍 {trip.destination}</div>}
            {daysCount && <div style={{ fontSize:11, color:'#888780', marginTop:2 }}>{daysCount} días</div>}
          </div>
          {trip.status === 'active' && (
            <span style={{ fontSize:10, padding:'3px 8px', borderRadius:99, background:'#EAF3DE', color:'#3B6D11', fontWeight:600 }}>En curso</span>
          )}
        </div>
      </div>

      <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:8, marginBottom:10 }}>
        <div style={{ background:'#fff', border:'0.5px solid #D3D1C7', borderRadius:12, padding:'0.9rem 1rem' }}>
          <div style={{ fontSize:11, color:'#888780', marginBottom:3 }}>Total gastado</div>
          <div style={{ fontSize:20, fontWeight:700, color:'#993556' }}>€{total.toFixed(0)}</div>
          {trip.budget && <div style={{ fontSize:11, color:'#B4B2A9' }}>de €{Number(trip.budget).toFixed(0)} presupuesto</div>}
        </div>
        <div style={{ background:'#fff', border:'0.5px solid #D3D1C7', borderRadius:12, padding:'0.9rem 1rem' }}>
          <div style={{ fontSize:11, color:'#888780', marginBottom:3 }}>Por persona</div>
          <div style={{ fontSize:20, fontWeight:700, color:'#2C2C2A' }}>€{(total/2).toFixed(0)}</div>
          <div style={{ fontSize:11, color:'#B4B2A9' }}>media</div>
        </div>
      </div>

      {total > 0 && (
        <div style={{ background:'#fff', border:'0.5px solid #D3D1C7', borderRadius:14, padding:'1rem 1.25rem', marginBottom:10 }}>
          <div style={{ fontSize:13, fontWeight:600, marginBottom:10 }}>⚖️ Quién debe qué</div>
          {[{name:'Paula',total:paulaTotal,direct:paula,color:'#F2A8C8',text:'#993556'},{name:'Águeda',total:aguedaTotal,direct:agueda,color:'#D3D1C7',text:'#5F5E5A'}].map(p => (
            <div key={p.name} style={{ display:'flex', alignItems:'center', justifyContent:'space-between', padding:'6px 0', borderBottom:'0.5px solid #F1EFE8' }}>
              <div style={{ display:'flex', alignItems:'center', gap:8 }}>
                <div style={{ width:28, height:28, borderRadius:'50%', background:p.color, display:'flex', alignItems:'center', justifyContent:'center', fontWeight:700, fontSize:11, color:p.text }}>{p.name[0]}</div>
                <div>
                  <div style={{ fontSize:13, fontWeight:500 }}>{p.name}</div>
                  <div style={{ fontSize:11, color:'#888780' }}>directo €{p.direct.toFixed(0)}</div>
                </div>
              </div>
              <div style={{ textAlign:'right' }}>
                <div style={{ fontSize:14, fontWeight:700, color:'#993556' }}>€{p.total.toFixed(0)}</div>
              </div>
            </div>
          ))}
          {Math.abs(diff) > 0.5 ? (
            <div style={{ background:'#FDF2F6', border:'0.5px solid #F2A8C8', borderRadius:9, padding:'8px 12px', marginTop:8, fontSize:13, color:'#993556', fontWeight:500, textAlign:'center' }}>
              {whoOwes} le debe €{Math.abs(diff).toFixed(0)} a {owesTo}
            </div>
          ) : (
            <div style={{ background:'#EAF3DE', borderRadius:9, padding:'8px 12px', marginTop:8, fontSize:13, color:'#3B6D11', textAlign:'center' }}>¡Al 50/50! 🎉</div>
          )}
          <button onClick={whatsapp} style={{ width:'100%', marginTop:10, padding:'8px', borderRadius:9, border:'0.5px solid #25D366', background:'#EAF3DE', color:'#3B6D11', cursor:'pointer', fontSize:12, fontWeight:600 }}>
            💬 Copiar resumen para WhatsApp
          </button>
        </div>
      )}

      {showForm && (
        <div style={{ background:'#fff', border:'0.5px solid #D3D1C7', borderRadius:14, padding:'1rem 1.25rem', marginBottom:10 }}>
          <div style={{ fontSize:13, fontWeight:600, marginBottom:10 }}>＋ Añadir gasto al viaje</div>
          <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:8, marginBottom:8 }}>
            <input style={inp} placeholder="Descripción" value={form.description} onChange={e=>set('description',e.target.value)} />
            <div style={{ display:'flex', gap:6 }}>
              <input style={{ ...inp, flex:1 }} type="number" placeholder="Importe" value={form.amount} onChange={e=>set('amount',e.target.value)} />
              <div style={{ display:'flex', borderRadius:9, overflow:'hidden', border:'0.5px solid #D3D1C7', flexShrink:0 }}>
                {['MXN','EUR'].map(c => <button key={c} type="button" onClick={()=>set('currency',c)} style={{ padding:'0 8px', border:'none', cursor:'pointer', fontSize:11, fontWeight:700, background:form.currency===c?'#D4537E':'#F8F7F6', color:form.currency===c?'white':'#888780' }}>{c}</button>)}
              </div>
            </div>
          </div>
          {form.currency==='MXN' && form.amount && (
            <div style={{ background:'#EAF3DE', borderRadius:8, padding:'6px 10px', fontSize:12, color:'#3B6D11', marginBottom:8 }}>↔ ${parseFloat(form.amount||0).toLocaleString()} MXN = <strong>€{amountEur}</strong></div>
          )}
          <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr 1fr', gap:8, marginBottom:8 }}>
            <select style={inp} value={form.cat} onChange={e=>set('cat',e.target.value)}>
              {TRIP_CATS.map(c => <option key={c.id} value={c.id}>{c.icon} {c.label}</option>)}
            </select>
            <select style={inp} value={form.person} onChange={e=>set('person',e.target.value)}>
              <option value="ambas">🏠 Ambas</option>
              <option value="paula">👩 Paula</option>
              <option value="agueda">👩 Águeda</option>
            </select>
            <input style={inp} type="date" value={form.date} onChange={e=>set('date',e.target.value)} />
          </div>
          <input style={{ ...inp, marginBottom:10 }} placeholder="Nota (opcional)" value={form.notes} onChange={e=>set('notes',e.target.value)} />
          <div style={{ display:'flex', gap:8 }}>
            <button onClick={() => setShowForm(false)} style={{ flex:1, padding:'8px', borderRadius:9, border:'0.5px solid #D3D1C7', background:'#F8F7F6', cursor:'pointer', fontSize:13 }}>Cancelar</button>
            <button onClick={handleAdd} style={{ flex:2, padding:'8px', borderRadius:9, border:'none', background:'#D4537E', color:'white', cursor:'pointer', fontSize:13, fontWeight:600 }}>✓ Añadir gasto</button>
          </div>
        </div>
      )}

      {!showForm && (
        <button onClick={() => setShowForm(true)} style={{ width:'100%', padding:'10px', borderRadius:12, border:'0.5px dashed #D4537E', background:'transparent', color:'#D4537E', cursor:'pointer', fontSize:13, fontWeight:600, marginBottom:10 }}>+ Añadir gasto</button>
      )}

      {loading ? <div style={{ textAlign:'center', padding:'1rem', color:'#888780', fontSize:13 }}>Cargando...</div> : expenses.length === 0 ? (
        <div style={{ textAlign:'center', padding:'2rem', color:'#888780' }}><div style={{ fontSize:32 }}>✈️</div><p style={{ fontSize:13, marginTop:8 }}>Sin gastos todavía</p></div>
      ) : (
        <div style={{ display:'flex', flexDirection:'column', gap:6 }}>
          {expenses.map(e => (
            <div key={e.id} style={{ background:'#fff', border:'0.5px solid #D3D1C7', borderRadius:10, padding:'0.65rem 1rem', display:'flex', alignItems:'center', justifyContent:'space-between' }}>
              <div style={{ display:'flex', alignItems:'center', gap:10 }}>
                <span style={{ fontSize:18 }}>{catIcon(e.cat)}</span>
                <div>
                  <div style={{ fontSize:13, fontWeight:500 }}>{e.description}</div>
                  <div style={{ display:'flex', gap:5, marginTop:2 }}>
                    <span style={{ fontSize:11, color:'#888780' }}>{e.person==='paula'?'👩 Paula':e.person==='agueda'?'👩 Águeda':'🏠 Ambas'}</span>
                    {e.currency==='MXN' && <span style={{ fontSize:10, padding:'1px 5px', borderRadius:99, background:'#FDF2F6', color:'#993556', fontWeight:600 }}>MXN</span>}
                    {e.notes && <span style={{ fontSize:11, color:'#B4B2A9', fontStyle:'italic' }}>"{e.notes}"</span>}
                  </div>
                </div>
              </div>
              <div style={{ display:'flex', alignItems:'center', gap:8 }}>
                <div style={{ textAlign:'right' }}>
                  <div style={{ fontSize:13, fontWeight:700, color:'#993556' }}>-€{Number(e.amount_eur).toFixed(0)}</div>
                  {e.currency==='MXN' && <div style={{ fontSize:10, color:'#B4B2A9' }}>${Number(e.amount_orig).toLocaleString('es-MX')}</div>}
                </div>
                <button onClick={() => setConfirming(e)} style={{ border:'none', background:'none', cursor:'pointer', fontSize:14, color:'#D3D1C7' }}
                  onMouseEnter={e2=>e2.target.style.color='#E24B4A'} onMouseLeave={e2=>e2.target.style.color='#D3D1C7'}>✕</button>
              </div>
            </div>
          ))}
        </div>
      )}

      {trip.status === 'active' && expenses.length > 0 && (
        <button onClick={() => onArchive(trip.id)} style={{ width:'100%', marginTop:12, padding:'8px', borderRadius:9, border:'0.5px solid #D3D1C7', background:'#F8F7F6', color:'#5F5E5A', cursor:'pointer', fontSize:12 }}>
          Archivar viaje 📁
        </button>
      )}
    </div>
  )
}

export default function TripsView({ trips, onAdd, onUpdate, exchangeRate }) {
  const [showForm, setShowForm] = useState(false)
  const [selected, setSelected] = useState(null)

  if (selected) {
    const trip = trips.find(t => t.id === selected)
    if (trip) return <TripDetail trip={trip} exchangeRate={exchangeRate} onBack={() => setSelected(null)} onArchive={async (id) => { await onUpdate(id, { ...trip, status:'archived' }); setSelected(null) }} />
  }

  const active   = trips.filter(t => t.status === 'active')
  const archived = trips.filter(t => t.status === 'archived')

  return (
    <div>
      {showForm && <NewTripForm onSave={async f => { await onAdd(f); setShowForm(false) }} onCancel={() => setShowForm(false)} />}

      {active.length === 0 && archived.length === 0 && !showForm && (
        <div style={{ textAlign:'center', padding:'2.5rem 1rem', color:'#888780' }}>
          <div style={{ fontSize:40, marginBottom:8 }}>✈️</div>
          <p style={{ fontSize:14, fontWeight:500, color:'#2C2C2A', marginBottom:4 }}>Sin viajes todavía</p>
          <p style={{ fontSize:12 }}>Crea vuestro primer viaje y lleva las cuentas como Tricount</p>
        </div>
      )}

      {active.map(trip => (
        <div key={trip.id} onClick={() => setSelected(trip.id)} style={{ background:'#fff', border:'1.5px solid #F2A8C8', borderRadius:14, padding:'1rem 1.25rem', marginBottom:8, cursor:'pointer', transition:'all 0.15s' }}
          onMouseEnter={e=>e.currentTarget.style.boxShadow='0 2px 12px rgba(212,83,126,0.12)'}
          onMouseLeave={e=>e.currentTarget.style.boxShadow='none'}
        >
          <div style={{ display:'flex', justifyContent:'space-between', alignItems:'flex-start' }}>
            <div>
              <div style={{ fontSize:15, fontWeight:700, color:'#993556' }}>✈️ {trip.name}</div>
              {trip.destination && <div style={{ fontSize:12, color:'#5F5E5A', marginTop:2 }}>📍 {trip.destination}</div>}
            </div>
            <span style={{ fontSize:10, padding:'3px 8px', borderRadius:99, background:'#EAF3DE', color:'#3B6D11', fontWeight:600, flexShrink:0 }}>Activo</span>
          </div>
          <div style={{ fontSize:11, color:'#B4B2A9', marginTop:6 }}>Toca para ver gastos →</div>
        </div>
      ))}

      {!showForm && (
        <button onClick={() => setShowForm(true)} style={{ width:'100%', padding:'12px', borderRadius:12, border:'0.5px dashed #D4537E', background:'transparent', color:'#D4537E', cursor:'pointer', fontSize:13, fontWeight:600, marginBottom:12 }}>
          ✈️ Nuevo viaje
        </button>
      )}

      {archived.length > 0 && (
        <div>
          <div style={{ fontSize:11, fontWeight:600, color:'#888780', textTransform:'uppercase', letterSpacing:'0.05em', marginBottom:8 }}>Viajes archivados</div>
          {archived.map(trip => (
            <div key={trip.id} onClick={() => setSelected(trip.id)} style={{ background:'#F8F7F6', border:'0.5px solid #D3D1C7', borderRadius:12, padding:'0.85rem 1rem', marginBottom:6, cursor:'pointer', opacity:0.8 }}>
              <div style={{ fontSize:13, fontWeight:500, color:'#5F5E5A' }}>📁 {trip.name}</div>
              {trip.destination && <div style={{ fontSize:11, color:'#888780' }}>{trip.destination}</div>}
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
