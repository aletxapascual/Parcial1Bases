# Sistema de Gestión de Clientes y Contratos de Aerolíneas

## 📋 Contexto

Este proyecto implementa un sistema web completo para la gestión de clientes y sus contratos con aerolíneas. El sistema permite registrar clientes, crear contratos de servicios de vuelo, y mantener un registro completo de las relaciones comerciales.

### Objetivo
Facilitar la administración de clientes corporativos y sus contratos de servicios aéreos, proporcionando una interfaz intuitiva para el registro, consulta y gestión de información.

## 🏢 Reglas de Negocio

### Clientes
- **RN001**: Cada cliente debe tener un nombre único y un correo electrónico único en el sistema
- **RN002**: El correo electrónico es obligatorio y debe ser válido
- **RN003**: Un cliente puede tener múltiples contratos con diferentes aerolíneas
- **RN004**: El teléfono es opcional pero recomendado para contacto

### Contratos
- **RN005**: Cada contrato debe estar asociado a un cliente existente
- **RN006**: La fecha de fin debe ser posterior o igual a la fecha de inicio
- **RN007**: El costo mensual debe ser un valor positivo
- **RN008**: Los estados válidos son: activo, inactivo, pendiente, cancelado
- **RN009**: Un contrato no puede ser eliminado si está activo

### Sistema
- **RN010**: El sistema debe mantener un historial de todas las operaciones
- **RN011**: Las operaciones críticas deben ser atómicas (transacciones ACID)
- **RN012**: El sistema debe ser accesible desde cualquier dispositivo con navegador web

## 🛠️ Tecnología Utilizada

### Frontend
- **React 18.2.0**: Framework de JavaScript para interfaces de usuario
- **Vite 5.0.8**: Herramienta de build y desarrollo
- **Axios 1.6.2**: Cliente HTTP para comunicación con la API
- **CSS3**: Estilos personalizados para la interfaz

### Backend
- **Node.js**: Runtime de JavaScript para el servidor
- **Express 4.18.2**: Framework web para Node.js
- **PostgreSQL**: Sistema de gestión de base de datos relacional
- **pg 8.11.3**: Cliente PostgreSQL para Node.js

### Base de Datos
- **PostgreSQL**: Motor de base de datos principal
- **Neon**: Plataforma de hosting de PostgreSQL en la nube
- **SSL**: Conexiones seguras a la base de datos

### Deployment
- **Vercel**: Hosting del frontend (aplicación React)
- **Railway**: Hosting del backend (API Node.js)
- **GitHub**: Control de versiones y repositorio principal

## 📚 Referencias

### Documentación Técnica
- [React Documentation](https://react.dev/)
- [Express.js Guide](https://expressjs.com/)
- [PostgreSQL Documentation](https://www.postgresql.org/docs/)
- [Vite Documentation](https://vitejs.dev/)

### Plataformas de Deployment
- [Vercel Documentation](https://vercel.com/docs)
- [Railway Documentation](https://docs.railway.app/)
- [Neon Documentation](https://neon.tech/docs)

### Herramientas de Desarrollo
- [Node.js Documentation](https://nodejs.org/docs/)
- [npm Documentation](https://docs.npmjs.com/)
- [Git Documentation](https://git-scm.com/doc)

## 🗄️ Diseño de Base de Datos

### Diagrama Entidad-Relación

```
┌─────────────────┐       ┌─────────────────┐
│     CLIENTES    │  1:N  │    CONTRATOS    │
├─────────────────┤       ├─────────────────┤
│ id (PK)         │◄──────│ id (PK)         │
│ name            │       │ client_id (FK)  │
│ email (UNIQUE)  │       │ airline         │
│ phone           │       │ plan            │
│ created_at      │       │ start_date      │
└─────────────────┘       │ end_date        │
                          │ monthly_cost    │
                          │ status          │
                          │ created_at      │
                          └─────────────────┘
```

### Normalización
El diseño está normalizado hasta la **Tercera Forma Normal (3FN)**:

1. **Primera Forma Normal (1FN)**: Todos los atributos son atómicos
2. **Segunda Forma Normal (2FN)**: No hay dependencias parciales
3. **Tercera Forma Normal (3FN)**: No hay dependencias transitivas

### Concurrencia
- **Control de Concurrencia Optimista**: Uso de timestamps para detectar conflictos
- **Transacciones ACID**: Garantía de atomicidad, consistencia, aislamiento y durabilidad
- **Índices**: Optimización de consultas con índices en campos de búsqueda frecuente
- **Constraints**: Validaciones a nivel de base de datos para integridad referencial

## 📖 Diccionario de Datos

### Tabla: CLIENTES
| Campo | Tipo | Restricciones | Descripción |
|-------|------|---------------|-------------|
| `id` | SERIAL | PRIMARY KEY, NOT NULL | Identificador único del cliente (auto-incremental) |
| `name` | VARCHAR(255) | NOT NULL | Nombre completo del cliente |
| `email` | VARCHAR(255) | NOT NULL, UNIQUE | Correo electrónico del cliente (único en el sistema) |
| `phone` | VARCHAR(50) | NULL | Número de teléfono del cliente (opcional) |
| `created_at` | TIMESTAMP | DEFAULT CURRENT_TIMESTAMP | Fecha y hora de creación del registro |

### Tabla: CONTRATOS
| Campo | Tipo | Restricciones | Descripción |
|-------|------|---------------|-------------|
| `id` | SERIAL | PRIMARY KEY, NOT NULL | Identificador único del contrato (auto-incremental) |
| `client_id` | INTEGER | NOT NULL, FOREIGN KEY | ID del cliente propietario del contrato |
| `airline` | VARCHAR(255) | NOT NULL | Nombre de la aerolínea |
| `plan` | VARCHAR(255) | NOT NULL | Tipo de plan contratado (ej: Clase Ejecutiva) |
| `start_date` | DATE | NOT NULL | Fecha de inicio del contrato |
| `end_date` | DATE | NULL | Fecha de finalización del contrato (opcional) |
| `monthly_cost` | NUMERIC(10,2) | NOT NULL | Costo mensual del contrato |
| `status` | VARCHAR(50) | NOT NULL, DEFAULT 'active' | Estado del contrato |
| `created_at` | TIMESTAMP | DEFAULT CURRENT_TIMESTAMP | Fecha y hora de creación del registro |

### Restricciones y Validaciones
- `fk_client`: Clave foránea que referencia a `clients.id`
- `chk_end_date_after_start`: La fecha de fin debe ser posterior o igual a la fecha de inicio
- `chk_status_valid`: El estado debe ser uno de: 'active', 'inactive', 'pending', 'cancelled'

## 👤 Manual de Usuario

### Acceso al Sistema
1. Abrir el navegador web
2. Navegar a: `https://parcial1-bases.vercel.app`
3. La aplicación se cargará automáticamente

### Gestión de Clientes

#### Agregar un Nuevo Cliente
1. **Hacer clic** en la pestaña "Clientes"
2. **Llenar el formulario**:
   - Nombre: Ingresar el nombre completo
   - Correo Electrónico: Ingresar un email válido y único
   - Teléfono: Opcional, ingresar número de contacto
3. **Hacer clic** en "Crear Cliente"
4. **Verificar** que aparece en la tabla de clientes

#### Consultar Clientes
- Los clientes se muestran automáticamente en la tabla
- Se puede ver: ID, Nombre, Correo, Teléfono, Número de Contratos, Fecha de Creación

### Gestión de Contratos

#### Agregar un Nuevo Contrato
1. **Hacer clic** en la pestaña "Contratos"
2. **Llenar el formulario**:
   - Cliente: Seleccionar de la lista desplegable
   - Aerolínea: Ingresar nombre de la aerolínea
   - Plan: Especificar tipo de plan
   - Fecha de Inicio: Seleccionar fecha
   - Fecha de Fin: Opcional, seleccionar fecha posterior
   - Costo Mensual: Ingresar valor numérico
   - Estado: Seleccionar estado del contrato
3. **Hacer clic** en "Crear Contrato"
4. **Verificar** que aparece en la tabla de contratos

#### Consultar Contratos
- Los contratos se muestran con información del cliente asociado
- Se puede ver: ID, Cliente, Aerolínea, Plan, Fechas, Costo, Estado

### Navegación
- **Pestañas**: Cambiar entre "Clientes" y "Contratos"
- **Mensajes**: El sistema muestra mensajes de éxito o error
- **Responsive**: La interfaz se adapta a diferentes tamaños de pantalla

### Solución de Problemas
- **Error de conexión**: Verificar conexión a internet
- **Error al crear cliente**: Verificar que el email no esté duplicado
- **Error al crear contrato**: Verificar que todos los campos obligatorios estén llenos

## 🔧 Instalación y Configuración

### Requisitos del Sistema
- Node.js 18.x o superior
- PostgreSQL 12.x o superior
- Navegador web moderno (Chrome, Firefox, Safari, Edge)

### Instalación Local
1. Clonar el repositorio: `git clone https://github.com/aletxapascual/Parcial1Bases.git`
2. Instalar dependencias del frontend: `cd web && npm install`
3. Instalar dependencias del backend: `cd api && npm install`
4. Configurar variables de entorno
5. Ejecutar migraciones de base de datos
6. Iniciar servidores: `npm run dev` en cada directorio

### Variables de Entorno
```bash
# Backend (Railway)
DATABASE_URL=postgresql://user:password@host:port/database
PORT=3000

# Frontend (Vercel)
VITE_API_URL=https://parcial1bases-production.up.railway.app
```

## 📊 Métricas del Proyecto
- **Líneas de código**: ~1,200
- **Archivos**: 15+
- **Tecnologías**: 8
- **Endpoints API**: 5
- **Tablas de BD**: 2
- **Tiempo de desarrollo**: 2 semanas
