-- =====================================================
-- Flyway Migration: V17__Add_inventory_items_table_and_service_center_relationship.sql
-- Description: Drop and recreate inventory_items table with service_center relationship
-- Author: EAD Team
-- Date: 2025-11-06
-- =====================================================

-- Step 1: Drop existing inventory_items table if it exists
-- This will cascade delete any dependent objects
DROP TABLE IF EXISTS inventory_items CASCADE;

-- Step 2: Create inventory_items table with service_center relationship
CREATE TABLE inventory_items (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    item_name VARCHAR(255) NOT NULL,
    description TEXT,
    quantity INTEGER NOT NULL DEFAULT 0,
    unit_price DECIMAL(10, 2) NOT NULL,
    category VARCHAR(255) NOT NULL,
    min_stock INTEGER NOT NULL DEFAULT 10,
    service_center_id UUID NOT NULL,
    created_by UUID NOT NULL,
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    last_updated TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT fk_inventory_service_center FOREIGN KEY (service_center_id) 
        REFERENCES service_center(id) ON DELETE CASCADE,
    CONSTRAINT fk_inventory_created_by FOREIGN KEY (created_by) 
        REFERENCES users(id) ON DELETE CASCADE
);

-- Step 3: Create indexes for better performance
CREATE INDEX idx_inventory_items_service_center ON inventory_items(service_center_id);
CREATE INDEX idx_inventory_items_created_by ON inventory_items(created_by);
CREATE INDEX idx_inventory_items_category ON inventory_items(category);
CREATE INDEX idx_inventory_items_quantity ON inventory_items(quantity);

-- Step 4: Add table and column comments for documentation
COMMENT ON TABLE inventory_items IS 'Stores inventory items for each service center';
COMMENT ON COLUMN inventory_items.id IS 'Primary key - unique identifier for inventory item';
COMMENT ON COLUMN inventory_items.item_name IS 'Name of the inventory item';
COMMENT ON COLUMN inventory_items.description IS 'Detailed description of the item';
COMMENT ON COLUMN inventory_items.quantity IS 'Current quantity in stock';
COMMENT ON COLUMN inventory_items.unit_price IS 'Price per unit';
COMMENT ON COLUMN inventory_items.category IS 'Category of the item (e.g., Lubricant, Filter, Spare Part)';
COMMENT ON COLUMN inventory_items.min_stock IS 'Minimum stock level before reordering';
COMMENT ON COLUMN inventory_items.service_center_id IS 'References the service center that owns this inventory item';
COMMENT ON COLUMN inventory_items.created_by IS 'References the user who created this inventory item';
COMMENT ON COLUMN inventory_items.created_at IS 'Timestamp when the item was created';
COMMENT ON COLUMN inventory_items.last_updated IS 'Timestamp of last update';

-- Step 5: Insert sample inventory items for each service center
-- This will populate some default items for testing purposes
DO $$
DECLARE
    service_center_record RECORD;
    admin_user_id UUID;
BEGIN
    -- Get the first admin user to use as created_by
    SELECT id INTO admin_user_id 
    FROM users 
    WHERE id IN (
        SELECT user_id FROM user_roles WHERE role_id = (
            SELECT id FROM roles WHERE name = 'ADMIN' LIMIT 1
        )
    )
    LIMIT 1;
    
    -- If no admin user exists, get any user
    IF admin_user_id IS NULL THEN
        SELECT id INTO admin_user_id FROM users LIMIT 1;
    END IF;
    
    -- Only proceed if we have a user and service centers
    IF admin_user_id IS NOT NULL THEN
        -- For each service center, add some default inventory items
        FOR service_center_record IN SELECT id FROM service_center LOOP
            -- Insert default inventory items for this service center
            INSERT INTO inventory_items 
                (id, item_name, description, quantity, unit_price, category, min_stock, service_center_id, created_by, created_at, last_updated)
            VALUES
                (gen_random_uuid(), 'Engine Oil 5W-30', 'Synthetic engine oil, 5L container', 50, 45.99, 'Lubricant', 10, service_center_record.id, admin_user_id, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
                (gen_random_uuid(), 'Oil Filter', 'Standard oil filter for most vehicles', 100, 12.99, 'Filter', 20, service_center_record.id, admin_user_id, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
                (gen_random_uuid(), 'Air Filter', 'High-performance air filter', 75, 18.50, 'Filter', 15, service_center_record.id, admin_user_id, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
                (gen_random_uuid(), 'Brake Pads - Front', 'Premium ceramic brake pads', 40, 89.99, 'Brake Component', 8, service_center_record.id, admin_user_id, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
                (gen_random_uuid(), 'Brake Pads - Rear', 'Premium ceramic brake pads', 40, 79.99, 'Brake Component', 8, service_center_record.id, admin_user_id, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
                (gen_random_uuid(), 'Wiper Blades', 'All-season wiper blades, pair', 60, 24.99, 'Spare Part', 12, service_center_record.id, admin_user_id, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
                (gen_random_uuid(), 'Car Battery 12V', 'Maintenance-free car battery', 25, 129.99, 'Battery', 5, service_center_record.id, admin_user_id, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
                (gen_random_uuid(), 'Coolant/Antifreeze', 'Universal coolant, 1 gallon', 45, 19.99, 'Lubricant', 10, service_center_record.id, admin_user_id, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
                (gen_random_uuid(), 'Spark Plugs Set', 'Iridium spark plugs, set of 4', 80, 34.99, 'Spare Part', 15, service_center_record.id, admin_user_id, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
                (gen_random_uuid(), 'Transmission Fluid', 'ATF automatic transmission fluid, 1L', 35, 28.99, 'Lubricant', 8, service_center_record.id, admin_user_id, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP);
        END LOOP;
    END IF;
END $$;