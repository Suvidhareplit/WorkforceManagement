-- Create admin user with hashed password (bcrypt hash for 'Admin@123')
INSERT INTO users (
  user_id,
  email,
  password_hash,
  name,
  role,
  created_at,
  updated_at
) VALUES (
  12345,
  'admin@hrms.com',
  '$2b$10$3euPcmQFCiblsZeEu5s7p.9wVsruW9DnLRDxPGz.TnOUJVxDK1Hy6', -- bcrypt hash for 'Admin@123'
  'Admin User',
  'admin',
  NOW(),
  NOW()
);
