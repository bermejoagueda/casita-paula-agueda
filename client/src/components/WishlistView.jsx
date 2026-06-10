import React, { useState } from 'react'
import ConfirmDialog from './ConfirmDialog'

const PRIO = {
  alta:  { label:'Alta',  bg:'#FCEBEB', color:'#A32D2D', dot:'#E24B4A' },
  media: { label:'Media', bg:'#FAEEDA', color:'#854F0B', dot:'#EF9F27' },
  baja:  { label:'Baja',  bg:'#EAF3DE', color:'#3B6D11', dot:'#639922' },
}

const inp = { border:'0.5px solid #D3D1C7', borderRadius:9, padding:'8px 10px', fontSize:13, background:'#F8F7F6', color:'#2C2C2A', outline:'none', width:'100%' }

function WishForm({ initial, onSave, onCancel }) {
  const [form, setForm] = useState(initial || { name:'', price_est:'', priority:'media', room:'', person:'ambas', notes:'' })
  const set = (k,v) => setForm(f => ({ ...f, [k]:v }))
  return (
    <div style={{ background:'#FDF2F6', border:'0.5px solid #F2A8C8', borderRadius:12, padding:'1rem', marginBottom:10 }}>
      <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:8, marginBottom:8 }}>
        <input style={inp} placeholder="Nombre del artículo" value={form.name} onChange={e=>set('name',e.target.value)} />
        <input style={inp} type="number" placeholder="Precio estimado (€)" value={form.price_est} onChange={e=>set('price_est',e.target.value)} />
      </div>
      <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr 1fr', gap:8, marginBottom:8 }}>
        <select style={inp} value={form.priority} onChange={e=>set('priority',e.target.value)}>
          <option value="alta">🔴 Alta</option>
          <option value="media">🟡 Media</option>
          <option value="baja">🟢 Cuando se pueda</option>
        </select>
        <input style={inp} placeholder="Habitación (opcional)" value={form.room} onChange={e=>set('room',e.target.value)} />
        <select style={inp} value={form.person} onChange={e=>set('person',e.target.value)}>
          <option value="ambas">🏠 Ambas</option>
          <option value="paula">👩 Paula</option>
          <option value="agueda">👩 Águeda</option>
        </select>
      </div>
      <input style={{ ...inp, marginBottom:10 }} placeholder="Nota (opcional)" value={form.notes} onChange={e=>set('notes',e.target.value)} />
      <div style={{ display:'flex', gap:8 }}>
        <button onClick={onCancel} style={{ flex:1, padding:'8px', borderRadius:9, border:'0.5px solid #D3D1C7', background:'#fff', cursor:'pointer', fontSize:13 }}>Cancelar</button>
        <button onClick={() => form.name && onSave(form)} style={{ flex:2, padding:'8px', borderRadius:9, border:'none', background:'#D4537E', color:'white', cursor:'pointer', fontSize:13, fontWeight:600 }}>Guardar</button>
      </div>
    </div>
  )
}

export default function WishlistView({ items, onAdd, onUpdate, onDelete }) {
  const [showForm, setShowForm] = useState(false)
  const [editing, setEditing] = useState(null)
  const [confirming, setConfirming] = useState(null)

  const pending = items.filter(i => !i.bought)
  const bought  = items.filter(i => i.bought)
  const totalEst = pending.reduce((a,i) => a + Number(i.price_est||0), 0)

  return (
    <div>
      {confirming && <ConfirmDialog message={`¿Eliminar "${confirming.name}"?`} onConfirm={() => { onDelete(confirming.id); setConfirming(null) }} onCancel={() => setConfirming(null)} />}

      {totalEst > 0 && (
        <div style={{ background:'#fff', border:'0.5px solid #D3D1C7', borderRadius:14, padding:'1rem 1.25rem', marginBottom:10 }}>
          <div style={{ display:'flex', justifyContent:'space-between', alignItems:'center', marginBottom:6 }}>
            <div style={{ fontSize:13, fontWeight:500 }}>Presupuesto total estimado</div>
            <div style={{ fontSize:18, fontWeight:700, color:'#993556' }}>€{totalEst.toLocaleString('es-ES')}</div>
          </div>
          <div style={{ display:'flex', gap:6 }}>
            {['alta','media','baja'].map(p => {
              const count = pending.filter(i=>i.priority===p).length
              const pr = PRIO[p]
              if (!count) return null
              return <span key={p} style={{ fontSize:11, padding:'2px 8px', borderRadius:99, background:pr.bg, color:pr.color, fontWeight:500 }}>{pr.label}: {count}</span>
            })}
          </div>
        </div>
      )}

      {editing && <WishForm initial={editing} onSave={async f => { await onUpdate(editing.id, f); setEditing(null) }} onCancel={() => setEditing(null)} />}
      {showForm && !editing && <WishForm onSave={async f => { await onAdd(f); setShowForm(false) }} onCancel={() => setShowForm(false)} />}

      {pending.length === 0 && !showForm && (
        <div style={{ textAlign:'center', padding:'2rem', color:'#888780' }}>
          <div style={{ fontSize:36, marginBottom:8 }}>✨</div>
          <p style={{ fontSize:13 }}>La wishlist está vacía</p>
        </div>
      )}

      <div style={{ display:'flex', flexDirection:'column', gap:8, marginBottom:10 }}>
        {['alta','media','baja'].map(prio => {
          const group = pending.filter(i => i.priority === prio)
          if (!group.length) return null
          const pr = PRIO[prio]
          return (
            <div key={prio}>
              <div style={{ fontSize:11, fontWeight:600, color:'#888780', textTransform:'uppercase', letterSpacing:'0.05em', marginBottom:6 }}>Prioridad {pr.label}</div>
              <div style={{ display:'flex', flexDirection:'column', gap:6 }}>
                {group.map(item => (
                  <div key={item.id} style={{ background:'#fff', border:'0.5px solid #D3D1C7', borderRadius:12, padding:'0.85rem 1rem', display:'flex', alignItems:'center', justifyContent:'space-between', transition:'border-color 0.15s' }}
                    onMouseEnter={e=>e.currentTarget.style.borderColor='#F2A8C8'}
                    onMouseLeave={e=>e.currentTarget.style.borderColor='#D3D1C7'}
                  >
                    <div style={{ display:'flex', alignItems:'center', gap:10 }}>
                      <div style={{ width:10, height:10, borderRadius:'50%', background:pr.dot, flexShrink:0 }} />
                      <div>
                        <div style={{ fontSize:13, fontWeight:500 }}>{item.name}</div>
                        <div style={{ display:'flex', gap:5, marginTop:2, flexWrap:'wrap' }}>
                          {item.price_est && <span style={{ fontSize:11, color:'#993556', fontWeight:600 }}>€{Number(item.price_est).toLocaleString('es-ES')}</span>}
                          {item.room && <span style={{ fontSize:11, color:'#888780' }}>· {item.room}</span>}
                          {item.notes && <span style={{ fontSize:11, color:'#B4B2A9', fontStyle:'italic' }}>"{item.notes}"</span>}
                        </div>
                      </div>
                    </div>
                    <div style={{ display:'flex', alignItems:'center', gap:8 }}>
                      <button onClick={() => onUpdate(item.id, { ...item, bought: true })} title="Marcar como comprado" style={{ border:'none', background:'none', cursor:'pointer', fontSize:16 }}>✅</button>
                      <button onClick={() => setEditing(item)} style={{ border:'none', background:'none', cursor:'pointer', fontSize:14, color:'#D3D1C7' }}
                        onMouseEnter={e=>e.target.style.color='#D4537E'} onMouseLeave={e=>e.target.style.color='#D3D1C7'}>✏️</button>
                      <button onClick={() => setConfirming(item)} style={{ border:'none', background:'none', cursor:'pointer', fontSize:14, color:'#D3D1C7' }}
                        onMouseEnter={e=>e.target.style.color='#E24B4A'} onMouseLeave={e=>e.target.style.color='#D3D1C7'}>✕</button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )
        })}
      </div>

      {!showForm && !editing && (
        <button onClick={() => setShowForm(true)} style={{ width:'100%', padding:'10px', borderRadius:12, border:'0.5px dashed #D4537E', background:'transparent', color:'#D4537E', cursor:'pointer', fontSize:13, fontWeight:600, marginBottom:10 }}>
          + Añadir a la wishlist
        </button>
      )}

      {bought.length > 0 && (
        <div style={{ background:'#F8F7F6', border:'0.5px solid #D3D1C7', borderRadius:14, padding:'0.85rem 1rem' }}>
          <div style={{ fontSize:12, fontWeight:600, color:'#888780', marginBottom:8 }}>Ya comprado 🎉 ({bought.length})</div>
          {bought.map(item => (
            <div key={item.id} style={{ display:'flex', alignItems:'center', justifyContent:'space-between', padding:'5px 0', opacity:0.6, borderBottom:'0.5px solid #E8E6E2' }}>
              <span style={{ fontSize:13, textDecoration:'line-through', color:'#888780' }}>✓ {item.name}</span>
              <span style={{ fontSize:12, color:'#3B6D11', fontWeight:600 }}>€{Number(item.price_est||0).toFixed(0)}</span>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
