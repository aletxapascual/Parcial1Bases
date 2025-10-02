export default function handler(req, res) {
  // Configurar CORS
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET,POST,OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') {
    res.status(200).end();
    return;
  }

  if (req.method === 'GET') {
    res.status(200).json({ 
      message: 'Clients endpoint working',
      clients: [],
      method: req.method 
    });
  } 
  else if (req.method === 'POST') {
    res.status(200).json({ 
      message: 'Client created successfully',
      body: req.body,
      method: req.method 
    });
  } 
  else {
    res.status(405).json({ error: 'Method not allowed' });
  }
}
