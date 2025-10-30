-- Insert 2 sample SERVICE records
INSERT INTO service_or_modification (id, type, name, unique_name, description, estimated_cost, estimated_time_minutes)
VALUES 
    (1, 'SERVICE', 'Oil Change', 'SERVICE_Oil_Change', 'Regular engine oil change with oil filter replacement', 50.00, 30),
    (2, 'SERVICE', 'Full Service', 'SERVICE_Full_Service', 'Complete vehicle inspection and maintenance service', 250.00, 180)
ON CONFLICT (id) DO NOTHING;

-- Insert 2 sample MODIFICATION records
INSERT INTO service_or_modification (id, type, name, unique_name, description, estimated_cost, estimated_time_minutes)
VALUES 
    (3, 'MODIFICATION', 'Window Tinting', 'MODIFICATION_Window_Tinting', 'Professional window tinting for all vehicle windows', 200.00, 120),
    (4, 'MODIFICATION', 'Audio System Installation', 'MODIFICATION_Audio_System_Installation', 'Premium audio system installation with speakers and subwoofer', 600.00, 300)
ON CONFLICT (id) DO NOTHING;

-- Update the sequence to continue from the last inserted ID
SELECT setval('service_or_modification_id_seq', (SELECT MAX(id) FROM service_or_modification), true);
