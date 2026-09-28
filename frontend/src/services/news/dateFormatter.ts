/**
 * Formatea fechas en formato natural en español (ej. "hace 2 h", "hace 45 min", "28 sep").
 */
export function formatSpanishDate(rawDate?: string | null): string {
  if (!rawDate) {
    return 'reciente';
  }

  const date = new Date(rawDate);
  if (isNaN(date.getTime())) {
    return rawDate.toLowerCase();
  }

  const now = new Date();
  const diffMs = now.getTime() - date.getTime();
  const diffSec = Math.floor(diffMs / 1000);
  const diffMin = Math.floor(diffSec / 60);
  const diffHours = Math.floor(diffMin / 60);
  const diffDays = Math.floor(diffHours / 24);

  // Fechas futuras o de hace segundos
  if (diffSec < 60) {
    return 'hace un momento';
  }

  // Menos de una hora
  if (diffMin < 60) {
    return `hace ${diffMin} min`;
  }

  // Menos de 24 horas
  if (diffHours < 24) {
    return `hace ${diffHours} h`;
  }

  // Menos de 7 días
  if (diffDays < 7) {
    return `hace ${diffDays} d`;
  }

  // Formato mes y día (ej. "28 sep" o "28 sep 2026")
  const meses = ['ene', 'feb', 'mar', 'abr', 'may', 'jun', 'jul', 'ago', 'sep', 'oct', 'nov', 'dic'];
  const dia = date.getDate();
  const mes = meses[date.getMonth()];
  const mismoAno = date.getFullYear() === now.getFullYear();

  return mismoAno ? `${dia} ${mes}` : `${dia} ${mes} ${date.getFullYear()}`;
}
