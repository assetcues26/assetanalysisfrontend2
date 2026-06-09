import { uploadSessionImagesPrepared } from '../services/sessionApi';

/** @typedef {{ items: File[], processing: boolean, confirmedCount: number, listeners: Set<() => void> }} QueueState */

/** @type {Map<string, QueueState>} */
const uploadQueues = new Map();

/** @type {Map<string, ReturnType<typeof buildSnapshot>>} */
const snapshotCache = new Map();

/**
 * @param {QueueState} state
 */
function buildSnapshot(state) {
  const pendingCount = state.items.length + (state.processing ? 1 : 0);
  return {
    queueLength: state.items.length,
    uploading: state.processing,
    pendingCount,
    confirmedCount: state.confirmedCount,
  };
}

/**
 * @param {string} token
 * @returns {QueueState}
 */
function queueState(token) {
  if (!uploadQueues.has(token)) {
    uploadQueues.set(token, {
      items: [],
      processing: false,
      confirmedCount: 0,
      listeners: new Set(),
    });
  }
  return uploadQueues.get(token);
}

/**
 * @param {string} token
 */
export function emitMobileCaptureQueue(token) {
  const state = queueState(token);
  state.listeners.forEach((listener) => listener());
}

/**
 * @param {string} token
 * @param {() => void} listener
 */
export function subscribeMobileCaptureQueue(token, listener) {
  const state = queueState(token);
  state.listeners.add(listener);
  return () => state.listeners.delete(listener);
}

/**
 * @param {string} token
 */
export function getMobileCaptureQueueSnapshot(token) {
  const state = queueState(token);
  const next = buildSnapshot(state);
  const cached = snapshotCache.get(token);

  if (
    !cached ||
    cached.queueLength !== next.queueLength ||
    cached.uploading !== next.uploading ||
    cached.pendingCount !== next.pendingCount ||
    cached.confirmedCount !== next.confirmedCount
  ) {
    snapshotCache.set(token, next);
    return next;
  }

  return cached;
}

/**
 * @param {string} token
 * @param {number} count
 */
export function seedMobileCaptureConfirmedCount(token, count) {
  const state = queueState(token);
  state.confirmedCount = Math.max(state.confirmedCount, count);
}

/**
 * @param {string} token
 * @param {File} file
 * @param {{
 *   getSessionImages?: () => Array<{ byte_size?: number | null }> | undefined,
 *   refresh?: () => Promise<unknown>,
 *   showToast?: (message: string, type?: string) => void,
 * }} handlers
 */
export function enqueueMobileCapture(token, file, handlers = {}) {
  const state = queueState(token);
  state.items.push(file);
  emitMobileCaptureQueue(token);
  runMobileCaptureQueue(token, handlers);
}

/**
 * @param {string} token
 * @param {{
 *   getSessionImages?: () => Array<{ byte_size?: number | null }> | undefined,
 *   refresh?: () => Promise<unknown>,
 *   showToast?: (message: string, type?: string) => void,
 * }} handlers
 */
export async function runMobileCaptureQueue(token, handlers = {}) {
  const state = queueState(token);
  if (state.processing || !token) return;

  state.processing = true;
  emitMobileCaptureQueue(token);

  const { getSessionImages, refresh, showToast } = handlers;

  while (state.items.length > 0) {
    const file = state.items[0];
    try {
      const updated = await uploadSessionImagesPrepared(token, file, 'mobile', {
        sessionImages: getSessionImages?.(),
      });
      if (typeof updated?.image_count === 'number') {
        state.confirmedCount = updated.image_count;
      } else {
        state.confirmedCount += 1;
      }
      state.items.shift();
      emitMobileCaptureQueue(token);
      refresh?.().catch(() => {});
    } catch (err) {
      state.items.shift();
      emitMobileCaptureQueue(token);
      showToast?.(err?.message || 'Upload failed', 'error');
    }
  }

  state.processing = false;
  emitMobileCaptureQueue(token);
}
