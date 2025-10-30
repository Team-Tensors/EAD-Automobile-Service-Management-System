-- V4__Fix_vehicle_sequence.sql
-- Fix the vehicle table sequence to prevent duplicate key errors

-- Reset the vehicle_id_seq to the maximum ID + 1
SELECT setval('vehicle_id_seq', COALESCE((SELECT MAX(id) FROM vehicle), 0) + 1, false);
