import fs from 'node:fs'
import path from 'node:path'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'
import { defineConfig, loadEnv, type Plugin } from 'vite'

function newsApiDevPlugin(apiKey?: string): Plugin {
  let cache: { timestamp: number; data: any[] } | null = null
  let frozenNews: any[] | null = null
  let creditLimitUntil = 0
  const CACHE_TTL_MS = 30 * 60 * 1000 // 30 minutos
  const FROZEN_FILE_PATH = path.resolve(import.meta.dirname || process.cwd(), 'src/data/noticias_congeladas.json')

  // Cargar noticias congeladas previas si existen en disco
  try {
    if (fs.existsSync(FROZEN_FILE_PATH)) {
      const raw = fs.readFileSync(FROZEN_FILE_PATH, 'utf-8')
      const parsed = JSON.parse(raw)
      if (Array.isArray(parsed) && parsed.length > 0) {
        frozenNews = parsed
      }
    }
  } catch {
    // ignorar
  }

  return {
    name: 'palantica-news-dev-api',
    configureServer(server) {
      server.middlewares.use('/api/news', async (req, res, next) => {
        if (req.method !== 'GET') {
          return next()
        }

        const now = Date.now()

        // 1. DISYUNTOR DE CRÉDITOS ("Sin gastar de más"):
        // Si previamente se detectó límite de créditos, NO llamamos a la API y servimos
        // directamente las últimas noticias reales congeladas.
        if (now < creditLimitUntil) {
          console.warn('[NewsData.io Dev Server] Límite de créditos activo. Entregando últimas noticias congeladas sin gastar llamadas.')
          const dataToServe = frozenNews || cache?.data || []
          if (dataToServe.length > 0) {
            res.setHeader('Content-Type', 'application/json')
            res.setHeader('Cache-Control', 'public, s-maxage=3600, stale-while-revalidate=600')
            res.setHeader('X-Palantica-Quota-Status', 'Exceeded-Frozen')
            res.end(JSON.stringify(dataToServe))
            return
          }
        }

        // 2. Caché en memoria estándar (30 min)
        if (cache && now - cache.timestamp < CACHE_TTL_MS) {
          res.setHeader('Content-Type', 'application/json')
          res.setHeader('Cache-Control', 'public, s-maxage=1800, stale-while-revalidate=300')
          res.end(JSON.stringify(cache.data))
          return
        }

        const key = apiKey || process.env.NEWSDATA_API_KEY
        if (!key) {
          // Si no hay API key definida localmente, dejamos continuar al proxy o middleware siguiente
          return next()
        }

        try {
          const query = 'padel OR pádel'
          const url = `https://newsdata.io/api/1/latest?apikey=${encodeURIComponent(key)}&q=${encodeURIComponent(query)}&language=es`
          const apiRes = await fetch(url)

          // 1. Detección de límite de créditos por código HTTP (429 Too Many Requests)
          if (apiRes.status === 429) {
            console.warn('[NewsData.io Dev Server] Límite de créditos alcanzado (HTTP 429). Congelando últimas noticias y pausando llamadas por 6 horas.')
            creditLimitUntil = Date.now() + 6 * 60 * 60 * 1000
            const dataToServe = frozenNews || cache?.data || []
            if (dataToServe.length > 0) {
              res.setHeader('Content-Type', 'application/json')
              res.setHeader('X-Palantica-Quota-Status', 'Exceeded-Frozen')
              res.end(JSON.stringify(dataToServe))
              return
            }
          }

          if (!apiRes.ok) {
            console.warn('[NewsData.io Dev Server] Error HTTP de API externa:', apiRes.status)
            if (frozenNews && frozenNews.length > 0) {
              res.setHeader('Content-Type', 'application/json')
              res.end(JSON.stringify(frozenNews))
              return
            }
            return next()
          }

          const json = (await apiRes.json()) as any

          // 2. Detección de límite de créditos en cuerpo JSON (UsageLimitExceeded)
          if (json.status !== 'success' || !Array.isArray(json.results)) {
            const errStr = JSON.stringify(json.results || '').toLowerCase()
            if (errStr.includes('limit') || errStr.includes('credit') || errStr.includes('exceeded')) {
              console.warn('[NewsData.io Dev Server] Límite de créditos detectado en JSON. Congelando últimas noticias y pausando llamadas por 6 horas.')
              creditLimitUntil = Date.now() + 6 * 60 * 60 * 1000
              const dataToServe = frozenNews || cache?.data || []
              if (dataToServe.length > 0) {
                res.setHeader('Content-Type', 'application/json')
                res.setHeader('X-Palantica-Quota-Status', 'Exceeded-Frozen')
                res.end(JSON.stringify(dataToServe))
                return
              }
            }

            console.warn('[NewsData.io Dev Server] Respuesta sin status success o sin results.')
            if (frozenNews && frozenNews.length > 0) {
              res.setHeader('Content-Type', 'application/json')
              res.end(JSON.stringify(frozenNews))
              return
            }
            return next()
          }

          if (json.results.length > 0) {
            console.log('[NewsData.io DEBUG] Artículo real recibido:\n', json.results[0])
          }

          const seen = new Set<string>()
          const normalized: any[] = []

          function isPadelArticle(item: any): boolean {
            const title = (item.title || '').toLowerCase()
            const desc = (item.description || '').toLowerCase()
            const kw = Array.isArray(item.keywords) ? item.keywords.join(' ').toLowerCase() : ''
            const full = `${title} ${desc} ${kw}`

            // Descartar falsos positivos y otros deportes
            if (/f[uú]tbol playa|beach soccer|paddle surf|padel surf|stand[- ]up paddle/i.test(full)) return false
            if (/a la venta|chalet|finca de caza|piscina y pista|inmobiliaria|promoci[oó]n de viviendas/i.test(title)) return false
            if (/hobbies contra el estr[eé]s|estudi[eé] una fp|futbolista|dictador mubarak|alcalde|alcaldesa|ayuntamiento/i.test(title) && !/p[aá]del/i.test(title)) return false
            if (/^el pickleball/i.test(title) && !/torneo de p[aá]del/i.test(title)) return false

            const padelRegex = /\b(p[aá]del|premier padel|world padel tour|wpt|padelfip|rotterdam p2|madrid p1|paris major|qatar major|milano p1|hexagone cup|pro padel league|pala de p[aá]del|palas de p[aá]del|pista de p[aá]del|tapia|coello|gal[aá]n|lebr[oó]n|chingotto|stupaczuk|stupa|di nenno|paquito navarro|belastegu[ií]n|sanyo|javi leal|fran guerrero|mike yanguas|coki nieto|jon sanz|gemma triay|paula josemar[ií]a|ari s[aá]nchez|delfi brea|claudia fern[aá]ndez|marta ortega|bea gonz[aá]lez)\b/i

            if (padelRegex.test(title) || padelRegex.test(kw)) return true
            if (padelRegex.test(desc) && /cuadro|final|semifinal|partido|victoria|campe[oó]n|circuito|jugador|pareja|set|tie-break|torneo/i.test(title)) return true

            return false
          }

          for (const item of json.results) {
            if (!item.title || !item.link) continue
            // FILTRADO ESTRICTO: Solo noticias 100% de pádel
            if (!isPadelArticle(item)) continue

            const normTitle = item.title.trim().toLowerCase()
            const normLink = item.link.trim().toLowerCase()
            if (seen.has(normTitle) || seen.has(normLink)) continue
            seen.add(normTitle)
            seen.add(normLink)

            let desc = (item.description || '').trim()
            if (desc.length > 160) {
              const lastSpace = desc.lastIndexOf(' ', 160)
              desc = desc.substring(0, lastSpace > 130 ? lastSpace : 160).trim() + '...'
            }

            const cat =
              Array.isArray(item.category) && item.category.length > 0
                ? item.category[0]
                : typeof item.category === 'string'
                  ? item.category
                  : 'Pádel'

            const textForSection = `${item.title} ${item.description || ''}`.toLowerCase()
            let seccion = 'General'
            if (/circuito|world padel tour|wpt|premier padel|fip|ranking|asociaci[oó]n/.test(textForSection)) {
              seccion = 'Circuito profesional'
            } else if (/torneo|resultado|final|semifinal|cuadro|master|open|major|p1|p2/.test(textForSection)) {
              seccion = 'Torneos y resultados'
            } else if (
              /tapia|coello|gal[aá]n|lebr[oó]n|chingotto|stupa|di nenno|paquito|navarro|s[aá]nchez|josemar[ií]a|gonz[aá]lez|triay|brea|jugador|jugadora/.test(
                textForSection
              )
            ) {
              seccion = 'Jugadores'
            } else if (/pala|carbono|goma|eva|n[uú]cleo|zapatilla|overgrip|pelota|tubular|balance/.test(textForSection)) {
              seccion = 'Material y palas'
            } else if (/entrevista|mano a mano|declar|confiesa|afirma|hablamos con/.test(textForSection)) {
              seccion = 'Entrevistas'
            } else if (/opini[oó]n|columna|an[aá]lisis|editorial|debate|t[aá]ctica/.test(textForSection)) {
              seccion = 'Opinión'
            }

            normalized.push({
              id: item.article_id || `art-${normalized.length + 1}`,
              titulo: item.title.trim(),
              bajada: desc || 'Crónica y novedades del pádel profesional.',
              imagen: item.image_url || null,
              link: item.link.trim(),
              fuente: item.source_name || item.source_id || 'Medio de Pádel',
              fecha: item.pubDate || new Date().toISOString(),
              categoria: cat,
              seccion,
              destacada: false,
            })
          }

          // Si tras el filtrado quedan menos de 6 noticias, complementar con notas de pádel garantizadas
          const fallbackEditorialNews = [
            {
              id: 'fallback-01',
              titulo: 'la final se decidió en el tie-break del tercer set.',
              bajada: 'Tapia y Coello sellan una temporada histórica tras salvar tres match points en un Palau Sant Jordi enmudecido.',
              imagen: 'https://images.unsplash.com/photo-1612872087720-bb876e2e67d1?w=1200&auto=format&fit=crop&q=80',
              link: 'https://premierpadel.com',
              fuente: 'Premier Padel',
              fecha: new Date().toISOString(),
              categoria: 'Circuito Pro',
              seccion: 'Circuito profesional',
              destacada: false,
            },
            {
              id: 'fallback-02',
              titulo: 'adiós definitivo al carbono 24k en las palas de control.',
              bajada: 'Los laboratorios de ingeniería de materiales revelan por qué la rigidez extrema perjudica la salida de bola.',
              imagen: 'https://images.unsplash.com/photo-1595435934249-5df7ed86e1c0?w=1200&auto=format&fit=crop&q=80',
              link: 'https://noxsport.es',
              fuente: 'Palantica Lab',
              fecha: new Date().toISOString(),
              categoria: 'Material y Palas',
              seccion: 'Material y palas',
              destacada: false,
            },
            {
              id: 'fallback-03',
              titulo: 'el retorno del revés a dos manos en el circuito femenino.',
              bajada: 'Un análisis biomecánico de cómo la nueva generación de jugadoras gana tres décimas de segundo frente a la volea profunda.',
              imagen: 'https://images.unsplash.com/photo-1541534741688-6078c6bfb5c5?w=800&auto=format&fit=crop&q=80',
              link: 'https://padelmagazine.fr',
              fuente: 'Padel Magazine',
              fecha: new Date().toISOString(),
              categoria: 'Jugadores',
              seccion: 'Jugadores',
              destacada: false,
            },
            {
              id: 'fallback-04',
              titulo: 'doha confirma el major con mayor dotación económica de la historia.',
              bajada: 'La Federación Internacional oficializa el calendario de invierno con una parada millonaria en el Khalifa International Tennis Complex.',
              imagen: 'https://images.unsplash.com/photo-1563299796-17596ed6b017?w=800&auto=format&fit=crop&q=80',
              link: 'https://padelfip.com',
              fuente: 'FIP Oficial',
              fecha: new Date().toISOString(),
              categoria: 'Torneos y Resultados',
              seccion: 'Torneos y resultados',
              destacada: false,
            },
            {
              id: 'fallback-05',
              titulo: 'la obsesión por la potencia está arruinando la táctica pura.',
              bajada: '¿Por qué la reducción del punto dulce ha empobrecido la construcción del punto en favor del pegador puro en pistas ultrarrápidas?',
              imagen: 'https://images.unsplash.com/photo-1517649763962-0c623266ddc0?w=800&auto=format&fit=crop&q=80',
              link: 'https://marca.com/padel',
              fuente: 'Marca Pádel',
              fecha: new Date().toISOString(),
              categoria: 'Opinión',
              seccion: 'Opinión',
              destacada: false,
            },
            {
              id: 'fallback-06',
              titulo: 'hablamos con agustín tapia sobre el peso exacto de su pala.',
              bajada: 'El prodigio de Catamarca confiesa cómo tres gramos adicionales en la cabeza cambiaron por completo su aceleración aérea en el smash.',
              imagen: 'https://images.unsplash.com/photo-1574629810360-7efbbe195018?w=800&auto=format&fit=crop&q=80',
              link: 'https://as.com/padel',
              fuente: 'Diario AS Pádel',
              fecha: new Date().toISOString(),
              categoria: 'Entrevistas',
              seccion: 'Entrevistas',
              destacada: false,
            },
          ]

          if (normalized.length < 6) {
            for (const fb of fallbackEditorialNews) {
              const normFbTitle = fb.titulo.trim().toLowerCase()
              if (!seen.has(normFbTitle)) {
                seen.add(normFbTitle)
                normalized.push(fb)
                if (normalized.length >= 6) break
              }
            }
          }

          const conImgIdx = normalized.findIndex((n) => !!n.imagen)
          if (conImgIdx >= 0) {
            normalized[conImgIdx].destacada = true
          } else if (normalized.length > 0) {
            normalized[0].destacada = true
          }

          // Guardar y congelar noticias en memoria y en disco para no perderlas
          frozenNews = normalized
          try {
            fs.writeFileSync(FROZEN_FILE_PATH, JSON.stringify(normalized, null, 2), 'utf-8')
          } catch {
            // ignorar
          }
          creditLimitUntil = 0

          cache = { timestamp: now, data: normalized }

          res.setHeader('Content-Type', 'application/json')
          res.setHeader('Cache-Control', 'public, s-maxage=1800, stale-while-revalidate=300')
          res.end(JSON.stringify(normalized))
        } catch (err) {
          console.error('[NewsData.io Dev Server] Error al consultar API:', err)
          if (frozenNews && frozenNews.length > 0) {
            res.setHeader('Content-Type', 'application/json')
            res.end(JSON.stringify(frozenNews))
            return
          }
          next()
        }
      })
    },
  }
}

function padelApiDevPlugin(padelKey?: string): Plugin {
  let cache: { timestamp: number; data: any } | null = null
  const CACHE_TTL_MS = 60 * 60 * 1000 // 1 hora de caché

  return {
    name: 'palantica-padel-dev-api',
    configureServer(server) {
      server.middlewares.use('/api/padel/telemetry', async (req, res, next) => {
        if (req.method !== 'GET') {
          return next()
        }

        const now = Date.now()
        if (cache && now - cache.timestamp < CACHE_TTL_MS) {
          res.setHeader('Content-Type', 'application/json')
          res.setHeader('Cache-Control', 'public, s-maxage=3600, stale-while-revalidate=600')
          res.end(JSON.stringify(cache.data))
          return
        }

        const key = padelKey || process.env.PADEL_API
        if (!key) {
          return next()
        }

        try {
          const headers = { Authorization: `Bearer ${key}`, Accept: 'application/json' }
          const [rankingsRes, tournamentsRes] = await Promise.all([
            fetch('https://padelapi.org/api/rankings', { headers }),
            fetch('https://padelapi.org/api/tournaments', { headers }),
          ])

          if (!rankingsRes.ok || !tournamentsRes.ok) {
            console.warn('[PadelAPI Dev Server] Error HTTP de padelapi.org')
            return next()
          }

          const rankingsJson = (await rankingsRes.json()) as any
          const tournamentsJson = (await tournamentsRes.json()) as any

          const rawRankings = Array.isArray(rankingsJson.data) ? rankingsJson.data : []
          const topPlayers = rawRankings.slice(0, 6).map((p: any) => ({
            ranking: p.ranking,
            name: p.name,
            country: p.nationality,
            points: p.points,
          }))

          const rawTournaments = Array.isArray(tournamentsJson.data) ? tournamentsJson.data : []
          const nowStr = new Date().toISOString().split('T')[0]
          const upcoming =
            rawTournaments
              .filter((t: any) => t.start_date && t.start_date >= nowStr)
              .sort((a: any, b: any) => a.start_date.localeCompare(b.start_date))[0] || rawTournaments[0]

          const telemetryData = {
            rankings: {
              date: rawRankings[0]?.date || nowStr,
              topPlayers,
            },
            nextTournament: upcoming
              ? {
                  name: upcoming.name,
                  location: upcoming.location || upcoming.country,
                  startDate: upcoming.start_date,
                  endDate: upcoming.end_date,
                  level: (upcoming.level || '').toUpperCase(),
                }
              : null,
            totalTournaments: rawTournaments.length,
          }

          cache = { timestamp: now, data: telemetryData }

          res.setHeader('Content-Type', 'application/json')
          res.setHeader('Cache-Control', 'public, s-maxage=3600, stale-while-revalidate=600')
          res.end(JSON.stringify(telemetryData))
        } catch (err) {
          console.error('[PadelAPI Dev Server] Error:', err)
          next()
        }
      })
    },
  }
}

// https://vite.dev/config/
export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd(), '')
  const newsKey = env.NEWSDATA_API_KEY || process.env.NEWSDATA_API_KEY
  const padelKey = env.PADEL_API || process.env.PADEL_API

  return {
    plugins: [react(), tailwindcss(), newsApiDevPlugin(newsKey), padelApiDevPlugin(padelKey)],
    server: {
      proxy: {
        // Redirige llamadas a la API de .NET en desarrollo si el middleware local no las resuelve
        '/api': {
          target: 'http://localhost:5007',
          changeOrigin: true,
        },
      },
    },
  }
})
