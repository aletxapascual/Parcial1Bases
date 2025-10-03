CREATE TABLE clients (
    id SERIAL PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    email VARCHAR(255) NOT NULL UNIQUE,
    phone VARCHAR(50),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_clients_email ON clients(email);

CREATE TABLE contracts (
    id SERIAL PRIMARY KEY,
    client_id INTEGER NOT NULL,
    airline VARCHAR(255) NOT NULL,
    plan VARCHAR(255) NOT NULL,
    start_date DATE NOT NULL,
    end_date DATE,
    monthly_cost NUMERIC(10, 2) NOT NULL,
    status VARCHAR(50) NOT NULL DEFAULT 'active',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    
    CONSTRAINT fk_client
        FOREIGN KEY (client_id) 
        REFERENCES clients(id)
        ON DELETE CASCADE
        ON UPDATE CASCADE,
    
    CONSTRAINT chk_end_date_after_start
        CHECK (end_date IS NULL OR end_date >= start_date),
    
    CONSTRAINT chk_status_valid
        CHECK (status IN ('active', 'inactive', 'pending', 'cancelled'))
);

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

INSERT INTO clients (name, email, phone) VALUES
('Empresa Tecnológica SA', 'admin@empresatech.com', '+52 55 1234 5678'),
('Consultoría Internacional Ltda', 'contacto@consultint.com', '+57 1 234 5678'),
('Grupo Financiero Global', 'gerencia@grupofinanciero.com', '+1 555 123 4567'),
('Industrias del Norte S.A.', 'ventas@industriasnorte.com', '+52 81 9876 5432'),
('Servicios Corporativos Premium', 'info@serviciospremium.com', '+34 91 234 5678');

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