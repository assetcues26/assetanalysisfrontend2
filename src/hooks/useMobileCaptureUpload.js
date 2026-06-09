import { useCallback, useEffect, useRef, useState } from 'react';
import { uploadSessionImagesPrepared } from '../services/sessionApi';

/**
 * Queue camera captures for compress + session upload while staying on the camera screen.
 * @param {{
 *   token?: string,
 *   session?: { images?: Array<{ byte_size?: number | null }> } | null,
 *   refresh?: () => Promise<unknown>,
 *   imageCount?: number,
 *   maxImages?: number,
 *   canAdd?: boolean,
 *   showToast?: (message: string, type?: string) => void,
 * }} options
 */
export function useMobileCaptureUpload({
  token,
  session,
  refresh,
  imageCount = 0,
  maxImages = 10,
  canAdd = false,
  showToast,
}) {
  const queueRef = useRef([]);
  const processingRef = useRef(false);
  const sessionRef = useRef(session);
  sessionRef.current = session;

  const [queueLength, setQueueLength] = useState(0);
  const [uploading, setUploading] = useState(false);

  const pendingCount = queueLength + (uploading ? 1 : 0);
  const canCaptureMore = Boolean(
    token && canAdd && imageCount + pendingCount < maxImages,
  );

  const processQueue = useCallback(async () => {
    if (processingRef.current || !token) return;
    processingRef.current = true;
    setUploading(true);

    while (queueRef.current.length > 0) {
      const file = queueRef.current[0];
      try {
        const updated = await uploadSessionImagesPrepared(token, file, 'mobile', {
          sessionImages: sessionRef.current?.images,
        });
        sessionRef.current = updated;
        if (refresh) {
          await refresh();
        }
        queueRef.current.shift();
        setQueueLength(queueRef.current.length);
      } catch (err) {
        // Drop the failed capture but keep syncing the rest of the queue.
        queueRef.current.shift();
        setQueueLength(queueRef.current.length);
        showToast?.(err?.message || 'Upload failed', 'error');
      }
    }

    processingRef.current = false;
    setUploading(false);
  }, [token, refresh, showToast]);

  const enqueueCapture = useCallback(
    (file) => {
      if (!file || !canCaptureMore) return false;
      queueRef.current.push(file);
      setQueueLength(queueRef.current.length);
      processQueue();
      return true;
    },
    [canCaptureMore, processQueue],
  );

  useEffect(() => {
    if (queueRef.current.length > 0) {
      processQueue();
    }
  }, [processQueue]);

  return {
    enqueueCapture,
    queueLength,
    uploading,
    pendingCount,
    canCaptureMore,
  };
}
