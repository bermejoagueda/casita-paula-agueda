const BASE = '/api'
const j = (r) => r.json()
const post = (url, data) => fetch(url, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(data) })
const put  = (url, data) => fetch(url, { method: 'PUT',  headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(data) })
const del  = (url)       => fetch(url, { method: 'DELETE' })

export const api = {
  async checkPin(pin)          { return j(await post(`${BASE}/auth`, { pin })) },
  async getExchangeRate()      { return j(await fetch(`${BASE}/exchange-rate`)) },
  async getTransactions(f={})  { const p = new URLSearchParams(); Object.entries(f).forEach(([k,v])=>{ if(v!==undefined&&v!=='') p.append(k,v) }); return j(await fetch(`${BASE}/transactions?${p}`)) },
  async addTransaction(d)      { return j(await post(`${BASE}/transactions`, d)) },
  async updateTransaction(id,d){ return j(await put(`${BASE}/transactions/${id}`, d)) },
  async deleteTransaction(id)  { return j(await del(`${BASE}/transactions/${id}`)) },
  async getBudgets()           { return j(await fetch(`${BASE}/budgets`)) },
  async updateBudget(cat,amt)  { return j(await put(`${BASE}/budgets/${cat}`, { amount: amt })) },
  async getSavings(y,m)        { return j(await fetch(`${BASE}/savings/${y}/${m}`)) },
  async updateSavings(y,m,g,s) { return j(await put(`${BASE}/savings/${y}/${m}`, { goal:g, saved:s })) },
  async getMonthlySummary(y)   { return j(await fetch(`${BASE}/monthly-summary/${y}`)) },
  async getAnnual(y)           { return j(await fetch(`${BASE}/annual/${y}`)) },
  async getRecurring()         { return j(await fetch(`${BASE}/recurring`)) },
  async addRecurring(d)        { return j(await post(`${BASE}/recurring`, d)) },
  async updateRecurring(id,d)  { return j(await put(`${BASE}/recurring/${id}`, d)) },
  async deleteRecurring(id)    { return j(await del(`${BASE}/recurring/${id}`)) },
  async generateRecurring(y,m) { return j(await post(`${BASE}/recurring/generate/${y}/${m}`, {})) },
  async getBoteSettings()     { return j(await fetch(`${BASE}/bote-settings`)) },
  async updateBoteSettings(d) { return j(await put(`${BASE}/bote-settings`, d)) },
  async getShopping()          { return j(await fetch(`${BASE}/shopping`)) },
  async addShoppingItem(d)     { return j(await post(`${BASE}/shopping`, d)) },
  async updateShoppingItem(id,d){ return j(await put(`${BASE}/shopping/${id}`, d)) },
  async deleteShoppingItem(id) { return j(await del(`${BASE}/shopping/${id}`)) },
  async clearChecked()         { return j(await post(`${BASE}/shopping/clear-checked`, {})) },
  async getWishlist()          { return j(await fetch(`${BASE}/wishlist`)) },
  async addWishItem(d)         { return j(await post(`${BASE}/wishlist`, d)) },
  async updateWishItem(id,d)   { return j(await put(`${BASE}/wishlist/${id}`, d)) },
  async deleteWishItem(id)     { return j(await del(`${BASE}/wishlist/${id}`)) },
  async getTrips()             { return j(await fetch(`${BASE}/trips`)) },
  async addTrip(d)             { return j(await post(`${BASE}/trips`, d)) },
  async updateTrip(id,d)       { return j(await put(`${BASE}/trips/${id}`, d)) },
  async deleteTrip(id)         { return j(await del(`${BASE}/trips/${id}`)) },
  async getTripExpenses(tid)   { return j(await fetch(`${BASE}/trips/${tid}/expenses`)) },
  async addTripExpense(tid,d)  { return j(await post(`${BASE}/trips/${tid}/expenses`, d)) },
  async deleteTripExpense(tid,id){ return j(await del(`${BASE}/trips/${tid}/expenses/${id}`)) },
}
