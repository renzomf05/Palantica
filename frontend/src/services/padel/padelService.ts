export interface TopPlayer {
  ranking: number;
  name: string;
  country: string;
  points: number;
}

export interface UpcomingTournament {
  name: string;
  location: string;
  startDate: string;
  endDate?: string;
  level: string;
}

export interface PadelTelemetry {
  rankings: {
    topPlayers: TopPlayer[];
    date: string;
  };
  nextTournament?: UpcomingTournament;
  totalTournaments: number;
}

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:5007';

export const fallbackTelemetry: PadelTelemetry = {
  rankings: {
    date: '2026-09-28',
    topPlayers: [
      { ranking: 1, name: 'Agustín Tapia', country: 'AR', points: 20383 },
      { ranking: 1, name: 'Arturo Coello', country: 'ES', points: 20383 },
      { ranking: 3, name: 'Alejandro Galán', country: 'ES', points: 18006 },
      { ranking: 3, name: 'Federico Chingotto', country: 'AR', points: 18006 },
    ],
  },
  nextTournament: {
    name: 'Kuwait P1 2026',
    location: 'Kuwait City',
    startDate: '2026-10-26',
    endDate: '2026-11-01',
    level: 'P1',
  },
  totalTournaments: 15,
};

class PadelService {
  public async getTelemetry(): Promise<PadelTelemetry> {
    try {
      // 1. Intentar endpoint relativo /api/padel/telemetry (Vite dev middleware o reverse proxy)
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

      // 2. Intentar backend .NET directo
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

      return fallbackTelemetry;
    } catch {
      return fallbackTelemetry;
    }
  }
}

export const padelService = new PadelService();
