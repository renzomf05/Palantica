-- Migración 001: Esquema Inicial de Palantica
-- Compatible con PostgreSQL / Supabase

CREATE TABLE IF NOT EXISTS marcas (
    id SERIAL PRIMARY KEY,
    nombre VARCHAR(100) NOT NULL UNIQUE,
    pais_origen VARCHAR(100) NOT NULL,
    sitio_web VARCHAR(255),
    logo_url VARCHAR(500),
    fecha_creacion TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS palas (
    id SERIAL PRIMARY KEY,
    marca_id INT NOT NULL REFERENCES marcas(id) ON DELETE CASCADE,
    modelo VARCHAR(150) NOT NULL,
    forma VARCHAR(50) NOT NULL, -- Redonda, Lagrima, Diamante
    balance_mm INT NOT NULL, -- 250 a 280 mm
    peso_min INT NOT NULL DEFAULT 355,
    peso_max INT NOT NULL DEFAULT 375,
    material_nucleo VARCHAR(100) NOT NULL, -- EVA Soft, Black EVA, MultiEVA, FOAM
    material_caras VARCHAR(100) NOT NULL, -- Carbono 3K, 12K, 18K, 24K, Fibra de Vidrio
    superficie_rugosa VARCHAR(50) DEFAULT 'Arenado', -- Liso, Arenado, Relieve 3D
    estacion_optima VARCHAR(50) NOT NULL DEFAULT 'TodoAno', -- Verano, Invierno, TodoAno
    precio_referencia DECIMAL(10,2) NOT NULL DEFAULT 0.00,
    puntuacion_general REAL NOT NULL DEFAULT 0.0,
    dureza_promedio REAL NOT NULL DEFAULT 5.0, -- Escala 1-10
    potencia_promedio REAL NOT NULL DEFAULT 5.0,
    control_promedio REAL NOT NULL DEFAULT 5.0,
    salida_bola_promedio REAL NOT NULL DEFAULT 5.0,
    maniobrabilidad_promedio REAL NOT NULL DEFAULT 5.0,
    punto_dulce_promedio REAL NOT NULL DEFAULT 5.0,
    confort_promedio REAL NOT NULL DEFAULT 5.0,
    imagen_url VARCHAR(500),
    ano_lanzamiento INT NOT NULL DEFAULT 2025,
    jugador_pro VARCHAR(100),
    descripcion TEXT,
    total_resenas INT NOT NULL DEFAULT 0,
    total_votos INT NOT NULL DEFAULT 0,
    fecha_creacion TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS usuarios (
    id SERIAL PRIMARY KEY,
    email VARCHAR(255) NOT NULL UNIQUE,
    password_hash VARCHAR(255) NOT NULL,
    nombre VARCHAR(120) NOT NULL,
    rol VARCHAR(50) NOT NULL DEFAULT 'Usuario', -- Usuario, Administrador
    pala_activa_id INT REFERENCES palas(id) ON DELETE SET NULL,
    nivel_juego VARCHAR(50) DEFAULT 'Intermedio', -- Iniciacion, Intermedio, Avanzado, Competicion
    lado_pista_preferido VARCHAR(50) DEFAULT 'Reves', -- Drive, Reves, Indistinto
    avatar_url VARCHAR(500),
    fecha_registro TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS resenas (
    id SERIAL PRIMARY KEY,
    pala_id INT NOT NULL REFERENCES palas(id) ON DELETE CASCADE,
    usuario_id INT NOT NULL REFERENCES usuarios(id) ON DELETE CASCADE,
    puntuacion INT NOT NULL CHECK (puntuacion >= 1 AND puntuacion <= 5),
    titulo VARCHAR(150) NOT NULL,
    contenido TEXT NOT NULL,
    lado_pista VARCHAR(50) DEFAULT 'Reves',
    tiempo_uso VARCHAR(50) DEFAULT '1 mes',
    fecha_publicacion TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT uq_usuario_pala_resena UNIQUE (pala_id, usuario_id)
);

CREATE TABLE IF NOT EXISTS votos_atributos (
    id SERIAL PRIMARY KEY,
    pala_id INT NOT NULL REFERENCES palas(id) ON DELETE CASCADE,
    usuario_id INT NOT NULL REFERENCES usuarios(id) ON DELETE CASCADE,
    dureza_percibida INT NOT NULL CHECK (dureza_percibida >= 1 AND dureza_percibida <= 10),
    potencia INT NOT NULL CHECK (potencia >= 1 AND potencia <= 10),
    control INT NOT NULL CHECK (control >= 1 AND control <= 10),
    salida_bola INT NOT NULL CHECK (salida_bola >= 1 AND salida_bola <= 10),
    maniobrabilidad INT NOT NULL CHECK (maniobrabilidad >= 1 AND maniobrabilidad <= 10),
    punto_dulce INT NOT NULL CHECK (punto_dulce >= 1 AND punto_dulce <= 10),
    confort INT NOT NULL CHECK (confort >= 1 AND confort <= 10),
    estacion_recomendada VARCHAR(50) DEFAULT 'TodoAno',
    fecha_voto TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT uq_usuario_pala_voto UNIQUE (pala_id, usuario_id)
);

CREATE TABLE IF NOT EXISTS padelgram_posts (
    id SERIAL PRIMARY KEY,
    usuario_id INT NOT NULL REFERENCES usuarios(id) ON DELETE CASCADE,
    pala_id INT NOT NULL REFERENCES palas(id) ON DELETE CASCADE,
    imagen_url VARCHAR(500) NOT NULL,
    descripcion TEXT,
    ubicacion VARCHAR(150),
    likes_count INT NOT NULL DEFAULT 0,
    fecha_publicacion TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS paletero_items (
    id SERIAL PRIMARY KEY,
    usuario_id INT NOT NULL REFERENCES usuarios(id) ON DELETE CASCADE,
    pala_id INT NOT NULL REFERENCES palas(id) ON DELETE CASCADE,
    categoria VARCHAR(50) NOT NULL, -- 'Usando actualmente', 'En el paletero', 'Palas que tuve', 'Palas que quiero'
    notas VARCHAR(255),
    fecha_registro TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT uq_usuario_pala_paletero UNIQUE (usuario_id, pala_id, categoria)
);

-- Índices de búsqueda y rendimiento
CREATE INDEX IF NOT EXISTS idx_palas_marca ON palas(marca_id);
CREATE INDEX IF NOT EXISTS idx_palas_forma ON palas(forma);
CREATE INDEX IF NOT EXISTS idx_palas_dureza ON palas(dureza_promedio);
CREATE INDEX IF NOT EXISTS idx_resenas_pala ON resenas(pala_id);
CREATE INDEX IF NOT EXISTS idx_votos_pala ON votos_atributos(pala_id);
CREATE INDEX IF NOT EXISTS idx_padelgram_pala ON padelgram_posts(pala_id);
CREATE INDEX IF NOT EXISTS idx_paletero_usuario ON paletero_items(usuario_id);
