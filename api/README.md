# Parcial1 API

API built with Node.js + Express that connects to PostgreSQL in Neon.

## Setup

1. Install dependencies:
```bash
npm install
```

2. Create a `.env` file in the `/api` directory with your Neon database URL:
```
DATABASE_URL=postgresql://username:password@host/database?sslmode=require
PORT=3000
```

3. Run the schema to create tables in your Neon database:
   - Connect to your Neon database console
   - Execute the SQL commands in `schema.sql`

4. Start the server:
```bash
npm start
```

Or for development with auto-reload:
```bash
npm run dev
```

## Endpoints

### Clients
- `GET /clients` - Returns all clients with their number of contracts
- `POST /clients` - Creates a new client
  - Body: `{ "name": "string", "email": "string", "phone": "string" }`

### Contracts
- `GET /contracts` - Returns all contracts (optional query params: `airline`, `status`)
- `POST /contracts` - Creates a new contract
  - Body: `{ "client_id": number, "airline": "string", "plan": "string", "start_date": "YYYY-MM-DD", "end_date": "YYYY-MM-DD" (optional), "monthly_cost": number, "status": "string" (optional) }`

