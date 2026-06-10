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
import { MONTHS } from './constants'
import { api } from './api'

const ST = (text) => (
  <div style={{ fontSize: 11, fontWeight: 600, color: '#888780', textTransform: 'uppercase', letterSpacing: '0.07em', margin: '1.25rem 0 0.65rem' }}>{text}</div>
)

const TABS = [
  ['dashboard', '📊 Dashboard'],
  ['movimientos', '💸 Movimientos'],
  ['anual', '📅 Anual'],
  ['ahorro', '🐷 Ahorro'],
]

export default function App() {
  const [unlocked, setUnlocked] = useState(() => sessionStorage.getItem('casita_unlocked') === 'true')
  const now = new Date()
  const [year, setYear]   = useState(now.getFullYear())
  const [month, setMonth] = useState(now.getMonth())
  const [txs, setTxs]     = useState([])
  const [budgets, setBudgets] = useState({})
  const [savings, setSavings] = useState({ goal: 0, saved: 0 })
  const [summary, setSummary] = useState([])
  const [annual, setAnnual]   = useState([])
  const [loading, setLoading] = useState(true)
  const [showBudgets, setShowBudgets] = useState(false)
  const [tab, setTab] = useState('dashboard')
  const [filters, setFilters] = useState({})

  const handleUnlock = () => { sessionStorage.setItem('casita_unlocked', 'true'); setUnlocked(true) }

  const loadData = useCallback(async () => {
    setLoading(true)
    try {
      const txFilters = { year, month: month + 1, ...filters }
      const [txData, budgetData, savingsData, summaryData, annualData] = await Promise.all([
        api.getTransactions(txFilters),
        api.getBudgets(),
        api.getSavings(year, month + 1),
        api.getMonthlySummary(year),
        api.getAnnual(year),
      ])
      setTxs(txData)
      const map = {}
      budgetData.forEach(b => { map[b.cat] = Number(b.amount) })
      setBudgets(map)
      setSavings(savingsData)
      setSummary(summaryData)
      setAnnual(annualData)
    } catch (err) { console.error(err) }
    finally { setLoading(false) }
  }, [year, month, filters])

  useEffect(() => { if (unlocked) loadData() }, [loadData, unlocked])

  const changeMonth = (dir) => {
    let m = month + dir, y = year
    if (m < 0)  { m = 11; y-- }
    if (m > 11) { m = 0;  y++ }
    setMonth(m); setYear(y)
  }

  const handleAdd    = async (data) => { await api.addTransaction(data); await loadData() }
  const handleDelete = async (id)   => { await api.deleteTransaction(id); setTxs(prev => prev.filter(t => t.id !== id)) }
  const handleEdit   = async (id, form) => { await api.updateTransaction(id, { desc: form.desc, amount: parseFloat(form.amount), cat: form.cat, type: form.type, date: form.date, person: form.person, notes: form.notes }); await loadData() }
  const handleUpdateBudget  = async (cat, amount) => { await api.updateBudget(cat, amount); setBudgets(prev => ({ ...prev, [cat]: amount })) }
  const handleUpdateSavings = async (goal, saved) => { const u = await api.updateSavings(year, month + 1, goal, saved); setSavings(u) }

  const tabStyle = (t) => ({
    padding: '6px 12px', borderRadius: 8, border: 'none', cursor: 'pointer', fontSize: 12, fontWeight: 500,
    background: tab === t ? '#D4537E' : '#fff',
    color: tab === t ? '#fff' : '#5F5E5A',
    border: tab === t ? 'none' : '0.5px solid #D3D1C7',
    whiteSpace: 'nowrap',
  })

  if (!unlocked) return <PinLock onUnlock={handleUnlock} />

  return (
    <div style={{ maxWidth: 680, margin: '0 auto', padding: '1.5rem 1rem 3rem', background: '#F1EFE8', minHeight: '100vh' }}>
      <Header onLock={() => { sessionStorage.removeItem('casita_unlocked'); setUnlocked(false) }} />

      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1rem' }}>
        <div style={{ display: 'flex', gap: 4 }}>
          {['◀','▶'].map((a, i) => (
            <button key={a} onClick={() => changeMonth(i === 0 ? -1 : 1)} style={{ background: '#fff', border: '0.5px solid #D3D1C7', borderRadius: 8, padding: '5px 11px', cursor: 'pointer', fontSize: 12, color: '#5F5E5A' }}>{a}</button>
          ))}
        </div>
        <span style={{ fontSize: 16, fontWeight: 500 }}>{MONTHS[month]} {year}</span>
        <button onClick={() => setShowBudgets(s => !s)} style={{
          background: showBudgets ? '#F9D6E7' : '#fff',
          border: `0.5px solid ${showBudgets ? '#F2A8C8' : '#D3D1C7'}`,
          borderRadius: 8, padding: '4px 10px', cursor: 'pointer', fontSize: 12,
          color: showBudgets ? '#993556' : '#5F5E5A',
        }}>⚙️</button>
      </div>

      <div style={{ display: 'flex', gap: 6, marginBottom: '1rem', overflowX: 'auto', paddingBottom: 4 }}>
        {TABS.map(([t, label]) => <button key={t} style={tabStyle(t)} onClick={() => setTab(t)}>{label}</button>)}
      </div>

      {loading ? (
        <div style={{ textAlign: 'center', color: '#D4537E', padding: '3rem', fontSize: 14 }}>Cargando... 🏠</div>
      ) : (
        <>
          {showBudgets && <BudgetEditor budgets={budgets} onUpdate={handleUpdateBudget} />}

          {tab === 'dashboard' && <>
            <SummaryCards transactions={txs} />
            <MonthlyChart summary={summary} year={year} />
            {ST('Categorías del mes')}
            <CategoryBars transactions={txs} budgets={budgets} />
            {ST('Distribución')}
            <SpendingChart transactions={txs} />
            {ST('Split Paula & Águeda')}
            <SplitView transactions={txs} />
          </>}

          {tab === 'movimientos' && <>
            {ST('Añadir movimiento')}
            <AddForm onAdd={handleAdd} />
            {ST('Movimientos')}
            <TxList transactions={txs} onDelete={handleDelete} onEdit={handleEdit} filters={filters} onFilterChange={f => setFilters(f)} />
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
