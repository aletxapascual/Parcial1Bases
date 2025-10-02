# Parcial1 - Clients & Contracts Management System

A full-stack application for managing clients and their contracts, built with Node.js/Express backend and React frontend.

## 📁 Project Structure

```
Parcial1/
├── api/                  # Backend API (Node.js + Express + PostgreSQL)
│   ├── index.js         # Main server file
│   ├── schema.sql       # Database schema
│   ├── package.json     # API dependencies
│   └── README.md        # API documentation
│
└── web/                  # Frontend (React + Vite)
    ├── src/
    │   ├── App.jsx      # Main application component
    │   ├── main.jsx     # React entry point
    │   └── index.css    # Global styles
    ├── package.json     # Frontend dependencies
    └── README.md        # Frontend documentation
```

## 🚀 Quick Start

### Prerequisites

- Node.js (v18 or higher)
- PostgreSQL database on Neon
- npm or yarn

### 1. Set Up the Database

1. Create a PostgreSQL database on [Neon](https://neon.tech)
2. Copy the connection string
3. Execute the SQL commands from `api/schema.sql` in your Neon database console

### 2. Set Up the API

```bash
cd api
npm install
```

Create a `.env` file in the `api` directory:
```env
DATABASE_URL=postgresql://username:password@host/database?sslmode=require
PORT=3000
```

Start the API server:
```bash
npm start
```

The API will be running at `http://localhost:3000`

### 3. Set Up the Frontend

```bash
cd web
npm install
```

Create a `.env` file in the `web` directory:
```env
VITE_API_URL=http://localhost:3000
```

Start the development server:
```bash
npm run dev
```

The web app will be running at `http://localhost:5173`

## 📋 Features

### API Endpoints

- **GET /clients** - Get all clients with contract count
- **POST /clients** - Create a new client
- **GET /contracts** - Get all contracts (supports filtering by airline and status)
- **POST /contracts** - Create a new contract

### Frontend Features

- **Single-page application** with tab navigation
- **Clients Section:**
  - Form to add new clients (name, email, phone)
  - Table showing all clients with their contract count
- **Contracts Section:**
  - Form to add new contracts (client selection, airline, plan, dates, cost, status)
  - Table showing all contracts with full details
- **Auto-refresh** after creating clients or contracts
- **Modern UI** with responsive design

## 🛠️ Technologies Used

### Backend
- Node.js
- Express.js
- PostgreSQL (via Neon)
- pg (PostgreSQL client)
- dotenv (environment variables)
- cors (CORS support)

### Frontend
- React 18
- Vite
- Axios
- Modern CSS

## 📝 Database Schema

### Clients Table
- `id` - Serial primary key
- `name` - Client name
- `email` - Unique email address
- `phone` - Phone number (optional)
- `created_at` - Timestamp

### Contracts Table
- `id` - Serial primary key
- `client_id` - Foreign key to clients
- `airline` - Airline name
- `plan` - Contract plan
- `start_date` - Contract start date
- `end_date` - Contract end date (optional)
- `monthly_cost` - Monthly cost (decimal)
- `status` - Contract status (active, inactive, etc.)
- `created_at` - Timestamp

## 🔒 Security Notes

- The API uses SSL connection to Neon with `rejectUnauthorized: false`
- CORS is enabled for frontend consumption
- Environment variables are used for sensitive data

## 📖 Development

### API Development Mode (with auto-reload)
```bash
cd api
npm run dev
```

### Build Frontend for Production
```bash
cd web
npm run build
```

## 📄 License

ISC

