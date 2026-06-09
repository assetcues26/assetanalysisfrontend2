import { useCallback, useEffect, useRef, useSyncExternalStore } from 'react';
import {
  enqueueMobileCapture,
  getMobileCaptureQueueSnapshot,
  runMobileCaptureQueue,
  seedMobileCaptureConfirmedCount,
  subscribeMobileCaptureQueue,
} from './mobileCaptureUploadQueue';

/**
 * Queue camera captures for compress + session upload. The queue survives navigation
 * so uploads keep syncing after the user taps Done.
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
  const sessionRef = useRef(session);
  sessionRef.current = session;

  const handlersRef = useRef({ refresh, showToast });
  handlersRef.current = { refresh, showToast };

  const subscribe = useCallback(
    (listener) => (token ? subscribeMobileCaptureQueue(token, listener) : () => {}),
    [token],
  );

  const emptySnapshotRef = useRef({
    queueLength: 0,
    uploading: false,
    pendingCount: 0,
    confirmedCount: 0,
  });

  const getSnapshot = useCallback(
    () => (token ? getMobileCaptureQueueSnapshot(token) : emptySnapshotRef.current),
    [token],
  );

  const queueSnapshot = useSyncExternalStore(subscribe, getSnapshot, getSnapshot);

  useEffect(() => {
    if (!token) return;
    seedMobileCaptureConfirmedCount(token, imageCount);
  }, [token, imageCount]);

  useEffect(() => {
    if (!token) return;
    runMobileCaptureQueue(token, {
      getSessionImages: () => sessionRef.current?.images,
      refresh: handlersRef.current.refresh,
      showToast: handlersRef.current.showToast,
    });
  }, [token]);

  const displayImageCount = Math.max(imageCount, queueSnapshot.confirmedCount);
  const pendingCount = queueSnapshot.pendingCount;
  const canCaptureMore = Boolean(
    token && canAdd && displayImageCount + pendingCount < maxImages,
  );

  const enqueueCapture = useCallback(
    (file) => {
      if (!file || !token || !canCaptureMore) return false;
      enqueueMobileCapture(token, file, {
        getSessionImages: () => sessionRef.current?.images,
        refresh: handlersRef.current.refresh,
        showToast: handlersRef.current.showToast,
      });
      return true;
    },
    [token, canCaptureMore],
  );

  return {
    enqueueCapture,
    queueLength: queueSnapshot.queueLength,
    uploading: queueSnapshot.uploading,
    pendingCount,
    displayImageCount,
    canCaptureMore,
    isSyncing: pendingCount > 0,
  };
}
