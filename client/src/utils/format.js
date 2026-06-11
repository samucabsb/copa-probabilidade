export function percent(value) {
  return `${Number(value || 0).toFixed(2)}%`;
}

export function normalizeText(value = '') {
  return value.toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '');
}

export function formatDateTime(timestamp) {
  if (!timestamp) return 'Sem data';
  return new Intl.DateTimeFormat('pt-BR', {
    day: '2-digit', month: '2-digit', year: 'numeric', hour: '2-digit', minute: '2-digit'
  }).format(new Date(timestamp));
}
