import { ASSET_ANALYSIS_ENDPOINTS } from '../config/api';

export const UPLOAD_MODE_STORAGE_KEY = 'assetcues_upload_processing_mode';

/** @typedef {'collage' | 'direct'} UploadProcessingMode */

/** Collage = single collage sent to API; direct = multi-image endpoint (stored key kept for compatibility). */
export const UPLOAD_PROCESSING_MODES = {
  COLLAGE: 'collage',
  DIRECT: 'direct',
};

export const UPLOAD_MODE_LABELS = {
  [UPLOAD_PROCESSING_MODES.COLLAGE]: 'Collage analysis (stitched collage)',
  [UPLOAD_PROCESSING_MODES.DIRECT]: 'Multi-image analysis (per image)',
};

export const UPLOAD_MODE_API_ROUTES = {
  [UPLOAD_PROCESSING_MODES.COLLAGE]: ASSET_ANALYSIS_ENDPOINTS.collage,
  [UPLOAD_PROCESSING_MODES.DIRECT]: ASSET_ANALYSIS_ENDPOINTS.multi,
};

export function isValidUploadMode(value) {
  return (
    value === UPLOAD_PROCESSING_MODES.COLLAGE || value === UPLOAD_PROCESSING_MODES.DIRECT
  );
}

export function readStoredUploadMode() {
  try {
    const stored = localStorage.getItem(UPLOAD_MODE_STORAGE_KEY);
    if (isValidUploadMode(stored)) return stored;
  } catch {
    /* ignore */
  }
  return UPLOAD_PROCESSING_MODES.DIRECT;
}
