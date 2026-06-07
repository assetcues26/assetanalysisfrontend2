import {
  UPLOAD_MODE_API_ROUTES,
  UPLOAD_PROCESSING_MODES,
} from '../constants/uploadMode';
import { formatApiErrorMessage } from '../utils/apiErrorMessage';

const DEFAULT_LOCALE = 'en';

/**
 * @param {import('../constants/uploadMode').UploadProcessingMode} processingMode
 */
export function resolveAnalysisEndpoint(processingMode) {
  return (
    UPLOAD_MODE_API_ROUTES[processingMode] ??
    UPLOAD_MODE_API_ROUTES[UPLOAD_PROCESSING_MODES.COLLAGE]
  );
}

/**
 * @param {Array<{ file?: File, name?: string }>} images
 * @param {import('../constants/uploadMode').UploadProcessingMode} processingMode
 * @param {{ locale?: string }} [options]
 */
export async function analyzeAssetsOnServer(images, processingMode, options = {}) {
  const url = resolveAnalysisEndpoint(processingMode);
  const formData = new FormData();
  const locale = options.locale ?? DEFAULT_LOCALE;

  for (const img of images) {
    if (!img.file) {
      throw new Error('Each image must include a file for upload');
    }
    const filename = img.name || img.file.name || 'image.jpg';
    formData.append('images', img.file, filename);
  }
  formData.append('locale', locale);

  const response = await fetch(url, {
    method: 'POST',
    body: formData,
  });

  let body = null;
  const contentType = response.headers.get('content-type') || '';
  if (contentType.includes('application/json')) {
    body = await response.json();
  } else {
    const text = await response.text();
    try {
      body = JSON.parse(text);
    } catch {
      body = { message: text || response.statusText };
    }
  }

  if (!response.ok) {
    throw new Error(formatApiErrorMessage(body, response.status));
  }

  if (body?.status && body.status !== 'success') {
    throw new Error(body.message || `Analysis status: ${body.status}`);
  }

  return body;
}
