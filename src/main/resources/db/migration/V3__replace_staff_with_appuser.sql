-- Drop old FK to staff if exists
ALTER TABLE patient_update DROP CONSTRAINT IF EXISTS fk_patient_update_recorded_by;

-- Drop old recorded_by column if it was referencing staff
ALTER TABLE patient_update DROP COLUMN IF EXISTS recorded_by;

-- Add recorded_by referencing app_user (nullable first)
ALTER TABLE patient_update ADD COLUMN recorded_by BIGINT;

-- Ensure at least one Admin user exists
INSERT INTO app_user (username, password, full_name, email, role, created_at)
VALUES ('admin', 'admin123', 'System Admin', 'admin@eward.local', 'ADMIN', now())
ON CONFLICT DO NOTHING;

-- Backfill existing updates with admin (id = 1 assumed here)
UPDATE patient_update SET recorded_by = 1 WHERE recorded_by IS NULL;

-- Enforce NOT NULL and FK
ALTER TABLE patient_update
    ALTER COLUMN recorded_by SET NOT NULL,
    ADD CONSTRAINT fk_patient_update_appuser
        FOREIGN KEY (recorded_by) REFERENCES app_user(id);
