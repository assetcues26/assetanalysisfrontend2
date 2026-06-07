/**
 * Resolve valuation insight bullets from API (points array or legacy paragraph).
 * @param {object | null | undefined} erp
 * @param {'climate_valuation' | 'nbv_vs_market'} kind
 * @returns {string[]}
 */
export function getValuationBullets(erp, kind) {
  if (!erp) return [];
  const pointsKey = kind === 'climate_valuation' ? 'climate_valuation_points' : 'nbv_vs_market_points';
  const noteKey = kind === 'climate_valuation' ? 'climate_valuation_note' : 'nbv_vs_market_note';
  if (Array.isArray(erp[pointsKey]) && erp[pointsKey].length) {
    return erp[pointsKey].map(normalizeBullet);
  }
  if (erp[noteKey]) {
    return splitProseToBullets(erp[noteKey]);
  }
  return [];
}

/**
 * @param {string} text
 * @returns {string}
 */
function normalizeBullet(text) {
  const cleaned = String(text || '').trim().replace(/\s+/g, ' ');
  if (!cleaned) return '';
  if (!/[.!?]$/.test(cleaned)) return `${cleaned}.`;
  return cleaned;
}

/**
 * @param {string} text
 * @returns {string[]}
 */
export function splitProseToBullets(text) {
  const raw = String(text || '').trim();
  if (!raw) return [];

  const chunks = [];
  for (const block of raw.split(/[;\n]+/)) {
    const part = block.trim();
    if (!part) continue;
    const sentences = part.split(/(?<=[.!?])\s+(?=[A-Z"(])/);
    chunks.push(...sentences);
  }
  return [...new Set(chunks.map(normalizeBullet).filter(Boolean))];
}
