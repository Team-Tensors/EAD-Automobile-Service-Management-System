-- Migration to change appointment.id from BIGINT to UUID

-- Step 1: Add a new UUID column to appointment table temporarily
ALTER TABLE appointment ADD COLUMN id_uuid UUID;

-- Step 2: Generate UUIDs for existing appointments
UPDATE appointment SET id_uuid = gen_random_uuid();

-- Step 3: Update time_log table to use UUID for appointment_id (add temp column)
ALTER TABLE time_log ADD COLUMN appointment_id_uuid UUID;

-- Step 4: Map old appointment_id to new UUID values in time_log
UPDATE time_log tl
SET appointment_id_uuid = a.id_uuid
FROM appointment a
WHERE tl.appointment_id = a.id;

-- Step 5: Update appointment_employees junction table (add temp column)
ALTER TABLE appointment_employees ADD COLUMN appointment_id_uuid UUID;

-- Step 6: Map old appointment_id to new UUID values in appointment_employees
UPDATE appointment_employees ae
SET appointment_id_uuid = a.id_uuid
FROM appointment a
WHERE ae.appointment_id = a.id;

-- Step 7: Drop old foreign key constraints
ALTER TABLE time_log DROP CONSTRAINT IF EXISTS fk_time_log_appointment;
ALTER TABLE appointment_employees DROP CONSTRAINT IF EXISTS fk_appointment_employees_appointment;

-- Step 8: Drop old appointment_id columns in related tables
ALTER TABLE time_log DROP COLUMN appointment_id;
ALTER TABLE appointment_employees DROP COLUMN appointment_id;

-- Step 9: Rename UUID columns to appointment_id in related tables
ALTER TABLE time_log RENAME COLUMN appointment_id_uuid TO appointment_id;
ALTER TABLE appointment_employees RENAME COLUMN appointment_id_uuid TO appointment_id;

-- Step 10: Drop old id column in appointment and rename id_uuid to id
ALTER TABLE appointment DROP CONSTRAINT appointment_pkey CASCADE;
ALTER TABLE appointment DROP COLUMN id;
ALTER TABLE appointment RENAME COLUMN id_uuid TO id;

-- Step 11: Set the new id column as primary key
ALTER TABLE appointment ADD PRIMARY KEY (id);

-- Step 12: Re-create foreign key constraints
ALTER TABLE time_log 
ADD CONSTRAINT fk_time_log_appointment 
FOREIGN KEY (appointment_id) REFERENCES appointment(id) ON DELETE CASCADE;

ALTER TABLE appointment_employees 
ADD CONSTRAINT fk_appointment_employees_appointment 
FOREIGN KEY (appointment_id) REFERENCES appointment(id) ON DELETE CASCADE;

-- Step 13: Make appointment_id NOT NULL in related tables
ALTER TABLE time_log ALTER COLUMN appointment_id SET NOT NULL;
ALTER TABLE appointment_employees ALTER COLUMN appointment_id SET NOT NULL;
