INSERT INTO service_center_slot (id, service_center_id, slot_number, is_booked, appointment_id)
SELECT 
    gen_random_uuid(),
    sc.id,
    s.slot_number,
    FALSE,
    NULL
FROM service_center sc
CROSS JOIN (SELECT generate_series(1, COALESCE(sc.center_slot, 2)) AS slot_number FROM service_center sc) s
WHERE NOT EXISTS (
    SELECT 1 
    FROM service_center_slot scs 
    WHERE scs.service_center_id = sc.id 
    AND scs.slot_number = s.slot_number
);