import { ASSET_ANALYSIS_API_BASE } from '../config/api';

import { formatApiErrorMessage } from '../utils/apiErrorMessage';

import { prepareImagesForUpload, sumSessionImageBytes } from '../utils/imageCompression';



const SESSIONS_BASE = `${ASSET_ANALYSIS_API_BASE}/v1/sessions`;

const UPLOAD_TIMEOUT_MS = 90_000;
const ANALYZE_TIMEOUT_MS = 120_000;

function isMobileDevice() {
  if (typeof navigator === 'undefined') return false;
  return /Android|iPhone|iPad|iPod|Mobile/i.test(navigator.userAgent);
}

function sessionHeaders() {

  const headers = { Accept: 'application/json' };

  const demoKey = import.meta.env.VITE_DEMO_API_KEY?.trim();

  if (demoKey) {

    headers['X-Demo-Key'] = demoKey;

  }

  return headers;

}



async function parseJsonResponse(response) {

  const contentType = response.headers.get('content-type') || '';

  if (contentType.includes('application/json')) {

    return response.json();

  }

  const text = await response.text();

  try {

    return JSON.parse(text);

  } catch {

    return { message: text || response.statusText };

  }

}



/**

 * @param {{ processing_mode: string }} body

 */

export async function createCaptureSession(body) {

  const response = await fetch(SESSIONS_BASE, {

    method: 'POST',

    headers: { ...sessionHeaders(), 'Content-Type': 'application/json' },

    body: JSON.stringify(body),

  });

  const data = await parseJsonResponse(response);

  if (!response.ok) {

    throw new Error(formatApiErrorMessage(data, response.status));

  }

  return data;

}



/**

 * @param {string} token

 */

export async function fetchCaptureSession(token) {

  const response = await fetch(`${SESSIONS_BASE}/${encodeURIComponent(token)}`, {

    headers: sessionHeaders(),

  });

  const data = await parseJsonResponse(response);

  if (!response.ok) {

    throw new Error(formatApiErrorMessage(data, response.status));

  }

  return data;

}



/**

 * @param {string} token

 * @param {File | File[]} files

 * @param {'laptop' | 'mobile'} source

 */

export async function uploadSessionImages(token, files, source = 'mobile') {
  const list = Array.isArray(files) ? files : [files];
  const formData = new FormData();

  for (const file of list) {
    formData.append('images', file, file.name || 'image.jpg');
  }
  formData.append('source', source);

  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), UPLOAD_TIMEOUT_MS);

  try {
    const response = await fetch(`${SESSIONS_BASE}/${encodeURIComponent(token)}/images`, {
      method: 'POST',
      headers: sessionHeaders(),
      body: formData,
      signal: controller.signal,
    });
    const data = await parseJsonResponse(response);
    if (!response.ok) {
      throw new Error(formatApiErrorMessage(data, response.status));
    }
    return data;
  } catch (err) {
    if (err?.name === 'AbortError') {
      throw new Error('Upload timed out — try fewer photos or a stronger connection.');
    }
    if (err?.name === 'TypeError') {
      throw new Error('Network error — check your connection and try again.');
    }
    throw err;
  } finally {
    clearTimeout(timeoutId);
  }
}



/**

 * Compress files to fit batch budget, then upload to session.

 *

 * @param {string} token

 * @param {File | File[]} files

 * @param {'laptop' | 'mobile'} source

 * @param {{ existingBytes?: number, sessionImages?: Array<{ byte_size?: number | null }> }} [options]

 */

export async function uploadSessionImagesPrepared(token, files, source = 'mobile', options = {}) {
  const list = Array.isArray(files) ? files : [files];
  const sequential = options.sequential ?? (source === 'mobile' && isMobileDevice());
  const onProgress = options.onProgress;
  let existingBytes = options.existingBytes ?? sumSessionImageBytes(options.sessionImages);

  if (!sequential || list.length <= 1) {
    onProgress?.({ phase: 'compress', current: 1, total: 1 });
    const prepared = await prepareImagesForUpload(list, {
      existingBytes,
      fast: options.fast ?? source === 'mobile',
    });
    onProgress?.({ phase: 'upload', current: 1, total: 1 });
    return uploadSessionImages(token, prepared, source);
  }

  onProgress?.({ phase: 'compress', current: 0, total: list.length });
  const prepared = [];
  for (let i = 0; i < list.length; i += 1) {
    const batch = await prepareImagesForUpload(list[i], { existingBytes, fast: true });
    prepared.push(batch[0]);
    existingBytes += batch[0].size;
    onProgress?.({ phase: 'compress', current: i + 1, total: list.length });
  }

  let lastResult;
  for (let i = 0; i < prepared.length; i += 1) {
    onProgress?.({ phase: 'upload', current: i + 1, total: prepared.length });
    lastResult = await uploadSessionImages(token, prepared[i], source);
  }
  return lastResult;
}



/**

 * @param {string} token

 * @param {string} imageId

 */

export async function deleteSessionImage(token, imageId) {

  const response = await fetch(

    `${SESSIONS_BASE}/${encodeURIComponent(token)}/images/${encodeURIComponent(imageId)}`,

    { method: 'DELETE', headers: sessionHeaders() },

  );

  const data = await parseJsonResponse(response);

  if (!response.ok) {

    throw new Error(formatApiErrorMessage(data, response.status));

  }

  return data;

}



/**

 * @param {string} token

 * @param {{ locale?: string }} [options]

 */

export async function analyzeCaptureSession(token, options = {}) {
  const formData = new FormData();
  formData.append('locale', options.locale || 'en-IN');

  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), ANALYZE_TIMEOUT_MS);

  try {
    const response = await fetch(`${SESSIONS_BASE}/${encodeURIComponent(token)}/analyze`, {
      method: 'POST',
      headers: sessionHeaders(),
      body: formData,
      signal: controller.signal,
    });
    const data = await parseJsonResponse(response);
    if (!response.ok) {
      throw new Error(formatApiErrorMessage(data, response.status));
    }
    return data;
  } catch (err) {
    if (err?.name === 'AbortError') {
      throw new Error('Analysis timed out — try again with fewer images.');
    }
    if (err?.name === 'TypeError') {
      throw new Error('Network error during analysis — check your connection.');
    }
    throw err;
  } finally {
    clearTimeout(timeoutId);
  }
}



export function isSessionUnavailableError(err) {

  const message = err?.message || '';

  return message.includes('503') || message.toLowerCase().includes('not configured');

}

