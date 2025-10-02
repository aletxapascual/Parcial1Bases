import express from 'express';
import pg from 'pg';
import dotenv from 'dotenv';
import cors from 'cors';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 3000;

// PostgreSQL client configuration for Neon
const pool = new pg.Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: {
    rejectUnauthorized: false
  }
});

app.use(cors());
app.use(express.json());

pool.query('SELECT NOW()', (err, res) => {
  if (err) {
    console.error('Database connection error:', err);
  } else {
    console.log('Database connected successfully at:', res.rows[0].now);
  }
});


app.get('/clients', async (req, res) => {
  try {
    const query = `
      SELECT 
        c.id,
        c.name,
        c.email,
        c.phone,
        c.created_at,
        COUNT(ct.id) as contract_count
      FROM clients c
      LEFT JOIN contracts ct ON c.id = ct.client_id
      GROUP BY c.id, c.name, c.email, c.phone, c.created_at
      ORDER BY c.id DESC
    `;
    
    const result = await pool.query(query);
    res.json(result.rows);
  } catch (error) {
    console.error('Error fetching clients:', error);
    res.status(500).json({ error: 'Failed to fetch clients' });
  }
});


app.post('/clients', async (req, res) => {
  const { name, email, phone } = req.body;
  
  if (!name || !email) {
    return res.status(400).json({ error: 'Name and email are required' });
  }
  
  try {
    const query = `
      INSERT INTO clients (name, email, phone)
      VALUES ($1, $2, $3)
      RETURNING *
    `;
    
    const result = await pool.query(query, [name, email, phone || null]);
    res.status(201).json(result.rows[0]);
  } catch (error) {
    console.error('Error creating client:', error);
    if (error.code === '23505') { // Unique violation
      res.status(409).json({ error: 'Email already exists' });
    } else {
      res.status(500).json({ error: 'Failed to create client' });
    }
  }
});


app.get('/contracts', async (req, res) => {
  try {
    const { airline, status } = req.query;
    
    let query = `
      SELECT 
        ct.id,
        ct.client_id,
        c.name as client_name,
        ct.airline,
        ct.plan,
        ct.start_date,
        ct.end_date,
        ct.monthly_cost,
        ct.status,
        ct.created_at
      FROM contracts ct
      JOIN clients c ON ct.client_id = c.id
      WHERE 1=1
    `;
    
    const params = [];
    let paramCounter = 1;
    
    if (airline) {
      query += ` AND ct.airline = $${paramCounter}`;
      params.push(airline);
      paramCounter++;
    }
    
    if (status) {
      query += ` AND ct.status = $${paramCounter}`;
      params.push(status);
      paramCounter++;
    }
    
    query += ' ORDER BY ct.id DESC';
    
    const result = await pool.query(query, params);
    res.json(result.rows);
  } catch (error) {
    console.error('Error fetching contracts:', error);
    res.status(500).json({ error: 'Failed to fetch contracts' });
  }
});


app.post('/contracts', async (req, res) => {
  const { client_id, airline, plan, start_date, end_date, monthly_cost, status } = req.body;
  
  if (!client_id || !airline || !plan || !start_date || !monthly_cost) {
    return res.status(400).json({ 
      error: 'client_id, airline, plan, start_date, and monthly_cost are required' 
    });
  }
  
  try {
    const query = `
      INSERT INTO contracts (client_id, airline, plan, start_date, end_date, monthly_cost, status)
      VALUES ($1, $2, $3, $4, $5, $6, $7)
      RETURNING *
    `;
    
    const result = await pool.query(query, [
      client_id,
      airline,
      plan,
      start_date,
      end_date || null,
      monthly_cost,
      status || 'active'
    ]);
    
    res.status(201).json(result.rows[0]);
  } catch (error) {
    console.error('Error creating contract:', error);
    if (error.code === '23503') { // Foreign key violation
      res.status(404).json({ error: 'Client not found' });
    } else {
      res.status(500).json({ error: 'Failed to create contract' });
    }
  }
});


app.get('/', (req, res) => {
  res.json({ message: 'Parcial1 API is running' });
});


app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});

