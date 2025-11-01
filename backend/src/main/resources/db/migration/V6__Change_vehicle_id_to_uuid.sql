-- Migration to change vehicle.id from BIGINT to UUID

-- Step 1: Add a new UUID column temporarily
ALTER TABLE vehicle ADD COLUMN id_uuid UUID;

-- Step 2: Generate UUIDs for existing records
UPDATE vehicle SET id_uuid = gen_random_uuid();

-- Step 3: Update appointment table to use UUID for vehicle_id (add temp column)
ALTER TABLE appointment ADD COLUMN vehicle_id_uuid UUID;

-- Step 4: Map old vehicle_id to new UUID values
UPDATE appointment a
SET vehicle_id_uuid = v.id_uuid
FROM vehicle v
WHERE a.vehicle_id = v.id;

-- Step 5: Drop old foreign key constraint on appointment
ALTER TABLE appointment DROP CONSTRAINT IF EXISTS fk_appointment_vehicle;

-- Step 6: Drop old vehicle_id column in appointment
ALTER TABLE appointment DROP COLUMN vehicle_id;

-- Step 7: Rename vehicle_id_uuid to vehicle_id in appointment
ALTER TABLE appointment RENAME COLUMN vehicle_id_uuid TO vehicle_id;

-- Step 8: Drop old id column in vehicle and rename id_uuid to id
ALTER TABLE vehicle DROP CONSTRAINT vehicle_pkey CASCADE;
ALTER TABLE vehicle DROP COLUMN id;
ALTER TABLE vehicle RENAME COLUMN id_uuid TO id;

-- Step 9: Set the new id column as primary key
ALTER TABLE vehicle ADD PRIMARY KEY (id);

-- Step 10: Re-create foreign key constraint on appointment
ALTER TABLE appointment 
ADD CONSTRAINT fk_appointment_vehicle 
FOREIGN KEY (vehicle_id) REFERENCES vehicle(id) ON DELETE CASCADE;

-- Step 11: Make vehicle_id NOT NULL in appointment
ALTER TABLE appointment ALTER COLUMN vehicle_id SET NOT NULL;
