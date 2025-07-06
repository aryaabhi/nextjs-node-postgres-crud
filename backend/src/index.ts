import express from 'express';
import dotenv from 'dotenv';
import { Pool } from 'pg';
import cors from 'cors';


dotenv.config();

const app = express();
const port = process.env.PORT || 4000;

// Set up PostgreSQL connection pool
const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
});

app.use(express.json());
app.use(cors());

app.get('/', (req, res) => {
  res.send('Hello from Node.js backend!');
});

// Test DB connection
app.get('/db-test', async (req, res) => {
  try {
    const result = await pool.query('SELECT NOW()');
    res.json({ time: result.rows[0].now });
  } catch (err) {
    if (err instanceof Error) {
      res.status(500).json({ error: err.message });
    } else {
      res.status(500).json({ error: String(err) });
    }
  }
});

// --- USERS ROUTER ---
const usersRouter = express.Router();

// Get all users
usersRouter.get('/', async (req, res) => {
  try {
    const result = await pool.query('SELECT * FROM users');
    res.json(result.rows);
  } catch (err) {
    if (err instanceof Error) {
      res.status(500).json({ error: err.message });
    } else {
      res.status(500).json({ error: String(err) });
    }
  }
});

// Get user by ID
usersRouter.get('/:id', async (req, res) => {
  const id = req.params['id'];
  if (!id) {
    return res.status(400).json({ error: 'ID is required' });
  }
  try {
    const result = await pool.query('SELECT * FROM users WHERE id = $1', [id]);
    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'User not found' });
    }
    res.json(result.rows[0]);
  } catch (err) {
    if (err instanceof Error) {
      res.status(500).json({ error: err.message });
    } else {
      res.status(500).json({ error: String(err) });
    }
  }
});

// Create new user
usersRouter.post('/', async (req, res) => {
  try {
    const { name, email } = req.body;
    const result = await pool.query(
      'INSERT INTO users (name, email) VALUES ($1, $2) RETURNING *',
      [name, email]
    );
    res.status(201).json(result.rows[0]);
  } catch (err) {
    if (err instanceof Error) {
      res.status(500).json({ error: err.message });
    } else {
      res.status(500).json({ error: String(err) });
    }
  }
});

// Update user
usersRouter.put('/:id', async (req, res) => {
  const id = req.params['id'];
  if (!id) {
    return res.status(400).json({ error: 'ID is required' });
  }
  try {
    const { name, email } = req.body;
    const result = await pool.query(
      'UPDATE users SET name = $1, email = $2 WHERE id = $3 RETURNING *',
      [name, email, id]
    );
    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'User not found' });
    }
    res.json(result.rows[0]);
  } catch (err) {
    if (err instanceof Error) {
      res.status(500).json({ error: err.message });
    } else {
      res.status(500).json({ error: String(err) });
    }
  }
});

// Delete user
usersRouter.delete('/:id', async (req, res) => {
  const id = req.params['id'];
  if (!id) {
    return res.status(400).json({ error: 'ID is required' });
  }
  try {
    const result = await pool.query(
      'DELETE FROM users WHERE id = $1 RETURNING *',
      [id]
    );
    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'User not found' });
    }
    res.json({ message: 'User deleted' });
  } catch (err) {
    if (err instanceof Error) {
      res.status(500).json({ error: err.message });
    } else {
      res.status(500).json({ error: String(err) });
    }
  }
});

// Mount the users router
app.use('/users', usersRouter);

app.listen(port, () => {
  console.log(`Server running on http://localhost:${port}`);
});