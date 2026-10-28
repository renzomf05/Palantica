-- Migración 006: Verificación de Correo (OTP 6 dígitos) y Autenticación en 2 Pasos (2FA)
-- Compatible con PostgreSQL / Supabase

ALTER TABLE usuarios ADD COLUMN IF NOT EXISTS email_verificado BOOLEAN NOT NULL DEFAULT FALSE;
ALTER TABLE usuarios ADD COLUMN IF NOT EXISTS codigo_verificacion VARCHAR(10);
ALTER TABLE usuarios ADD COLUMN IF NOT EXISTS codigo_expiracion TIMESTAMP WITH TIME ZONE;
ALTER TABLE usuarios ADD COLUMN IF NOT EXISTS two_factor_enabled BOOLEAN NOT NULL DEFAULT FALSE;
ALTER TABLE usuarios ADD COLUMN IF NOT EXISTS two_factor_secret VARCHAR(100);

-- Actualizar usuarios existentes para que no queden bloqueados
UPDATE usuarios SET email_verificado = TRUE WHERE email_verificado IS FALSE;
