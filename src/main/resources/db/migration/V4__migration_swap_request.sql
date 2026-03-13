-- v4_migration_swap_request.sql

-- 1) Add last_modified to duty_roster (non-destructive)
ALTER TABLE duty_roster
ADD COLUMN IF NOT EXISTS last_modified TIMESTAMP WITH TIME ZONE DEFAULT now();

-- 2) Add columns to change_request to make it compatible with new system (additive)
ALTER TABLE change_request
    ADD COLUMN IF NOT EXISTS request_type VARCHAR(50),
    ADD COLUMN IF NOT EXISTS shift_from VARCHAR(50),
    ADD COLUMN IF NOT EXISTS shift_to VARCHAR(50),
    ADD COLUMN IF NOT EXISTS additional_payload JSONB;

-- 3) Set existing change_request rows to ADMIN_APPROVAL
UPDATE change_request
SET request_type = 'ADMIN_APPROVAL'
WHERE request_type IS NULL;

-- 4) Create unified swap_request table (new)
CREATE TABLE IF NOT EXISTS swap_request (
    id BIGSERIAL PRIMARY KEY,
    request_type VARCHAR(50) NOT NULL, -- DIRECT, ADMIN_DIRECT, INDIRECT
    requester_staff_id BIGINT NOT NULL REFERENCES staff(id) ON DELETE CASCADE,
    target_staff_id BIGINT REFERENCES staff(id) ON DELETE SET NULL,
    original_shift_date DATE NOT NULL,
    original_shift VARCHAR(50) NOT NULL,
    requested_shift_date DATE,
    requested_shift VARCHAR(50),
    peer_approval_status VARCHAR(50) DEFAULT 'NOT_REQUIRED',
    admin_status VARCHAR(50) DEFAULT 'PENDING',
    reason TEXT,
    request_meta JSONB,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- 5) Swap audit log
CREATE TABLE IF NOT EXISTS swap_audit_log (
    id BIGSERIAL PRIMARY KEY,
    swap_request_id BIGINT REFERENCES swap_request(id) ON DELETE CASCADE,
    action VARCHAR(100) NOT NULL,
    actor_user_id BIGINT REFERENCES app_user(id),
    notes TEXT,
    occurred_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

