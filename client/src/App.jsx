import React, { useState, useEffect, useCallback } from 'react'
import Header from './components/Header'
import SummaryCards from './components/SummaryCards'
import CategoryBars from './components/CategoryBars'
import SpendingChart from './components/SpendingChart'
import AddForm from './components/AddForm'
import TxList from './components/TxList'
import BudgetEditor from './components/BudgetEditor'
import { MONTHS } from './constants'
import { api } from './api'

const sectionTitle = (text) => (
  <div style={{
    fontSize: 11, fontWeight: 600, color: '#888780',
    textTransform: 'uppercase', letterSpacing: '0.07em',
    margin: '1.25rem 0 0.65rem',
  }}>{text}</div>
)

export default function App() {
  const now = new Date()
  const [year, setYear]   = useState(now.getFullYear())
  const [month, setMonth] = useState(now.getMonth()) // 0-indexed
  const [txs, setTxs]     = useState([])
  const [budgets, setBudgets] = useState({})
  const [loading, setLoading] = useState(true)
  const [showBudgets, setShowBudgets] = useState(false)

  const loadData = useCallback(async () => {
    setLoading(true)
    try {
      const [txData, budgetData] = await Promise.all([
        api.getTransactions(year, month + 1),
        api.getBudgets(),
      ])
      setTxs(txData)
      const map = {}
      budgetData.forEach(b => { map[b.cat] = Number(b.amount) })
      setBudgets(map)
    } catch (err) {
      console.error(err)
    } finally {
      setLoading(false)
    }
  }, [year, month])

  useEffect(() => { loadData() }, [loadData])

  const changeMonth = (dir) => {
    let m = month + dir
    let y = year
    if (m < 0)  { m = 11; y-- }
    if (m > 11) { m = 0;  y++ }
    setMonth(m)
    setYear(y)
  }

  const handleAdd = async (data) => {
    await api.addTransaction(data)
    await loadData()
  }

  const handleDelete = async (id) => {
    await api.deleteTransaction(id)
    setTxs(prev => prev.filter(t => t.id !== id))
  }

  const handleUpdateBudget = async (cat, amount) => {
    await api.updateBudget(cat, amount)
    setBudgets(prev => ({ ...prev, [cat]: amount }))
  }

  return (
    <div style={{ maxWidth: 680, margin: '0 auto', padding: '1.5rem 1rem 3rem' }}>
      <Header />

      {/* Month navigation */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1rem' }}>
        <div style={{ display: 'flex', gap: 4 }}>
          {['◀', '▶'].map((arrow, i) => (
            <button key={arrow} onClick={() => changeMonth(i === 0 ? -1 : 1)} style={{
              background: '#fff', border: '0.5px solid #D3D1C7',
              borderRadius: 8, padding: '5px 11px', cursor: 'pointer', fontSize: 12, color: '#5F5E5A',
            }}>{arrow}</button>
          ))}
        </div>
        <span style={{ fontSize: 16, fontWeight: 500 }}>{MONTHS[month]} {year}</span>
        <div style={{ display: 'flex', gap: 6, alignItems: 'center' }}>
          <span style={{ fontSize: 12, color: '#888780' }}>{txs.length} movimientos</span>
          <button onClick={() => setShowBudgets(s => !s)} style={{
            background: showBudgets ? '#F9D6E7' : '#fff',
            border: `0.5px solid ${showBudgets ? '#F2A8C8' : '#D3D1C7'}`,
            borderRadius: 8, padding: '4px 10px', cursor: 'pointer', fontSize: 12,
            color: showBudgets ? '#993556' : '#5F5E5A',
          }}>
            ⚙️ Presupuestos
          </button>
        </div>
      </div>

      {loading ? (
        <div style={{ textAlign: 'center', color: '#D4537E', padding: '3rem', fontSize: 14 }}>
          Cargando... 🏠
        </div>
      ) : (
        <>
          <SummaryCards transactions={txs} />

          {showBudgets && (
            <BudgetEditor budgets={budgets} onUpdate={handleUpdateBudget} />
          )}

          {sectionTitle('Categorías')}
          <CategoryBars transactions={txs} budgets={budgets} />

          {sectionTitle('Distribución de gastos')}
          <SpendingChart transactions={txs} />

          {sectionTitle('Añadir movimiento')}
          <AddForm onAdd={handleAdd} />

          {sectionTitle('Últimos movimientos')}
          <TxList transactions={txs} onDelete={handleDelete} />
        </>
      )}
    </div>
  )
}
