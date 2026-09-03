-- Migración 002: Seed de Datos Iniciales de Palas y Fabricantes

-- Fabricantes de Pádel
INSERT INTO marcas (id, nombre, pais_origen, sitio_web, logo_url) VALUES
(1, 'Nox', 'España', 'https://noxsport.es', 'https://images.unsplash.com/photo-1599586120429-48281b6f0ece?w=200'),
(2, 'Bullpadel', 'España', 'https://bullpadel.com', 'https://images.unsplash.com/photo-1599586120429-48281b6f0ece?w=200'),
(3, 'Babolat', 'Francia', 'https://babolat.com', 'https://images.unsplash.com/photo-1599586120429-48281b6f0ece?w=200'),
(4, 'Siux', 'España', 'https://siuxpadel.com', 'https://images.unsplash.com/photo-1599586120429-48281b6f0ece?w=200'),
(5, 'Head', 'Austria', 'https://head.com', 'https://images.unsplash.com/photo-1599586120429-48281b6f0ece?w=200'),
(6, 'Adidas', 'Alemania', 'https://allforpadel.com', 'https://images.unsplash.com/photo-1599586120429-48281b6f0ece?w=200')
ON CONFLICT (id) DO NOTHING;

SELECT setval('marcas_id_seq', (SELECT MAX(id) FROM marcas));

-- Palas emblemáticas de referencia
INSERT INTO palas (
    id, marca_id, modelo, forma, balance_mm, peso_min, peso_max,
    material_nucleo, material_caras, superficie_rugosa, estacion_optima,
    precio_referencia, puntuacion_general, dureza_promedio,
    potencia_promedio, control_promedio, salida_bola_promedio,
    maniobrabilidad_promedio, punto_dulce_promedio, confort_promedio,
    imagen_url, ano_lanzamiento, jugador_pro, descripcion, total_resenas, total_votos
) VALUES
(
    1, 1, 'AT10 Genius 18K 2025', 'Lagrima', 265, 360, 375,
    'MLD Black EVA', 'Carbono 18K Alum', 'Arenado', 'TodoAno',
    299.95, 4.9, 6.8,
    9.1, 9.4, 7.8,
    9.3, 8.8, 8.6,
    'https://images.unsplash.com/photo-1612872087720-bb876e2e67d1?w=800', 2025, 'Agustín Tapia',
    'La pala del Mozart de Catamarca. Equilibrio milimétrico entre velocidad de maniobra, control en fondo de pista y potencia con carbono aluminizado.',
    14, 28
),
(
    2, 2, 'Vertex 04 2025', 'Diamante', 275, 365, 375,
    'MultiEVA', 'Xtend Carbon 12K', 'Relieve 3D', 'Invierno',
    319.90, 4.7, 8.2,
    9.7, 8.2, 6.5,
    8.1, 7.5, 7.4,
    'https://images.unsplash.com/photo-1612872087720-bb876e2e67d1?w=800', 2025, 'Juan Tello',
    'Potencia bruta para jugadores de ataque agresivo. El sistema Curvatik reduce torsiones y el canal Air React maximiza la velocidad de swing.',
    19, 35
),
(
    3, 3, 'Technical Viper 2025', 'Diamante', 270, 365, 375,
    'Black EVA', 'Carbono 3K', 'Relieve 3D', 'Verano',
    340.00, 4.6, 9.0,
    9.9, 7.6, 5.8,
    7.5, 6.8, 6.5,
    'https://images.unsplash.com/photo-1612872087720-bb876e2e67d1?w=800', 2025, 'Juan Lebrón',
    'Tacto de piedra implacable. Máxima precisión en volea y potencia quirúrgica para remates por 3 y por 4 metros.',
    22, 40
),
(
    4, 4, 'Electra ST3 Pro', 'Lagrima', 265, 355, 370,
    'EVA Hard', 'Carbono 15K', 'Arenado', 'TodoAno',
    285.00, 4.8, 7.5,
    9.2, 9.0, 7.2,
    8.9, 8.2, 8.0,
    'https://images.unsplash.com/photo-1612872087720-bb876e2e67d1?w=800', 2025, 'Franco Stupaczuk',
    'Pala híbrida de altísima rigidez que responde con pegada seca y excelente control en bloqueos.',
    11, 18
),
(
    5, 5, 'Extreme Pro', 'Diamante', 272, 370, 380,
    'Power FOAM', 'Carbono Híbrido', 'Relieve 3D', 'Verano',
    280.00, 4.7, 8.0,
    9.6, 8.0, 7.5,
    7.8, 7.4, 7.6,
    'https://images.unsplash.com/photo-1612872087720-bb876e2e67d1?w=800', 2025, 'Arturo Coello',
    'La pala del número uno del mundo. Potencia masiva generada por su balance elevado y tecnología Auxetic.',
    15, 25
),
(
    6, 6, 'Metalbone 3.3', 'Diamante', 280, 345, 360,
    'EVA Soft Performance', 'Carbon Aluminized 2 T0 1', 'Relieve 3D', 'Invierno',
    330.00, 4.8, 7.0,
    9.5, 8.5, 8.2,
    8.4, 8.0, 8.2,
    'https://images.unsplash.com/photo-1612872087720-bb876e2e67d1?w=800', 2025, 'Ale Galán',
    'Sistema de pesos Weight & Balance personalizable en el corazón de la pala. Salida de bola electrizante y excelente aceleración.',
    18, 30
),
(
    7, 1, 'ML10 Pro Cup Luxury', 'Redonda', 255, 360, 375,
    'HR3 Core', 'Fibra de Vidrio 3K Silver', 'Liso', 'TodoAno',
    219.95, 4.9, 4.5,
    7.8, 9.8, 8.9,
    9.7, 9.6, 9.5,
    'https://images.unsplash.com/photo-1612872087720-bb876e2e67d1?w=800', 2025, 'Miguel Lamperti',
    'La leyenda viva del pádel. Punto dulce gigantesco, tacto confortable y control absoluto para cualquier nivel de juego.',
    35, 60
)
ON CONFLICT (id) DO NOTHING;

SELECT setval('palas_id_seq', (SELECT MAX(id) FROM palas));

-- Usuario Administrador Inicial (password: AdminPalantica2026!)
INSERT INTO usuarios (id, email, password_hash, nombre, rol, pala_activa_id, nivel_juego) VALUES
(
    1, 'admin@palantica.com',
    '$2a$11$N.ZpPZZk1m4E82/8sN85yeZtE6c9O82u3pS6kP5r4H1sN85yeZtE6', -- BCrypt hash
    'Admin Palantica', 'Administrador', 1, 'Competicion'
)
ON CONFLICT (id) DO NOTHING;

SELECT setval('usuarios_id_seq', (SELECT MAX(id) FROM usuarios));
