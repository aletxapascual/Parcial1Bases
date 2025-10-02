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
      // GET /clients - Returns all clients with their number of contracts
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
      res.status(200).json(result.rows);
    } 
    else if (req.method === 'POST') {
      // POST /clients - Inserts a new client
      const { name, email, phone } = req.body;
      
      if (!name || !email) {
        return res.status(400).json({ error: 'Name and email are required' });
      }
      
      const query = `
        INSERT INTO clients (name, email, phone)
        VALUES ($1, $2, $3)
        RETURNING *
      `;
      
      const result = await pool.query(query, [name, email, phone || null]);
      res.status(201).json(result.rows[0]);
    } 
    else {
      res.setHeader('Allow', ['GET', 'POST']);
      res.status(405).end(`Method ${req.method} Not Allowed`);
    }
  } catch (error) {
    console.error('Error in clients API:', error);
    
    if (error.code === '23505') { // Unique violation
      res.status(409).json({ error: 'Email already exists' });
    } else {
      res.status(500).json({ error: 'Failed to process request' });
    }
  }
}
