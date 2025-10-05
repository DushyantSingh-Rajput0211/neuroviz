-- Insert demo user
-- Password: Demo@123 (bcrypt hashed)
INSERT INTO users (email, password_hash, first_name, last_name) 
VALUES (
    'demo@neuroviz.ai', 
    '$2a$10$N.zmdr9k7uOCQb376NoUnuTJ8iKyVkjlxSqKj3Lx9YwY8mQYpQpU2',
    'Demo',
    'User'
) ON CONFLICT (email) DO NOTHING;
