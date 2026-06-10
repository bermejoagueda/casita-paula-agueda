const BASE = '/api'

export const api = {
  async checkPin(pin) {
    const r = await fetch(`${BASE}/auth`, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ pin }) })
    return r.json()
  },
  async getTransactions(filters = {}) {
    const params = new URLSearchParams()
    Object.entries(filters).forEach(([k, v]) => { if (v !== undefined && v !== '') params.append(k, v) })
    const r = await fetch(`${BASE}/transactions?${params}`)
    return r.json()
  },
  async addTransaction(data) {
    const r = await fetch(`${BASE}/transactions`, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(data) })
    return r.json()
  },
  async updateTransaction(id, data) {
    const r = await fetch(`${BASE}/transactions/${id}`, { method: 'PUT', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(data) })
    return r.json()
  },
  async deleteTransaction(id) {
    const r = await fetch(`${BASE}/transactions/${id}`, { method: 'DELETE' })
    return r.json()
  },
  async getBudgets() { return (await fetch(`${BASE}/budgets`)).json() },
  async updateBudget(cat, amount) {
    const r = await fetch(`${BASE}/budgets/${cat}`, { method: 'PUT', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ amount }) })
    return r.json()
  },
  async getSavings(year, month) { return (await fetch(`${BASE}/savings/${year}/${month}`)).json() },
  async updateSavings(year, month, goal, saved) {
    const r = await fetch(`${BASE}/savings/${year}/${month}`, { method: 'PUT', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ goal, saved }) })
    return r.json()
  },
  async getMonthlySummary(year) { return (await fetch(`${BASE}/monthly-summary/${year}`)).json() },
  async getAnnual(year) { return (await fetch(`${BASE}/annual/${year}`)).json() },
  async getRecurring() { return (await fetch(`${BASE}/recurring`)).json() },
  async addRecurring(data) {
    const r = await fetch(`${BASE}/recurring`, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(data) })
    return r.json()
  },
  async updateRecurring(id, data) {
    const r = await fetch(`${BASE}/recurring/${id}`, { method: 'PUT', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(data) })
    return r.json()
  },
  async deleteRecurring(id) {
    const r = await fetch(`${BASE}/recurring/${id}`, { method: 'DELETE' })
    return r.json()
  },
  async generateRecurring(year, month) {
    const r = await fetch(`${BASE}/recurring/generate/${year}/${month}`, { method: 'POST' })
    return r.json()
  },
}
