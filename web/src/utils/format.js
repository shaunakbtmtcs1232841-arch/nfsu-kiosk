/**
 * Formats SIP2 dates like "20261030    143000" or "20261030" or ISO dates to "30 Oct 2026"
 */
export function formatSipDate(raw) {
  if (!raw) return '—';
  const clean = String(raw).trim();
  
  // Format: YYYYMMDD followed by spaces/time
  if (/^\d{8}/.test(clean)) {
    const year = parseInt(clean.slice(0, 4), 10);
    const month = parseInt(clean.slice(4, 6), 10) - 1;
    const day = parseInt(clean.slice(6, 8), 10);
    const d = new Date(year, month, day);
    if (!isNaN(d.getTime())) {
      return d.toLocaleDateString('en-GB', {
        day: 'numeric',
        month: 'short',
        year: 'numeric'
      });
    }
  }

  // Fallback if ISO string or parseable by Date
  const parsed = new Date(clean);
  if (!isNaN(parsed.getTime())) {
    return parsed.toLocaleDateString('en-GB', {
      day: 'numeric',
      month: 'short',
      year: 'numeric'
    });
  }

  return clean;
}

export function formatTime(date = new Date()) {
  return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' });
}

export function formatDate(date = new Date()) {
  return date.toLocaleDateString('en-GB', { weekday: 'short', day: 'numeric', month: 'short', year: 'numeric' });
}

export function maskPatronId(id) {
  if (!id) return 'Patron';
  const s = String(id).trim();
  if (s.length <= 4) return `***${s}`;
  return `${s.slice(0, 2)}••••${s.slice(-4)}`;
}
