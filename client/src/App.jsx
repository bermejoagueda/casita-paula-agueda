import React, { useState, useEffect, useCallback } from 'react'
import PinLock from './components/PinLock'
import Header from './components/Header'
import SummaryCards from './components/SummaryCards'
import CategoryBars from './components/CategoryBars'
import SpendingChart from './components/SpendingChart'
import MonthlyChart from './components/MonthlyChart'
import AnnualView from './components/AnnualView'
import SplitView from './components/SplitView'
import SavingsBox from './components/SavingsBox'
import AddForm from './components/AddForm'
import TxList from './components/TxList'
import BudgetEditor from './components/BudgetEditor'
import RecurringView from './components/RecurringView'
import ContextualMessage from './components/ContextualMessage'
import LoadingScreen from './components/LoadingScreen'
import Toast from './components/Toast'
import { useToast } from './hooks/useToast'
import { MONTHS } from './constants'
import { api } from './api'

const ST = (text) => (
  <div style={{ fontSize: 11, fontWeight: 600, color: '#888780', textTransform: 'uppercase', letterSpacing: '0.07em', margin: '1.25rem 0 0.65rem' }}>{text}</div>
)

const TABS = [
  ['dashboard', '📊 Dashboard'],
  ['movimientos', '💸 Movimientos'],
  ['fijos', '🔁 Fijos'],
  ['anual', '📅 Anual'],
  ['ahorro', '🐷 Ahorro'],
]

export default function App() {
  const [unlocked, setUnlocked] = useState(() => sessionStorage.getItem('casita_unlocked') === 'true')
  const now = new Date()
  const [year, setYear]       = useState(now.getFullYear())
  const [month, setMonth]     = useState(now.getMonth())
  const [txs, setTxs]         = useState([])
  const [budgets, setBudgets] = useState({})
  const [savings, setSavings] = useState({ goal: 0, saved: 0 })
  const [summary, setSummary] = useState([])
  const [annual, setAnnual]   = useState([])
  const [recurring, setRecurring] = useState([])
  const [loading, setLoading] = useState(true)
  const [showBudgets, setShowBudgets] = useState(false)
  const [tab, setTab]         = useState('dashboard')
  const [filters, setFilters] = useState({})
  const { toasts, showToast, removeToast } = useToast()

  const handleUnlock = () => { sessionStorage.setItem('casita_unlocked', 'true'); setUnlocked(true) }

  const loadData = useCallback(async () => {
    setLoading(true)
    try {
      const txFilters = { year, month: month + 1, ...filters }
      const [txData, budgetData, savingsData, summaryData, annualData, recurringData] = await Promise.all([
        api.getTransactions(txFilters),
        api.getBudgets(),
        api.getSavings(year, month + 1),
        api.getMonthlySummary(year),
        api.getAnnual(year),
        api.getRecurring(),
      ])
      setTxs(txData)
      const map = {}
      budgetData.forEach(b => { map[b.cat] = Number(b.amount) })
      setBudgets(map)
      setSavings(savingsData)
      setSummary(summaryData)
      setAnnual(annualData)
      setRecurring(recurringData)
    } catch (err) {
      showToast('Error cargando datos', 'error')
    } finally { setLoading(false) }
  }, [year, month, filters])

  useEffect(() => { if (unlocked) loadData() }, [loadData, unlocked])

  const changeMonth = (dir) => {
    let m = month + dir, y = year
    if (m < 0)  { m = 11; y-- }
    if (m > 11) { m = 0;  y++ }
    setMonth(m); setYear(y)
  }

  const handleAdd = async (data) => {
    await api.addTransaction(data)
    await loadData()
    showToast(`✓ ${data.desc} añadido`, 'success')
  }

  const handleDelete = async (id) => {
    const tx = txs.find(t => t.id === id)
    await api.deleteTransaction(id)
    setTxs(prev => prev.filter(t => t.id !== id))
    showToast(`Eliminado: ${tx?.description}`, 'info')
  }

  const handleEdit = async (id, form) => {
    await api.updateTransaction(id, { desc: form.desc, amount: parseFloat(form.amount), cat: form.cat, type: form.type, date: form.date, person: form.person, notes: form.notes })
    await loadData()
    showToast('Cambios guardados', 'success')
  }

  const handleUpdateBudget = async (cat, amount) => {
    await api.updateBudget(cat, amount)
    setBudgets(prev => ({ ...prev, [cat]: amount }))
    showToast('Presupuesto actualizado', 'success')
  }

  const handleUpdateSavings = async (goal, saved) => {
    const u = await api.updateSavings(year, month + 1, goal, saved)
    setSavings(u)
    showToast('Ahorro guardado', 'success')
  }

  const handleAddRecurring    = async (data) => { await api.addRecurring(data); await loadData(); showToast('Gasto fijo añadido', 'success') }
  const handleUpdateRecurring = async (id, data) => { await api.updateRecurring(id, data); await loadData() }
  const handleDeleteRecurring = async (id) => { await api.deleteRecurring(id); setRecurring(prev => prev.filter(r => r.id !== id)); showToast('Gasto fijo eliminado', 'info') }
  const handleGenerateRecurring = async () => {
    const res = await api.generateRecurring(year, month + 1)
    await loadData()
    return res
  }

  const tabStyle = (t) => ({
    padding: '7px 13px', borderRadius: 10,
    border: tab === t ? 'none' : '0.5px solid #D3D1C7',
    cursor: 'pointer', fontSize: 12, fontWeight: 500, whiteSpace: 'nowrap',
    background: tab === t ? '#D4537E' : '#fff',
    color: tab === t ? '#fff' : '#5F5E5A',
    transition: 'all 0.15s',
    boxShadow: tab === t ? '0 2px 8px rgba(212,83,126,0.25)' : 'none',
  })

  if (!unlocked) return <PinLock onUnlock={handleUnlock} />

  return (
    <div style={{ maxWidth: 680, margin: '0 auto', padding: '1.5rem 1rem 3rem', background: '#F1EFE8', minHeight: '100vh' }}>

      {/* Toasts */}
      {toasts.map(t => <Toast key={t.id} message={t.message} type={t.type} onDone={() => removeToast(t.id)} />)}

      <Header onLock={() => { sessionStorage.removeItem('casita_unlocked'); setUnlocked(false) }} />

      {/* Month nav */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1rem' }}>
        <div style={{ display: 'flex', gap: 4 }}>
          {['◀','▶'].map((a, i) => (
            <button key={a} onClick={() => changeMonth(i === 0 ? -1 : 1)} style={{
              background: '#fff', border: '0.5px solid #D3D1C7', borderRadius: 9,
              padding: '6px 12px', cursor: 'pointer', fontSize: 12, color: '#5F5E5A',
              transition: 'all 0.1s',
            }}
              onMouseEnter={e => e.currentTarget.style.borderColor = '#F2A8C8'}
              onMouseLeave={e => e.currentTarget.style.borderColor = '#D3D1C7'}
            >{a}</button>
          ))}
        </div>
        <span style={{ fontSize: 16, fontWeight: 600, color: '#2C2C2A' }}>{MONTHS[month]} {year}</span>
        <button onClick={() => setShowBudgets(s => !s)} style={{
          background: showBudgets ? '#F9D6E7' : '#fff',
          border: `0.5px solid ${showBudgets ? '#F2A8C8' : '#D3D1C7'}`,
          borderRadius: 9, padding: '5px 11px', cursor: 'pointer', fontSize: 12,
          color: showBudgets ? '#993556' : '#5F5E5A', transition: 'all 0.15s',
        }}>⚙️ Presupuestos</button>
      </div>

      {/* Tabs */}
      <div style={{ display: 'flex', gap: 6, marginBottom: '1rem', overflowX: 'auto', paddingBottom: 4 }}>
        {TABS.map(([t, label]) => <button key={t} style={tabStyle(t)} onClick={() => setTab(t)}>{label}</button>)}
      </div>

      {loading ? <LoadingScreen /> : (
        <>
          {showBudgets && <BudgetEditor budgets={budgets} onUpdate={handleUpdateBudget} />}

          {tab === 'dashboard' && <>
            <ContextualMessage transactions={txs} budgets={budgets} month={month} year={year} />
            <SummaryCards transactions={txs} />
            <MonthlyChart summary={summary} year={year} />
            {ST('Categorías del mes')}
            <CategoryBars transactions={txs} budgets={budgets} />
            {ST('Distribución de gastos')}
            <SpendingChart transactions={txs} />
            {ST('Split Paula & Águeda')}
            <SplitView transactions={txs} />
          </>}

          {tab === 'movimientos' && <>
            {ST('Añadir movimiento')}
            <AddForm onAdd={handleAdd} />
            {ST('Movimientos del mes')}
            <TxList transactions={txs} onDelete={handleDelete} onEdit={handleEdit} filters={filters} onFilterChange={f => setFilters(f)} />
          </>}

          {tab === 'fijos' && <>
            {ST('Gastos fijos y recurrentes')}
            <RecurringView recurring={recurring} onAdd={handleAddRecurring} onUpdate={handleUpdateRecurring} onDelete={handleDeleteRecurring} onGenerate={handleGenerateRecurring} year={year} month={month} monthTxs={txs} />
          </>}

          {tab === 'anual' && <>
            {ST(`Histórico ${year}`)}
            <AnnualView annual={annual} year={year} />
          </>}

          {tab === 'ahorro' && <>
            {ST('Ahorro mensual')}
            <SavingsBox savings={savings} onUpdate={handleUpdateSavings} />
            <MonthlyChart summary={summary} year={year} />
          </>}
        </>
      )}
    </div>
  )
}
