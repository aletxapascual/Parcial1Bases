export default function handler(req, res) {
  res.status(200).json({ 
    message: 'Parcial1 API is running!',
    endpoints: ['/api/test', '/api/clients', '/api/contracts'],
    method: req.method
  });
}
