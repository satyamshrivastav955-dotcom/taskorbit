const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];

function day(v: string | Date): Date {
  return v instanceof Date ? v : new Date(v);
}

function dateFormat(): 'in' | 'us' {
  try {
    const raw = localStorage.getItem('taskorbit_settings_cache');
    if (raw !== null) {
      const parsed = JSON.parse(raw) as { dateFormat?: string };
      if (parsed.dateFormat === 'us') return 'us';
    }
  } catch {
    // Default format when settings are unavailable.
  }
  return 'in';
}

export function formatDate(v: string | Date): string {
  const d = day(v);
  const dd = String(d.getDate()).padStart(2, '0');
  const mon = months[d.getMonth()];
  if (dateFormat() === 'us') return `${mon} ${dd}, ${d.getFullYear()}`;
  return `${dd} ${mon} ${d.getFullYear()}`;
}

export function formatDateRange(a: string | Date, b: string | Date): string {
  return `${formatDate(a)} - ${formatDate(b)}`;
}

export function toDayKey(d: Date): string {
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
}

export function addDays(base: Date, n: number): Date {
  const d = new Date(base);
  d.setDate(d.getDate() + n);
  return d;
}
