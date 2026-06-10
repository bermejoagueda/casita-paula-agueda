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

let rateCache = { rate: 20.0, updatedAt: null };

async function fetchExchangeRate() {
  try {
    const res = await fetch('https://api.exchangerate-api.com/v4/latest/EUR');
    const data = await res.json();
    if (data.rates && data.rates.MXN) {
      rateCache = { rate: data.rates.MXN, updatedAt: new Date() };
      console.log('Cambio: 1 EUR = ' + rateCache.rate.toFixed(2) + ' MXN');
    }
  } catch (err) { console.log('Error tipo de cambio, usando cache'); }
}

async function initDB() {
  await pool.query(`ALTER TABLE transactions ALTER COLUMN amount DROP NOT NULL`).catch(() => {});
  await pool.query(`
    CREATE TABLE IF NOT EXISTS transactions (
      id            SERIAL PRIMARY KEY,
      description   TEXT NOT NULL,
      amount        NUMERIC(10,2),
      amount_eur    NUMERIC(10,2),
      amount_orig   NUMERIC(10,2),
      currency      TEXT DEFAULT 'EUR',
      exchange_rate NUMERIC(10,4),
      cat           TEXT NOT NULL,
      type          TEXT NOT NULL CHECK (type IN ('expense','income')),
      date          DATE NOT NULL,
      person        TEXT DEFAULT 'ambas',
      notes         TEXT DEFAULT '',
      created_at    TIMESTAMPTZ DEFAULT NOW()
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
      id           SERIAL PRIMARY KEY,
      description  TEXT NOT NULL,
      amount       NUMERIC(10,2) NOT NULL,
      currency     TEXT DEFAULT 'EUR',
      cat          TEXT NOT NULL,
      person       TEXT DEFAULT 'ambas',
      day_of_month INT NOT NULL DEFAULT 1,
      active       BOOLEAN NOT NULL DEFAULT true,
      created_at   TIMESTAMPTZ DEFAULT NOW()
    );
    CREATE TABLE IF NOT EXISTS shopping_items (
      id          SERIAL PRIMARY KEY,
      name        TEXT NOT NULL,
      category    TEXT DEFAULT 'otros',
      quantity    TEXT DEFAULT '1',
      is_usual    BOOLEAN DEFAULT false,
      checked     BOOLEAN DEFAULT false,
      created_at  TIMESTAMPTZ DEFAULT NOW()
    );
    CREATE TABLE IF NOT EXISTS wishlist (
      id          SERIAL PRIMARY KEY,
      name        TEXT NOT NULL,
      price_est   NUMERIC(10,2),
      priority    TEXT DEFAULT 'media',
      room        TEXT DEFAULT '',
      person      TEXT DEFAULT 'ambas',
      bought      BOOLEAN DEFAULT false,
      notes       TEXT DEFAULT '',
      created_at  TIMESTAMPTZ DEFAULT NOW()
    );
    CREATE TABLE IF NOT EXISTS trips (
      id          SERIAL PRIMARY KEY,
      name        TEXT NOT NULL,
      destination TEXT DEFAULT '',
      start_date  DATE,
      end_date    DATE,
      budget      NUMERIC(10,2),
      status      TEXT DEFAULT 'active',
      created_at  TIMESTAMPTZ DEFAULT NOW()
    );
    CREATE TABLE IF NOT EXISTS trip_expenses (
      id            SERIAL PRIMARY KEY,
      trip_id       INT NOT NULL REFERENCES trips(id) ON DELETE CASCADE,
      description   TEXT NOT NULL,
      amount_eur    NUMERIC(10,2) NOT NULL,
      amount_orig   NUMERIC(10,2),
      currency      TEXT DEFAULT 'EUR',
      exchange_rate NUMERIC(10,4),
      cat           TEXT DEFAULT 'otro',
      person        TEXT DEFAULT 'ambas',
      date          DATE NOT NULL,
      notes         TEXT DEFAULT '',
      created_at    TIMESTAMPTZ DEFAULT NOW()
    );
  `);

  await pool.query(`ALTER TABLE transactions ADD COLUMN IF NOT EXISTS amount_eur NUMERIC(10,2)`).catch(() => {});
  await pool.query(`ALTER TABLE transactions ADD COLUMN IF NOT EXISTS amount_orig NUMERIC(10,2)`).catch(() => {});
  await pool.query(`ALTER TABLE transactions ADD COLUMN IF NOT EXISTS currency TEXT DEFAULT 'EUR'`).catch(() => {});
  await pool.query(`ALTER TABLE transactions ADD COLUMN IF NOT EXISTS exchange_rate NUMERIC(10,4)`).catch(() => {});
  await pool.query(`ALTER TABLE transactions ADD COLUMN IF NOT EXISTS person TEXT DEFAULT 'ambas'`).catch(() => {});
  await pool.query(`ALTER TABLE transactions ADD COLUMN IF NOT EXISTS notes TEXT DEFAULT ''`).catch(() => {});
  await pool.query(`ALTER TABLE recurring ADD COLUMN IF NOT EXISTS currency TEXT DEFAULT 'EUR'`).catch(() => {});
  await pool.query(`UPDATE transactions SET amount_eur = amount WHERE amount_eur IS NULL AND amount IS NOT NULL`).catch(() => {});
  await pool.query(`UPDATE transactions SET amount_orig = amount_eur WHERE amount_orig IS NULL`).catch(() => {});
  await pool.query(`UPDATE transactions SET currency = 'EUR' WHERE currency IS NULL`).catch(() => {});
  await pool.query(`UPDATE transactions SET person = 'ambas' WHERE person IS NULL`).catch(() => {});
  await pool.query(`UPDATE transactions SET notes = '' WHERE notes IS NULL`).catch(() => {});

  const { rowCount } = await pool.query('SELECT 1 FROM budgets LIMIT 1');
  if (rowCount === 0) {
    await pool.query(`INSERT INTO budgets (cat, amount) VALUES ('alquiler',900),('comida',400),('servicios',150),('transporte',120),('ocio',200),('salud',100),('ropa',80),('otro',100)`);
  }

  const { rowCount: shopCount } = await pool.query('SELECT 1 FROM shopping_items LIMIT 1');
  if (shopCount === 0) {
    await pool.query(`INSERT INTO shopping_items (name, category, is_usual, checked) VALUES ('Leche','lacteos',true,false),('Huevos','lacteos',true,false),('Pan','panaderia',true,false),('Aguacates','frutas',true,false),('Tomates','verduras',true,false),('Aceite de oliva','despensa',true,false),('Cafe','despensa',true,false),('Detergente','limpieza',true,false)`);
  }

  const { rowCount: wishCount } = await pool.query('SELECT 1 FROM wishlist LIMIT 1');
  if (wishCount === 0) {
    await pool.query(`INSERT INTO wishlist (name, price_est, priority, room, person) VALUES ('Sofa nuevo',800,'alta','salon','ambas'),('Cafetera Nespresso',120,'media','cocina','ambas'),('Plantas decorativas',80,'baja','salon','agueda')`);
  }

  console.log('DB lista');
}

app.post('/api/auth', (req, res) => {
  if (req.body.pin === PIN) res.json({ ok: true });
  else res.status(401).json({ ok: false, error: 'PIN incorrecto' });
});

app.get('/api/exchange-rate', (req, res) => {
  res.json({ rate: rateCache.rate, updatedAt: rateCache.updatedAt, base: 'EUR', target: 'MXN' });
});

app.get('/api/transactions', async (req, res) => {
  try {
    const { year, month, cat, person, search } = req.query;
    let query = 'SELECT * FROM transactions WHERE 1=1';
    const params = []; let i = 1;
    if (year && month) { query += ` AND EXTRACT(YEAR FROM date)=$${i++} AND EXTRACT(MONTH FROM date)=$${i++}`; params.push(year, month); }
    else if (year) { query += ` AND EXTRACT(YEAR FROM date)=$${i++}`; params.push(year); }
    if (cat)    { query += ` AND cat=$${i++}`; params.push(cat); }
    if (person) { query += ` AND person=$${i++}`; params.push(person); }
    if (search) { query += ` AND LOWER(description) LIKE $${i++}`; params.push(`%${search.toLowerCase()}%`); }
    query += ' ORDER BY date DESC, created_at DESC';
    const { rows } = await pool.query(query, params);
    res.json(rows);
  } catch { res.status(500).json({ error: 'Error' }); }
});

app.post('/api/transactions', async (req, res) => {
  try {
    const { desc, amount_eur, amount_orig, currency = 'EUR', exchange_rate, cat, type, date, person = 'ambas', notes = '' } = req.body;
    if (!desc || !amount_eur || !cat || !type || !date) return res.status(400).json({ error: 'Faltan campos' });
    const eur = parseFloat(amount_eur);
    const orig = parseFloat(amount_orig || amount_eur);
    const { rows } = await pool.query(
      'INSERT INTO transactions (description, amount, amount_eur, amount_orig, currency, exchange_rate, cat, type, date, person, notes) VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11) RETURNING *',
      [desc, eur, eur, orig, currency, exchange_rate || 1, cat, type, date, person, notes]
    );
    res.status(201).json(rows[0]);
  } catch (err) { console.error('INSERT ERROR:', err.message); res.status(500).json({ error: err.message }); }
});

app.put('/api/transactions/:id', async (req, res) => {
  try {
    const { desc, amount_eur, amount_orig, currency = 'EUR', exchange_rate, cat, type, date, person = 'ambas', notes = '' } = req.body;
    const eur = parseFloat(amount_eur);
    const { rows } = await pool.query(
      'UPDATE transactions SET description=$1, amount=$2, amount_eur=$2, amount_orig=$3, currency=$4, exchange_rate=$5, cat=$6, type=$7, date=$8, person=$9, notes=$10 WHERE id=$11 RETURNING *',
      [desc, eur, parseFloat(amount_orig || amount_eur), currency, exchange_rate || 1, cat, type, date, person, notes, req.params.id]
    );
    res.json(rows[0]);
  } catch (err) { res.status(500).json({ error: err.message }); }
});

app.delete('/api/transactions/:id', async (req, res) => {
  try { await pool.query('DELETE FROM transactions WHERE id=$1', [req.params.id]); res.json({ ok: true }); }
  catch { res.status(500).json({ error: 'Error' }); }
});

app.get('/api/budgets', async (req, res) => {
  try { res.json((await pool.query('SELECT * FROM budgets')).rows); }
  catch { res.status(500).json({ error: 'Error' }); }
});
app.put('/api/budgets/:cat', async (req, res) => {
  try {
    const { rows } = await pool.query('INSERT INTO budgets (cat,amount) VALUES ($1,$2) ON CONFLICT (cat) DO UPDATE SET amount=$2 RETURNING *', [req.params.cat, req.body.amount]);
    res.json(rows[0]);
  } catch { res.status(500).json({ error: 'Error' }); }
});

app.get('/api/savings/:year/:month', async (req, res) => {
  try {
    const { rows } = await pool.query('SELECT * FROM savings WHERE year=$1 AND month=$2', [req.params.year, req.params.month]);
    res.json(rows[0] || { year: req.params.year, month: req.params.month, goal: 0, saved: 0 });
  } catch { res.status(500).json({ error: 'Error' }); }
});
app.put('/api/savings/:year/:month', async (req, res) => {
  try {
    const { goal, saved } = req.body;
    const { rows } = await pool.query('INSERT INTO savings (year,month,goal,saved) VALUES ($1,$2,$3,$4) ON CONFLICT (year,month) DO UPDATE SET goal=$3, saved=$4 RETURNING *', [req.params.year, req.params.month, goal, saved]);
    res.json(rows[0]);
  } catch { res.status(500).json({ error: 'Error' }); }
});

app.get('/api/recurring', async (req, res) => {
  try { res.json((await pool.query('SELECT * FROM recurring ORDER BY day_of_month, id')).rows); }
  catch { res.status(500).json({ error: 'Error' }); }
});
app.post('/api/recurring', async (req, res) => {
  try {
    const { description, amount, currency = 'EUR', cat, person = 'ambas', day_of_month = 1 } = req.body;
    const { rows } = await pool.query('INSERT INTO recurring (description, amount, currency, cat, person, day_of_month) VALUES ($1,$2,$3,$4,$5,$6) RETURNING *', [description, amount, currency, cat, person, day_of_month]);
    res.status(201).json(rows[0]);
  } catch { res.status(500).json({ error: 'Error' }); }
});
app.put('/api/recurring/:id', async (req, res) => {
  try {
    const { description, amount, currency, cat, person, day_of_month, active } = req.body;
    const { rows } = await pool.query('UPDATE recurring SET description=$1, amount=$2, currency=$3, cat=$4, person=$5, day_of_month=$6, active=$7 WHERE id=$8 RETURNING *', [description, amount, currency || 'EUR', cat, person, day_of_month, active, req.params.id]);
    res.json(rows[0]);
  } catch { res.status(500).json({ error: 'Error' }); }
});
app.delete('/api/recurring/:id', async (req, res) => {
  try { await pool.query('DELETE FROM recurring WHERE id=$1', [req.params.id]); res.json({ ok: true }); }
  catch { res.status(500).json({ error: 'Error' }); }
});
app.post('/api/recurring/generate/:year/:month', async (req, res) => {
  try {
    const { year, month } = req.params;
    const { rows: recRows } = await pool.query('SELECT * FROM recurring WHERE active=true');
    const pad = n => String(n).padStart(2, '0');
    const rate = rateCache.rate;
    let generated = 0;
    for (const r of recRows) {
      const date = `${year}-${pad(month)}-${pad(Math.min(r.day_of_month, 28))}`;
      const eur = r.currency === 'MXN' ? parseFloat((r.amount / rate).toFixed(2)) : parseFloat(r.amount);
      const { rowCount } = await pool.query('SELECT 1 FROM transactions WHERE description=$1 AND date=$2', [r.description, date]);
      if (rowCount === 0) {
        await pool.query('INSERT INTO transactions (description, amount, amount_eur, amount_orig, currency, exchange_rate, cat, type, date, person, notes) VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11)', [r.description, eur, eur, r.amount, r.currency, r.currency === 'MXN' ? rate : 1, r.cat, 'expense', date, r.person, 'gasto fijo']);
        generated++;
      }
    }
    res.json({ ok: true, generated });
  } catch { res.status(500).json({ error: 'Error' }); }
});

app.get('/api/shopping', async (req, res) => {
  try { res.json((await pool.query('SELECT * FROM shopping_items ORDER BY checked, category, name')).rows); }
  catch { res.status(500).json({ error: 'Error' }); }
});
app.post('/api/shopping', async (req, res) => {
  try {
    const { name, category = 'otros', quantity = '1', is_usual = false } = req.body;
    const { rows } = await pool.query('INSERT INTO shopping_items (name, category, quantity, is_usual) VALUES ($1,$2,$3,$4) RETURNING *', [name, category, quantity, is_usual]);
    res.status(201).json(rows[0]);
  } catch { res.status(500).json({ error: 'Error' }); }
});
app.put('/api/shopping/:id', async (req, res) => {
  try {
    const { name, category, quantity, is_usual, checked } = req.body;
    const { rows } = await pool.query('UPDATE shopping_items SET name=$1, category=$2, quantity=$3, is_usual=$4, checked=$5 WHERE id=$6 RETURNING *', [name, category, quantity, is_usual, checked, req.params.id]);
    res.json(rows[0]);
  } catch { res.status(500).json({ error: 'Error' }); }
});
app.delete('/api/shopping/:id', async (req, res) => {
  try { await pool.query('DELETE FROM shopping_items WHERE id=$1', [req.params.id]); res.json({ ok: true }); }
  catch { res.status(500).json({ error: 'Error' }); }
});
app.post('/api/shopping/clear-checked', async (req, res) => {
  try { await pool.query('DELETE FROM shopping_items WHERE checked=true AND is_usual=false'); res.json({ ok: true }); }
  catch { res.status(500).json({ error: 'Error' }); }
});

app.get('/api/wishlist', async (req, res) => {
  try { res.json((await pool.query('SELECT * FROM wishlist ORDER BY bought, created_at')).rows); }
  catch { res.status(500).json({ error: 'Error' }); }
});
app.post('/api/wishlist', async (req, res) => {
  try {
    const { name, price_est, priority = 'media', room = '', person = 'ambas', notes = '' } = req.body;
    const { rows } = await pool.query('INSERT INTO wishlist (name, price_est, priority, room, person, notes) VALUES ($1,$2,$3,$4,$5,$6) RETURNING *', [name, price_est, priority, room, person, notes]);
    res.status(201).json(rows[0]);
  } catch { res.status(500).json({ error: 'Error' }); }
});
app.put('/api/wishlist/:id', async (req, res) => {
  try {
    const { name, price_est, priority, room, person, bought, notes } = req.body;
    const { rows } = await pool.query('UPDATE wishlist SET name=$1, price_est=$2, priority=$3, room=$4, person=$5, bought=$6, notes=$7 WHERE id=$8 RETURNING *', [name, price_est, priority, room, person, bought, notes, req.params.id]);
    res.json(rows[0]);
  } catch { res.status(500).json({ error: 'Error' }); }
});
app.delete('/api/wishlist/:id', async (req, res) => {
  try { await pool.query('DELETE FROM wishlist WHERE id=$1', [req.params.id]); res.json({ ok: true }); }
  catch { res.status(500).json({ error: 'Error' }); }
});

app.get('/api/trips', async (req, res) => {
  try { res.json((await pool.query('SELECT * FROM trips ORDER BY created_at DESC')).rows); }
  catch { res.status(500).json({ error: 'Error' }); }
});
app.post('/api/trips', async (req, res) => {
  try {
    const { name, destination = '', start_date, end_date, budget } = req.body;
    const { rows } = await pool.query('INSERT INTO trips (name, destination, start_date, end_date, budget) VALUES ($1,$2,$3,$4,$5) RETURNING *', [name, destination, start_date || null, end_date || null, budget || null]);
    res.status(201).json(rows[0]);
  } catch { res.status(500).json({ error: 'Error' }); }
});
app.put('/api/trips/:id', async (req, res) => {
  try {
    const { name, destination, start_date, end_date, budget, status } = req.body;
    const { rows } = await pool.query('UPDATE trips SET name=$1, destination=$2, start_date=$3, end_date=$4, budget=$5, status=$6 WHERE id=$7 RETURNING *', [name, destination, start_date, end_date, budget, status, req.params.id]);
    res.json(rows[0]);
  } catch { res.status(500).json({ error: 'Error' }); }
});
app.delete('/api/trips/:id', async (req, res) => {
  try { await pool.query('DELETE FROM trips WHERE id=$1', [req.params.id]); res.json({ ok: true }); }
  catch { res.status(500).json({ error: 'Error' }); }
});

app.get('/api/trips/:id/expenses', async (req, res) => {
  try { res.json((await pool.query('SELECT * FROM trip_expenses WHERE trip_id=$1 ORDER BY date DESC, created_at DESC', [req.params.id])).rows); }
  catch { res.status(500).json({ error: 'Error' }); }
});
app.post('/api/trips/:id/expenses', async (req, res) => {
  try {
    const { description, amount_eur, amount_orig, currency = 'EUR', exchange_rate, cat = 'otro', person = 'ambas', date, notes = '' } = req.body;
    const { rows } = await pool.query('INSERT INTO trip_expenses (trip_id, description, amount_eur, amount_orig, currency, exchange_rate, cat, person, date, notes) VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10) RETURNING *', [req.params.id, description, amount_eur, amount_orig || amount_eur, currency, exchange_rate || 1, cat, person, date, notes]);
    res.status(201).json(rows[0]);
  } catch { res.status(500).json({ error: 'Error' }); }
});
app.delete('/api/trips/:tripId/expenses/:id', async (req, res) => {
  try { await pool.query('DELETE FROM trip_expenses WHERE id=$1 AND trip_id=$2', [req.params.id, req.params.tripId]); res.json({ ok: true }); }
  catch { res.status(500).json({ error: 'Error' }); }
});

app.get('/api/monthly-summary/:year', async (req, res) => {
  try {
    const { rows } = await pool.query(`SELECT EXTRACT(MONTH FROM date)::int AS month, type, SUM(COALESCE(amount_eur, amount)) AS total FROM transactions WHERE EXTRACT(YEAR FROM date)=$1 GROUP BY month, type ORDER BY month`, [req.params.year]);
    res.json(rows);
  } catch { res.status(500).json({ error: 'Error' }); }
});
app.get('/api/annual/:year', async (req, res) => {
  try {
    const { rows } = await pool.query(`SELECT EXTRACT(MONTH FROM date)::int AS month, cat, type, SUM(COALESCE(amount_eur, amount)) AS total FROM transactions WHERE EXTRACT(YEAR FROM date)=$1 GROUP BY month, cat, type ORDER BY month`, [req.params.year]);
    res.json(rows);
  } catch { res.status(500).json({ error: 'Error' }); }
});

app.post('/api/migrate', async (req, res) => {
  try {
    await pool.query(`ALTER TABLE transactions ALTER COLUMN amount DROP NOT NULL`).catch(() => {});
    await pool.query(`ALTER TABLE transactions ADD COLUMN IF NOT EXISTS amount_eur NUMERIC(10,2)`).catch(() => {});
    await pool.query(`ALTER TABLE transactions ADD COLUMN IF NOT EXISTS amount_orig NUMERIC(10,2)`).catch(() => {});
    await pool.query(`ALTER TABLE transactions ADD COLUMN IF NOT EXISTS currency TEXT DEFAULT 'EUR'`).catch(() => {});
    await pool.query(`ALTER TABLE transactions ADD COLUMN IF NOT EXISTS person TEXT DEFAULT 'ambas'`).catch(() => {});
    await pool.query(`ALTER TABLE transactions ADD COLUMN IF NOT EXISTS notes TEXT DEFAULT ''`).catch(() => {});
    const r1 = await pool.query(`UPDATE transactions SET amount_eur = amount WHERE amount_eur IS NULL AND amount IS NOT NULL`);
    const r2 = await pool.query(`UPDATE transactions SET amount_orig = amount_eur WHERE amount_orig IS NULL`);
    const r3 = await pool.query(`UPDATE transactions SET currency = 'EUR' WHERE currency IS NULL`);
    const r4 = await pool.query(`UPDATE transactions SET person = 'ambas' WHERE person IS NULL`);
    const r5 = await pool.query(`UPDATE transactions SET notes = '' WHERE notes IS NULL`);
    res.json({ ok: true, migrated: r1.rowCount });
  } catch (err) { res.status(500).json({ error: err.message }); }
});

app.get('/api/health', (_, res) => res.json({ status: 'ok' }));
app.get('*', (_, res) => res.sendFile(path.join(__dirname, '../client/dist/index.html')));

fetchExchangeRate().then(() => initDB()).then(() => {
  setInterval(fetchExchangeRate, 6 * 60 * 60 * 1000);
  app.listen(PORT, () => console.log('Casita en puerto ' + PORT));
}).catch(err => { console.error('Error:', err); process.exit(1); });
