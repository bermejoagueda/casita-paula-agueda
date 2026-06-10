import React from 'react'
import { CATS } from '../constants'

const MONTHS_ES = ['enero','febrero','marzo','abril','mayo','junio','julio','agosto','septiembre','octubre','noviembre','diciembre']

export default function ContextualMessage({ transactions, budgets, month, year }) {
  const now = new Date()
  const isCurrentMonth = now.getFullYear() === year && now.getMonth() === month
  const expenses = transactions.filter(t => t.type === 'expense')
  const income   = transactions.filter(t => t.type === 'income').reduce((a,t) => a + Number(t.amount_eur), 0)
  const totalExp = expenses.reduce((a,t) => a + Number(t.amount_eur), 0)
  const balance  = income - totalExp
  const mxnCount = transactions.filter(t => t.currency === 'MXN').length

  if (transactions.length === 0) {
    const msgs = [`¡${MONTHS_ES[month].charAt(0).toUpperCase()+MONTHS_ES[month].slice(1)} tranquilo por ahora! 🌞`, 'Mes en blanco, ¡empezamos! ✨', 'Sin movimientos este mes todavía 📋']
    return <MessageCard msg={msgs[month % msgs.length]} color="#FDF2F6" textColor="#993556" />
  }

  const overBudget = CATS.map(cat => {
    const spent = expenses.filter(t => t.cat === cat.id).reduce((a,t) => a + Number(t.amount_eur), 0)
    const budget = budgets[cat.id] || 0
    return { ...cat, spent, budget, pct: budget > 0 ? spent / budget : 0 }
  }).filter(c => c.pct >= 0.9 && c.budget > 0)

  if (overBudget.length > 0) {
    const c = overBudget[0]; const pct = Math.round(c.pct * 100)
    if (pct >= 100) return <MessageCard msg={`${c.icon} ¡Os habéis pasado del presupuesto de ${c.name}! (${pct}%) 💸`} color="#FCEBEB" textColor="#A32D2D" />
    return <MessageCard msg={`${c.icon} Lleváis el ${pct}% del presupuesto de ${c.name} — ojo 👀`} color="#FAEEDA" textColor="#854F0B" />
  }

  if (mxnCount > 0 && isCurrentMonth) {
    return <MessageCard msg={`${mxnCount} gasto${mxnCount > 1 ? 's' : ''} en MXN convertido${mxnCount > 1 ? 's' : ''} automáticamente 🇲🇽↔🇪🇺`} color="#FDF2F6" textColor="#993556" />
  }

  if (isCurrentMonth && totalExp > 0) {
    const daysLeft = new Date(year, month + 1, 0).getDate() - now.getDate()
    if (daysLeft <= 5) return <MessageCard msg={`¡Últimos ${daysLeft} días del mes · €${totalExp.toFixed(0)} gastados`} color="#FAEEDA" textColor="#854F0B" />
    return <MessageCard msg={`€${totalExp.toFixed(0)} gastados este mes 💚`} color="#EAF3DE" textColor="#3B6D11" />
  }
  return <MessageCard msg="Todo controlado por ahora 🏠✨" color="#FDF2F6" textColor="#993556" />
}

function MessageCard({ msg, color, textColor }) {
  return (
    <div style={{ background: color, borderRadius: 12, padding: '10px 14px', fontSize: 13, fontWeight: 500, color: textColor, marginBottom: '1rem', lineHeight: 1.4 }}>
      {msg}
    </div>
  )
}
