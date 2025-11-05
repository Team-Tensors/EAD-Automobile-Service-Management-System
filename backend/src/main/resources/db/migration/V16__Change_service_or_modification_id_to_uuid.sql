-- =====================================================
-- Flyway Migration: V16__Change_service_or_modification_id_to_uuid.sql
-- Description: Convert service_or_modification table ID from BIGINT to UUID
-- Author: EAD Team
-- Date: 2025-11-05
-- =====================================================

-- Step 1: Create a temporary mapping table to store old ID -> new UUID mappings
CREATE TABLE temp_service_or_modification_id_mapping (
    old_id BIGINT PRIMARY KEY,
    new_id UUID NOT NULL
);

-- Step 2: Populate mapping table with UUID for each existing service_or_modification record
INSERT INTO temp_service_or_modification_id_mapping (old_id, new_id)
SELECT id, gen_random_uuid()
FROM service_or_modification;

-- Step 3: Add new UUID column to service_or_modification table
ALTER TABLE service_or_modification
ADD COLUMN id_new UUID;

-- Step 4: Populate new UUID column using the mapping
UPDATE service_or_modification som
SET id_new = (SELECT new_id FROM temp_service_or_modification_id_mapping WHERE old_id = som.id);

-- Step 5: Add new UUID column to appointment table for service_or_modification reference
ALTER TABLE appointment
ADD COLUMN service_or_modification_id_new UUID;

-- Step 6: Update appointment table with new UUIDs using the mapping
UPDATE appointment a
SET service_or_modification_id_new = (
    SELECT new_id 
    FROM temp_service_or_modification_id_mapping 
    WHERE old_id = a.service_or_modification_id
);

-- Step 7: Drop the old foreign key constraint
ALTER TABLE appointment
DROP CONSTRAINT IF EXISTS fk_appointment_service_or_modification;

-- Step 8: Drop old columns
ALTER TABLE appointment
DROP COLUMN service_or_modification_id;

ALTER TABLE service_or_modification
DROP COLUMN id;

-- Step 9: Rename new columns to original names
ALTER TABLE service_or_modification
RENAME COLUMN id_new TO id;

ALTER TABLE appointment
RENAME COLUMN service_or_modification_id_new TO service_or_modification_id;

-- Step 10: Set the new UUID column as primary key
ALTER TABLE service_or_modification
ADD PRIMARY KEY (id);

-- Step 11: Make the appointment reference column NOT NULL
ALTER TABLE appointment
ALTER COLUMN service_or_modification_id SET NOT NULL;

-- Step 12: Add back the foreign key constraint with UUID
ALTER TABLE appointment
ADD CONSTRAINT fk_appointment_service_or_modification 
FOREIGN KEY (service_or_modification_id) 
REFERENCES service_or_modification(id) 
ON DELETE RESTRICT;

-- Step 13: Create index for better performance
CREATE INDEX IF NOT EXISTS idx_appointment_service_or_modification_id 
ON appointment(service_or_modification_id);

-- Step 14: Drop the temporary mapping table
DROP TABLE temp_service_or_modification_id_mapping;

-- Log completion
DO $$
BEGIN
    RAISE NOTICE '=== Successfully converted service_or_modification ID to UUID ===';
END $$;
