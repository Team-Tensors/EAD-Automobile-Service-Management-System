-- Step 1: Enable the uuid-ossp extension for UUID generation
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Step 2: Add a temporary UUID column to the service_center table
ALTER TABLE service_center
ADD COLUMN new_id UUID;

-- Step 3: Populate the new_id column with UUIDs for existing records
UPDATE service_center
SET new_id = uuid_generate_v4()
WHERE new_id IS NULL;

-- Step 4: Create a temporary table to map old Long IDs to new UUIDs
CREATE TABLE temp_service_center_id_mapping (
    old_id BIGINT,
    new_id UUID,
    PRIMARY KEY (old_id)
);

-- Step 5: Populate the mapping table
INSERT INTO temp_service_center_id_mapping (old_id, new_id)
SELECT id, new_id
FROM service_center;

-- Step 6: Drop the foreign key constraint on the appointment table
ALTER TABLE appointment
DROP CONSTRAINT fk_appointment_service_center;

-- Step 7: Add a temporary UUID column to the appointment table
ALTER TABLE appointment
ADD COLUMN temp_service_center_id UUID;

-- Step 8: Update the temporary column with UUID values from the mapping table
UPDATE appointment
SET temp_service_center_id = (
    SELECT new_id FROM temp_service_center_id_mapping WHERE old_id = appointment.service_center_id
);

-- Step 9: Drop the original service_center_id column
ALTER TABLE appointment
DROP COLUMN service_center_id;

-- Step 10: Rename the temporary column to service_center_id
ALTER TABLE appointment
RENAME COLUMN temp_service_center_id TO service_center_id;

-- Step 11: Drop the old id column and rename new_id to id in service_center
ALTER TABLE service_center
DROP COLUMN id;

ALTER TABLE service_center
RENAME COLUMN new_id TO id;

-- Step 12: Recreate the primary key on service_center
ALTER TABLE service_center
ADD CONSTRAINT pk_service_center PRIMARY KEY (id);

-- Step 13: Recreate the foreign key constraint on appointment
ALTER TABLE appointment
ADD CONSTRAINT fk_appointment_service_center
FOREIGN KEY (service_center_id)
REFERENCES service_center (id);

-- Step 14: Drop the temporary mapping table
DROP TABLE temp_service_center_id_mapping;