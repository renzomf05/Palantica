import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const jsonPath = path.resolve(__dirname, '../backend/Palantica.Api/Features/Padelful/padelful_rackets.json');
const sqlOutputPath = path.resolve(__dirname, '../backend/Palantica.Api/Migrations/004_SeedCatalogoPalas.sql');

if (!fs.existsSync(jsonPath)) {
  console.error(`❌ No se encontró el archivo de datos en: ${jsonPath}`);
  process.exit(1);
}

const rawData = JSON.parse(fs.readFileSync(jsonPath, 'utf8'));
console.log(`📦 Leídas ${rawData.length} palas desde ${path.basename(jsonPath)}`);

function escapeSqlString(str) {
  if (str === null || str === undefined) return 'NULL';
  return `'${String(str).replace(/'/g, "''")}'`;
}

function escapeSqlNumber(num, defaultVal = 0) {
  if (num === null || num === undefined || isNaN(Number(num))) return defaultVal;
  return Number(num);
}

// 1. Limpieza estricta: Transformar eliminando cualquier texto descriptivo/narrativo
const cleanRecords = rawData.map(pala => ({
  slug: pala.slug,
  marca: pala.marca || 'Genérica',
  modelo: pala.modelo || pala.slug,
  forma: pala.forma || 'Lagrima',
  balance_mm: escapeSqlNumber(pala.balanceMm, 265),
  balance_nivel: pala.balanceNivel || 'Medio',
  material_nucleo: pala.materialNucleo || null,
  material_caras: pala.materialCaras || null,
  dureza_nivel: pala.durezaNivel || 'Media',
  dureza_score: escapeSqlNumber(pala.durezaScore, 5.0),
  potencia_score: escapeSqlNumber(pala.potenciaScore, 5.0),
  control_score: escapeSqlNumber(pala.controlScore, 5.0),
  salida_bola_score: escapeSqlNumber(pala.salidaBolaScore, 5.0),
  maniobrabilidad_score: escapeSqlNumber(pala.maniobrabilidadScore, 5.0),
  punto_dulce_score: escapeSqlNumber(pala.puntoDulceScore, 5.0),
  puntuacion_general: escapeSqlNumber(pala.puntuacionGeneral, 5.0),
  precio: escapeSqlNumber(pala.precio, 0.00),
  moneda: pala.moneda || 'EUR',
  imagen_url: pala.imagenUrl || null,
  jugador_pro: pala.jugadorPro || null,
  ano_lanzamiento: escapeSqlNumber(pala.anoLanzamiento, 2025),
  fuente_original: pala.fuenteOriginal || null
  // NOTA: descripcion fue omitida intencionalmente para evitar conflictos de autoría y optimizar storage.
}));

console.log(`✨ ${cleanRecords.length} registros purificados técnica y legalmente (0 descripciones).`);

// 2. Generación del archivo SQL por lotes
const batchSize = 50;
let sqlContent = `-- Migración 004: Inserción de catálogo técnico oficial (1,722 palas)
-- Generado automáticamente con ON CONFLICT (slug) DO NOTHING
-- Excluye texto descriptivo de terceros.

`;

for (let i = 0; i < cleanRecords.length; i += batchSize) {
  const batch = cleanRecords.slice(i, i + batchSize);
  
  sqlContent += `INSERT INTO catalogo_palas (
    slug, marca, modelo, forma, balance_mm, balance_nivel, material_nucleo, material_caras,
    dureza_nivel, dureza_score, potencia_score, control_score, salida_bola_score,
    maniobrabilidad_score, punto_dulce_score, puntuacion_general, precio, moneda,
    imagen_url, jugador_pro, ano_lanzamiento, fuente_original
) VALUES\n`;

  const valuesArr = batch.map(r => {
    return `  (${escapeSqlString(r.slug)}, ${escapeSqlString(r.marca)}, ${escapeSqlString(r.modelo)}, ` +
      `${escapeSqlString(r.forma)}, ${r.balance_mm}, ${escapeSqlString(r.balance_nivel)}, ` +
      `${escapeSqlString(r.material_nucleo)}, ${escapeSqlString(r.material_caras)}, ` +
      `${escapeSqlString(r.dureza_nivel)}, ${r.dureza_score}, ${r.potencia_score}, ` +
      `${r.control_score}, ${r.salida_bola_score}, ${r.maniobrabilidad_score}, ` +
      `${r.punto_dulce_score}, ${r.puntuacion_general}, ${r.precio}, ${escapeSqlString(r.moneda)}, ` +
      `${escapeSqlString(r.imagen_url)}, ${escapeSqlString(r.jugador_pro)}, ${r.ano_lanzamiento}, ` +
      `${escapeSqlString(r.fuente_original)})`;
  });

  sqlContent += valuesArr.join(',\n') + '\nON CONFLICT (slug) DO NOTHING;\n\n';
}

fs.writeFileSync(sqlOutputPath, sqlContent, 'utf8');
const stats = fs.statSync(sqlOutputPath);
console.log(`💾 Archivo SQL generado con éxito: ${sqlOutputPath} (${(stats.size / 1024).toFixed(1)} KB)`);

// 3. Soporte opcional para inserción directa vía REST API de Supabase (--upload)
const isUploadMode = process.argv.includes('--upload');
if (isUploadMode) {
  const supabaseUrl = process.env.SUPABASE_URL || 'https://detxepmluillmdknfanm.supabase.co';
  const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY || '***REMOVED***';

  console.log(`\n🚀 Iniciando subida directa a Supabase (${supabaseUrl})...`);
  
  (async () => {
    let subidos = 0;
    for (let i = 0; i < cleanRecords.length; i += batchSize) {
      const batch = cleanRecords.slice(i, i + batchSize);
      try {
        const res = await fetch(`${supabaseUrl}/rest/v1/catalogo_palas`, {
          method: 'POST',
          headers: {
            'apikey': serviceRoleKey,
            'Authorization': `Bearer ${serviceRoleKey}`,
            'Content-Type': 'application/json',
            'Prefer': 'resolution=ignore-duplicates'
          },
          body: JSON.stringify(batch)
        });

        if (!res.ok) {
          const errText = await res.text();
          console.error(`❌ Error en lote ${i / batchSize + 1}: HTTP ${res.status} - ${errText}`);
          if (errText.includes('Could not find the table') || res.status === 404) {
            console.error('\n⚠️ ATENCIÓN: La tabla "catalogo_palas" aún no existe en Supabase.');
            console.error('Primero debes ejecutar la migración 003_CatalogoPalas.sql en el SQL Editor de Supabase:');
            console.error('https://supabase.com/dashboard/project/detxepmluillmdknfanm/sql/new\n');
            break;
          }
        } else {
          subidos += batch.length;
          process.stdout.write(`\r✅ Progreso: ${subidos}/${cleanRecords.length} palas sincronizadas en Supabase...`);
        }
      } catch (err) {
        console.error(`❌ Excepción de red en lote ${i}: ${err.message}`);
        break;
      }
    }
    console.log('\n🏁 Proceso de subida finalizado.');
  })();
}
