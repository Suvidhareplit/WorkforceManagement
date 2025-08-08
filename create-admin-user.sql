-- Create admin user with hashed password (bcrypt hash for 'Admin@123')
INSERT INTO users (
  "userId",
  "email",
  "password",
  "name",
  "role",
  "createdAt",
  "updatedAt"
) VALUES (
  'admin001',
  'admin@hrms.com',
  '$2b$10$3euPcmQFCiblsZeEu5s7p.9wVsruW9DnLRDxPGz.TnOUJVxDK1Hy6', -- bcrypt hash for 'Admin@123'
  'Admin User',
  'admin',
  NOW(),
  NOW()
);
