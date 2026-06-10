import React, { useState, useEffect, useCallback } from 'react'
import Header from './components/Header'
import SummaryCards from './components/SummaryCards'
import CategoryBars from './components/CategoryBars'
import SpendingChart from './components/SpendingChart'
import MonthlyChart from './components/MonthlyChart'
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

export default function App() {
  const now = new Date()
  const [year, setYear]   = useState(now.getFullYear())
  const [month, setMonth] = useState(now.getMonth())
  const [txs, setTxs]     = useState([])
  const [budgets, setBudgets] = useState({})
  const [savings, setSavings] = useState({ goal: 0, saved: 0 })
  const [summary, setSummary] = useState([])
  const [loading, setLoading] = useState(true)
  const [showBudgets, setShowBudgets] = useState(false)
  const [tab, setTab] = useState('dashboard')

  const loadData = useCallback(async () => {
    setLoading(true)
    try {
      const [txData, budgetData, savingsData, summaryData] = await Promise.all([
        api.getTransactions(year, month + 1),
        api.getBudgets(),
        api.getSavings(year, month + 1),
        api.getMonthlySummary(year),
      ])
      setTxs(txData)
      const map = {}
      budgetData.forEach(b => { map[b.cat] = Number(b.amount) })
      setBudgets(map)
      setSavings(savingsData)
      setSummary(summaryData)
    } catch (err) {
      console.error(err)
    } finally {
      setLoading(false)
    }
  }, [year, month])

  useEffect(() => { loadData() }, [loadData])

  const changeMonth = (dir) => {
    let m = month + dir, y = year
    if (m < 0)  { m = 11; y-- }
    if (m > 11) { m = 0;  y++ }
    setMonth(m); setYear(y)
  }

  const handleAdd = async (data) => { await api.addTransaction(data); await loadData() }
  const handleDelete = async (id) => { await api.deleteTransaction(id); setTxs(prev => prev.filter(t => t.id !== id)) }
  const handleUpdateBudget = async (cat, amount) => { await api.updateBudget(cat, amount); setBudgets(prev => ({ ...prev, [cat]: amount })) }
  const handleUpdateSavings = async (goal, saved) => {
    const updated = await api.updateSavings(year, month + 1, goal, saved)
    setSavings(updated)
  }

  const tabStyle = (t) => ({
    padding: '6px 14px', borderRadius: 8, border: 'none', cursor: 'pointer', fontSize: 13, fontWeight: 500,
    background: tab === t ? '#D4537E' : '#fff',
    color: tab === t ? '#fff' : '#5F5E5A',
    border: tab === t ? 'none' : '0.5px solid #D3D1C7',
  })

  return (
    <div style={{ maxWidth: 680, margin: '0 auto', padding: '1.5rem 1rem 3rem', background: '#F1EFE8', minHeight: '100vh' }}>
      <Header />

      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1rem' }}>
        <div style={{ display: 'flex', gap: 4 }}>
          {['◀','▶'].map((a, i) => (
            <button key={a} onClick={() => changeMonth(i === 0 ? -1 : 1)} style={{
              background: '#fff', border: '0.5px solid #D3D1C7', borderRadius: 8, padding: '5px 11px', cursor: 'pointer', fontSize: 12, color: '#5F5E5A',
            }}>{a}</button>
          ))}
        </div>
        <span style={{ fontSize: 16, fontWeight: 500 }}>{MONTHS[month]} {year}</span>
        <button onClick={() => setShowBudgets(s => !s)} style={{
          background: showBudgets ? '#F9D6E7' : '#fff',
          border: `0.5px solid ${showBudgets ? '#F2A8C8' : '#D3D1C7'}`,
          borderRadius: 8, padding: '4px 10px', cursor: 'pointer', fontSize: 12,
          color: showBudgets ? '#993556' : '#5F5E5A',
        }}>⚙️ Presupuestos</button>
      </div>

      <div style={{ display: 'flex', gap: 8, marginBottom: '1rem' }}>
        {[['dashboard','📊 Dashboard'], ['movimientos','💸 Movimientos'], ['ahorro','🐷 Ahorro']].map(([t, label]) => (
          <button key={t} style={tabStyle(t)} onClick={() => setTab(t)}>{label}</button>
        ))}
      </div>

      {loading ? (
        <div style={{ textAlign: 'center', color: '#D4537E', padding: '3rem', fontSize: 14 }}>Cargando... 🏠</div>
      ) : (
        <>
          {showBudgets && <BudgetEditor budgets={budgets} onUpdate={handleUpdateBudget} />}

          {tab === 'dashboard' && (
            <>
              <SummaryCards transactions={txs} />
              <MonthlyChart summary={summary} year={year} />
              {ST('Categorías del mes')}
              <CategoryBars transactions={txs} budgets={budgets} />
              {ST('Distribución de gastos')}
              <SpendingChart transactions={txs} />
              {ST('Split entre Paula y Águeda')}
              <SplitView transactions={txs} />
            </>
          )}

          {tab === 'movimientos' && (
            <>
              {ST('Añadir movimiento')}
              <AddForm onAdd={handleAdd} />
              {ST('Últimos movimientos')}
              <TxList transactions={txs} onDelete={handleDelete} />
            </>
          )}

          {tab === 'ahorro' && (
            <>
              {ST('Ahorro mensual')}
              <SavingsBox savings={savings} onUpdate={handleUpdateSavings} />
              <MonthlyChart summary={summary} year={year} />
            </>
          )}
        </>
      )}
    </div>
  )
}
