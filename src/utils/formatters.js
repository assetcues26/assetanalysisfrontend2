/**
 * Format decimal years as "X years Y months" (nearest month).
 * Passes through non-numeric strings unchanged.
 * @param {number | string | null | undefined} yearsFloat
 */
export function formatAgeYearsMonths(yearsFloat) {
  if (yearsFloat == null || yearsFloat === '') return '—';
  if (typeof yearsFloat === 'string') {
    const trimmed = yearsFloat.trim();
    if (!/^\d+(\.\d+)?$/.test(trimmed)) return trimmed;
    yearsFloat = Number(trimmed);
  }
  const num = Number(yearsFloat);
  if (Number.isNaN(num)) return String(yearsFloat);
  const totalMonths = Math.max(0, Math.round(num * 12));
  const y = Math.floor(totalMonths / 12);
  const m = totalMonths % 12;
  if (y === 0) return `${m} month${m === 1 ? '' : 's'}`;
  if (m === 0) return `${y} year${y === 1 ? '' : 's'}`;
  return `${y} year${y === 1 ? '' : 's'} ${m} month${m === 1 ? '' : 's'}`;
}

export function formatProcessingTime(ms) {
  if (ms == null || Number.isNaN(Number(ms))) return '—';
  const seconds = Number(ms) / 1000;
  return `${seconds.toFixed(1)} seconds`;
}

export function formatConfidence(value) {
  if (value == null || Number.isNaN(Number(value))) return '0%';
  return `${Math.round(Number(value) * 100)}%`;
}

export function formatFileSize(bytes) {
  if (!bytes || bytes === 0) return '0 B';
  const units = ['B', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(1024));
  return `${(bytes / 1024 ** i).toFixed(i === 0 ? 0 : 1)} ${units[i]}`;
}

export function formatRelativeTime(dateInput) {
  const date = dateInput instanceof Date ? dateInput : new Date(dateInput);
  const now = Date.now();
  const diffMs = now - date.getTime();
  const seconds = Math.floor(diffMs / 1000);
  const minutes = Math.floor(seconds / 60);
  const hours = Math.floor(minutes / 60);
  const days = Math.floor(hours / 24);
  const weeks = Math.floor(days / 7);

  if (seconds < 60) return 'Just now';
  if (minutes < 60) return `${minutes} minute${minutes === 1 ? '' : 's'} ago`;
  if (hours < 24) return `${hours} hour${hours === 1 ? '' : 's'} ago`;
  if (days < 7) return `${days} day${days === 1 ? '' : 's'} ago`;
  if (weeks < 4) return `${weeks} week${weeks === 1 ? '' : 's'} ago`;
  return date.toLocaleDateString(undefined, {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  });
}

export function normalizeCondition(condition) {
  if (!condition) return 'Fair';
  const value = String(condition).trim();
  const lower = value.toLowerCase();
  if (lower === 'good' || lower === 'excellent') return 'Good';
  if (lower === 'fair' || lower === 'average') return 'Fair';
  if (lower === 'poor' || lower === 'bad' || lower === 'damaged') return 'Poor';
  if (value === 'Good' || value === 'Fair' || value === 'Poor') return value;
  return 'Fair';
}

/**
 * @param {{ min?: number, max?: number } | null | undefined} range
 * @param {string} [symbol]
 */
export function formatMoneyRange(range, symbol = '₹') {
  if (!range || range.min == null || range.max == null) return '—';
  const locale = symbol === '₹' ? 'en-IN' : undefined;
  const min = Number(range.min).toLocaleString(locale, { maximumFractionDigits: 0 });
  const max = Number(range.max).toLocaleString(locale, { maximumFractionDigits: 0 });
  return `${symbol}${min} – ${symbol}${max}`;
}

/** Format an INR money range for India client display. */
export function formatInrMoneyRange(range) {
  return formatMoneyRange(range, '₹');
}

export function formatList(items) {
  if (!items?.length) return '—';
  return items.join(', ');
}

export function formatTokenCount(value) {
  if (value == null || Number.isNaN(Number(value))) return '—';
  return Number(value).toLocaleString();
}

/** Small USD amounts from API cost breakdown (e.g. 0.002). */
export function formatUsdCost(value) {
  if (value == null || Number.isNaN(Number(value))) return '—';
  const n = Number(value);
  if (n === 0) return '$0.00';
  if (n < 0.01) return `$${n.toFixed(4)}`;
  if (n < 1) return `$${n.toFixed(3)}`;
  return `$${n.toFixed(2)}`;
}

export function formatInrCost(value) {
  if (value == null || Number.isNaN(Number(value))) return '—';
  const n = Number(value);
  if (n < 1) return `₹${n.toFixed(2)}`;
  return `₹${n.toLocaleString(undefined, { maximumFractionDigits: 2 })}`;
}

export function formatDateTime(dateInput) {
  const date = dateInput instanceof Date ? dateInput : new Date(dateInput);
  if (Number.isNaN(date.getTime())) return '—';
  return date.toLocaleString(undefined, {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
    hour: 'numeric',
    minute: '2-digit',
  });
}

export function truncateText(text, maxLength = 120) {
  if (!text || text.length <= maxLength) return text || '';
  return `${text.slice(0, maxLength).trimEnd()}…`;
}
