# 🚀 Guía de Deployment - Vercel (Todo en uno)

## ✅ Deployment Completo en Vercel

### 1. Configurar variables de entorno en Vercel
1. Ve a tu proyecto en Vercel
2. **Settings** → **Environment Variables**
3. Agregar:
   ```
   DATABASE_URL=tu_connection_string_de_neon_aqui
   VITE_API_URL=/api
   ```

### 2. Desplegar
- Vercel detectará automáticamente los cambios
- O haz clic en **"Redeploy"**

### 3. Estructura del deployment
- **Frontend**: Se sirve desde `/web/dist`
- **API**: Funciones serverless en `/api/vercel/functions`
- **Rutas**:
  - `/api/clients` → Endpoints de clientes
  - `/api/contracts` → Endpoints de contratos
  - `/` → Frontend React

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

- **Aplicación completa**: `https://tu-app.vercel.app`
- **API**: `https://tu-app.vercel.app/api/`
- **Base de datos**: Neon PostgreSQL

## Verificación

1. **API**: `https://tu-app.vercel.app/api/` debe mostrar: `{"message":"Parcial1 API is running on Vercel Functions"}`
2. **Frontend**: `https://tu-app.vercel.app/` debe cargar sin errores
3. **Funcionalidad**: Crear clientes y contratos debe funcionar perfectamente

## ✅ Ventajas de usar Vercel Functions

- **Todo en un solo deployment**
- **Serverless** (paga solo por uso)
- **Muy rápido** (edge functions)
- **CORS automático** configurado
- **Escalado automático**
