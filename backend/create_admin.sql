-- Run this in your Supabase SQL Editor to manually insert the Admin User
-- Password is 'PuneAdmin2026!'

INSERT INTO users (id, email, hashed_password, is_active, is_verified, role, is_shadowbanned, created_at, updated_at)
VALUES (
    gen_random_uuid(),
    'admin@punedating.com',
    '$2b$12$N9ZGBHclSOnrQ1.tGE9OxeQfI6C.L8O4R6vYlF7M/S4f1kIuXFzVK', -- Secure bcrypt hash for PuneAdmin2026!
    true,
    true,
    'admin',
    false,
    now(),
    now()
) ON CONFLICT (email) DO UPDATE 
SET role = 'admin', is_active = true, hashed_password = '$2b$12$N9ZGBHclSOnrQ1.tGE9OxeQfI6C.L8O4R6vYlF7M/S4f1kIuXFzVK';
