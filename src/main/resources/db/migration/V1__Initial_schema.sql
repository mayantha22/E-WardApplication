-- V1__init_schema.sql
-- Initial schema for e-Ward Ward Management System
-- Run by Flyway on application start

-- Users table (for authentication)
CREATE TABLE IF NOT EXISTS app_user (
    id BIGSERIAL PRIMARY KEY,
    username VARCHAR(100) NOT NULL UNIQUE,
    password VARCHAR(200) NOT NULL,
    full_name VARCHAR(200),
    email VARCHAR(200),
    role VARCHAR(50) NOT NULL, -- ADMIN, STAFF
    created_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Staff table (nursing staff profile)
CREATE TABLE IF NOT EXISTS staff (
    id BIGSERIAL PRIMARY KEY,
    user_id BIGINT NOT NULL REFERENCES app_user(id) ON DELETE CASCADE,
    employee_number VARCHAR(50) UNIQUE,
    phone VARCHAR(50),
    designation VARCHAR(100),
    ward VARCHAR(100),
    leave_count INT DEFAULT 0,
    night_duty_count INT DEFAULT 0,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Patient table
CREATE TABLE IF NOT EXISTS patient (
    id BIGSERIAL PRIMARY KEY,
    medical_record_number VARCHAR(100) UNIQUE,
    full_name VARCHAR(200) NOT NULL,
    nic VARCHAR(50),
    contact VARCHAR(100),
    admission_date TIMESTAMP WITH TIME ZONE DEFAULT now(),
    discharge_date TIMESTAMP WITH TIME ZONE,
    assigned_ward VARCHAR(100),
    status VARCHAR(100),
    notes TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Patient daily updates (one-to-many)
CREATE TABLE IF NOT EXISTS patient_update (
    id BIGSERIAL PRIMARY KEY,
    patient_id BIGINT NOT NULL REFERENCES patient(id) ON DELETE CASCADE,
    update_date TIMESTAMP WITH TIME ZONE DEFAULT now(),
    summary TEXT,
    recorded_by BIGINT REFERENCES staff(id),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Medicine inventory
CREATE TABLE IF NOT EXISTS medicine_inventory (
    id BIGSERIAL PRIMARY KEY,
    name VARCHAR(200) NOT NULL,
    batch_number VARCHAR(100),
    quantity INT NOT NULL DEFAULT 0,
    threshold INT NOT NULL DEFAULT 5,
    location VARCHAR(200),
    last_updated TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Equipment inventory
CREATE TABLE IF NOT EXISTS equipment_inventory (
    id BIGSERIAL PRIMARY KEY,
    name VARCHAR(200) NOT NULL,
    serial_number VARCHAR(200),
    quantity INT NOT NULL DEFAULT 0,
    threshold INT NOT NULL DEFAULT 1,
    location VARCHAR(200),
    last_updated TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Drug trolley inventory (separate)
CREATE TABLE IF NOT EXISTS drug_trolley_inventory (
    id BIGSERIAL PRIMARY KEY,
    trolley_id VARCHAR(100),
    medicine_id BIGINT REFERENCES medicine_inventory(id) ON DELETE SET NULL,
    quantity INT NOT NULL DEFAULT 0,
    last_updated TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Duty roster
CREATE TABLE IF NOT EXISTS duty_roster (
    id BIGSERIAL PRIMARY KEY,
    month INT NOT NULL,
    year INT NOT NULL,
    ward VARCHAR(100),
    data JSONB, -- flexible assignments JSON
    created_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Duty change requests
CREATE TABLE IF NOT EXISTS change_request (
    id BIGSERIAL PRIMARY KEY,
    from_staff_id BIGINT NOT NULL REFERENCES staff(id),
    to_staff_id BIGINT NOT NULL REFERENCES staff(id),
    request_date TIMESTAMP WITH TIME ZONE DEFAULT now(),
    requested_shift_date DATE,
    reason TEXT,
    status VARCHAR(50) DEFAULT 'PENDING', -- PENDING, APPROVED, REJECTED
    decision_date TIMESTAMP WITH TIME ZONE,
    decided_by BIGINT REFERENCES app_user(id),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Notifications
CREATE TABLE IF NOT EXISTS notification (
    id BIGSERIAL PRIMARY KEY,
    recipient_user_id BIGINT REFERENCES app_user(id),
    message TEXT NOT NULL,
    type VARCHAR(50),
    is_read BOOLEAN DEFAULT false,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Indexes for performance
CREATE INDEX IF NOT EXISTS idx_patient_assigned_ward ON patient(assigned_ward);
CREATE INDEX IF NOT EXISTS idx_medicine_name ON medicine_inventory(name);
CREATE INDEX IF NOT EXISTS idx_equipment_name ON equipment_inventory(name);
