export interface TopPlayer {
  ranking: number;
  name: string;
  country: string;
  points: number;
  pala?: string;
  palaSlug?: string;
  fotoUrl?: string;
  mano?: string;
  victorias?: string;
}

export interface UpcomingTournament {
  id?: string;
  name: string;
  location: string;
  startDate: string;
  endDate?: string;
  level: string;
  prize?: string;
  surface?: string;
  imageUrl?: string;
  descripcion?: string;
  featured?: boolean;
}

export interface PadelTelemetry {
  rankings: {
    topPlayers: TopPlayer[];
    date: string;
  };
  nextTournament?: UpcomingTournament;
  upcomingTournaments?: UpcomingTournament[];
  totalTournaments: number;
}

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:5007';

export const fallbackTelemetry: PadelTelemetry = {
  rankings: {
    date: '2026-10-21',
    topPlayers: [
      {
        ranking: 1,
        name: 'Agustín Tapia',
        country: 'AR',
        points: 20383,
        pala: 'Nox AT10 Luxury Genius 18K Alum 2026',
        palaSlug: 'nox-at10-luxury-genius-18k-alum-xtrem-2027-agustin-tapia',
        fotoUrl: 'https://images.unsplash.com/photo-1599586120429-48281b6f0ece?w=800&auto=format&fit=crop&q=80',
        mano: 'Revés',
        victorias: '92%'
      },
      {
        ranking: 1,
        name: 'Arturo Coello',
        country: 'ES',
        points: 20383,
        pala: 'Head Extreme Pro 2026',
        palaSlug: 'head-extreme-pro',
        fotoUrl: 'https://images.unsplash.com/photo-1530549387789-4c1017266635?w=800&auto=format&fit=crop&q=80',
        mano: 'Drive / Zurdo',
        victorias: '92%'
      },
      {
        ranking: 3,
        name: 'Alejandro Galán',
        country: 'ES',
        points: 18006,
        pala: 'Adidas Metalbone 3.3 HRD 2026',
        palaSlug: 'adidas-metalbone-3-3',
        fotoUrl: 'https://images.unsplash.com/photo-1517649763962-0c623266ddc0?w=800&auto=format&fit=crop&q=80',
        mano: 'Revés',
        victorias: '88%'
      },
      {
        ranking: 3,
        name: 'Federico Chingotto',
        country: 'AR',
        points: 18006,
        pala: 'Bullpadel Neuron 2026',
        palaSlug: 'bullpadel-vertex-04-2025',
        fotoUrl: 'https://images.unsplash.com/photo-1554068865-24cecd4e34b8?w=800&auto=format&fit=crop&q=80',
        mano: 'Drive',
        victorias: '88%'
      },
      {
        ranking: 5,
        name: 'Juan Lebrón',
        country: 'ES',
        points: 12450,
        pala: 'Babolat Technical Viper 2026',
        palaSlug: 'babolat-technical-viper-2025',
        fotoUrl: 'https://images.unsplash.com/photo-1544919982-b61976f0ba43?w=800&auto=format&fit=crop&q=80',
        mano: 'Revés / Drive',
        victorias: '82%'
      },
      {
        ranking: 6,
        name: 'Franco Stupaczuk',
        country: 'AR',
        points: 11200,
        pala: 'Siux Electra ST3 Pro 2026',
        palaSlug: 'siux-electra-st3-pro',
        fotoUrl: 'https://images.unsplash.com/photo-1570295999919-56ceb5ecca61?w=800&auto=format&fit=crop&q=80',
        mano: 'Revés',
        victorias: '79%'
      },
      {
        ranking: 1,
        name: 'Paula Josemaría',
        country: 'ES',
        points: 21100,
        pala: 'Head Speed Motion 2026',
        palaSlug: 'head-extreme-pro',
        fotoUrl: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=800&auto=format&fit=crop&q=80',
        mano: 'Drive / Zurda',
        victorias: '94%'
      },
      {
        ranking: 1,
        name: 'Ariana Sánchez',
        country: 'ES',
        points: 21100,
        pala: 'Head Speed Pro 2026',
        palaSlug: 'head-extreme-pro',
        fotoUrl: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=800&auto=format&fit=crop&q=80',
        mano: 'Revés',
        victorias: '94%'
      }
    ],
  },
  nextTournament: {
    name: 'Kuwait City Premier Padel P1',
    location: 'Kuwait City, Kuwait',
    startDate: '2026-10-26',
    endDate: '2026-11-01',
    level: 'P1',
    prize: '470.000 €',
    surface: 'Indoor Cristal Rápido',
  },
  upcomingTournaments: [
    {
      id: 'tourn-1',
      name: 'Kuwait City Premier Padel P1',
      location: 'Kuwait City, Kuwait',
      startDate: '2026-10-26',
      endDate: '2026-11-01',
      level: 'P1',
      prize: '470.000 €',
      surface: 'Indoor Cristal Rápido',
      imageUrl: 'https://images.unsplash.com/photo-1554068865-24cecd4e34b8?w=1000&auto=format&fit=crop&q=80',
      descripcion: 'El circuito aterriza en el Golfo Pérsico con las mejores 48 parejas masculinas y 32 femeninas luchando por 1.000 puntos FIP.'
    },
    {
      id: 'tourn-2',
      name: 'Dubai Premier Padel P1',
      location: 'Dubai, EAU',
      startDate: '2026-11-03',
      endDate: '2026-11-09',
      level: 'P1',
      prize: '470.000 €',
      surface: 'Outdoor Pista Panorámica',
      imageUrl: 'https://images.unsplash.com/photo-1517649763962-0c623266ddc0?w=1000&auto=format&fit=crop&q=80',
      descripcion: 'Segundo torneo de la gira asiática en el Dubai Duty Free Tennis Stadium con clima templado.'
    },
    {
      id: 'tourn-3',
      name: 'GNP Mexico Premier Padel Major',
      location: 'Acapulco, México',
      startDate: '2026-11-23',
      endDate: '2026-11-29',
      level: 'MAJOR',
      prize: '600.000 €',
      surface: 'Arena GNP Seguros',
      imageUrl: 'https://images.unsplash.com/photo-1541534741688-6078c6bfb5c5?w=1000&auto=format&fit=crop&q=80',
      descripcion: 'El cuarto y último Major de la temporada en la cuna del pádel con 2.000 puntos en disputa.'
    },
    {
      id: 'tourn-4',
      name: 'Milano Premier Padel P1',
      location: 'Milán, Italia',
      startDate: '2026-12-01',
      endDate: '2026-12-07',
      level: 'P1',
      prize: '470.000 €',
      surface: 'Allianz Cloud Indoor',
      imageUrl: 'https://images.unsplash.com/photo-1595435934249-5df7ed86e1c0?w=1000&auto=format&fit=crop&q=80',
      descripcion: 'El torneo bajo techo más vibrante de Europa antes del gran Tour Finals en Milán.'
    },
    {
      id: 'tourn-5',
      name: 'Barcelona Tour Finals 2026',
      location: 'Barcelona, España',
      startDate: '2026-12-16',
      endDate: '2026-12-20',
      level: 'FINALS',
      prize: '750.000 €',
      surface: 'Palau Sant Jordi',
      imageUrl: 'https://images.unsplash.com/photo-1530549387789-4c1017266635?w=1000&auto=format&fit=crop&q=80',
      descripcion: 'El torneo de maestros con las 8 mejores parejas del año compitiendo por la corona mundial.'
    }
  ],
  totalTournaments: 25,
};

class PadelService {
  public async getTelemetry(): Promise<PadelTelemetry> {
    try {
      // 1. Intentar backend .NET directo
      try {
        const directResp = await fetch(`${API_BASE_URL}/api/padel/telemetry`, {
          headers: { Accept: 'application/json' },
        });
        if (directResp.ok) {
          return await directResp.json();
        }
      } catch (directErr) {
        console.warn('[PadelService] Backend directo no disponible:', directErr);
      }

      // 2. Intentar endpoint relativo /api/padel/telemetry (Vite proxy)
      try {
        const resp = await fetch('/api/padel/telemetry', {
          headers: { Accept: 'application/json' },
        });
        if (resp.ok) {
          return await resp.json();
        }
      } catch (relErr) {
        console.warn('[PadelService] Endpoint relativo no disponible:', relErr);
      }

      return fallbackTelemetry;
    } catch {
      return fallbackTelemetry;
    }
  }
}

export const padelService = new PadelService();
