# 🏠 Casita de Paula & Águeda

Gestor de gastos del hogar. Stack: React + Vite + Node/Express + PostgreSQL.

---

## 🚀 Deploy en Railway (paso a paso)

### 1. Sube el código a GitHub

```bash
# En la carpeta del proyecto:
git init
git add .
git commit -m "✨ Casita inicial"

# Crea un repo nuevo en github.com y luego:
git remote add origin https://github.com/TU_USUARIO/casita-paula-agueda.git
git branch -M main
git push -u origin main
```

### 2. Crea el proyecto en Railway

1. Ve a [railway.app](https://railway.app) e inicia sesión con GitHub
2. Haz clic en **"New Project"**
3. Selecciona **"Deploy from GitHub repo"**
4. Elige el repo `casita-paula-agueda`
5. Railway detectará automáticamente que es un proyecto Node.js

### 3. Añade la base de datos PostgreSQL

1. Dentro del proyecto en Railway, haz clic en **"+ New"**
2. Selecciona **"Database → Add PostgreSQL"**
3. Railway creará la base de datos y añadirá `DATABASE_URL` automáticamente como variable de entorno

### 4. Verifica las variables de entorno

En tu servicio Node.js en Railway, ve a **"Variables"** y confirma que existe:
- `DATABASE_URL` — añadida automáticamente por el plugin de PostgreSQL
- `NODE_ENV` — añade manualmente con valor `production`

### 5. ¡Listo! 🎉

Railway hará el build y deploy automáticamente. Cada `git push` a `main` redesplegará la app.

---

## 💻 Desarrollo local

```bash
# Instala dependencias del servidor
npm install

# Instala dependencias del cliente
cd client && npm install && cd ..

# Crea tu .env local
cp .env.example .env
# Edita .env con tu DATABASE_URL local

# Inicia servidor (puerto 3001)
npm run dev

# En otra terminal, inicia el cliente (puerto 5173)
cd client && npm run dev
```

La app estará en `http://localhost:5173` en local.

---

## 📁 Estructura del proyecto

```
casita/
├── server/
│   └── index.js          # Express API + init de BD
├── client/
│   ├── src/
│   │   ├── components/   # Header, AddForm, CategoryBars...
│   │   ├── App.jsx       # Lógica principal
│   │   ├── api.js        # Llamadas al backend
│   │   └── constants.js  # Categorías y meses
│   └── vite.config.js
├── package.json           # Scripts de build para Railway
└── .env.example
```

## 🗂 Categorías incluidas

| Categoría    | Presupuesto por defecto |
|--------------|------------------------|
| 🏠 Alquiler  | €900                   |
| 🛒 Comida    | €400                   |
| ⚡ Servicios | €150                   |
| 🚗 Transporte| €120                   |
| 🎬 Ocio      | €200                   |
| 💊 Salud     | €100                   |
| 👗 Ropa      | €80                    |
| 📦 Otros     | €100                   |

Los presupuestos son editables desde la propia app.
