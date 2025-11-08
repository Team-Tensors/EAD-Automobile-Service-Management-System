-- =====================================================
-- Flyway Migration: V18__Rename_year_to_vehicle_year.sql
-- Description: Rename 'year' column to 'vehicle_year' to avoid reserved keyword conflicts
-- Author: EAD Team
-- Date: 2025-11-08
-- =====================================================

-- Rename the year column to vehicle_year to avoid SQL reserved keyword issues
ALTER TABLE vehicle RENAME COLUMN year TO vehicle_year;
