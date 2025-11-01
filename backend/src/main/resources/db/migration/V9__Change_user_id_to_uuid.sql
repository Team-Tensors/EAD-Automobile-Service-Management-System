-- Migration to change users.id from BIGINT to UUID
-- This affects: user_roles, refresh_tokens, password_reset_tokens, vehicle, appointment, time_log, notifications

-- Step 1: Add a new UUID column to users table temporarily
ALTER TABLE users ADD COLUMN id_uuid UUID;

-- Step 2: Generate UUIDs for existing users
UPDATE users SET id_uuid = gen_random_uuid();

-- Step 3: Update all related tables - add temporary UUID columns

-- user_roles
ALTER TABLE user_roles ADD COLUMN user_id_uuid UUID;
UPDATE user_roles ur
SET user_id_uuid = u.id_uuid
FROM users u
WHERE ur.user_id = u.id;

-- refresh_tokens
ALTER TABLE refresh_tokens ADD COLUMN user_id_uuid UUID;
UPDATE refresh_tokens rt
SET user_id_uuid = u.id_uuid
FROM users u
WHERE rt.user_id = u.id;

-- password_reset_tokens
ALTER TABLE password_reset_tokens ADD COLUMN user_id_uuid UUID;
UPDATE password_reset_tokens prt
SET user_id_uuid = u.id_uuid
FROM users u
WHERE prt.user_id = u.id;

-- vehicle
ALTER TABLE vehicle ADD COLUMN user_id_uuid UUID;
UPDATE vehicle v
SET user_id_uuid = u.id_uuid
FROM users u
WHERE v.user_id = u.id;

-- appointment
ALTER TABLE appointment ADD COLUMN user_id_uuid UUID;
UPDATE appointment a
SET user_id_uuid = u.id_uuid
FROM users u
WHERE a.user_id = u.id;

-- time_log
ALTER TABLE time_log ADD COLUMN user_id_uuid UUID;
UPDATE time_log tl
SET user_id_uuid = u.id_uuid
FROM users u
WHERE tl.user_id = u.id;

-- notifications
ALTER TABLE notifications ADD COLUMN user_id_uuid UUID;
UPDATE notifications n
SET user_id_uuid = u.id_uuid
FROM users u
WHERE n.user_id = u.id;

-- Step 4: Drop all foreign key constraints

-- user_roles
ALTER TABLE user_roles DROP CONSTRAINT IF EXISTS fk_user_roles_user;
ALTER TABLE user_roles DROP CONSTRAINT IF EXISTS user_roles_pkey;

-- refresh_tokens
ALTER TABLE refresh_tokens DROP CONSTRAINT IF EXISTS fk_refresh_token_user;

-- password_reset_tokens
ALTER TABLE password_reset_tokens DROP CONSTRAINT IF EXISTS fk_password_reset_user;

-- vehicle
ALTER TABLE vehicle DROP CONSTRAINT IF EXISTS fk_vehicle_user;

-- appointment
ALTER TABLE appointment DROP CONSTRAINT IF EXISTS fk_appointment_user;

-- time_log
ALTER TABLE time_log DROP CONSTRAINT IF EXISTS fk_time_log_user;

-- notifications (has special constraint structure)
ALTER TABLE notifications DROP CONSTRAINT IF EXISTS fk_notification_user;

-- Step 5: Drop old user_id columns from all related tables

ALTER TABLE user_roles DROP COLUMN user_id;
ALTER TABLE refresh_tokens DROP COLUMN user_id;
ALTER TABLE password_reset_tokens DROP COLUMN user_id;
ALTER TABLE vehicle DROP COLUMN user_id;
ALTER TABLE appointment DROP COLUMN user_id;
ALTER TABLE time_log DROP COLUMN user_id;
ALTER TABLE notifications DROP COLUMN user_id;

-- Step 6: Rename user_id_uuid to user_id in all related tables

ALTER TABLE user_roles RENAME COLUMN user_id_uuid TO user_id;
ALTER TABLE refresh_tokens RENAME COLUMN user_id_uuid TO user_id;
ALTER TABLE password_reset_tokens RENAME COLUMN user_id_uuid TO user_id;
ALTER TABLE vehicle RENAME COLUMN user_id_uuid TO user_id;
ALTER TABLE appointment RENAME COLUMN user_id_uuid TO user_id;
ALTER TABLE time_log RENAME COLUMN user_id_uuid TO user_id;
ALTER TABLE notifications RENAME COLUMN user_id_uuid TO user_id;

-- Step 7: Change users table primary key

ALTER TABLE users DROP CONSTRAINT users_pkey CASCADE;
ALTER TABLE users DROP COLUMN id;
ALTER TABLE users RENAME COLUMN id_uuid TO id;
ALTER TABLE users ADD PRIMARY KEY (id);

-- Step 8: Set NOT NULL constraints on user_id columns

ALTER TABLE user_roles ALTER COLUMN user_id SET NOT NULL;
ALTER TABLE refresh_tokens ALTER COLUMN user_id SET NOT NULL;
ALTER TABLE password_reset_tokens ALTER COLUMN user_id SET NOT NULL;
ALTER TABLE vehicle ALTER COLUMN user_id SET NOT NULL;
ALTER TABLE appointment ALTER COLUMN user_id SET NOT NULL;
ALTER TABLE time_log ALTER COLUMN user_id SET NOT NULL;
ALTER TABLE notifications ALTER COLUMN user_id SET NOT NULL;

-- Step 9: Re-create primary key and foreign key constraints

-- user_roles primary key
ALTER TABLE user_roles ADD PRIMARY KEY (user_id, role_id);

-- Foreign key constraints
ALTER TABLE user_roles
ADD CONSTRAINT fk_user_roles_user
FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE;

ALTER TABLE refresh_tokens
ADD CONSTRAINT fk_refresh_token_user
FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE;

ALTER TABLE password_reset_tokens
ADD CONSTRAINT fk_password_reset_user
FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE;

ALTER TABLE vehicle
ADD CONSTRAINT fk_vehicle_user
FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE;

ALTER TABLE appointment
ADD CONSTRAINT fk_appointment_user
FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE;

ALTER TABLE time_log
ADD CONSTRAINT fk_time_log_user
FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE;

ALTER TABLE notifications
ADD CONSTRAINT fk_notification_user
FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE;

-- Step 10: Re-create indexes

DROP INDEX IF EXISTS idx_refresh_tokens_user_id;
CREATE INDEX idx_refresh_tokens_user_id ON refresh_tokens(user_id);

DROP INDEX IF EXISTS idx_notifications_user_id;
CREATE INDEX idx_notifications_user_id ON notifications(user_id);

