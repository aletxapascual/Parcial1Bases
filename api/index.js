export default function handler(req, res) {
  res.status(200).json({ 
    message: 'Parcial1 API is running on Vercel Functions',
    endpoints: {
      clients: '/api/clients',
      contracts: '/api/contracts'
    }
  });
}