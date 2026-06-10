require('dotenv').config();
const express = require('express');
const cors = require('cors');
const path = require('path');
const { Pool } = require('pg');

const app = express();
const PORT = process.env.PORT || 3001;
const PIN = process.env.APP_PIN || '1234';

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: process.env.NODE_ENV === 'production' ? { rejectUnauthorized: false } : false,
});

app.use(cors());
app.use(express.json());
app.use(express.static(path.join(__dirname, '../client/dist')));

async function initDB() {
  await pool.query(`
    CREATE TABLE IF NOT EXISTS transactions (
      id          SERIAL PRIMARY KEY,
      description TEXT NOT NULL,
      amount      NUMERIC(10,2) NOT NULL,
      cat         TEXT NOT NULL,
      type        TEXT NOT NULL CHECK (type IN ('expense','income')),
      date        DATE NOT NULL,
      person      TEXT NOT NULL DEFAULT 'ambas',
      notes       TEXT DEFAULT '',
      created_at  TIMESTAMPTZ DEFAULT NOW()
    );
    CREATE TABLE IF NOT EXISTS budgets (
      cat    TEXT PRIMARY KEY,
      amount NUMERIC(10,2) NOT NULL
    );
    CREATE TABLE IF NOT EXISTS savings (
      id    SERIAL PRIMARY KEY,
      year  INT NOT NULL,
      month INT NOT NULL,
      goal  NUMERIC(10,2) NOT NULL DEFAULT 0,
      saved NUMERIC(10,2) NOT NULL DEFAULT 0,
      UNIQUE(year, month)
    );
    CREATE TABLE IF NOT EXISTS recurring (
      id          SERIAL PRIMARY KEY,
      description TEXT NOT NULL,
      amount      NUMERIC(10,2) NOT NULL,
      cat         TEXT NOT NULL,
      person      TEXT NOT NULL DEFAULT 'ambas',
      day_of_month INT NOT NULL DEFAULT 1,
      active      BOOLEAN NOT NULL DEFAULT true,
      created_at  TIMESTAMPTZ DEFAULT NOW()
    );
  `);
  await pool.query(`ALTER TABLE transactions ADD COLUMN IF NOT EXISTS person TEXT NOT NULL DEFAULT 'ambas'`).catch(() => {});
  await pool.query(`ALTER TABLE transactions ADD COLUMN IF NOT EXISTS notes TEXT DEFAULT ''`).catch(() => {});

  const { rowCount } = await pool.query('SELECT 1 FROM budgets LIMIT 1');
  if (rowCount === 0) {
    await pool.query(`INSERT INTO budgets (cat, amount) VALUES
      ('alquiler',900),('comida',400),('servicios',150),
      ('transporte',120),('ocio',200),('salud',100),('ropa',80),('otro',100)`);
  }

  const { rowCount: txCount } = await pool.query('SELECT 1 FROM transactions LIMIT 1');
  if (txCount === 0) {
    const m = new Date().toISOString().slice(0, 7);
    await pool.query(`INSERT INTO transactions (description, amount, cat, type, date, person, notes) VALUES
      ('Alquiler',900,'alquiler','expense','${m}-01','ambas',''),
      ('Mercadona',85,'comida','expense','${m}-03','agueda','compra semanal'),
      ('Luz y gas',72,'servicios','expense','${m}-02','ambas',''),
      ('Cine',24,'ocio','expense','${m}-05','paula','con amigas'),
      ('Carburante',60,'transporte','expense','${m}-04','paula',''),
      ('Nomina Paula',1600,'otro','income','${m}-01','paula',''),
      ('Nomina Agueda',1400,'otro','income','${m}-01','agueda',''),
      ('Zara',55,'ropa','expense','${m}-06','agueda',''),
      ('Farmacia',18,'salud','expense','${m}-05','paula','')`);
  }

  const { rowCount: recCount } = await pool.query('SELECT 1 FROM recurring LIMIT 1');
  if (recCount === 0) {
    await pool.query(`INSERT INTO recurring (description, amount, cat, person, day_of_month) VALUES
      ('Alquiler',900,'alquiler','ambas',1),
      ('Netflix',13,'ocio','ambas',5),
      ('Spotify',10,'ocio','ambas',5),
      ('Luz y gas',80,'servicios','ambas',2)`);
  }
  console.log('DB lista');
}

// Auth
app.post('/api/auth', (req, res) => {
  const { pin } = req.body;
  if (pin === PIN) res.json({ ok: true });
  else res.status(401).json({ ok: false, error: 'PIN incorrecto' });
});

// Transactions
app.get('/api/transactions', async (req, res) => {
  try {
    const { year, month, cat, person, search } = req.query;
    let query = 'SELECT * FROM transactions WHERE 1=1';
    const params = [];
    let i = 1;
    if (year && month) { query += ` AND EXTRACT(YEAR FROM date)=$${i++} AND EXTRACT(MONTH FROM date)=$${i++}`; params.push(year, month); }
    else if (year) { query += ` AND EXTRACT(YEAR FROM date)=$${i++}`; params.push(year); }
    if (cat) { query += ` AND cat=$${i++}`; params.push(cat); }
    if (person) { query += ` AND person=$${i++}`; params.push(person); }
    if (search) { query += ` AND LOWER(description) LIKE $${i++}`; params.push(`%${search.toLowerCase()}%`); }
    query += ' ORDER BY date DESC, created_at DESC';
    const { rows } = await pool.query(query, params);
    res.json(rows);
  } catch (err) { res.status(500).json({ error: 'Error' }); }
});

app.post('/api/transactions', async (req, res) => {
  try {
    const { desc, amount, cat, type, date, person = 'ambas', notes = '' } = req.body;
    if (!desc || !amount || !cat || !type || !date) return res.status(400).json({ error: 'Faltan campos' });
    const { rows } = await pool.query(
      'INSERT INTO transactions (description, amount, cat, type, date, person, notes) VALUES ($1,$2,$3,$4,$5,$6,$7) RETURNING *',
      [desc, amount, cat, type, date, person, notes]
    );
    res.status(201).json(rows[0]);
  } catch (err) { res.status(500).json({ error: 'Error' }); }
});

app.put('/api/transactions/:id', async (req, res) => {
  try {
    const { desc, amount, cat, type, date, person = 'ambas', notes = '' } = req.body;
    const { rows } = await pool.query(
      'UPDATE transactions SET description=$1, amount=$2, cat=$3, type=$4, date=$5, person=$6, notes=$7 WHERE id=$8 RETURNING *',
      [desc, amount, cat, type, date, person, notes, req.params.id]
    );
    res.json(rows[0]);
  } catch (err) { res.status(500).json({ error: 'Error' }); }
});

app.delete('/api/transactions/:id', async (req, res) => {
  try {
    await pool.query('DELETE FROM transactions WHERE id=$1', [req.params.id]);
    res.json({ ok: true });
  } catch (err) { res.status(500).json({ error: 'Error' }); }
});

// Budgets
app.get('/api/budgets', async (req, res) => {
  try { const { rows } = await pool.query('SELECT * FROM budgets'); res.json(rows); }
  catch { res.status(500).json({ error: 'Error' }); }
});
app.put('/api/budgets/:cat', async (req, res) => {
  try {
    const { amount } = req.body;
    const { rows } = await pool.query(
      'INSERT INTO budgets (cat,amount) VALUES ($1,$2) ON CONFLICT (cat) DO UPDATE SET amount=$2 RETURNING *',
      [req.params.cat, amount]
    );
    res.json(rows[0]);
  } catch { res.status(500).json({ error: 'Error' }); }
});

// Savings
app.get('/api/savings/:year/:month', async (req, res) => {
  try {
    const { rows } = await pool.query('SELECT * FROM savings WHERE year=$1 AND month=$2', [req.params.year, req.params.month]);
    res.json(rows[0] || { year: req.params.year, month: req.params.month, goal: 0, saved: 0 });
  } catch { res.status(500).json({ error: 'Error' }); }
});
app.put('/api/savings/:year/:month', async (req, res) => {
  try {
    const { goal, saved } = req.body;
    const { rows } = await pool.query(
      'INSERT INTO savings (year,month,goal,saved) VALUES ($1,$2,$3,$4) ON CONFLICT (year,month) DO UPDATE SET goal=$3, saved=$4 RETURNING *',
      [req.params.year, req.params.month, goal, saved]
    );
    res.json(rows[0]);
  } catch { res.status(500).json({ error: 'Error' }); }
});

// Recurring
app.get('/api/recurring', async (req, res) => {
  try {
    const { rows } = await pool.query('SELECT * FROM recurring ORDER BY day_of_month, id');
    res.json(rows);
  } catch { res.status(500).json({ error: 'Error' }); }
});

app.post('/api/recurring', async (req, res) => {
  try {
    const { description, amount, cat, person = 'ambas', day_of_month = 1 } = req.body;
    const { rows } = await pool.query(
      'INSERT INTO recurring (description, amount, cat, person, day_of_month) VALUES ($1,$2,$3,$4,$5) RETURNING *',
      [description, amount, cat, person, day_of_month]
    );
    res.status(201).json(rows[0]);
  } catch { res.status(500).json({ error: 'Error' }); }
});

app.put('/api/recurring/:id', async (req, res) => {
  try {
    const { description, amount, cat, person, day_of_month, active } = req.body;
    const { rows } = await pool.query(
      'UPDATE recurring SET description=$1, amount=$2, cat=$3, person=$4, day_of_month=$5, active=$6 WHERE id=$7 RETURNING *',
      [description, amount, cat, person, day_of_month, active, req.params.id]
    );
    res.json(rows[0]);
  } catch { res.status(500).json({ error: 'Error' }); }
});

app.delete('/api/recurring/:id', async (req, res) => {
  try {
    await pool.query('DELETE FROM recurring WHERE id=$1', [req.params.id]);
    res.json({ ok: true });
  } catch { res.status(500).json({ error: 'Error' }); }
});

// Generate recurring for a month
app.post('/api/recurring/generate/:year/:month', async (req, res) => {
  try {
    const { year, month } = req.params;
    const { rows: recRows } = await pool.query('SELECT * FROM recurring WHERE active=true');
    const pad = n => String(n).padStart(2, '0');
    const monthStr = `${year}-${pad(month)}`;
    let generated = 0;
    for (const r of recRows) {
      const date = `${monthStr}-${pad(Math.min(r.day_of_month, 28))}`;
      const { rowCount } = await pool.query(
        `SELECT 1 FROM transactions WHERE description=$1 AND date=$2 AND amount=$3`,
        [r.description, date, r.amount]
      );
      if (rowCount === 0) {
        await pool.query(
          'INSERT INTO transactions (description, amount, cat, type, date, person, notes) VALUES ($1,$2,$3,$4,$5,$6,$7)',
          [r.description, r.amount, r.cat, 'expense', date, r.person, 'gasto fijo']
        );
        generated++;
      }
    }
    res.json({ ok: true, generated });
  } catch (err) { res.status(500).json({ error: 'Error' }); }
});

// Summary endpoints
app.get('/api/monthly-summary/:year', async (req, res) => {
  try {
    const { rows } = await pool.query(`
      SELECT EXTRACT(MONTH FROM date)::int AS month, type, SUM(amount) AS total
      FROM transactions WHERE EXTRACT(YEAR FROM date)=$1
      GROUP BY month, type ORDER BY month`, [req.params.year]);
    res.json(rows);
  } catch { res.status(500).json({ error: 'Error' }); }
});

app.get('/api/annual/:year', async (req, res) => {
  try {
    const { rows } = await pool.query(`
      SELECT EXTRACT(MONTH FROM date)::int AS month, cat, type, SUM(amount) AS total
      FROM transactions WHERE EXTRACT(YEAR FROM date)=$1
      GROUP BY month, cat, type ORDER BY month`, [req.params.year]);
    res.json(rows);
  } catch { res.status(500).json({ error: 'Error' }); }
});

app.get('/api/health', (_, res) => res.json({ status: 'ok' }));
app.get('*', (_, res) => res.sendFile(path.join(__dirname, '../client/dist/index.html')));

initDB().then(() => {
  app.listen(PORT, () => console.log('Casita en puerto ' + PORT));
}).catch(err => { console.error('Error DB:', err); process.exit(1); });
