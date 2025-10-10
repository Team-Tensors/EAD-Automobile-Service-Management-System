-- =====================================================
-- Flyway Migration: V2__Insert_default_roles.sql
-- Description: Insert default roles for the system
-- Author: EAD Team
-- Date: 2025-10-07
-- =====================================================

-- Insert default roles
INSERT INTO roles (name) VALUES ('CUSTOMER') ON CONFLICT (name) DO NOTHING;
INSERT INTO roles (name) VALUES ('EMPLOYEE') ON CONFLICT (name) DO NOTHING;
INSERT INTO roles (name) VALUES ('ADMIN') ON CONFLICT (name) DO NOTHING;
