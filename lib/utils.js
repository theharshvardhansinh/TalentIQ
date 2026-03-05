export function serialize(obj) {
  if (!obj) return null;
  return JSON.parse(JSON.stringify(obj));
}

export function formatDate(dateString) {
  if (!dateString) return '';
  return new Date(dateString).toLocaleDateString('en-US', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
  });
}

export function formatTime(dateString) {
  if (!dateString) return '';
  return new Date(dateString).toLocaleTimeString('en-US', {
    hour: 'numeric',
    minute: '2-digit',
    hour12: true,
  });
}

export function localDatetimeToISO(datetimeLocalStr) {
  if (!datetimeLocalStr) return '';
  const offsetMin = new Date().getTimezoneOffset();
  const sign = offsetMin <= 0 ? '+' : '-';
  const absMin = Math.abs(offsetMin);
  const hh = String(Math.floor(absMin / 60)).padStart(2, '0');
  const mm = String(absMin % 60).padStart(2, '0');
  return new Date(`${datetimeLocalStr}:00${sign}${hh}:${mm}`).toISOString();
}
