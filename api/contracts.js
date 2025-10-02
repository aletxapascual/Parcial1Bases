import { getPool } from './lib/db.js';

export default async function handler(req, res) {
  // Configurar CORS
  res.setHeader('Access-Control-Allow-Credentials', true);
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET,OPTIONS,PATCH,DELETE,POST,PUT');
  res.setHeader(
    'Access-Control-Allow-Headers',
    'X-CSRF-Token, X-Requested-With, Accept, Accept-Version, Content-Length, Content-MD5, Content-Type, Date, X-Api-Version'
  );

  if (req.method === 'OPTIONS') {
    res.status(200).end();
    return;
  }

  const pool = getPool();

  try {
    if (req.method === 'GET') {
      // GET /contracts - Returns all contracts (with optional filtering by airline and status)
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
      res.status(200).json(result.rows);
    } 
    else if (req.method === 'POST') {
      // POST /contracts - Inserts a new contract linked to a client
      const { client_id, airline, plan, start_date, end_date, monthly_cost, status } = req.body;
      
      if (!client_id || !airline || !plan || !start_date || !monthly_cost) {
        return res.status(400).json({ 
          error: 'client_id, airline, plan, start_date, and monthly_cost are required' 
        });
      }
      
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
    } 
    else {
      res.setHeader('Allow', ['GET', 'POST']);
      res.status(405).end(`Method ${req.method} Not Allowed`);
    }
  } catch (error) {
    console.error('Error in contracts API:', error);
    
    if (error.code === '23503') { // Foreign key violation
      res.status(404).json({ error: 'Client not found' });
    } else {
      res.status(500).json({ error: 'Failed to process request' });
    }
  }
}
