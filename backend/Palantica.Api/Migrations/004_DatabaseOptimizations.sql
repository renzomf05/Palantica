-- ============================================================================
-- Migración 004: Esquema Equilibrado de Alto Rendimiento e Integridad
-- Palantica - Enciclopedia Técnica de Pádel
-- ============================================================================

-- ----------------------------------------------------------------------------
-- 1. Extensiones necesarias
-- ----------------------------------------------------------------------------
CREATE EXTENSION IF NOT EXISTS citext;

CREATE EXTENSION IF NOT EXISTS pg_trgm;

-- ----------------------------------------------------------------------------
-- 2. Limpieza preventiva de duplicados antes de aplicar restricciones UNIQUE
-- ----------------------------------------------------------------------------
-- Deduplicar reseñas por (pala_id, usuario_id) conservando la más reciente
DELETE FROM resenas r1
WHERE
    r1.id < (
        SELECT MAX(r2.id)
        FROM resenas r2
        WHERE
            r2.pala_id = r1.pala_id
            AND r2.usuario_id = r1.usuario_id
    );

-- Deduplicar votos_atributos por (pala_id, usuario_id) conservando el más reciente
DELETE FROM votos_atributos v1
WHERE
    v1.id < (
        SELECT MAX(v2.id)
        FROM votos_atributos v2
        WHERE
            v2.pala_id = v1.pala_id
            AND v2.usuario_id = v1.usuario_id
    );

-- Deduplicar paletero_items por (usuario_id, pala_id) conservando el más reciente
DELETE FROM paletero_items pi1
WHERE
    pi1.id < (
        SELECT MAX(pi2.id)
        FROM paletero_items pi2
        WHERE
            pi2.usuario_id = pi1.usuario_id
            AND pi2.pala_id = pi1.pala_id
    );

-- ----------------------------------------------------------------------------
-- 3. Restricciones de Unicidad (Evitar duplicados y colisiones)
-- ----------------------------------------------------------------------------
DO $$
BEGIN
    -- Unicidad de nombre en marcas
    IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'uq_marcas_nombre') THEN
        ALTER TABLE marcas ADD CONSTRAINT uq_marcas_nombre UNIQUE (nombre);

END IF;

-- Unicidad de slug en palas
IF NOT EXISTS (
    SELECT 1
    FROM pg_constraint
    WHERE
        conname = 'uq_palas_slug'
) THEN
ALTER TABLE palas
ADD CONSTRAINT uq_palas_slug UNIQUE (slug);

END IF;

-- Un usuario solo puede tener 1 reseña por pala
IF NOT EXISTS (
    SELECT 1
    FROM pg_constraint
    WHERE
        conname = 'uq_resenas_pala_usuario'
) THEN
ALTER TABLE resenas
ADD CONSTRAINT uq_resenas_pala_usuario UNIQUE (pala_id, usuario_id);

END IF;

-- Un usuario solo puede tener 1 voto sensorial por pala
IF NOT EXISTS (
    SELECT 1
    FROM pg_constraint
    WHERE
        conname = 'uq_votos_pala_usuario'
) THEN
ALTER TABLE votos_atributos
ADD CONSTRAINT uq_votos_pala_usuario UNIQUE (pala_id, usuario_id);

END IF;

-- Una pala no puede estar duplicada para un mismo usuario en el paletero
IF NOT EXISTS (
    SELECT 1
    FROM pg_constraint
    WHERE
        conname = 'uq_paletero_usuario_pala'
) THEN
ALTER TABLE paletero_items
ADD CONSTRAINT uq_paletero_usuario_pala UNIQUE (usuario_id, pala_id);

END IF;

END $$;

-- ----------------------------------------------------------------------------
-- 4. Índices en Claves Foráneas (Acelera joins, filtros y eliminaciones)
-- ----------------------------------------------------------------------------
CREATE INDEX IF NOT EXISTS ix_palas_marca_id ON palas (marca_id);

CREATE INDEX IF NOT EXISTS ix_resenas_pala_id ON resenas (pala_id);

CREATE INDEX IF NOT EXISTS ix_resenas_usuario_id ON resenas (usuario_id);

CREATE INDEX IF NOT EXISTS ix_votos_pala_id ON votos_atributos (pala_id);

CREATE INDEX IF NOT EXISTS ix_votos_usuario_id ON votos_atributos (usuario_id);

CREATE INDEX IF NOT EXISTS ix_paletero_usuario_id ON paletero_items (usuario_id);

CREATE INDEX IF NOT EXISTS ix_paletero_pala_id ON paletero_items (pala_id);

CREATE INDEX IF NOT EXISTS ix_padelgram_usuario_fecha ON padelgram_posts (
    usuario_id,
    fecha_publicacion DESC
);

CREATE INDEX IF NOT EXISTS ix_padelgram_pala_id ON padelgram_posts (pala_id);

-- ----------------------------------------------------------------------------
-- 5. Índices de Búsqueda de Alto Rendimiento (Trigram y filtros de catálogo)
-- ----------------------------------------------------------------------------
CREATE INDEX IF NOT EXISTS ix_palas_modelo_trgm ON palas USING gin (modelo gin_trgm_ops);

CREATE INDEX IF NOT EXISTS ix_palas_forma ON palas (forma);

CREATE INDEX IF NOT EXISTS ix_palas_precio ON palas (precio_referencia);

CREATE INDEX IF NOT EXISTS ix_palas_puntuacion ON palas (puntuacion_general DESC);

CREATE INDEX IF NOT EXISTS ix_palas_ano ON palas (ano_lanzamiento DESC);

-- ----------------------------------------------------------------------------
-- 6. Restricciones CHECK de Integridad Sensorial y Métricas
-- ----------------------------------------------------------------------------
DO $$
BEGIN
    -- Validación de puntuación en reseñas (1 a 5)
    IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'chk_resenas_puntuacion') THEN
        ALTER TABLE resenas ADD CONSTRAINT chk_resenas_puntuacion CHECK (puntuacion >= 1 AND puntuacion <= 5);

END IF;

-- Validación de pesos de palas
IF NOT EXISTS (
    SELECT 1
    FROM pg_constraint
    WHERE
        conname = 'chk_palas_peso'
) THEN
ALTER TABLE palas
ADD CONSTRAINT chk_palas_peso CHECK (peso_min <= peso_max);

END IF;

-- Validación de precio no negativo
IF NOT EXISTS (
    SELECT 1
    FROM pg_constraint
    WHERE
        conname = 'chk_palas_precio'
) THEN
ALTER TABLE palas
ADD CONSTRAINT chk_palas_precio CHECK (precio_referencia >= 0);

END IF;

-- Validación de balance positivo
IF NOT EXISTS (
    SELECT 1
    FROM pg_constraint
    WHERE
        conname = 'chk_palas_balance'
) THEN
ALTER TABLE palas
ADD CONSTRAINT chk_palas_balance CHECK (balance_mm > 0);

END IF;

END $$;

-- ----------------------------------------------------------------------------
-- 7. Paletero: Pala Activa Limpia (Resuelve la referencia circular)
-- ----------------------------------------------------------------------------
ALTER TABLE paletero_items
ADD COLUMN IF NOT EXISTS es_activa BOOLEAN NOT NULL DEFAULT false;

-- Índice condicional único: cada usuario solo puede tener exactamente UNA pala activa
CREATE UNIQUE INDEX IF NOT EXISTS ux_paletero_activa ON paletero_items (usuario_id)
WHERE
    es_activa = true;

-- Sincronizar pala activa actual de los usuarios hacia paletero_items
UPDATE paletero_items pi
SET
    es_activa = true
FROM usuarios u
WHERE
    u.id = pi.usuario_id
    AND u.pala_activa_id = pi.pala_id;

-- ----------------------------------------------------------------------------
-- 8. Padelgram: Tabla Real de Likes (Fase 7)
-- ----------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS padelgram_likes (
    post_id INT NOT NULL REFERENCES padelgram_posts (id) ON DELETE CASCADE,
    usuario_id INT NOT NULL REFERENCES usuarios (id) ON DELETE CASCADE,
    created_at TIMESTAMP
    WITH
        TIME ZONE DEFAULT CURRENT_TIMESTAMP,
        PRIMARY KEY (post_id, usuario_id)
);

CREATE INDEX IF NOT EXISTS ix_padelgram_likes_usuario ON padelgram_likes (usuario_id);

-- ----------------------------------------------------------------------------
-- 9. Jugadores Profesionales como Entidad de Dominio
-- ----------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS jugadores_pro (
    id SERIAL PRIMARY KEY,
    nombre VARCHAR(120) NOT NULL UNIQUE,
    slug VARCHAR(140) NOT NULL UNIQUE,
    pais VARCHAR(60) DEFAULT 'España',
    posicion VARCHAR(30) DEFAULT 'Reves', -- Drive / Reves
    ranking_fip INT,
    foto_url VARCHAR(500),
    biografia TEXT,
    fecha_creacion TIMESTAMP
    WITH
        TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS pala_jugadores_pro (
    pala_id INT NOT NULL REFERENCES palas (id) ON DELETE CASCADE,
    jugador_pro_id INT NOT NULL REFERENCES jugadores_pro (id) ON DELETE CASCADE,
    temporada INT DEFAULT 2025,
    PRIMARY KEY (pala_id, jugador_pro_id)
);

CREATE INDEX IF NOT EXISTS ix_pala_jugadores_jugador ON pala_jugadores_pro (jugador_pro_id);

-- Poblar automáticamente jugadores_pro a partir de las palas existentes
INSERT INTO
    jugadores_pro (nombre, slug, pais)
SELECT DISTINCT
    TRIM(jugador_pro) AS nombre,
    LOWER(
        REGEXP_REPLACE(
            REPLACE (TRIM(jugador_pro), ' ', '-'),
                '[^a-z0-9\-]',
                '',
                'g'
        )
    ) AS slug,
    CASE
        WHEN TRIM(jugador_pro) ILIKE '%tapia%'
        OR TRIM(jugador_pro) ILIKE '%bela%'
        OR TRIM(jugador_pro) ILIKE '%di nenno%'
        OR TRIM(jugador_pro) ILIKE '%stupaczuk%'
        OR TRIM(jugador_pro) ILIKE '%chingotto%'
        OR TRIM(jugador_pro) ILIKE '%sanyo%' THEN 'Argentina'
        ELSE 'España'
    END AS pais
FROM palas
WHERE
    jugador_pro IS NOT NULL
    AND TRIM(jugador_pro) <> '' ON CONFLICT (nombre) DO NOTHING;

-- Enlazar palas con sus jugadores profesionales
INSERT INTO
    pala_jugadores_pro (
        pala_id,
        jugador_pro_id,
        temporada
    )
SELECT
    p.id AS pala_id,
    jp.id AS jugador_pro_id,
    COALESCE(p.ano_lanzamiento, 2025) AS temporada
FROM
    palas p
    JOIN jugadores_pro jp ON LOWER(TRIM(jp.nombre)) = LOWER(TRIM(p.jugador_pro)) ON CONFLICT (pala_id, jugador_pro_id) DO NOTHING;