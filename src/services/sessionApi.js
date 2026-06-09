import { ASSET_ANALYSIS_API_BASE } from '../config/api';

import { formatApiErrorMessage } from '../utils/apiErrorMessage';

import { prepareImagesForUpload, sumSessionImageBytes } from '../utils/imageCompression';



const SESSIONS_BASE = `${ASSET_ANALYSIS_API_BASE}/v1/sessions`;



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



  const response = await fetch(`${SESSIONS_BASE}/${encodeURIComponent(token)}/images`, {

    method: 'POST',

    headers: sessionHeaders(),

    body: formData,

  });

  const data = await parseJsonResponse(response);

  if (!response.ok) {

    throw new Error(formatApiErrorMessage(data, response.status));

  }

  return data;

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

  const existingBytes =

    options.existingBytes ?? sumSessionImageBytes(options.sessionImages);

  const prepared = await prepareImagesForUpload(files, { existingBytes });

  return uploadSessionImages(token, prepared, source);

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



  const response = await fetch(`${SESSIONS_BASE}/${encodeURIComponent(token)}/analyze`, {

    method: 'POST',

    headers: sessionHeaders(),

    body: formData,

  });

  const data = await parseJsonResponse(response);

  if (!response.ok) {

    throw new Error(formatApiErrorMessage(data, response.status));

  }

  return data;

}



export function isSessionUnavailableError(err) {

  const message = err?.message || '';

  return message.includes('503') || message.toLowerCase().includes('not configured');

}

