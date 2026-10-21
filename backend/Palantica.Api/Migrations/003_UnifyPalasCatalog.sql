-- ============================================================================
-- Migración 003: Unificación Definitiva de Catálogo (catalogo_palas -> palas)
-- ============================================================================

-- 1. Asegurar nuevas columnas necesarias en la tabla 'palas'
ALTER TABLE palas ADD COLUMN IF NOT EXISTS slug VARCHAR(200);
ALTER TABLE palas ADD COLUMN IF NOT EXISTS balance_nivel VARCHAR(30) DEFAULT 'Medio';
ALTER TABLE palas ADD COLUMN IF NOT EXISTS dureza_nivel VARCHAR(30) DEFAULT 'Media';
ALTER TABLE palas ADD COLUMN IF NOT EXISTS moneda VARCHAR(10) DEFAULT 'EUR';
ALTER TABLE palas ADD COLUMN IF NOT EXISTS fuente_original VARCHAR(500);

-- 2. Asignar slug canónico a las 7 palas iniciales si no lo tienen
UPDATE palas SET slug = 'nox-at10-genius-18k-2025' WHERE id = 1 AND slug IS NULL;
UPDATE palas SET slug = 'bullpadel-vertex-04-2025' WHERE id = 2 AND slug IS NULL;
UPDATE palas SET slug = 'babolat-technical-viper-2025' WHERE id = 3 AND slug IS NULL;
UPDATE palas SET slug = 'siux-electra-st3-pro' WHERE id = 4 AND slug IS NULL;
UPDATE palas SET slug = 'head-extreme-pro' WHERE id = 5 AND slug IS NULL;
UPDATE palas SET slug = 'adidas-metalbone-3-3' WHERE id = 6 AND slug IS NULL;
UPDATE palas SET slug = 'nox-ml10-pro-cup-luxury' WHERE id = 7 AND slug IS NULL;
UPDATE palas SET slug = LOWER(REGEXP_REPLACE(REPLACE(modelo, ' ', '-'), '[^a-z0-9\-]', '', 'g')) WHERE slug IS NULL;

-- Asegurar restricción UNIQUE en slug
CREATE UNIQUE INDEX IF NOT EXISTS uq_palas_slug ON palas(slug);

-- 3. Si existe la tabla catalogo_palas, transferir marcas y palas a palas
DO $$
BEGIN
    IF EXISTS (SELECT FROM information_schema.tables WHERE table_name = 'catalogo_palas') THEN

        -- Insertar marcas de catalogo_palas que no existan en marcas
        INSERT INTO marcas (nombre, pais_origen, sitio_web, logo_url)
        SELECT DISTINCT
            TRIM(cp.marca) AS nombre,
            'España' AS pais_origen,
            'https://www.' || LOWER(REGEXP_REPLACE(TRIM(cp.marca), '[^a-zA-Z0-9]', '', 'g')) || '.com' AS sitio_web,
            'https://images.unsplash.com/photo-1599586120429-48281b6f0ece?w=200' AS logo_url
        FROM catalogo_palas cp
        WHERE cp.marca IS NOT NULL AND TRIM(cp.marca) <> ''
          AND NOT EXISTS (
              SELECT 1 FROM marcas m WHERE LOWER(TRIM(m.nombre)) = LOWER(TRIM(cp.marca))
          )
        ON CONFLICT (nombre) DO NOTHING;

        -- Migrar todos los registros de catalogo_palas a palas
        INSERT INTO palas (
            marca_id,
            modelo,
            slug,
            forma,
            balance_mm,
            balance_nivel,
            peso_min,
            peso_max,
            material_nucleo,
            material_caras,
            superficie_rugosa,
            estacion_optima,
            dureza_nivel,
            precio_referencia,
            moneda,
            puntuacion_general,
            dureza_promedio,
            potencia_promedio,
            control_promedio,
            salida_bola_promedio,
            maniobrabilidad_promedio,
            punto_dulce_promedio,
            confort_promedio,
            imagen_url,
            ano_lanzamiento,
            jugador_pro,
            fuente_original,
            descripcion,
            total_resenas,
            total_votos
        )
        SELECT
            m.id AS marca_id,
            TRIM(cp.modelo) AS modelo,
            TRIM(cp.slug) AS slug,
            COALESCE(NULLIF(TRIM(cp.forma), ''), 'Lagrima') AS forma,
            COALESCE(cp.balance_mm, 265) AS balance_mm,
            COALESCE(NULLIF(TRIM(cp.balance_nivel), ''), 'Medio') AS balance_nivel,
            360 AS peso_min,
            375 AS peso_max,
            COALESCE(NULLIF(TRIM(cp.material_nucleo), ''), 'Black EVA') AS material_nucleo,
            COALESCE(NULLIF(TRIM(cp.material_caras), ''), 'Carbono 12K') AS material_caras,
            'Arenado' AS superficie_rugosa,
            CASE
                WHEN cp.dureza_score > 7.5 THEN 'Verano'
                WHEN cp.dureza_score < 5.5 THEN 'Invierno'
                ELSE 'TodoAno'
            END AS estacion_optima,
            COALESCE(NULLIF(TRIM(cp.dureza_nivel), ''), 'Media') AS dureza_nivel,
            COALESCE(cp.precio, 0.00) AS precio_referencia,
            COALESCE(NULLIF(TRIM(cp.moneda), ''), 'EUR') AS moneda,
            COALESCE(cp.puntuacion_general, 5.0) AS puntuacion_general,
            COALESCE(cp.dureza_score, 5.0) AS dureza_promedio,
            COALESCE(cp.potencia_score, 5.0) AS potencia_promedio,
            COALESCE(cp.control_score, 5.0) AS control_promedio,
            COALESCE(cp.salida_bola_score, 5.0) AS salida_bola_promedio,
            COALESCE(cp.maniobrabilidad_score, 5.0) AS maniobrabilidad_promedio,
            COALESCE(cp.punto_dulce_score, 5.0) AS punto_dulce_promedio,
            8.0 AS confort_promedio,
            cp.imagen_url,
            COALESCE(cp.ano_lanzamiento, 2025) AS ano_lanzamiento,
            cp.jugador_pro,
            cp.fuente_original,
            NULL AS descripcion,
            0 AS total_resenas,
            0 AS total_votos
        FROM catalogo_palas cp
        JOIN marcas m ON LOWER(TRIM(m.nombre)) = LOWER(TRIM(cp.marca))
        ON CONFLICT (slug) DO UPDATE SET
            precio_referencia = EXCLUDED.precio_referencia,
            puntuacion_general = EXCLUDED.puntuacion_general,
            imagen_url = COALESCE(palas.imagen_url, EXCLUDED.imagen_url),
            fuente_original = EXCLUDED.fuente_original,
            balance_nivel = EXCLUDED.balance_nivel,
            dureza_nivel = EXCLUDED.dureza_nivel,
            moneda = EXCLUDED.moneda;

        -- Eliminar definitivamente la tabla catalogo_palas
        DROP TABLE IF EXISTS catalogo_palas CASCADE;

    END IF;
END $$;

-- 4. Crear índices de rendimiento en la tabla palas
CREATE INDEX IF NOT EXISTS idx_palas_slug ON palas(slug);
CREATE INDEX IF NOT EXISTS idx_palas_ano ON palas(ano_lanzamiento DESC);
CREATE INDEX IF NOT EXISTS idx_palas_puntuacion ON palas(puntuacion_general DESC);
CREATE INDEX IF NOT EXISTS idx_palas_precio ON palas(precio_referencia);
CREATE INDEX IF NOT EXISTS idx_palas_balance_nivel ON palas(balance_nivel);
CREATE INDEX IF NOT EXISTS idx_palas_dureza_nivel ON palas(dureza_nivel);
