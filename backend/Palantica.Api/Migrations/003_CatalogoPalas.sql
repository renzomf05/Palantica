-- Migración 003: Catálogo Factual y Técnico de Palas de Pádel
-- Compatible con PostgreSQL y Supabase
-- Excluye intencionalmente cualquier descripción narrativa o texto editorial para respetar derechos de autor y optimizar almacenamiento.

CREATE TABLE IF NOT EXISTS catalogo_palas (
    id SERIAL PRIMARY KEY,
    slug VARCHAR(200) NOT NULL UNIQUE,
    marca VARCHAR(100) NOT NULL,
    modelo VARCHAR(150) NOT NULL,
    forma VARCHAR(50) NOT NULL DEFAULT 'Lagrima',
    balance_mm INT NOT NULL DEFAULT 265,
    balance_nivel VARCHAR(30) NOT NULL DEFAULT 'Medio',
    material_nucleo VARCHAR(100),
    material_caras VARCHAR(100),
    dureza_nivel VARCHAR(30) NOT NULL DEFAULT 'Media',
    dureza_score REAL NOT NULL DEFAULT 5.0,
    potencia_score REAL NOT NULL DEFAULT 5.0,
    control_score REAL NOT NULL DEFAULT 5.0,
    salida_bola_score REAL NOT NULL DEFAULT 5.0,
    maniobrabilidad_score REAL NOT NULL DEFAULT 5.0,
    punto_dulce_score REAL NOT NULL DEFAULT 5.0,
    puntuacion_general REAL NOT NULL DEFAULT 5.0,
    precio DECIMAL(10,2) NOT NULL DEFAULT 0.00,
    moneda VARCHAR(10) NOT NULL DEFAULT 'EUR',
    imagen_url VARCHAR(500),
    jugador_pro VARCHAR(100),
    ano_lanzamiento INT NOT NULL DEFAULT 2025,
    fuente_original VARCHAR(500),
    fecha_creacion TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Índices de filtrado y búsqueda de alta velocidad
CREATE INDEX IF NOT EXISTS idx_catalogo_palas_marca ON catalogo_palas(marca);
CREATE INDEX IF NOT EXISTS idx_catalogo_palas_forma ON catalogo_palas(forma);
CREATE INDEX IF NOT EXISTS idx_catalogo_palas_balance ON catalogo_palas(balance_nivel);
CREATE INDEX IF NOT EXISTS idx_catalogo_palas_dureza ON catalogo_palas(dureza_nivel);
CREATE INDEX IF NOT EXISTS idx_catalogo_palas_puntuacion ON catalogo_palas(puntuacion_general DESC);
CREATE INDEX IF NOT EXISTS idx_catalogo_palas_ano ON catalogo_palas(ano_lanzamiento DESC);
CREATE INDEX IF NOT EXISTS idx_catalogo_palas_modelo ON catalogo_palas(modelo);
