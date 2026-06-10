import React, { useState } from 'react'
import ConfirmDialog from './ConfirmDialog'

const CATS = [
  { id:'frutas', label:'🍎 Frutas y verduras' },
  { id:'lacteos', label:'🥛 Lácteos' },
  { id:'carne', label:'🥩 Carne y pescado' },
  { id:'panaderia', label:'🍞 Panadería' },
  { id:'despensa', label:'🫙 Despensa' },
  { id:'limpieza', label:'🧴 Limpieza' },
  { id:'higiene', label:'🪥 Higiene' },
  { id:'otros', label:'📦 Otros' },
]

const catIcon = (id) => CATS.find(c=>c.id===id)?.label.split(' ')[0] || '📦'

export default function ShoppingView({ items, onAdd, onUpdate, onDelete, onClearChecked }) {
  const [newItem, setNewItem] = useState('')
  const [newCat, setNewCat] = useState('otros')
  const [confirming, setConfirming] = useState(false)

  const pending   = items.filter(i => !i.checked)
  const checked   = items.filter(i => i.checked)
  const usuals    = items.filter(i => i.is_usual && !i.checked)

  const handleAdd = async (name, cat = newCat, is_usual = false) => {
    if (!name.trim()) return
    await onAdd({ name: name.trim(), category: cat, is_usual })
    setNewItem('')
  }

  const inp = { border: '0.5px solid #D3D1C7', borderRadius: 9, padding: '8px 10px', fontSize: 13, background: '#F8F7F6', color: '#2C2C2A', outline: 'none' }

  return (
    <div>
      {confirming && <ConfirmDialog message="¿Eliminar todos los artículos marcados?" confirmLabel="Limpiar" onConfirm={() => { onClearChecked(); setConfirming(false) }} onCancel={() => setConfirming(false)} />}

      <div style={{ background:'#fff', border:'0.5px solid #D3D1C7', borderRadius:14, padding:'1rem 1.25rem', marginBottom:10 }}>
        <div style={{ display:'flex', gap:8, marginBottom:8 }}>
          <input style={{ ...inp, flex:1 }} placeholder="Añadir artículo..." value={newItem}
            onChange={e => setNewItem(e.target.value)}
            onKeyDown={e => { if(e.key==='Enter') handleAdd(newItem) }} />
          <select style={{ ...inp, width:130 }} value={newCat} onChange={e => setNewCat(e.target.value)}>
            {CATS.map(c => <option key={c.id} value={c.id}>{c.label}</option>)}
          </select>
          <button onClick={() => handleAdd(newItem)} style={{ background:'#D4537E', color:'white', border:'none', borderRadius:9, padding:'8px 14px', fontSize:13, fontWeight:600, cursor:'pointer', whiteSpace:'nowrap' }}>+ Añadir</button>
        </div>

        {usuals.length > 0 && (
          <div>
            <div style={{ fontSize:11, color:'#888780', fontWeight:600, textTransform:'uppercase', letterSpacing:'0.05em', marginBottom:6 }}>Habituales rápidos</div>
            <div style={{ display:'flex', flexWrap:'wrap', gap:6, marginBottom:8 }}>
              {usuals.map(u => (
                <button key={u.id} onClick={() => onUpdate(u.id, { ...u, checked: true })} style={{ border:'0.5px solid #D3D1C7', borderRadius:99, padding:'4px 10px', fontSize:12, color:'#5F5E5A', background:'#F8F7F6', cursor:'pointer' }}>
                  {catIcon(u.category)} {u.name}
                </button>
              ))}
            </div>
          </div>
        )}
      </div>

      {pending.length === 0 && checked.length === 0 && (
        <div style={{ textAlign:'center', padding:'2rem', color:'#888780' }}>
          <div style={{ fontSize:36, marginBottom:8 }}>🛒</div>
          <p style={{ fontSize:13 }}>La lista está vacía</p>
        </div>
      )}

      {pending.length > 0 && (
        <div style={{ background:'#fff', border:'0.5px solid #D3D1C7', borderRadius:14, padding:'0.85rem 1rem', marginBottom:10 }}>
          <div style={{ fontSize:12, fontWeight:600, color:'#2C2C2A', marginBottom:8 }}>Pendientes ({pending.length})</div>
          {pending.map(item => (
            <div key={item.id} style={{ display:'flex', alignItems:'center', gap:10, padding:'7px 0', borderBottom:'0.5px solid #F1EFE8' }}>
              <div onClick={() => onUpdate(item.id, { ...item, checked: true })} style={{ width:20, height:20, borderRadius:6, border:'1.5px solid #D3D1C7', flexShrink:0, cursor:'pointer', display:'flex', alignItems:'center', justifyContent:'center' }} />
              <span style={{ fontSize:15 }}>{catIcon(item.category)}</span>
              <div style={{ flex:1 }}>
                <div style={{ fontSize:13, fontWeight:500 }}>{item.name}</div>
                {item.quantity && item.quantity !== '1' && <div style={{ fontSize:11, color:'#888780' }}>x{item.quantity}</div>}
              </div>
              {item.is_usual && <span style={{ fontSize:10, padding:'1px 6px', borderRadius:99, background:'#F9D6E7', color:'#993556', fontWeight:500 }}>habitual</span>}
              <button onClick={() => onDelete(item.id)} style={{ border:'none', background:'none', cursor:'pointer', fontSize:14, color:'#D3D1C7' }}
                onMouseEnter={e=>e.target.style.color='#E24B4A'} onMouseLeave={e=>e.target.style.color='#D3D1C7'}>✕</button>
            </div>
          ))}
        </div>
      )}

      {checked.length > 0 && (
        <div style={{ background:'#fff', border:'0.5px solid #D3D1C7', borderRadius:14, padding:'0.85rem 1rem' }}>
          <div style={{ display:'flex', alignItems:'center', justifyContent:'space-between', marginBottom:8 }}>
            <div style={{ fontSize:12, fontWeight:600, color:'#888780' }}>En el carro ✓ ({checked.length})</div>
            <button onClick={() => setConfirming(true)} style={{ fontSize:11, color:'#993556', background:'none', border:'0.5px solid #F2A8C8', borderRadius:7, padding:'3px 8px', cursor:'pointer' }}>Limpiar</button>
          </div>
          {checked.map(item => (
            <div key={item.id} style={{ display:'flex', alignItems:'center', gap:10, padding:'6px 0', borderBottom:'0.5px solid #F1EFE8', opacity:0.6 }}>
              <div onClick={() => onUpdate(item.id, { ...item, checked: false })} style={{ width:20, height:20, borderRadius:6, background:'#D4537E', border:'1.5px solid #D4537E', flexShrink:0, cursor:'pointer', display:'flex', alignItems:'center', justifyContent:'center', color:'white', fontSize:11, fontWeight:700 }}>✓</div>
              <span style={{ fontSize:13, textDecoration:'line-through', color:'#888780', flex:1 }}>{item.name}</span>
              <button onClick={() => onDelete(item.id)} style={{ border:'none', background:'none', cursor:'pointer', fontSize:14, color:'#D3D1C7' }}>✕</button>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
