-- V13__Recreate_shift_schedules_with_uuid.sql
-- Simpler approach: Drop and recreate the table with correct UUID types
-- WARNING: This will delete all existing shift_schedules data!

-- Step 1: Drop the existing table
DROP TABLE IF EXISTS shift_schedules CASCADE;

-- Step 2: Recreate with correct UUID types
CREATE TABLE shift_schedules (
                                 shift_id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
                                 employee_id UUID NOT NULL,
                                 appointment_id UUID NOT NULL,
                                 start_time TIMESTAMP NOT NULL,
                                 end_time TIMESTAMP NOT NULL,
                                 created_at TIMESTAMP,
                                 assigned_by VARCHAR(50) NOT NULL,

    -- Foreign key constraints
                                 CONSTRAINT fk_shift_schedules_employee
                                     FOREIGN KEY (employee_id) REFERENCES users(id) ON DELETE CASCADE,
                                 CONSTRAINT fk_shift_schedules_appointment
                                     FOREIGN KEY (appointment_id) REFERENCES appointment(id) ON DELETE CASCADE
);

-- Step 3: Create indexes for performance
CREATE INDEX idx_employee_start_time ON shift_schedules(employee_id, start_time);
CREATE INDEX idx_start_time ON shift_schedules(start_time);

-- Optional: Add comments for documentation
COMMENT ON TABLE shift_schedules IS 'Employee shift schedules linked to appointments';
COMMENT ON COLUMN shift_schedules.assigned_by IS 'How the shift was assigned: MANUAL or AUTOMATIC';