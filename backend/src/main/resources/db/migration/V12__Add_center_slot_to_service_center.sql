-- Add center_slot column to service_center table with default value of 2
ALTER TABLE service_center
ADD COLUMN center_slot INTEGER NOT NULL DEFAULT 2;

-- Optional: Update existing records to ensure consistency (redundant due to DEFAULT, but explicit)
UPDATE service_center
SET center_slot = 2
WHERE center_slot IS NULL;