-- Migration to change vehicle.year from VARCHAR to INTEGER

-- Step 1: Add a new integer column temporarily
ALTER TABLE vehicle ADD COLUMN year_int INTEGER;

-- Step 2: Convert existing string year values to integers
-- Handle cases where year might be invalid (non-numeric or null)
UPDATE vehicle 
SET year_int = CASE 
    WHEN year ~ '^[0-9]+$' THEN CAST(year AS INTEGER)
    ELSE NULL
END;

-- Step 3: Drop the old year column
ALTER TABLE vehicle DROP COLUMN year;

-- Step 4: Rename year_int to year
ALTER TABLE vehicle RENAME COLUMN year_int TO year;

-- Step 5: Set NOT NULL constraint (optional, based on your requirements)
ALTER TABLE vehicle ALTER COLUMN year SET NOT NULL;
