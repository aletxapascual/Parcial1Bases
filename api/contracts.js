export default function handler(req, res) {
  res.status(200).json({ 
    message: 'Contracts endpoint working!',
    contracts: [],
    method: req.method
  });
}
