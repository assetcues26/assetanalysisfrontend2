/** Map internal API / model codes to client-friendly labels. */

const UNCERTAINTY_FLAG_LABELS = {
  generation_ambiguous: 'Model generation could not be confirmed from the photos.',
  image_quality_low: 'Photo quality was too low for a fully confident assessment.',
  partial_view: 'Only part of the asset was visible in the photos.',
  label_unreadable: 'Nameplate or label text was difficult to read.',
  age_uncertain: 'Asset age could not be estimated with enough confidence.',
  valuation_uncertain: 'Market value estimate needs a human check before client use.',
  identity_weak: 'Asset identity could not be verified with high confidence.',
};

const VALUATION_STATUS_LABELS = {
  ok: 'Verified estimate',
  indicative_only: 'Indicative estimate — please verify before sharing with clients.',
  withheld: 'Estimate held back — identity or data quality needs review first.',
};

const REPAIR_NEEDED_LABELS = {
  none: 'None',
  cosmetic_only: 'Cosmetic only',
  recommended: 'Recommended',
  required: 'Required',
};

const REPAIR_URGENCY_LABELS = {
  none: 'None',
  monitor: 'Monitor',
  scheduled: 'Scheduled',
  immediate: 'Immediate',
};

const ANALYSIS_METHOD_LABELS = {
  collage: 'Collage scan',
  multi_image: 'Multi-photo scan',
};

/**
 * @param {string | null | undefined} value
 * @returns {string}
 */
export function humanizeSnakeCase(value) {
  if (!value) return '';
  return String(value)
    .trim()
    .replace(/_/g, ' ')
    .replace(/\b\w/g, (c) => c.toUpperCase());
}

/**
 * @param {string} flag
 * @returns {string}
 */
export function humanizeUncertaintyFlag(flag) {
  const key = String(flag || '').trim().toLowerCase();
  if (!key) return '';
  return UNCERTAINTY_FLAG_LABELS[key] || `${humanizeSnakeCase(key)}.`;
}

/**
 * @param {string[]} flags
 * @returns {string[]}
 */
export function humanizeUncertaintyFlags(flags) {
  if (!flags?.length) return [];
  return flags.map(humanizeUncertaintyFlag).filter(Boolean);
}

/**
 * @param {string | null | undefined} status
 * @returns {string | null}
 */
export function humanizeValuationStatus(status) {
  if (!status) return null;
  const key = String(status).trim().toLowerCase();
  return VALUATION_STATUS_LABELS[key] || humanizeSnakeCase(key);
}

/**
 * @param {string | null | undefined} method
 * @returns {string}
 */
export function humanizeAnalysisMethod(method) {
  if (!method) return '';
  const key = String(method).trim().toLowerCase();
  return ANALYSIS_METHOD_LABELS[key] || humanizeSnakeCase(key);
}

/**
 * @param {string | null | undefined} value
 * @param {'repair_needed' | 'repair_urgency'} kind
 */
export function humanizeRepairField(value, kind = 'repair_needed') {
  if (!value) return '';
  const key = String(value).trim().toLowerCase();
  const map = kind === 'repair_urgency' ? REPAIR_URGENCY_LABELS : REPAIR_NEEDED_LABELS;
  return map[key] || humanizeSnakeCase(key);
}
