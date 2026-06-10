const BASE = '/api'

export const api = {
  async getTransactions(year, month) {
    const url = year && month ? `${BASE}/transactions?year=${year}&month=${month}` : `${BASE}/transactions`
    const r = await fetch(url)
    if (!r.ok) throw new Error('Error cargando transacciones')
    return r.json()
  },
  async addTransaction(data) {
    const r = await fetch(`${BASE}/transactions`, {
      method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(data),
    })
    if (!r.ok) throw new Error('Error añadiendo transacción')
    return r.json()
  },
  async deleteTransaction(id) {
    const r = await fetch(`${BASE}/transactions/${id}`, { method: 'DELETE' })
    if (!r.ok) throw new Error('Error eliminando')
    return r.json()
  },
  async getBudgets() {
    const r = await fetch(`${BASE}/budgets`)
    return r.json()
  },
  async updateBudget(cat, amount) {
    const r = await fetch(`${BASE}/budgets/${cat}`, {
      method: 'PUT', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ amount }),
    })
    return r.json()
  },
  async getSavings(year, month) {
    const r = await fetch(`${BASE}/savings/${year}/${month}`)
    return r.json()
  },
  async updateSavings(year, month, goal, saved) {
    const r = await fetch(`${BASE}/savings/${year}/${month}`, {
      method: 'PUT', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ goal, saved }),
    })
    return r.json()
  },
  async getMonthlySummary(year) {
    const r = await fetch(`${BASE}/monthly-summary/${year}`)
    return r.json()
  },
}
