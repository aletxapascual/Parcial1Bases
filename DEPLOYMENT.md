# 🚀 Guía de Deployment

## Backend (API) - Railway

### 1. Crear cuenta en Railway
- Ve a [railway.app](https://railway.app)
- Conecta tu cuenta de GitHub

### 2. Desplegar la API
1. **Crear nuevo proyecto** en Railway
2. **Conectar repositorio**: Selecciona `aletxapascual/Parcial1Bases`
3. **Configurar servicio**:
   - **Root Directory**: `api`
   - **Build Command**: `npm install`
   - **Start Command**: `npm start`

### 3. Configurar variables de entorno en Railway
```bash
DATABASE_URL=tu_connection_string_de_neon_aqui
PORT=3000
```

### 4. Obtener URL de la API
- Railway te dará una URL como: `https://tu-api.railway.app`

## Frontend (Web) - Vercel

### 1. Configurar variables de entorno en Vercel
1. Ve a tu proyecto en Vercel
2. **Settings** → **Environment Variables**
3. Agregar:
   ```
   VITE_API_URL=https://tu-api.railway.app
   ```

### 2. Redesplegar
- Vercel detectará automáticamente los cambios
- O haz clic en **"Redeploy"**

## Base de Datos - Neon

### 1. Configurar PostgreSQL
- Ya tienes tu base de datos en Neon
- Copia la **connection string** completa
- Agrégala como `DATABASE_URL` en Railway

### 2. Ejecutar migraciones
```sql
-- Ejecutar el contenido de database.sql en tu base de datos Neon
```

## URLs Finales

- **Frontend**: `https://tu-frontend.vercel.app`
- **Backend**: `https://tu-backend.railway.app`
- **Base de datos**: Neon PostgreSQL

## Verificación

1. **Backend**: `https://tu-backend.railway.app/` debe mostrar: `{"message":"Parcial1 API is running"}`
2. **Frontend**: Debe cargar sin errores de conexión
3. **Funcionalidad**: Crear clientes y contratos debe funcionar
