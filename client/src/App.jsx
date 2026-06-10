import React, { useState, useEffect, useCallback } from 'react'
import PinLock from './components/PinLock'
import Header from './components/Header'
import SummaryCards from './components/SummaryCards'
import CategoryBars from './components/CategoryBars'
import AnnualView from './components/AnnualView'
import SavingsBox from './components/SavingsBox'
import AddForm from './components/AddForm'
import TxList from './components/TxList'
import RecurringView from './components/RecurringView'
import ContextualMessage from './components/ContextualMessage'
import LoadingScreen from './components/LoadingScreen'
import Toast from './components/Toast'
import ShoppingView from './components/ShoppingView'
import WishlistView from './components/WishlistView'
import TripsView from './components/TripsView'
import BoteView from './components/BoteView'
import BoteSummaryCard from './components/BoteSummaryCard'
import { useToast } from './hooks/useToast'
import { MONTHS } from './constants'
import { api } from './api'

const SECTIONS = [
  { id:'dashboard',   icon:'📊', label:'Inicio',    group:'finanzas' },
  { id:'movimientos', icon:'💸', label:'Gastos',    group:'finanzas' },
  { id:'fijos',       icon:'🔁', label:'Fijos',     group:'finanzas' },
  { id:'anual',       icon:'📅', label:'Anual',     group:'finanzas' },
  { id:'ahorro',      icon:'🐷', label:'Ahorro',    group:'finanzas' },
  { id:'bote',        icon:'🫙', label:'Bote',      group:'casa' },
  { id:'compra',      icon:'🛒', label:'Compra',    group:'casa' },
  { id:'wishlist',    icon:'✨', label:'Wishlist',  group:'casa' },
  { id:'viajes',      icon:'✈️', label:'Viajes',    group:'casa' },
]

const ST = (text) => (
  <div style={{ fontSize:11, fontWeight:600, color:'#888780', textTransform:'uppercase', letterSpacing:'0.07em', margin:'1.25rem 0 0.65rem' }}>{text}</div>
)

export default function App() {
  const [unlocked, setUnlocked] = useState(() => sessionStorage.getItem('casita_unlocked') === 'true')
  const now = new Date()
  const [year, setYear]       = useState(now.getFullYear())
  const [month, setMonth]     = useState(now.getMonth())
  const [txs, setTxs]         = useState([])
  const [budgets, setBudgets] = useState({})
  const [savings, setSavings] = useState({ goal:0, saved:0 })
  const [summary, setSummary] = useState([])
  const [annual, setAnnual]   = useState([])
  const [recurring, setRecurring] = useState([])
  const [shopping, setShopping]   = useState([])
  const [wishlist, setWishlist]   = useState([])
  const [trips, setTrips]         = useState([])
  const [boteSettings, setBoteSettings] = useState({})
  const [exchangeRate, setExchangeRate] = useState(null)
  const [rateUpdatedAt, setRateUpdatedAt] = useState(null)
  const [loading, setLoading] = useState(true)
  const [tab, setTab]         = useState('dashboard')
  const [filters, setFilters] = useState({})
  const { toasts, showToast, removeToast } = useToast()

  const handleUnlock = () => { sessionStorage.setItem('casita_unlocked','true'); setUnlocked(true) }

  const loadData = useCallback(async () => {
    setLoading(true)
    try {
      const txFilters = { year, month: month+1, ...filters }
      const [txData, budgetData, savingsData, summaryData, annualData, recurringData, rateData, shopData, wishData, tripData, boteData] = await Promise.all([
        api.getTransactions(txFilters), api.getBudgets(), api.getSavings(year, month+1),
        api.getMonthlySummary(year), api.getAnnual(year), api.getRecurring(),
        api.getExchangeRate(), api.getShopping(), api.getWishlist(), api.getTrips(),
        api.getBoteSettings(),
      ])
      setTxs(txData)
      const map = {}; budgetData.forEach(b => { map[b.cat] = Number(b.amount) }); setBudgets(map)
      setSavings(savingsData); setSummary(summaryData); setAnnual(annualData)
      setRecurring(recurringData); setExchangeRate(rateData.rate); setRateUpdatedAt(rateData.updatedAt)
      setShopping(shopData); setWishlist(wishData); setTrips(tripData); setBoteSettings(boteData)
    } catch { showToast('Error cargando datos','error') }
    finally { setLoading(false) }
  }, [year, month, filters])

  useEffect(() => { if (unlocked) loadData() }, [loadData, unlocked])

  const changeMonth = (dir) => {
    let m = month+dir, y = year
    if (m<0) { m=11; y-- } if (m>11) { m=0; y++ }
    setMonth(m); setYear(y)
  }

  const handleAdd    = async (data) => { await api.addTransaction(data); await loadData(); showToast(`✓ ${data.desc} añadido`,'success') }
  const handleDelete = async (id)   => { const tx=txs.find(t=>t.id===id); await api.deleteTransaction(id); setTxs(p=>p.filter(t=>t.id!==id)); showToast(`Eliminado: ${tx?.description}`,'info') }
  const handleEdit   = async (id,f) => { await api.updateTransaction(id,f); await loadData(); showToast('Cambios guardados','success') }
  const handleUpdateSavings = async (g,s) => { const u=await api.updateSavings(year,month+1,g,s); setSavings(u); showToast('Ahorro guardado','success') }
  const handleAddRecurring    = async (d)    => { await api.addRecurring(d); await loadData(); showToast('Gasto fijo añadido','success') }
  const handleUpdateRecurring = async (id,d) => { await api.updateRecurring(id,d); await loadData() }
  const handleDeleteRecurring = async (id)   => { await api.deleteRecurring(id); setRecurring(p=>p.filter(r=>r.id!==id)); showToast('Eliminado','info') }
  const handleGenerateRecurring = async () => { const r=await api.generateRecurring(year,month+1); await loadData(); return r }

  const handleAddShop    = async (d)    => { const i=await api.addShoppingItem(d); setShopping(p=>[...p,i]); showToast(`${d.name} añadido`,'success') }
  const handleUpdateShop = async (id,d) => { const i=await api.updateShoppingItem(id,d); setShopping(p=>p.map(x=>x.id===id?i:x)) }
  const handleDeleteShop = async (id)   => { await api.deleteShoppingItem(id); setShopping(p=>p.filter(x=>x.id!==id)) }
  const handleClearChecked = async ()   => { await api.clearChecked(); setShopping(p=>p.filter(x=>!x.checked||x.is_usual)) }

  const handleAddWish    = async (d)    => { const i=await api.addWishItem(d); setWishlist(p=>[i,...p]); showToast(`${d.name} añadido a la wishlist`,'success') }
  const handleUpdateWish = async (id,d) => { const i=await api.updateWishItem(id,d); setWishlist(p=>p.map(x=>x.id===id?i:x)); if(d.bought) showToast('¡Comprado! 🎉','success') }
  const handleDeleteWish = async (id)   => { await api.deleteWishItem(id); setWishlist(p=>p.filter(x=>x.id!==id)) }

  const handleAddTrip    = async (d)    => { const t=await api.addTrip(d); setTrips(p=>[t,...p]); showToast(`✈️ ${d.name} creado`,'success') }
  const handleUpdateTrip = async (id,d) => { const t=await api.updateTrip(id,d); setTrips(p=>p.map(x=>x.id===id?t:x)) }

  const sidebarItem = (s) => {
    const active = tab === s.id
    return (
      <button key={s.id} onClick={() => setTab(s.id)} title={s.label} style={{
        width:48, height:48, borderRadius:12, display:'flex', flexDirection:'column',
        alignItems:'center', justifyContent:'center', gap:2, cursor:'pointer',
        border:'none', background: active ? '#FDF2F6' : 'transparent',
        transition:'all 0.15s',
      }}>
        <span style={{ fontSize:18, lineHeight:1 }}>{s.icon}</span>
        <span style={{ fontSize:8, fontWeight:600, color: active ? '#993556' : '#888780', lineHeight:1 }}>{s.label}</span>
      </button>
    )
  }

  if (!unlocked) return <PinLock onUnlock={handleUnlock} />

  return (
    <div style={{ display:'flex', maxWidth:760, margin:'0 auto', minHeight:'100vh', background:'#F1EFE8' }}>
      {toasts.map(t => <Toast key={t.id} message={t.message} type={t.type} onDone={() => removeToast(t.id)} />)}

      <div style={{ width:64, background:'#fff', borderRight:'0.5px solid #D3D1C7', display:'flex', flexDirection:'column', alignItems:'center', padding:'12px 0', gap:2, flexShrink:0, position:'sticky', top:0, height:'100vh', overflowY:'auto' }}>
        <div style={{ fontSize:22, marginBottom:8 }}>🏠</div>
        {SECTIONS.filter(s=>s.group==='finanzas').map(sidebarItem)}
        <div style={{ width:32, height:'0.5px', background:'#E8E6E2', margin:'6px 0' }} />
        {SECTIONS.filter(s=>s.group==='casa').map(sidebarItem)}
        <div style={{ marginTop:'auto' }}>
          <button onClick={() => { sessionStorage.removeItem('casita_unlocked'); setUnlocked(false) }} title="Cerrar sesión" style={{ width:48, height:48, borderRadius:12, display:'flex', flexDirection:'column', alignItems:'center', justifyContent:'center', gap:2, cursor:'pointer', border:'none', background:'transparent' }}>
            <span style={{ fontSize:18 }}>🔒</span>
            <span style={{ fontSize:8, fontWeight:600, color:'#888780' }}>Salir</span>
          </button>
        </div>
      </div>

      <div style={{ flex:1, padding:'1.25rem 1rem 3rem', overflowY:'auto', minWidth:0 }}>
        <Header exchangeRate={exchangeRate} rateUpdatedAt={rateUpdatedAt} />

        {['dashboard','movimientos','fijos','anual','ahorro'].includes(tab) && (
          <div style={{ display:'flex', alignItems:'center', justifyContent:'space-between', marginBottom:'1rem' }}>
            <div style={{ display:'flex', gap:4 }}>
              {['◀','▶'].map((a,i) => (
                <button key={a} onClick={() => changeMonth(i===0?-1:1)} style={{ background:'#fff', border:'0.5px solid #D3D1C7', borderRadius:9, padding:'5px 11px', cursor:'pointer', fontSize:12, color:'#5F5E5A' }}>{a}</button>
              ))}
            </div>
            <span style={{ fontSize:15, fontWeight:600 }}>{MONTHS[month]} {year}</span>
<div />
          </div>
        )}

        {loading ? <LoadingScreen /> : (
          <>
              {tab==='dashboard' && <>
              <ContextualMessage transactions={txs} budgets={budgets} month={month} year={year} />
              <SummaryCards transactions={txs} />
              <MonthlyChart summary={summary} year={year} />
              {ST('Categorías del mes')}
              <CategoryBars transactions={txs} budgets={budgets} />
            </>}

            {tab==='movimientos' && <>
              {ST('Añadir movimiento')}
              <AddForm onAdd={handleAdd} exchangeRate={exchangeRate} />
              {ST('Movimientos del mes')}
              <TxList transactions={txs} onDelete={handleDelete} onEdit={handleEdit} filters={filters} onFilterChange={f=>setFilters(f)} exchangeRate={exchangeRate} />
            </>}

            {tab==='fijos' && <>
              {ST('Gastos fijos y recurrentes')}
              <RecurringView recurring={recurring} onAdd={handleAddRecurring} onUpdate={handleUpdateRecurring} onDelete={handleDeleteRecurring} onGenerate={handleGenerateRecurring} year={year} month={month} monthTxs={txs} exchangeRate={exchangeRate} />
            </>}

            {tab==='anual' && <>
              {ST(`Histórico ${year}`)}
              <AnnualView annual={annual} year={year} />
            </>}

            {tab==='ahorro' && <>
              {ST('Ahorro mensual')}
              <SavingsBox savings={savings} onUpdate={handleUpdateSavings} />
            </>}

            {tab==='compra' && <>
              {ST('Lista de la compra')}
              <ShoppingView items={shopping} onAdd={handleAddShop} onUpdate={handleUpdateShop} onDelete={handleDeleteShop} onClearChecked={handleClearChecked} />
            </>}

            {tab==='wishlist' && <>
              {ST('Wishlist del hogar')}
              <WishlistView items={wishlist} onAdd={handleAddWish} onUpdate={handleUpdateWish} onDelete={handleDeleteWish} />
            </>}

            {tab==='bote' && <>
              {ST('Bote común')}
              <BoteView recurring={recurring} exchangeRate={exchangeRate} transactions={txs} />
            </>}

            {tab==='viajes' && <>
              {ST('Viajes')}
              <TripsView trips={trips} onAdd={handleAddTrip} onUpdate={handleUpdateTrip} exchangeRate={exchangeRate} />
            </>}
          </>
        )}
      </div>
    </div>
  )
}
