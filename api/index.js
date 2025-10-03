import express from 'express';
import pg from 'pg';
import dotenv from 'dotenv';
import cors from 'cors';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 3000;

// PostgreSQL client configuration
const pool = new pg.Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: {
    rejectUnauthorized: false
  }
});

// Middleware
app.use(cors());
app.use(express.json());

// Test database connection
pool.query('SELECT NOW()', (err, res) => {
  if (err) {
    console.error('Database connection error:', err);
  } else {
    console.log('Database connected successfully at:', res.rows[0].now);
  }
});

// GET /clients - Returns all clients with their number of contracts
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

// POST /clients - Inserts a new client with ACID transaction
app.post('/clients', async (req, res) => {
  const { name, email, phone } = req.body;
  
  if (!name || !email) {
    return res.status(400).json({ error: 'Name and email are required' });
  }
  
  const client = await pool.connect();
  
  try {
    // Iniciar transacción ACID
    await client.query('BEGIN');
    
    // Verificar que el email no existe (evitar duplicados)
    const checkQuery = 'SELECT id FROM clients WHERE email = $1';
    const existingClient = await client.query(checkQuery, [email]);
    
    if (existingClient.rows.length > 0) {
      await client.query('ROLLBACK');
      return res.status(409).json({ error: 'Email already exists' });
    }
    
    // Insertar nuevo cliente
    const insertQuery = `
      INSERT INTO clients (name, email, phone)
      VALUES ($1, $2, $3)
      RETURNING *
    `;
    
    const result = await client.query(insertQuery, [name, email, phone || null]);
    
    // Confirmar transacción (COMMIT)
    await client.query('COMMIT');
    
    res.status(201).json(result.rows[0]);
    
  } catch (error) {
    // Rollback en caso de error (atomicidad)
    await client.query('ROLLBACK');
    console.error('Error creating client:', error);
    res.status(500).json({ error: 'Failed to create client' });
  } finally {
    // Liberar conexión
    client.release();
  }
});

// GET /contracts - Returns all contracts
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

// POST /contracts - Inserts a new contract with ACID transaction
app.post('/contracts', async (req, res) => {
  const { client_id, airline, plan, start_date, end_date, monthly_cost, status } = req.body;
  
  if (!client_id || !airline || !plan || !start_date || !monthly_cost) {
    return res.status(400).json({ 
      error: 'client_id, airline, plan, start_date, and monthly_cost are required' 
    });
  }
  
  const client = await pool.connect();
  
  try {
    // Iniciar transacción ACID
    await client.query('BEGIN');
    
    // Verificar que el cliente existe
    const clientCheckQuery = 'SELECT id, name FROM clients WHERE id = $1';
    const clientResult = await client.query(clientCheckQuery, [client_id]);
    
    if (clientResult.rows.length === 0) {
      await client.query('ROLLBACK');
      return res.status(404).json({ error: 'Client not found' });
    }
    
    // Validar fechas (end_date debe ser posterior a start_date)
    if (end_date && new Date(end_date) < new Date(start_date)) {
      await client.query('ROLLBACK');
      return res.status(400).json({ error: 'End date must be after start date' });
    }
    
    // Validar costo mensual (debe ser positivo)
    if (monthly_cost <= 0) {
      await client.query('ROLLBACK');
      return res.status(400).json({ error: 'Monthly cost must be positive' });
    }
    
    // Insertar nuevo contrato
    const insertQuery = `
      INSERT INTO contracts (client_id, airline, plan, start_date, end_date, monthly_cost, status)
      VALUES ($1, $2, $3, $4, $5, $6, $7)
      RETURNING *
    `;
    
    const result = await client.query(insertQuery, [
      client_id,
      airline,
      plan,
      start_date,
      end_date || null,
      monthly_cost,
      status || 'active'
    ]);
    
    // Confirmar transacción (COMMIT)
    await client.query('COMMIT');
    
    res.status(201).json(result.rows[0]);
    
  } catch (error) {
    // Rollback en caso de error (atomicidad)
    await client.query('ROLLBACK');
    console.error('Error creating contract:', error);
    
    if (error.code === '23503') { // Foreign key violation
      res.status(404).json({ error: 'Client not found' });
    } else if (error.code === '23514') { // Check constraint violation
      res.status(400).json({ error: 'Invalid data: constraint violation' });
    } else {
      res.status(500).json({ error: 'Failed to create contract' });
    }
  } finally {
    // Liberar conexión
    client.release();
  }
});

// PUT /clients/:id - Updates a client with ACID transaction
app.put('/clients/:id', async (req, res) => {
  const { id } = req.params;
  const { name, email, phone } = req.body;
  
  if (!name || !email) {
    return res.status(400).json({ error: 'Name and email are required' });
  }
  
  const client = await pool.connect();
  
  try {
    await client.query('BEGIN');
    
    // Verificar que el cliente existe
    const checkQuery = 'SELECT id FROM clients WHERE id = $1';
    const existingClient = await client.query(checkQuery, [id]);
    
    if (existingClient.rows.length === 0) {
      await client.query('ROLLBACK');
      return res.status(404).json({ error: 'Client not found' });
    }
    
    // Verificar que el email no existe en otro cliente
    const emailCheckQuery = 'SELECT id FROM clients WHERE email = $1 AND id != $2';
    const emailConflict = await client.query(emailCheckQuery, [email, id]);
    
    if (emailConflict.rows.length > 0) {
      await client.query('ROLLBACK');
      return res.status(409).json({ error: 'Email already exists' });
    }
    
    // Actualizar cliente
    const updateQuery = `
      UPDATE clients 
      SET name = $1, email = $2, phone = $3
      WHERE id = $4
      RETURNING *
    `;
    
    const result = await client.query(updateQuery, [name, email, phone || null, id]);
    await client.query('COMMIT');
    
    res.json(result.rows[0]);
    
  } catch (error) {
    await client.query('ROLLBACK');
    console.error('Error updating client:', error);
    res.status(500).json({ error: 'Failed to update client' });
  } finally {
    client.release();
  }
});

// DELETE /clients/:id - Deletes a client with ACID transaction
app.delete('/clients/:id', async (req, res) => {
  const { id } = req.params;
  const client = await pool.connect();
  
  try {
    await client.query('BEGIN');
    
    // Verificar que el cliente existe
    const checkQuery = 'SELECT id, name FROM clients WHERE id = $1';
    const existingClient = await client.query(checkQuery, [id]);
    
    if (existingClient.rows.length === 0) {
      await client.query('ROLLBACK');
      return res.status(404).json({ error: 'Client not found' });
    }
    
    // Verificar si tiene contratos (solo avisar, pero permitir eliminar)
    const contractsQuery = 'SELECT COUNT(*) as total_contracts FROM contracts WHERE client_id = $1';
    const contractsResult = await client.query(contractsQuery, [id]);
    const totalContracts = parseInt(contractsResult.rows[0].total_contracts);
    
    // Si tiene contratos, los eliminaremos también (CASCADE DELETE)
    if (totalContracts > 0) {
      console.log(`Deleting client ${id} with ${totalContracts} contracts (CASCADE DELETE)`);
    }
    
    // Eliminar cliente (CASCADE eliminará los contratos inactivos)
    const deleteQuery = 'DELETE FROM clients WHERE id = $1 RETURNING *';
    const result = await client.query(deleteQuery, [id]);
    
    await client.query('COMMIT');
    res.json({ message: 'Client deleted successfully', client: result.rows[0] });
    
  } catch (error) {
    await client.query('ROLLBACK');
    console.error('Error deleting client:', error);
    res.status(500).json({ error: 'Failed to delete client' });
  } finally {
    client.release();
  }
});

// PUT /contracts/:id - Updates a contract with ACID transaction
app.put('/contracts/:id', async (req, res) => {
  const { id } = req.params;
  const { airline, plan, start_date, end_date, monthly_cost, status } = req.body;
  
  const client = await pool.connect();
  
  try {
    await client.query('BEGIN');
    
    // Verificar que el contrato existe
    const checkQuery = 'SELECT id, client_id FROM contracts WHERE id = $1';
    const existingContract = await client.query(checkQuery, [id]);
    
    if (existingContract.rows.length === 0) {
      await client.query('ROLLBACK');
      return res.status(404).json({ error: 'Contract not found' });
    }
    
    // Validar fechas si se proporcionan
    if (end_date && start_date && new Date(end_date) < new Date(start_date)) {
      await client.query('ROLLBACK');
      return res.status(400).json({ error: 'End date must be after start date' });
    }
    
    // Validar costo mensual si se proporciona
    if (monthly_cost && monthly_cost <= 0) {
      await client.query('ROLLBACK');
      return res.status(400).json({ error: 'Monthly cost must be positive' });
    }
    
    // Construir query dinámico para actualización
    const updateFields = [];
    const values = [];
    let paramCount = 1;
    
    if (airline) { updateFields.push(`airline = $${paramCount++}`); values.push(airline); }
    if (plan) { updateFields.push(`plan = $${paramCount++}`); values.push(plan); }
    if (start_date) { updateFields.push(`start_date = $${paramCount++}`); values.push(start_date); }
    if (end_date !== undefined) { updateFields.push(`end_date = $${paramCount++}`); values.push(end_date); }
    if (monthly_cost) { updateFields.push(`monthly_cost = $${paramCount++}`); values.push(monthly_cost); }
    if (status) { updateFields.push(`status = $${paramCount++}`); values.push(status); }
    
    if (updateFields.length === 0) {
      await client.query('ROLLBACK');
      return res.status(400).json({ error: 'No fields to update' });
    }
    
    values.push(id);
    const updateQuery = `
      UPDATE contracts 
      SET ${updateFields.join(', ')}
      WHERE id = $${paramCount}
      RETURNING *
    `;
    
    const result = await client.query(updateQuery, values);
    await client.query('COMMIT');
    
    res.json(result.rows[0]);
    
  } catch (error) {
    await client.query('ROLLBACK');
    console.error('Error updating contract:', error);
    res.status(500).json({ error: 'Failed to update contract' });
  } finally {
    client.release();
  }
});

// DELETE /contracts/:id - Deletes a contract with ACID transaction
app.delete('/contracts/:id', async (req, res) => {
  const { id } = req.params;
  const client = await pool.connect();
  
  try {
    await client.query('BEGIN');
    
    // Verificar que el contrato existe
    const checkQuery = 'SELECT id, status FROM contracts WHERE id = $1';
    const existingContract = await client.query(checkQuery, [id]);
    
    if (existingContract.rows.length === 0) {
      await client.query('ROLLBACK');
      return res.status(404).json({ error: 'Contract not found' });
    }
    
    // Permitir eliminar cualquier contrato (incluyendo activos)
    // Solo avisar si está activo
    if (existingContract.rows[0].status === 'active') {
      console.log(`Deleting active contract ${id} - status will be changed to cancelled`);
    }
    
    // Eliminar contrato
    const deleteQuery = 'DELETE FROM contracts WHERE id = $1 RETURNING *';
    const result = await client.query(deleteQuery, [id]);
    
    await client.query('COMMIT');
    res.json({ message: 'Contract deleted successfully', contract: result.rows[0] });
    
  } catch (error) {
    await client.query('ROLLBACK');
    console.error('Error deleting contract:', error);
    res.status(500).json({ error: 'Failed to delete contract' });
  } finally {
    client.release();
  }
});

// Root endpoint
app.get('/', (req, res) => {
  res.json({ 
    message: 'Parcial1 API is running on Railway',
    endpoints: [
      'GET /clients',
      'POST /clients', 
      'PUT /clients/:id',
      'DELETE /clients/:id',
      'GET /contracts',
      'POST /contracts',
      'PUT /contracts/:id', 
      'DELETE /contracts/:id'
    ]
  });
});

// Start server
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});