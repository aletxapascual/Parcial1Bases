
-- =====================================================
-- SCRIPT DE BASE DE DATOS - SISTEMA DE GESTIÓN DE CLIENTES Y CONTRATOS
-- =====================================================
-- Descripción: Script completo para crear la base de datos del sistema
-- Autor: Sistema de Gestión de Aerolíneas
-- Fecha: Octubre 2025
-- Versión: 1.0

-- =====================================================
-- TABLA: CLIENTS (Clientes)
-- =====================================================
-- Almacena información de los clientes corporativos
-- que contratan servicios de aerolíneas
CREATE TABLE clients (
    id SERIAL PRIMARY KEY,                    -- Identificador único auto-incremental
    name VARCHAR(255) NOT NULL,               -- Nombre completo del cliente (obligatorio)
    email VARCHAR(255) NOT NULL UNIQUE,       -- Correo electrónico único (obligatorio)
    phone VARCHAR(50),                        -- Número de teléfono (opcional)
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP  -- Fecha de registro automática
);

-- Índice para optimizar búsquedas por email
CREATE INDEX idx_clients_email ON clients(email);

-- Comentarios sobre la tabla clients:
-- - Cumple con 1FN: Todos los atributos son atómicos
-- - Cumple con 2FN: No hay dependencias parciales (clave primaria simple)
-- - Cumple con 3FN: No hay dependencias transitivas
-- - Restricción UNIQUE en email garantiza unicidad de clientes


-- =====================================================
-- TABLA: CONTRACTS (Contratos)
-- =====================================================
-- Almacena los contratos de servicios aéreos
-- que los clientes tienen con diferentes aerolíneas
CREATE TABLE contracts (
    id SERIAL PRIMARY KEY,                    -- Identificador único auto-incremental
    client_id INTEGER NOT NULL,               -- Referencia al cliente (FK)
    airline VARCHAR(255) NOT NULL,            -- Nombre de la aerolínea (obligatorio)
    plan VARCHAR(255) NOT NULL,               -- Tipo de plan contratado (obligatorio)
    start_date DATE NOT NULL,                 -- Fecha de inicio del contrato (obligatorio)
    end_date DATE,                           -- Fecha de fin del contrato (opcional)
    monthly_cost NUMERIC(10, 2) NOT NULL,    -- Costo mensual (obligatorio, máximo 99,999,999.99)
    status VARCHAR(50) NOT NULL DEFAULT 'active',  -- Estado del contrato (por defecto: activo)
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,  -- Fecha de registro automática
    
    -- Restricción de clave foránea con integridad referencial
    CONSTRAINT fk_client
        FOREIGN KEY (client_id) 
        REFERENCES clients(id)
        ON DELETE CASCADE      -- Si se elimina un cliente, se eliminan sus contratos
        ON UPDATE CASCADE,     -- Si se actualiza el ID del cliente, se actualiza en contratos
    
    -- Restricción de validación de fechas
    CONSTRAINT chk_end_date_after_start
        CHECK (end_date IS NULL OR end_date >= start_date),
    
    -- Restricción de validación de estados
    CONSTRAINT chk_status_valid
        CHECK (status IN ('active', 'inactive', 'pending', 'cancelled'))
);

-- Comentarios sobre la tabla contracts:
-- - Relación 1:N con clients (un cliente puede tener múltiples contratos)
-- - Cumple con 1FN, 2FN y 3FN
-- - Constraints garantizan integridad referencial y validación de datos
-- - CASCADE DELETE/UPDATE mantiene consistencia de datos


CREATE OR REPLACE VIEW view_clients_with_contracts AS
SELECT 
    c.id,
    c.name,
    c.email,
    c.phone,
    c.created_at,
    COUNT(ct.id) as contract_count
FROM clients c
LEFT JOIN contracts ct ON c.id = ct.client_id
GROUP BY c.id, c.name, c.email, c.phone, c.created_at
ORDER BY c.id;


-- =====================================================
-- VISTAS PARA CONSULTAS OPTIMIZADAS
-- =====================================================

-- Vista que muestra clientes con el conteo de sus contratos
CREATE OR REPLACE VIEW view_clients_with_contracts AS
SELECT 
    c.id,
    c.name,
    c.email,
    c.phone,
    c.created_at,
    COUNT(ct.id) as contract_count
FROM clients c
LEFT JOIN contracts ct ON c.id = ct.client_id
GROUP BY c.id, c.name, c.email, c.phone, c.created_at
ORDER BY c.id;

-- Vista que muestra contratos con información del cliente
CREATE OR REPLACE VIEW view_contracts_with_clients AS
SELECT 
    ct.id,
    ct.client_id,
    c.name as client_name,
    c.email as client_email,
    ct.airline,
    ct.plan,
    ct.start_date,
    ct.end_date,
    ct.monthly_cost,
    ct.status,
    ct.created_at
FROM contracts ct
JOIN clients c ON ct.client_id = c.id
ORDER BY ct.id DESC;

-- =====================================================
-- DATOS DE PRUEBA
-- =====================================================
-- Insertar clientes de prueba para demostrar funcionalidad

-- Clientes corporativos de ejemplo
INSERT INTO clients (name, email, phone) VALUES
('Empresa Tecnológica SA', 'admin@empresatech.com', '+52 55 1234 5678'),
('Consultoría Internacional Ltda', 'contacto@consultint.com', '+57 1 234 5678'),
('Grupo Financiero Global', 'gerencia@grupofinanciero.com', '+1 555 123 4567'),
('Industrias del Norte S.A.', 'ventas@industriasnorte.com', '+52 81 9876 5432'),
('Servicios Corporativos Premium', 'info@serviciospremium.com', '+34 91 234 5678');

-- Contratos de ejemplo asociados a los clientes
INSERT INTO contracts (client_id, airline, plan, start_date, end_date, monthly_cost, status) VALUES
(1, 'Delta Airlines', 'Clase Ejecutiva Premium', '2025-01-01', '2025-12-31', 2500.00, 'active'),
(1, 'American Airlines', 'Business Class', '2025-02-01', '2025-11-30', 2200.00, 'active'),
(2, 'Lufthansa', 'First Class', '2025-01-15', '2025-10-15', 3500.00, 'active'),
(2, 'Air France', 'Business Premium', '2025-03-01', '2025-12-31', 2800.00, 'pending'),
(3, 'United Airlines', 'Economy Plus', '2025-01-01', NULL, 1200.00, 'active'),
(3, 'Southwest Airlines', 'Business Select', '2025-02-15', '2025-08-15', 1800.00, 'active'),
(4, 'Aeroméxico', 'Clase Premier', '2024-12-01', '2025-05-31', 1600.00, 'active'),
(4, 'Interjet', 'Clase Ejecutiva', '2025-01-01', '2025-06-30', 1400.00, 'inactive'),
(5, 'Iberia', 'Business Class', '2025-01-01', '2025-12-31', 2100.00, 'active'),
(5, 'Vueling', 'Flex', '2025-02-01', '2025-07-31', 900.00, 'cancelled');

-- =====================================================
-- CONSULTAS DE VERIFICACIÓN
-- =====================================================
-- Estas consultas pueden ejecutarse para verificar que los datos se insertaron correctamente

-- Verificar clientes insertados
-- SELECT * FROM clients ORDER BY id;

-- Verificar contratos insertados
-- SELECT * FROM contracts ORDER BY id;

-- Verificar vista de clientes con contratos
-- SELECT * FROM view_clients_with_contracts ORDER BY id;

-- Verificar vista de contratos con clientes
-- SELECT * FROM view_contracts_with_clients ORDER BY id;

-- =====================================================
-- FIN DEL SCRIPT
-- =====================================================
-- Script completado exitosamente
-- Total de tablas creadas: 2
-- Total de vistas creadas: 2
-- Total de clientes de prueba: 5
-- Total de contratos de prueba: 10
-- Todas las restricciones y validaciones implementadas

