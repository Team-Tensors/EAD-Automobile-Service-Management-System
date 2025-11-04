-- Migration to change appointment_employees.employee_id from BIGINT to UUID
-- This was missed in V9__Change_user_id_to_uuid.sql

-- Step 1: Clear any existing data from appointment_employees table
-- This is necessary because the old bigint employee_id references no longer exist
-- after V9 migration changed users.id to UUID, so we cannot map old to new values
DELETE FROM appointment_employees;

-- Step 2: Drop the foreign key constraint on employee_id
ALTER TABLE appointment_employees DROP CONSTRAINT IF EXISTS fk_appointment_employees_employee;

-- Step 3: Drop the old employee_id column
ALTER TABLE appointment_employees DROP COLUMN employee_id;

-- Step 4: Add the new employee_id column as UUID (nullable for now)
ALTER TABLE appointment_employees ADD COLUMN employee_id UUID;

-- Step 5: Set NOT NULL constraint (table should be empty after DELETE)
ALTER TABLE appointment_employees ALTER COLUMN employee_id SET NOT NULL;

-- Step 6: Re-create the foreign key constraint with UUID type
ALTER TABLE appointment_employees
ADD CONSTRAINT fk_appointment_employees_employee
FOREIGN KEY (employee_id) REFERENCES users(id) ON DELETE CASCADE;

-- Step 7: Create index for better query performance
CREATE INDEX IF NOT EXISTS idx_appointment_employees_employee_id ON appointment_employees(employee_id);
