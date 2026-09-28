/**
 * Tipos de datos fundamentales para la plataforma Palantica.
 */

export type FormaPala = 'Redonda' | 'Lagrima' | 'Diamante' | string;
export type EstacionOptima = 'Verano' | 'Invierno' | 'TodoAno' | string;
export type NivelJuego = 'Iniciacion' | 'Intermedio' | 'Avanzado' | 'Competicion' | string;
export type LadoPista = 'Drive' | 'Reves' | 'Indistinto' | string;

export interface Marca {
  id: number;
  nombre: string;
  paisOrigen: string;
  sitioWeb?: string | null;
  logoUrl?: string | null;
  totalPalas: number;
}

export interface Pala {
  id: number;
  marcaId: number;
  marcaNombre: string;
  marcaLogoUrl?: string | null;
  modelo: string;
  forma: FormaPala;
  balanceMm: number;
  pesoMin: number;
  pesoMax: number;
  materialNucleo: string;
  materialCaras: string;
  superficieRugosa: string;
  estacionOptima: EstacionOptima;
  precioReferencia: number;
  monedaPrecio?: string;
  fuentePrecio?: string;
  puntuacionGeneral: number;
  durezaPromedio: number;
  potenciaPromedio: number;
  controlPromedio: number;
  imagenUrl?: string | null;
  anoLanzamiento: number;
  jugadorPro?: string | null;
  totalResenas: number;
  totalVotos: number;
}

export interface PalaSimilar {
  id: number;
  marcaId: number;
  marcaNombre: string;
  modelo: string;
  forma: string;
  materialCaras: string;
  materialNucleo: string;
  imagenUrl?: string | null;
  precioReferencia: number;
  monedaPrecio?: string;
  fuentePrecio?: string;
  puntuacionGeneral: number;
  durezaPromedio: number;
  similitudPorcentaje: number;
  distanciaVectorial: number;
}

export interface PalaDetalle extends Pala {
  marcaPais: string;
  marcaSitioWeb?: string | null;
  salidaBolaPromedio: number;
  maniobrabilidadPromedio: number;
  puntoDulcePromedio: number;
  confortPromedio: number;
  descripcion?: string | null;
  palasSimilares?: PalaSimilar[];
}

export interface ShopifyPalaPreview {
  marca: string;
  modelo: string;
  forma: string;
  balanceMm: number;
  materialNucleo: string;
  materialCaras: string;
  precio: number;
  moneda: string;
  imagenUrl?: string;
  descripcion?: string;
  jugadorPro?: string;
  fuenteTienda: string;
}

export interface ShopifySyncResult {
  storeUrl: string;
  totalEncontrados: number;
  totalImportados: number;
  totalOmitidos: number;
  palasSincronizadas: ShopifyPalaPreview[];
}

export interface PalaFilterParams {
  search?: string;
  marca?: string;
  forma?: string;
  estacion?: string;
  durezaMin?: number;
  durezaMax?: number;
  precioMin?: number;
  precioMax?: number;
  orderBy?: 'puntuacion' | 'precio_asc' | 'precio_desc' | 'novedad' | 'dureza' | string;
  page?: number;
  pageSize?: number;
}

export interface Resena {
  id: number;
  palaId: number;
  usuarioId: number;
  usuarioNombre: string;
  usuarioNivelJuego: string;
  usuarioAvatarUrl?: string | null;
  puntuacion: number;
  titulo: string;
  contenido: string;
  ladoPista: string;
  tiempoUso: string;
  fechaPublicacion: string;
}

export interface ResenaCreateRequest {
  puntuacion: number;
  titulo: string;
  contenido: string;
  ladoPista?: string;
  tiempoUso?: string;
}

export interface VotoCreateRequest {
  durezaPercibida: number;
  potencia: number;
  control: number;
  salidaBola: number;
  maniobrabilidad: number;
  puntoDulce: number;
  confort: number;
  estacionRecomendada?: string;
}

export interface VotacionResumen {
  palaId: number;
  durezaPromedio: number;
  potenciaPromedio: number;
  controlPromedio: number;
  salidaBolaPromedio: number;
  maniobrabilidadPromedio: number;
  puntoDulcePromedio: number;
  confortPromedio: number;
  totalVotos: number;
  votosVerano: number;
  votosInvierno: number;
  votosTodoAno: number;
  estacionDominante: string;
}

export type CategoriaPaletero =
  | 'Usando actualmente'
  | 'En el paletero'
  | 'Palas que tuve'
  | 'Palas que quiero';

export interface PaleteroItem {
  id: number;
  usuarioId: number;
  palaId: number;
  palaModelo: string;
  palaMarca: string;
  palaForma: string;
  palaImagenUrl?: string | null;
  palaPuntuacionGeneral: number;
  palaDurezaPromedio: number;
  palaPrecioReferencia: number;
  categoria: CategoriaPaletero;
  notas?: string | null;
  fechaRegistro: string;
}

export interface MiPaleteroGrouped {
  usandoActualmente: PaleteroItem[];
  enElPaletero: PaleteroItem[];
  palasQueTuve: PaleteroItem[];
  palasQueQuiero: PaleteroItem[];
}

export interface PadelgramPost {
  id: number;
  usuarioId: number;
  usuarioNombre: string;
  usuarioAvatarUrl?: string | null;
  palaId: number;
  palaModelo: string;
  palaMarca: string;
  imagenUrl: string;
  descripcion?: string | null;
  ubicacion?: string | null;
  likesCount: number;
  fechaPublicacion: string;
}

export interface Noticia {
  id: string;
  titulo: string;
  resumen: string;
  contenido?: string | null;
  categoria: string;
  fuente: string;
  urlFuente?: string | null;
  imagenUrl?: string | null;
  fechaPublicacion: string;
  tiempoLecturaMinutos: number;
  tags: string[];
}

export interface Usuario {
  id: number;
  email: string;
  nombre: string;
  rol: string;
  nivelJuego: string;
  ladoPistaPreferido: string;
  avatarUrl?: string | null;
}

export interface PerfilUsuario extends Usuario {
  palaActivaId?: number | null;
  palaActivaModelo?: string | null;
  palaActivaMarca?: string | null;
  fechaRegistro: string;
  totalResenas: number;
  totalVotos: number;
  totalPaletero: number;
  totalPadelgramPosts: number;
}

export interface AuthResponse {
  token: string;
  id: number;
  email: string;
  nombre: string;
  rol: string;
  nivelJuego: string;
  ladoPistaPreferido: string;
  avatarUrl?: string | null;
}

export interface PagedResponse<T> {
  items: T[];
  page: number;
  pageSize: number;
  totalCount: number;
  totalPages: number;
  hasNextPage: boolean;
  hasPreviousPage: boolean;
}
