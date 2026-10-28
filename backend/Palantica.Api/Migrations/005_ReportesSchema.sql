-- Migración 005: Esquema para Reportes y Feedback de Usuarios
-- Compatible con PostgreSQL / Supabase

CREATE TABLE IF NOT EXISTS reportes (
    id SERIAL PRIMARY KEY,
    usuario_id INT NOT NULL REFERENCES usuarios(id) ON DELETE CASCADE,
    usuario_nombre VARCHAR(120) NOT NULL,
    usuario_email VARCHAR(255) NOT NULL,
    asunto VARCHAR(150) NOT NULL,
    mensaje TEXT NOT NULL,
    estado VARCHAR(30) NOT NULL DEFAULT 'Pendiente',
    fecha_creacion TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    fecha_resolucion TIMESTAMP WITH TIME ZONE
);

CREATE INDEX IF NOT EXISTS idx_reportes_usuario_id ON reportes(usuario_id);
CREATE INDEX IF NOT EXISTS idx_reportes_estado ON reportes(estado);
CREATE INDEX IF NOT EXISTS idx_reportes_fecha ON reportes(fecha_creacion DESC);
