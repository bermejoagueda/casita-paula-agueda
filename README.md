# 🏠 Casita de Paula & Águeda

Gestor de gastos del hogar. Stack: React + Vite + Node/Express + PostgreSQL.

---

## 🚀 Deploy en Render.com (paso a paso)

### 1. Ve a [render.com](https://render.com)
- Haz clic en **"Get Started for Free"**
- Regístrate con **GitHub** (así conecta directamente con tu repo)

### 2. Crea un nuevo Web Service
- Haz clic en **"New +"** → **"Web Service"**
- Conecta tu cuenta de GitHub si no lo has hecho
- Selecciona el repo **`bermejoagueda/casita-paula-agueda`**
- Haz clic en **"Connect"**

### 3. Configura el servicio
Rellena así:

| Campo | Valor |
|-------|-------|
| Name | `casita-paula-agueda` |
| Region | `Frankfurt (EU Central)` |
| Branch | `main` |
| Build Command | `npm install && npm run build` |
| Start Command | `npm start` |
| Instance Type | **Free** |

### 4. Añade la base de datos PostgreSQL
- Antes de hacer Deploy, haz clic en **"Advanced"**
- Luego **"Add Database"** → selecciona **PostgreSQL**
- Render conectará la base de datos automáticamente

### 5. Despliega
- Haz clic en **"Create Web Service"**
- Render hará el build (~3-4 minutos la primera vez)
- Cuando aparezca 🟢 **Live**, tu app estará online

---

## 💻 Desarrollo local

```bash
npm install
cd client && npm install && cd ..
cp .env.example .env
# Edita .env con tu DATABASE_URL local
npm run dev
# En otra terminal:
cd client && npm run dev
```

---

## 📁 Estructura

```
casita/
├── server/index.js       # API Express + init BD
├── client/src/
│   ├── components/       # Header, AddForm, CategoryBars...
│   ├── App.jsx
│   ├── api.js
│   └── constants.js
├── render.yaml           # Config automática de Render
└── package.json
```
