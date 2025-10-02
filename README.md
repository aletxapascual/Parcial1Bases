# Parcial1 Web Frontend

React frontend built with Vite for managing clients and contracts.

## Features

- Single-page application with two sections: **Clients** and **Contracts**
- Tab navigation to switch between sections
- Forms to create clients and contracts
- Tables displaying all data with auto-refresh after creation
- Responsive design with modern UI

## Setup

1. Install dependencies:
```bash
npm install
```

2. Create a `.env` file in the `/web` directory:
```
VITE_API_URL=http://localhost:3000
```

3. Start the development server:
```bash
npm run dev
```

The app will be available at `http://localhost:5173`

## Build for Production

```bash
npm run build
```

The build files will be in the `dist` directory.

## Environment Variables

- `VITE_API_URL` - The base URL of the API (default: http://localhost:3000)

