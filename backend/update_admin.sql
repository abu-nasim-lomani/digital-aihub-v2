-- Update all users to admin role
UPDATE "User" SET role = 'admin' WHERE role = 'user';
