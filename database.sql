
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

