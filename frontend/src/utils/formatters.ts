/**
 * Utilidades de formateo para Palantica
 */

/**
 * Limpia y normaliza el nombre completo de una pala evitando repeticiones de marca
 * Ej: ("Star Vie", "Star Vie Star Vie Shade") -> "Star Vie Shade"
 * Ej: ("Nox", "Nox AT10 Luxury Genius") -> "Nox AT10 Luxury Genius"
 * Ej: ("Bullpadel", "Vertex 04 2026") -> "Bullpadel Vertex 04 2026"
 */
export function formatPalaFullName(marca?: string | null, modelo?: string | null): string {
  if (!modelo) return (marca || '').trim();
  if (!marca) return (modelo || '').trim();

  const m = marca.trim();
  let mod = modelo.trim();

  // Escapar caracteres especiales de regex en la marca
  const escapedMarca = m.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
  const brandRegex = new RegExp(`^(${escapedMarca}\\s*)+`, 'i');
  mod = mod.replace(brandRegex, '').trim();

  return `${m} ${mod}`;
}

/**
 * Obtiene solo el nombre del modelo sin la marca si ya está presente
 */
export function formatPalaModelOnly(marca?: string | null, modelo?: string | null): string {
  if (!modelo) return '';
  if (!marca) return modelo.trim();

  const m = marca.trim();
  let mod = modelo.trim();

  const escapedMarca = m.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
  const brandRegex = new RegExp(`^(${escapedMarca}\\s*)+`, 'i');
  return mod.replace(brandRegex, '').trim();
}
