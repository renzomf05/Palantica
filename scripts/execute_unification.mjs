import fs from 'fs';
import path from 'path';

const SUPABASE_URL = process.env.SUPABASE_URL || 'https://detxepmluillmdknfanm.supabase.co';
const SERVICE_KEY = process.env.SUPABASE_SECRET_KEY || process.env.SUPABASE_SERVICE_ROLE_KEY;
if (!SERVICE_KEY) throw new Error('Definir SUPABASE_SECRET_KEY en el entorno');

const headers = {
  apikey: SERVICE_KEY,
  Authorization: `Bearer ${SERVICE_KEY}`,
  'Content-Type': 'application/json'
};

async function run() {
  console.log('🚀 Iniciando proceso de unificación de base de datos...');
  console.log(`📡 Conectando a Supabase: ${SUPABASE_URL}`);

  // 1. Obtener todas las 1.722 palas desde padelful_rackets.json
  console.log('\n📥 Paso 1: Leyendo 1.722 palas oficiales desde padelful_rackets.json...');
  const jsonPath = path.resolve('backend/Palantica.Api/Features/Padelful/padelful_rackets.json');
  const catalogoPalas = JSON.parse(fs.readFileSync(jsonPath, 'utf8'));
  console.log(`✅ Se leyeron ${catalogoPalas.length} palas desde el archivo oficial.`);

  if (catalogoPalas.length === 0) {
    console.log('⚠️ No hay registros en catalogo_palas. Nada que migrar.');
    return;
  }

  // 2. Obtener marcas actuales
  console.log('\n📥 Paso 2: Verificando marcas existentes...');
  const resMarcas = await fetch(`${SUPABASE_URL}/rest/v1/marcas?select=id,nombre&limit=500`, { headers });
  if (!resMarcas.ok) {
    throw new Error(`Error leyendo marcas: ${resMarcas.status} ${await resMarcas.text()}`);
  }
  const existingMarcas = await resMarcas.json();
  const marcasMap = new Map();
  for (const m of existingMarcas) {
    marcasMap.set(m.nombre.trim().toLowerCase(), m.id);
  }
  console.log(`✅ Marcas existentes en base de datos: ${existingMarcas.length}`);

  // Identificar marcas faltantes
  const brandNamesInCatalog = new Set(catalogoPalas.map(p => p.marca?.trim()).filter(Boolean));
  const newBrands = [];
  for (const brand of brandNamesInCatalog) {
    if (!marcasMap.has(brand.toLowerCase())) {
      newBrands.push({
        nombre: brand,
        pais_origen: 'España',
        sitio_web: `https://www.${brand.toLowerCase().replace(/[^a-z0-9]/g, '')}.com`,
        logo_url: 'https://images.unsplash.com/photo-1599586120429-48281b6f0ece?w=200'
      });
    }
  }

  if (newBrands.length > 0) {
    console.log(`📦 Insertando ${newBrands.length} marcas nuevas en la tabla 'marcas'...`);
    const resInsertMarcas = await fetch(`${SUPABASE_URL}/rest/v1/marcas`, {
      method: 'POST',
      headers: { ...headers, Prefer: 'resolution=ignore-duplicates,return=representation' },
      body: JSON.stringify(newBrands)
    });
    if (!resInsertMarcas.ok) {
      throw new Error(`Error insertando marcas: ${resInsertMarcas.status} ${await resInsertMarcas.text()}`);
    }
    const inserted = await resInsertMarcas.json();
    console.log(`✅ ${inserted.length} marcas creadas exitosamente.`);

    // Actualizar marcasMap
    const resMarcasUpdated = await fetch(`${SUPABASE_URL}/rest/v1/marcas?select=id,nombre&limit=500`, { headers });
    const updatedMarcas = await resMarcasUpdated.json();
    marcasMap.clear();
    for (const m of updatedMarcas) {
      marcasMap.set(m.nombre.trim().toLowerCase(), m.id);
    }
  }

  // 3. Transformar y mapear palas a la tabla palas
  console.log('\n🔄 Paso 3: Transformando palas al esquema oficial de la tabla palas...');
  const cleanPalas = catalogoPalas.map(cp => {
    const brandKey = (cp.marca || 'Generica').trim().toLowerCase();
    const marcaId = marcasMap.get(brandKey) || 1;

    const durezaScore = Number(cp.dureza_score) || 5.0;
    const estacion = durezaScore > 7.5 ? 'Verano' : (durezaScore < 5.5 ? 'Invierno' : 'TodoAno');

    return {
      marca_id: marcaId,
      modelo: cp.modelo?.trim() || cp.slug,
      slug: cp.slug?.trim(),
      forma: cp.forma?.trim() || 'Lagrima',
      balance_mm: Number(cp.balance_mm) || 265,
      peso_min: 360,
      peso_max: 375,
      material_nucleo: cp.material_nucleo?.trim() || 'Black EVA',
      material_caras: cp.material_caras?.trim() || 'Carbono 12K',
      superficie_rugosa: 'Arenado',
      estacion_optima: estacion,
      precio_referencia: Number(cp.precio) || 0.00,
      moneda_precio: cp.moneda?.trim() || 'EUR',
      fuente_precio: 'PVP Oficial Padelful',
      puntuacion_general: Number(cp.puntuacion_general) || 5.0,
      dureza_promedio: durezaScore,
      potencia_promedio: Number(cp.potencia_score) || 5.0,
      control_promedio: Number(cp.control_score) || 5.0,
      salida_bola_promedio: Number(cp.salida_bola_score) || 5.0,
      maniobrabilidad_promedio: Number(cp.maniobrabilidad_score) || 5.0,
      punto_dulce_promedio: Number(cp.punto_dulce_score) || 5.0,
      confort_promedio: 8.0,
      imagen_url: cp.imagen_url || null,
      ano_lanzamiento: Number(cp.ano_lanzamiento) || 2025,
      jugador_pro: cp.jugador_pro?.trim() || null,
      padelful_url: cp.fuente_original || null,
      descripcion: null,
      total_resenas: 0,
      total_votos: 0
    };
  });

  // 4. Inserción por lotes en 'palas'
  console.log(`\n📤 Paso 4: Insertando ${cleanPalas.length} palas en la tabla 'palas' (lotes de 50)...`);
  const batchSize = 50;
  let totalInsertadas = 0;

  for (let i = 0; i < cleanPalas.length; i += batchSize) {
    const batch = cleanPalas.slice(i, i + batchSize);
    const resBatch = await fetch(`${SUPABASE_URL}/rest/v1/palas?on_conflict=slug`, {
      method: 'POST',
      headers: {
        ...headers,
        Prefer: 'resolution=merge-duplicates'
      },
      body: JSON.stringify(batch)
    });

    if (!resBatch.ok) {
      const err = await resBatch.text();
      throw new Error(`Error en lote ${Math.floor(i / batchSize) + 1}: ${resBatch.status} ${err}`);
    }

    totalInsertadas += batch.length;
    process.stdout.write(`\r⏳ Progreso: ${totalInsertadas}/${cleanPalas.length} palas insertadas...`);
  }
  console.log('\n✅ Todas las palas fueron migradas con éxito a la tabla palas.');

  // 5. Verificar total de registros en 'palas'
  console.log('\n🔍 Paso 5: Verificando conteo total en la tabla palas...');
  const resCount = await fetch(`${SUPABASE_URL}/rest/v1/palas?select=id`, {
    headers: { ...headers, Prefer: 'count=exact', Range: '0-0' }
  });
  const contentRange = resCount.headers.get('content-range');
  console.log(`📊 Conteo total verificado en 'palas': ${contentRange}`);

  // 6. Vaciar tabla catalogo_palas
  console.log('\n🧹 Paso 6: Vaciando registros de la tabla catalogo_palas...');
  const resDelete = await fetch(`${SUPABASE_URL}/rest/v1/catalogo_palas?id=gt.0`, {
    method: 'DELETE',
    headers
  });
  if (!resDelete.ok) {
    console.warn(`Aviso al vaciar catalogo_palas: ${resDelete.status} ${await resDelete.text()}`);
  } else {
    console.log('✅ Registros de catalogo_palas eliminados exitosamente.');
  }

  // 7. Verificar que catalogo_palas está vacía
  const resCheckEmpty = await fetch(`${SUPABASE_URL}/rest/v1/catalogo_palas?select=id`, {
    headers: { ...headers, Prefer: 'count=exact', Range: '0-0' }
  });
  console.log(`📊 Conteo en 'catalogo_palas': ${resCheckEmpty.headers.get('content-range')}`);

  console.log('\n🎉 ¡MIGRACIÓN Y UNIFICACIÓN DE BASE DE DATOS COMPLETADA CON ÉXITO!');
}

run().catch(err => {
  console.error('\n❌ ERROR FATAL EN MIGRACIÓN:', err);
  process.exit(1);
});
