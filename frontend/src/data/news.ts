export interface NewsItem {
  id: string;
  titulo: string;
  bajada: string;
  categoria: string;
  autor: string;
  fecha: string;
  tiempoLectura: number;
  imagen: string; // URL o identificador de placeholder
  fotoDescripcion: string;
  destacada: boolean;
  seccion: 'circuito' | 'torneos' | 'jugadores' | 'material' | 'entrevistas' | 'opinion';
  ratio?: '16/9' | '4/3' | '9/16' | '1/1' | '21/9';
  destacadaSecundaria?: boolean;
}

export const mockNews: NewsItem[] = [
  {
    id: 'nota-01',
    titulo: 'la final se decidió en el tie-break del tercer set.',
    bajada: 'Tapia y Coello sellan una temporada histórica tras salvar tres match points en un Palau Sant Jordi enmudecido.',
    categoria: 'Circuito Pro',
    autor: 'J. M. Díaz',
    fecha: '28 SEP 2026',
    tiempoLectura: 6,
    imagen: 'placeholder-hero-tapia-coello',
    /* acá va la foto de: Agustín Tapia arrodillado en el suelo del Palau Sant Jordi celebrando con Arturo Coello tras el punto de campeonato, plano angular a nivel de pista */
    fotoDescripcion: 'Agustín Tapia arrodillado en el suelo del Palau Sant Jordi celebrando con Arturo Coello tras el punto de campeonato.',
    destacada: true,
    seccion: 'circuito',
    ratio: '21/9',
  },
  {
    id: 'nota-02',
    titulo: 'adiós definitivo al carbono 24k en las palas de control.',
    bajada: 'Los laboratorios de ingeniería de materiales revelan por qué la rigidez extrema perjudica la salida de bola en jugadores no profesionales.',
    categoria: 'Material y Palas',
    autor: 'Dr. Roberto Valls',
    fecha: '27 SEP 2026',
    tiempoLectura: 9,
    imagen: 'placeholder-destacada-carbono',
    /* acá va la foto de: Primer plano macro de las capas de fibra de carbono entrelazadas bajo microscopio electrónico con luz rasante técnica */
    fotoDescripcion: 'Primer plano macro de las capas de fibra de carbono entrelazadas bajo microscopio electrónico con luz rasante técnica.',
    destacada: false,
    destacadaSecundaria: true,
    seccion: 'material',
    ratio: '16/9',
  },
  {
    id: 'nota-03',
    titulo: 'el retorno del revés a dos manos en el circuito femenino.',
    bajada: 'Un análisis biomecánico de cómo la nueva generación de jugadoras gana tres décimas de segundo frente a la volea profunda.',
    categoria: 'Jugadores',
    autor: 'Elena Morales',
    fecha: '26 SEP 2026',
    tiempoLectura: 5,
    imagen: 'placeholder-reves-dos-manos',
    /* acá va la foto de: Jugadora profesional en plena preparación del revés a dos manos, congelada en el aire, luz natural de pista exterior */
    fotoDescripcion: 'Jugadora profesional en plena preparación del revés a dos manos, congelada en el aire, luz natural.',
    destacada: false,
    seccion: 'jugadores',
    ratio: '4/3',
  },
  {
    id: 'nota-04',
    titulo: 'doha confirma el major con mayor dotación económica de la historia.',
    bajada: 'La Federación Internacional oficializa el calendario de invierno con una parada millonaria en el Khalifa International Tennis Complex.',
    categoria: 'Torneos y Resultados',
    autor: 'P. Alarcón',
    fecha: '25 SEP 2026',
    tiempoLectura: 4,
    imagen: 'placeholder-doha-major',
    /* acá va la foto de: Pista central iluminada bajo la noche de Doha, arquitectura futurista en el fondo y reflejos en el vidrio */
    fotoDescripcion: 'Pista central iluminada bajo la noche de Doha, arquitectura futurista en el fondo.',
    destacada: false,
    seccion: 'torneos',
    ratio: '4/3',
  },
  {
    id: 'nota-05',
    titulo: 'la obsesión por la potencia está arruinando la táctica pura.',
    bajada: '¿Por qué la reducción del punto dulce ha empobrecido la construcción del punto en favor del pegador puro?',
    categoria: 'Opinión',
    autor: 'Mariano Amat',
    fecha: '24 SEP 2026',
    tiempoLectura: 7,
    imagen: 'placeholder-opinion-tactica',
    /* acá va la foto de: Silueta de jugador apoyado en la red con la cabeza gacha tras un punto largo, contraste en blanco y negro */
    fotoDescripcion: 'Silueta de jugador apoyado en la red con la cabeza gacha tras un punto largo, blanco y negro.',
    destacada: false,
    seccion: 'opinion',
    ratio: '16/9',
  },
  {
    id: 'nota-06',
    titulo: 'hablamos con agustín tapia sobre el peso exacto de su pala.',
    bajada: 'El prodigio de Catamarca confiesa cómo tres gramos adicionales en la cabeza cambiaron por completo su juego aéreo.',
    categoria: 'Entrevistas',
    autor: 'Lucas Rossi',
    fecha: '23 SEP 2026',
    tiempoLectura: 11,
    imagen: 'placeholder-tapia-entrevista',
    /* acá va la foto de: Retrato editorial íntimo de Agustín Tapia en vestuarios, mirando a cámara con grip en mano y mirada concentrada */
    fotoDescripcion: 'Retrato editorial íntimo de Agustín Tapia en vestuarios, mirando a cámara con grip en mano.',
    destacada: false,
    seccion: 'entrevistas',
    ratio: '4/3',
  },
  {
    id: 'nota-07',
    titulo: 'fricción y arena: el dilema de las suelas omni vs espiga.',
    bajada: 'Probamos las últimas zapatillas del circuito en césped rizado sin arena visible para medir el índice de tracción.',
    categoria: 'Material y Palas',
    autor: 'Laboratorio Palantica',
    fecha: '22 SEP 2026',
    tiempoLectura: 4,
    imagen: 'placeholder-zapatillas-suela',
    /* acá va la foto de: Suela de zapatilla de pádel flexionada contra la moqueta azul, capturando partículas microscópicas de slice */
    fotoDescripcion: 'Suela de zapatilla de pádel flexionada contra la moqueta azul con micro-detalles.',
    destacada: false,
    seccion: 'material',
    ratio: '1/1',
  },
  {
    id: 'nota-08',
    titulo: 'el nuevo calendario unificado reduce un 20% los viajes de los jugadores.',
    bajada: 'Acuerdo histórico entre organizadores y la asociación de jugadores para priorizar la salud física y prevenir lesiones.',
    categoria: 'Circuito Pro',
    autor: 'J. M. Díaz',
    fecha: '21 SEP 2026',
    tiempoLectura: 3,
    imagen: 'placeholder-calendario-asociacion',
    /* acá va la foto de: Rueda de prensa en el centro de prensa con micrófonos vintage y los mejores jugadores del mundo */
    fotoDescripcion: 'Rueda de prensa internacional de jugadores profesionales reunidos en mesa editorial.',
    destacada: false,
    seccion: 'circuito',
    ratio: '16/9',
  },
  {
    id: 'nota-09',
    titulo: 'por qué el globo rápido a la reja es el golpe más difícil de enseñar.',
    bajada: 'Una disección milimétrica de los ángulos de impacto y la lectura de rebote en los cristales laterales.',
    categoria: 'Técnica',
    autor: 'Seba Nerone',
    fecha: '20 SEP 2026',
    tiempoLectura: 6,
    imagen: 'placeholder-globo-tecnica',
    /* acá va la foto de: Vista cenital geométrica de una cancha de pádel dividida por líneas de luz técnica mostrando trayectorias */
    fotoDescripcion: 'Vista cenital geométrica de una cancha de pádel con líneas vectoriales de trayectoria.',
    destacada: false,
    seccion: 'opinion',
    ratio: '4/3',
  },
  {
    id: 'nota-10',
    titulo: 'el milagro de bea gonzález: recuperación récord antes de málaga.',
    bajada: 'Tras seis semanas de readaptación física, "la perla" vuelve al cuadro principal con una versión física renovada.',
    categoria: 'Jugadores',
    autor: 'Elena Morales',
    fecha: '19 SEP 2026',
    tiempoLectura: 5,
    imagen: 'placeholder-bea-gonzalez',
    /* acá va la foto de: Bea González sonriendo con intensidad en el banco de cambios, sudor en la frente y toalla al cuello */
    fotoDescripcion: 'Bea González sonriendo con intensidad en el banco de cambios tras un set agotador.',
    destacada: false,
    seccion: 'jugadores',
    ratio: '4/3',
  },
  {
    id: 'nota-11',
    titulo: 'pistas panorámicas: el fin de las columnas en las esquinas.',
    bajada: 'La evolución arquitectónica de las pistas de cristal templado de 12mm que cambió la televisión para siempre.',
    categoria: 'Torneos y Resultados',
    autor: 'Carlos Méndez',
    fecha: '18 SEP 2026',
    tiempoLectura: 4,
    imagen: 'placeholder-cristal-panoramico',
    /* acá va la foto de: Esquina transparente sin marcos metálicos, mostrando la perspectiva limpia y continua del estadio */
    fotoDescripcion: 'Esquina transparente sin marcos metálicos con perspectiva limpia del estadio.',
    destacada: false,
    seccion: 'torneos',
    ratio: '16/9',
  }
];

export interface SectionMeta {
  id: string;
  slug: string;
  nombre: string;
  subtitulo: string;
  fotoDescripcion: string;
  conteo: number;
}

export const mockSections: SectionMeta[] = [
  {
    id: 'sec-1',
    slug: 'circuito',
    nombre: 'circuito profesional.',
    subtitulo: 'crónicas, clasificaciones, cambios de pareja y política deportiva.',
    /* acá va la foto de: Jugadores entrando por el túnel de vestuarios a la pista central con luces estroboscópicas */
    fotoDescripcion: 'Jugadores entrando por el túnel de vestuarios a la pista central con luces de estadio.',
    conteo: 42,
  },
  {
    id: 'sec-2',
    slug: 'torneos',
    nombre: 'torneos y resultados.',
    subtitulo: 'cuadros principales, marcadores en vivo y crónicas de rondas eliminatorias.',
    /* acá va la foto de: Trofeo metálico del Master de Madrid reposando en el podio bajo focos cenitales */
    fotoDescripcion: 'Trofeo metálico del torneo reposando en el podio bajo focos cenitales.',
    conteo: 28,
  },
  {
    id: 'sec-3',
    slug: 'jugadores',
    nombre: 'jugadores.',
    subtitulo: 'perfiles, estadísticas de rendimiento, biomecánica y seguimiento individual.',
    /* acá va la foto de: Detalle de las manos vendadas de un jugador apretando el overgrip antes de sacar */
    fotoDescripcion: 'Detalle de las manos vendadas de un jugador apretando el overgrip antes de sacar.',
    conteo: 35,
  },
  {
    id: 'sec-4',
    slug: 'material',
    nombre: 'material y palas.',
    subtitulo: 'análisis de laboratorio, pruebas balísticas, gomas, carbono y zapatillas.',
    /* acá va la foto de: Pala despiezada en capas transversales mostrando el núcleo EVA multicapa y el tubular de carbono */
    fotoDescripcion: 'Pala despiezada en capas transversales en mesa técnica de laboratorio.',
    conteo: 54,
  },
  {
    id: 'sec-5',
    slug: 'entrevistas',
    nombre: 'entrevistas.',
    subtitulo: 'conversaciones a fondo con las voces más influyentes del pádel mundial.',
    /* acá va la foto de: Micrófono de estudio frente a un entrenador legendario en sala oscura con luz lateral */
    fotoDescripcion: 'Entrenador legendario en sala oscura con luz lateral en plano medio reflexivo.',
    conteo: 19,
  },
  {
    id: 'sec-6',
    slug: 'opinion',
    nombre: 'opinión.',
    subtitulo: 'columnas críticas, análisis táctico contemporáneo y debate cultural.',
    /* acá va la foto de: Apuntes tácticos escritos a mano con pizarra imantada de pádel y bolas numeradas */
    fotoDescripcion: 'Apuntes tácticos escritos a mano con pizarra imantada de pádel y bolas numeradas.',
    conteo: 23,
  },
];
