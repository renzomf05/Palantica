import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { palasApi } from '../../api/palas';
import { padelgramApi } from '../../api/padelgram';
import { Carousel } from '../../components/ui/Carousel';
import { useFitText } from '../../hooks/useFitText';
import type { Pala, CarouselCardItem, PadelgramPost } from '../../types';
import {
  Star,
  Layers,
  ArrowUpRight,
  ChevronRight,
  Radio
} from 'lucide-react';

export const HomePage: React.FC = () => {
  const [loading, setLoading] = useState(true);
  const [filtroComunidad, setFiltroComunidad] = useState<string>('SEMANA');

  // Datos para los 4 carruseles
  const [paletasNuevas, setPaletasNuevas] = useState<CarouselCardItem[]>([]);
  const [deLaComunidad, setDeLaComunidad] = useState<CarouselCardItem[]>([]);
  const [nuevosLanzamientos, setNuevosLanzamientos] = useState<CarouselCardItem[]>([]);
  const [catalogoReciente, setCatalogoReciente] = useState<CarouselCardItem[]>([]);

  // Hook para titular adaptativo gigante Swiss
  const { ref: heroTitleRef } = useFitText<HTMLHeadingElement>({
    minFontSize: 24,
    maxFontSize: 46,
  });

  useEffect(() => {
    let isMounted = true;

    async function loadAllSections() {
      setLoading(true);
      try {
        // Cargar palas desde la API
        const palasRes = await palasApi.getPalas({ pageSize: 12, orderBy: 'novedad' });
        const palas = palasRes.items || [];

        // 1. Carrusel: Paletas nuevas (Noticias y presentaciones)
        const mockPaletasNuevas: CarouselCardItem[] = [
          {
            id: 'n1',
            titulo: 'Bullpadel Vertex 04 2026: Nueva geometría de marco y balance reactivo',
            subtitulo: 'Análisis Técnico',
            etiqueta: 'PALETA NUEVA',
            imagenUrl:
              'https://images.unsplash.com/photo-1554068865-24cecd4e34b8?auto=format&fit=crop&w=800&q=80',
            linkTo: palas[0] ? `/paletas/${palas[0].id}` : '/paletas',
            autor: { nombre: 'Redacción Palantica' },
            rating: 9.6,
            fecha: 'Hoy',
          },
          {
            id: 'n2',
            titulo: 'Nox AT10 Luxury Genius 18K Alum: La evolución de Agustín Tapia',
            subtitulo: 'Review a Fondo',
            etiqueta: 'PALETA NUEVA',
            imagenUrl:
              'https://images.unsplash.com/photo-1599586120429-48281b6f0ece?auto=format&fit=crop&w=800&q=80',
            linkTo: palas[1] ? `/paletas/${palas[1].id}` : '/paletas',
            autor: { nombre: 'Martín Di Nenno' },
            rating: 9.8,
            fecha: 'Ayer',
          },
          {
            id: 'n3',
            titulo: 'Babolat Technical Viper Juan Lebrón: Potencia extrema sin concesiones',
            subtitulo: 'Test de Potencia',
            etiqueta: 'PALETA NUEVA',
            imagenUrl:
              'https://images.unsplash.com/photo-1544919982-b61976f0ba43?auto=format&fit=crop&w=800&q=80',
            linkTo: palas[2] ? `/paletas/${palas[2].id}` : '/paletas',
            autor: { nombre: 'Laboratorio Pádel' },
            rating: 9.4,
            fecha: 'Hace 3 días',
          },
          {
            id: 'n4',
            titulo: 'Head Extreme Pro 2026: El diamante con Auxetic 2.0 que domina el juego aéreo',
            subtitulo: 'Novedades 2026',
            etiqueta: 'PALETA NUEVA',
            imagenUrl:
              'https://images.unsplash.com/photo-1530549387789-4c1017266635?auto=format&fit=crop&w=800&q=80',
            linkTo: palas[3] ? `/paletas/${palas[3].id}` : '/paletas',
            autor: { nombre: 'Guillermo Lahoz' },
            rating: 9.2,
            fecha: 'Hace 4 días',
          },
          {
            id: 'n5',
            titulo: 'Adidas Metalbone 3.3 HRD Ale Galán: Sistema de pesos personalizable',
            subtitulo: 'Comparativa',
            etiqueta: 'PALETA NUEVA',
            imagenUrl:
              'https://images.unsplash.com/photo-1517649763962-0c623266ddc0?auto=format&fit=crop&w=800&q=80',
            linkTo: palas[4] ? `/paletas/${palas[4].id}` : '/paletas',
            autor: { nombre: 'Pro Tour Lab' },
            rating: 9.7,
            fecha: 'Hace 1 sem',
          },
        ];

        // 2. Carrusel: De la comunidad (Posts de usuarios)
        let mockComunidad: CarouselCardItem[] = [];
        try {
          const feedRes = await padelgramApi.getFeed(1, 6);
          if (feedRes.items && feedRes.items.length > 0) {
            mockComunidad = feedRes.items.map((post: PadelgramPost) => ({
              id: `com-${post.id}`,
              titulo: post.descripcion || `Review comunitaria de ${post.palaModelo}`,
              subtitulo: `${post.palaMarca} • ${post.palaModelo}`,
              etiqueta: 'COMUNIDAD',
              imagenUrl: post.imagenUrl,
              linkTo: '/feed',
              autor: {
                nombre: post.usuarioNombre,
                avatarUrl: post.usuarioAvatarUrl || undefined,
              },
              likes: post.likesCount || 14,
              comentarios: 6,
            }));
          }
        } catch {
          // fallback
        }

        if (mockComunidad.length === 0) {
          mockComunidad = [
            {
              id: 'c1',
              titulo: '6 meses jugando con la Siux Electra ST3 de Stupa: Sensaciones reales',
              subtitulo: 'Review Jugador de Revés',
              etiqueta: 'COMUNIDAD',
              imagenUrl:
                'https://images.unsplash.com/photo-1517649763962-0c623266ddc0?auto=format&fit=crop&w=800&q=80',
              linkTo: '/feed',
              autor: {
                nombre: 'Nico S.',
                avatarUrl: 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&w=120&q=80',
              },
              likes: 42,
              comentarios: 18,
            },
            {
              id: 'c2',
              titulo: '¿Pala blanda en invierno o cambiar a una más dura? Mi experiencia en Madrid',
              subtitulo: 'Debate Térmico',
              etiqueta: 'COMUNIDAD',
              imagenUrl:
                'https://images.unsplash.com/photo-1554068865-24cecd4e34b8?auto=format&fit=crop&w=800&q=80',
              linkTo: '/feed',
              autor: {
                nombre: 'Carla G.',
                avatarUrl: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&w=120&q=80',
              },
              likes: 78,
              comentarios: 29,
            },
            {
              id: 'c3',
              titulo: 'Comparativa en pista: Vertex 04 vs Hack 03. Cuál perdona más el error',
              subtitulo: 'Test de Punto Dulce',
              etiqueta: 'COMUNIDAD',
              imagenUrl:
                'https://images.unsplash.com/photo-1599586120429-48281b6f0ece?auto=format&fit=crop&w=800&q=80',
              linkTo: '/feed',
              autor: {
                nombre: 'Tomás R.',
                avatarUrl: 'https://images.unsplash.com/photo-1570295999919-56ceb5ecca61?auto=format&fit=crop&w=120&q=80',
              },
              likes: 56,
              comentarios: 14,
            },
            {
              id: 'c4',
              titulo: 'Mi paletero 2026 listo para la liga interclubes. Palas, grips y zapatillas',
              subtitulo: 'Equipamiento',
              etiqueta: 'COMUNIDAD',
              imagenUrl:
                'https://images.unsplash.com/photo-1544919982-b61976f0ba43?auto=format&fit=crop&w=800&q=80',
              linkTo: '/feed',
              autor: {
                nombre: 'Facu M.',
                avatarUrl: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=120&q=80',
              },
              likes: 91,
              comentarios: 35,
            },
          ];
        }

        // 3. Carrusel: Nuevos lanzamientos oficiales de marcas
        const mockNuevosLanzamientos: CarouselCardItem[] = [
          {
            id: 'l1',
            titulo: 'Colección Nox Luxury 2026: Carbono Alum y núcleos Dual Density',
            subtitulo: 'Nox Padel • Colección Completa',
            etiqueta: 'LANZAMIENTO',
            imagenUrl:
              'https://images.unsplash.com/photo-1530549387789-4c1017266635?auto=format&fit=crop&w=800&q=80',
            linkTo: '/paletas?marca=Nox',
            precio: 320,
            fecha: 'Lanzamiento Oficial',
          },
          {
            id: 'l2',
            titulo: 'Siux Trilogy IV Control Patty Llaguno: Máxima salida en formato redondo',
            subtitulo: 'Siux • Edición Profesional',
            etiqueta: 'LANZAMIENTO',
            imagenUrl:
              'https://images.unsplash.com/photo-1554068865-24cecd4e34b8?auto=format&fit=crop&w=800&q=80',
            linkTo: '/paletas?marca=Siux',
            precio: 290,
            fecha: 'Disponible Ya',
          },
          {
            id: 'l3',
            titulo: 'Wilson Bela Pro V2.5: La leyenda de Fernando Belasteguín en su máxima versión',
            subtitulo: 'Wilson • Serie Exclusiva',
            etiqueta: 'LANZAMIENTO',
            imagenUrl:
              'https://images.unsplash.com/photo-1599586120429-48281b6f0ece?auto=format&fit=crop&w=800&q=80',
            linkTo: '/paletas?marca=Wilson',
            precio: 340,
            fecha: 'Preventa',
          },
          {
            id: 'l4',
            titulo: 'Bullpadel Flow Woman 2026 Alejandra Salazar: Ligereza y control total',
            subtitulo: 'Bullpadel • Pro Line',
            etiqueta: 'LANZAMIENTO',
            imagenUrl:
              'https://images.unsplash.com/photo-1517649763962-0c623266ddc0?auto=format&fit=crop&w=800&q=80',
            linkTo: '/paletas?marca=Bullpadel',
            precio: 270,
            fecha: 'Nuevo',
          },
        ];

        // 4. Carrusel: Nuevas paletas agregadas al catálogo (con navegación directa a /paletas/:id)
        const mockCatalogo: CarouselCardItem[] = palas.map((pala: Pala) => ({
          id: `cat-${pala.id}`,
          titulo: `${pala.marcaNombre} ${pala.modelo}`,
          subtitulo: `${pala.forma} • ${pala.materialCaras}`,
          etiqueta: 'NUEVA EN CATÁLOGO',
          imagenUrl:
            pala.imagenUrl ||
            'https://images.unsplash.com/photo-1554068865-24cecd4e34b8?auto=format&fit=crop&w=800&q=80',
          linkTo: `/paletas/${pala.id}`,
          rating: pala.puntuacionGeneral || 9.1,
          precio: pala.precioReferencia || 280,
        }));

        if (isMounted) {
          setPaletasNuevas(mockPaletasNuevas);
          setDeLaComunidad(mockComunidad);
          setNuevosLanzamientos(mockNuevosLanzamientos);
          setCatalogoReciente(
            mockCatalogo.length > 0
              ? mockCatalogo
              : [
                {
                  id: 1,
                  titulo: 'Bullpadel Vertex 04 2026',
                  subtitulo: 'Diamante • Carbono 12K',
                  etiqueta: 'NUEVA EN CATÁLOGO',
                  imagenUrl:
                    'https://images.unsplash.com/photo-1554068865-24cecd4e34b8?auto=format&fit=crop&w=800&q=80',
                  linkTo: '/paletas/1',
                  rating: 9.6,
                  precio: 310,
                },
                {
                  id: 2,
                  titulo: 'Nox AT10 Luxury Genius 18K',
                  subtitulo: 'Lágrima • Carbono 18K',
                  etiqueta: 'NUEVA EN CATÁLOGO',
                  imagenUrl:
                    'https://images.unsplash.com/photo-1599586120429-48281b6f0ece?auto=format&fit=crop&w=800&q=80',
                  linkTo: '/paletas/2',
                  rating: 9.8,
                  precio: 330,
                },
                {
                  id: 3,
                  titulo: 'Babolat Technical Viper',
                  subtitulo: 'Diamante • Carbono 3K',
                  etiqueta: 'NUEVA EN CATÁLOGO',
                  imagenUrl:
                    'https://images.unsplash.com/photo-1544919982-b61976f0ba43?auto=format&fit=crop&w=800&q=80',
                  linkTo: '/paletas/3',
                  rating: 9.3,
                  precio: 295,
                },
                {
                  id: 4,
                  titulo: 'Head Extreme Pro',
                  subtitulo: 'Diamante • Híbrido',
                  etiqueta: 'NUEVA EN CATÁLOGO',
                  imagenUrl:
                    'https://images.unsplash.com/photo-1530549387789-4c1017266635?auto=format&fit=crop&w=800&q=80',
                  linkTo: '/paletas/4',
                  rating: 9.1,
                  precio: 285,
                },
              ]
          );
        }
      } catch (err) {
        console.error('Error cargando secciones:', err);
      } finally {
        if (isMounted) setLoading(false);
      }
    }

    loadAllSections();

    return () => {
      isMounted = false;
    };
  }, []);

  return (
    <div className="w-full flex flex-col gap-8 animate-fade-in pb-12">
      {/* LAYOUT PRINCIPAL: Columna con Hero + Carruseles y Sidebar derecha simétrica */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        {/* COLUMNA PRINCIPAL (8 columnas en desktop): Hero Editorial y Secciones */}
        <div className="lg:col-span-8 xl:col-span-8 flex flex-col gap-8">
          {/* 1. CARD DESTACADA HERO: Editorial Swiss adaptativo y simétrico con la sidebar */}
          <section className="relative w-full rounded-3xl overflow-hidden min-h-[380px] sm:min-h-[400px] flex items-end border border-white/10 shadow-2xl bg-zinc-950 group">
            <img
              src="https://images.unsplash.com/photo-1554068865-24cecd4e34b8?auto=format&fit=crop&w=1600&q=85"
              alt="Palantica Editorial Pádel"
              className="absolute inset-0 w-full h-full object-cover transition-transform duration-700 ease-out group-hover:scale-105"
            />

            {/* Gradiente cinemático suave */}
            <div className="absolute inset-0 bg-gradient-to-t from-black via-black/60 to-transparent sm:bg-gradient-to-r sm:from-black/50 sm:via-black/75 sm:to-black/90 pointer-events-none" />

            {/* Contenido adaptado al ancho */}
            <div className="relative z-10 w-full p-6 sm:p-8 flex flex-col sm:flex-row sm:items-end justify-between gap-6">
              <div className="max-w-xl">
                <h1
                  ref={heroTitleRef}
                  className="font-black tracking-tight text-white leading-tight drop-shadow-md text-2xl sm:text-3xl lg:text-4xl"
                >
                  La Guía Definitiva de Palas 2026: Dureza, Balances y Comportamiento Térmico
                </h1>

                <p className="mt-3 text-sm sm:text-base text-zinc-200 line-clamp-2 max-w-lg font-medium">
                  Analizamos la física y el tacto sensorial de cada goma EVA y trenzado de carbono en pista para encontrar la pala exacta según tu estilo y clima.
                </p>
              </div>

              <div className="flex items-center gap-3">
                <Link
                  to="/paletas"
                  className="inline-flex items-center gap-2 px-5 py-2.5 rounded-full bg-emerald-500 text-zinc-950 font-extrabold text-xs sm:text-sm hover:bg-emerald-400 transition-all shadow-lg shadow-emerald-500/25 active:scale-95 whitespace-nowrap"
                >
                  <span>Explorar Catálogo</span>
                  <ArrowUpRight size={16} />
                </Link>
              </div>
            </div>
          </section>

          {/* Carruseles de Paletas */}
          <div className="flex flex-col gap-10">
            {/* Carrusel 1: Paletas nuevas */}
            <Carousel
              titulo="Paletas nuevas"
              items={paletasNuevas}
              verTodoLink="/paletas"
              loading={loading}
            />

            {/* Carrusel 2: De la comunidad (con filtros HOY, SEMANA, MES) */}
            <Carousel
              titulo="De la comunidad"
              items={deLaComunidad}
              verTodoLink="/feed"
              filtros={['HOY', 'SEMANA', 'MES']}
              filtroActivo={filtroComunidad}
              onFiltroChange={(f) => setFiltroComunidad(f)}
              loading={loading}
            />

            {/* Carrusel 3: Nuevos lanzamientos */}
            <Carousel
              titulo="Nuevos lanzamientos"
              items={nuevosLanzamientos}
              verTodoLink="/paletas"
              loading={loading}
            />

            {/* Carrusel 4: Nuevas paletas en el catálogo */}
            <Carousel
              titulo="Nuevas paletas"
              items={catalogoReciente}
              verTodoLink="/paletas"
              loading={loading}
            />
          </div>
        </div>

        {/* SIDEBAR DERECHA (4 columnas en desktop): Estadísticas (Foto 1) y Últimas Reseñas */}
        <aside className="lg:col-span-4 xl:col-span-4 flex flex-col gap-6 sticky top-24">
          {/* Bloque 1: Enciclopedia de Paletas (Estadísticas inspiradas en Fragrantica) */}
          <div className="p-5 sm:p-6 rounded-3xl bg-[var(--bg-surface)] border border-white/10 shadow-lg flex flex-col gap-4">
            <div className="flex items-center justify-between border-b border-white/10 pb-3">
              <div className="flex items-center gap-2">
                <Layers className="text-emerald-400" size={18} />
                <h3 className="text-base font-black tracking-tight text-white m-0">
                  Enciclopedia de Paletas
                </h3>
              </div>
              <span className="flex items-center gap-1 text-[11px] font-bold text-emerald-400">
                <Radio size={12} className="animate-pulse" />
                En vivo
              </span>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div className="p-3 rounded-2xl bg-zinc-900/80 border border-white/5 flex flex-col">
                <span className="text-[11px] font-bold text-zinc-400 uppercase tracking-wider">
                  Total de Paletas
                </span>
                <span className="text-2xl font-black text-white tracking-tight mt-0.5">
                  148
                </span>
                <span className="text-[10px] text-emerald-400 mt-1 font-medium">
                  +12 este mes
                </span>
              </div>

              <div className="p-3 rounded-2xl bg-zinc-900/80 border border-white/5 flex flex-col">
                <span className="text-[11px] font-bold text-zinc-400 uppercase tracking-wider">
                  Reseñas Reales
                </span>
                <span className="text-2xl font-black text-white tracking-tight mt-0.5">
                  1,420
                </span>
                <span className="text-[10px] text-zinc-400 mt-1 font-medium">
                  100% verificadas
                </span>
              </div>

              <div className="p-3 rounded-2xl bg-zinc-900/80 border border-white/5 flex flex-col">
                <span className="text-[11px] font-bold text-zinc-400 uppercase tracking-wider">
                  Jugadores
                </span>
                <span className="text-2xl font-black text-white tracking-tight mt-0.5">
                  3,850
                </span>
                <span className="text-[10px] text-emerald-400 mt-1 font-medium">
                  Comunidad activa
                </span>
              </div>

              <div className="p-3 rounded-2xl bg-zinc-900/80 border border-white/5 flex flex-col">
                <span className="text-[11px] font-bold text-zinc-400 uppercase tracking-wider">
                  En línea ahora
                </span>
                <span className="text-2xl font-black text-emerald-400 tracking-tight mt-0.5">
                  64
                </span>
                <span className="text-[10px] text-zinc-400 mt-1 font-medium">
                  Debatiendo
                </span>
              </div>
            </div>

            <Link
              to="/paletas"
              className="w-full mt-1 py-2.5 rounded-xl bg-zinc-800 hover:bg-zinc-700 text-center text-xs font-bold text-white transition-colors flex items-center justify-center gap-1.5"
            >
              <span>Explorar Fichas Técnicas</span>
              <ChevronRight size={14} />
            </Link>
          </div>

          {/* Bloque 2: Últimas reseñas */}
          <div className="p-5 rounded-3xl bg-[var(--bg-surface)] border border-white/10 shadow-lg flex flex-col gap-4">
            <div className="flex items-center justify-between border-b border-white/10 pb-3">
              <div className="flex items-center gap-2">
                <Star className="text-amber-400 fill-amber-400/20" size={18} />
                <h3 className="text-base font-black tracking-tight text-white m-0">
                  Últimas Reseñas
                </h3>
              </div>
              <Link
                to="/paletas"
                className="text-xs font-bold text-emerald-400 hover:text-emerald-300"
              >
                Ver todas
              </Link>
            </div>

            <div className="flex flex-col gap-3.5">
              {[
                {
                  pala: 'Bullpadel Vertex 04',
                  marca: 'Bullpadel',
                  autor: 'Juan Ignacio M.',
                  avatar: 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&w=120&q=80',
                  puntuacion: 9.5,
                  comentario: 'Increíble salida de pared y la goma no pierde tacto en calor.',
                  tiempo: 'Hace 25 min',
                  link: '/paletas/1',
                  imagenPala: 'https://noxsport.es/cdn/shop/files/PALA_NOX_AT10_GENIUS_18K_BY_AGUSTIN_TAPIA_2025_01.png',
                },
                {
                  pala: 'Nox AT10 18K Alum',
                  marca: 'Nox',
                  autor: 'Mariano B.',
                  avatar: 'https://images.unsplash.com/photo-1570295999919-56ceb5ecca61?auto=format&fit=crop&w=120&q=80',
                  puntuacion: 9.8,
                  comentario: 'La pala más maniobrable que probé en red. El balance es perfecto.',
                  tiempo: 'Hace 2 h',
                  link: '/paletas/2',
                  imagenPala: 'https://noxsport.es/cdn/shop/files/PALA_NOX_AT10_GENIUS_18K_BY_AGUSTIN_TAPIA_2025_01.png',
                },
                {
                  pala: 'Siux Electra ST3',
                  marca: 'Siux',
                  autor: 'Sofía V.',
                  avatar: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&w=120&q=80',
                  puntuacion: 9.2,
                  comentario: 'Tacto medio-duro muy firme. Para rematar por tres es letal.',
                  tiempo: 'Hace 4 h',
                  link: '/paletas/3',
                  imagenPala: 'https://noxsport.es/cdn/shop/files/PALA_NOX_AT10_GENIUS_18K_BY_AGUSTIN_TAPIA_2025_01.png',
                },
              ].map((res, i) => (
                <Link
                  key={i}
                  to={res.link}
                  className="p-3.5 sm:p-4 rounded-2xl bg-zinc-900/60 hover:bg-zinc-800/80 border border-white/5 hover:border-emerald-500/30 transition-all flex items-center gap-3.5 group min-h-[116px]"
                >
                  {/* Imagen de la paleta en pedestal con iluminación superior */}
                  <div className="w-20 h-24 sm:w-22 sm:h-26 rounded-xl bg-gradient-to-b from-zinc-800 to-zinc-950 flex items-center justify-center p-1.5 border border-white/10 flex-shrink-0 relative overflow-hidden group-hover:border-emerald-500/40 transition-colors shadow-inner">
                    <img
                      src={res.imagenPala}
                      alt={res.pala}
                      className="w-full h-full object-contain filter drop-shadow-[0_4px_8px_rgba(0,0,0,0.6)] group-hover:scale-110 transition-transform duration-300"
                    />
                  </div>

                  {/* Información detallada de la reseña */}
                  <div className="flex-1 min-w-0 flex flex-col justify-between h-full py-0.5">
                    <div>
                      <div className="flex items-center justify-between gap-2">
                        <span className="text-xs font-black text-white group-hover:text-emerald-400 transition-colors truncate">
                          {res.pala}
                        </span>
                        <span className="flex items-center gap-1 text-xs font-black text-amber-400 flex-shrink-0">
                          <Star size={12} className="fill-amber-400 text-amber-400" />
                          {res.puntuacion}
                        </span>
                      </div>
                      <span className="text-[10px] font-bold text-zinc-500 uppercase tracking-wider block mt-0.5">
                        {res.marca}
                      </span>
                    </div>

                    <p className="text-xs text-zinc-300 font-normal line-clamp-2 my-1 leading-relaxed">
                      "{res.comentario}"
                    </p>

                    <div className="flex items-center justify-between text-[11px] text-zinc-400 pt-1 border-t border-white/5">
                      <div className="flex items-center gap-1.5 truncate">
                        <img
                          src={res.avatar}
                          alt={res.autor}
                          className="w-4 h-4 rounded-full object-cover flex-shrink-0"
                        />
                        <span className="font-medium text-zinc-300 truncate text-[11px]">{res.autor}</span>
                      </div>
                      <span className="text-[10px] flex-shrink-0 text-zinc-500">{res.tiempo}</span>
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          </div>
        </aside>
      </div>
    </div>
  );
};
