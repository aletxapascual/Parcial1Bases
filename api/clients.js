export default function handler(req, res) {
  res.status(200).json({ 
    message: 'Clients endpoint working!',
    clients: [],
    method: req.method
  });
}
