-- Migration to remove service_type_id and modification_type_id columns from appointment table
-- These columns are no longer needed as the system now uses a unified service_or_modification_id column

-- Check if service_type_id column exists and drop it
DO $$ 
BEGIN
    IF EXISTS (
        SELECT 1 
        FROM information_schema.columns 
        WHERE table_name = 'appointment' 
        AND column_name = 'service_type_id'
    ) THEN
        -- Drop foreign key constraint if it exists
        ALTER TABLE appointment DROP CONSTRAINT IF EXISTS fk_appointment_service_type;
        
        -- Drop the column
        ALTER TABLE appointment DROP COLUMN service_type_id;
        
        RAISE NOTICE 'Dropped service_type_id column from appointment table';
    ELSE
        RAISE NOTICE 'service_type_id column does not exist in appointment table';
    END IF;
END $$;

-- Check if modification_type_id column exists and drop it
DO $$ 
BEGIN
    IF EXISTS (
        SELECT 1 
        FROM information_schema.columns 
        WHERE table_name = 'appointment' 
        AND column_name = 'modification_type_id'
    ) THEN
        -- Drop foreign key constraint if it exists
        ALTER TABLE appointment DROP CONSTRAINT IF EXISTS fk_appointment_modification_type;
        
        -- Drop the column
        ALTER TABLE appointment DROP COLUMN modification_type_id;
        
        RAISE NOTICE 'Dropped modification_type_id column from appointment table';
    ELSE
        RAISE NOTICE 'modification_type_id column does not exist in appointment table';
    END IF;
END $$;
