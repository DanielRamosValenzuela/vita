-- Script para convertir un usuario en SUPER_ADMIN
-- Reemplaza 'tu-email@example.com' con tu email real

UPDATE "User"
SET role = 'SUPER_ADMIN'
WHERE email = 'tu-email@example.com';

-- Verificar que se actualizó correctamente
SELECT id, email, name, role 
FROM "User" 
WHERE email = 'tu-email@example.com';




