require('dotenv').config();
const express = require('express');
const cors = require('cors');
const path = require('path');
const { Pool } = require('pg');

const app = express();
const PORT = process.env.PORT || 3001;

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: process.env.NODE_ENV === 'production' ? { rejectUnauthorized: false } : false,
});

app.use(cors());
app.use(express.json());

// Serve React build in production
app.use(express.static(path.join(__dirname, '../client/dist')));

// ── Init DB ──────────────────────────────────────────────
async function initDB() {
  await pool.query(`
    CREATE TABLE IF NOT EXISTS transactions (
      id        SERIAL PRIMARY KEY,
      desc      TEXT NOT NULL,
      amount    NUMERIC(10,2) NOT NULL,
      cat       TEXT NOT NULL,
      type      TEXT NOT NULL CHECK (type IN ('expense','income')),
      date      DATE NOT NULL,
      created_at TIMESTAMPTZ DEFAULT NOW()
    );

    CREATE TABLE IF NOT EXISTS budgets (
      cat     TEXT PRIMARY KEY,
      amount  NUMERIC(10,2) NOT NULL
    );
  `);

  // Insert default budgets if empty
  const { rowCount } = await pool.query('SELECT 1 FROM budgets LIMIT 1');
  if (rowCount === 0) {
    await pool.query(`
      INSERT INTO budgets (cat, amount) VALUES
        ('alquiler', 900),
        ('comida', 400),
        ('servicios', 150),
        ('transporte', 120),
        ('ocio', 200),
        ('salud', 100),
        ('ropa', 80),
        ('otro', 100)
    `);
  }

  // Insert sample data if empty
  const { rowCount: txCount } = await pool.query('SELECT 1 FROM transactions LIMIT 1');
  if (txCount === 0) {
    const thisMonth = new Date().toISOString().slice(0, 7);
    await pool.query(`
      INSERT INTO transactions (desc, amount, cat, type, date) VALUES
        ('Alquiler', 900, 'alquiler', 'expense', '${thisMonth}-01'),
        ('Mercadona', 85, 'comida', 'expense', '${thisMonth}-03'),
        ('Luz y gas', 72, 'servicios', 'expense', '${thisMonth}-02'),
        ('Cine', 24, 'ocio', 'expense', '${thisMonth}-05'),
        ('Carburante', 60, 'transporte', 'expense', '${thisMonth}-04'),
        ('Nómina Paula', 1600, 'otro', 'income', '${thisMonth}-01'),
        ('Nómina Águeda', 1400, 'otro', 'income', '${thisMonth}-01'),
        ('Zara', 55, 'ropa', 'expense', '${thisMonth}-06'),
        ('Farmacia', 18, 'salud', 'expense', '${thisMonth}-05')
    `);
  }

  console.log('✅ Base de datos lista');
}

// ── Routes ───────────────────────────────────────────────

// GET transactions (optional ?year=&month=)
app.get('/api/transactions', async (req, res) => {
  try {
    const { year, month } = req.query;
    let query = 'SELECT * FROM transactions';
    const params = [];
    if (year && month) {
      query += ` WHERE EXTRACT(YEAR FROM date) = $1 AND EXTRACT(MONTH FROM date) = $2`;
      params.push(year, month);
    }
    query += ' ORDER BY date DESC, created_at DESC';
    const { rows } = await pool.query(query, params);
    res.json(rows);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Error al obtener transacciones' });
  }
});

// POST transaction
app.post('/api/transactions', async (req, res) => {
  try {
    const { desc, amount, cat, type, date } = req.body;
    if (!desc || !amount || !cat || !type || !date) {
      return res.status(400).json({ error: 'Faltan campos obligatorios' });
    }
    const { rows } = await pool.query(
      'INSERT INTO transactions (desc, amount, cat, type, date) VALUES ($1,$2,$3,$4,$5) RETURNING *',
      [desc, amount, cat, type, date]
    );
    res.status(201).json(rows[0]);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Error al crear transacción' });
  }
});

// DELETE transaction
app.delete('/api/transactions/:id', async (req, res) => {
  try {
    await pool.query('DELETE FROM transactions WHERE id = $1', [req.params.id]);
    res.json({ ok: true });
  } catch (err) {
    res.status(500).json({ error: 'Error al eliminar' });
  }
});

// GET budgets
app.get('/api/budgets', async (req, res) => {
  try {
    const { rows } = await pool.query('SELECT * FROM budgets');
    res.json(rows);
  } catch (err) {
    res.status(500).json({ error: 'Error al obtener presupuestos' });
  }
});

// PUT budget
app.put('/api/budgets/:cat', async (req, res) => {
  try {
    const { amount } = req.body;
    const { rows } = await pool.query(
      'INSERT INTO budgets (cat, amount) VALUES ($1,$2) ON CONFLICT (cat) DO UPDATE SET amount=$2 RETURNING *',
      [req.params.cat, amount]
    );
    res.json(rows[0]);
  } catch (err) {
    res.status(500).json({ error: 'Error al actualizar presupuesto' });
  }
});

// Health check
app.get('/api/health', (_, res) => res.json({ status: 'ok', time: new Date() }));

// Fallback → React
app.get('*', (_, res) => {
  res.sendFile(path.join(__dirname, '../client/dist/index.html'));
});

initDB().then(() => {
  app.listen(PORT, () => console.log(`🏠 Casita corriendo en puerto ${PORT}`));
}).catch(err => {
  console.error('Error iniciando DB:', err);
  process.exit(1);
});
