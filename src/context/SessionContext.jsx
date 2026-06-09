import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
} from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { CAPTURE_SESSION_ENABLED } from '../config/features';
import { useApp } from './AppContext';
import { useBatchContext } from './BatchContext';
import {
  analyzeCaptureSession,
  createCaptureSession,
  deleteSessionImage,
  fetchCaptureSession,
  isSessionUnavailableError,
  uploadSessionImagesPrepared,
} from '../services/sessionApi';

const POLL_MS = 2500;

const SessionContext = createContext(null);

const LAPTOP_SYNC_PATHS = ['/upload', '/capture', '/batch'];

export function SessionProvider({ children }) {
  const navigate = useNavigate();
  const location = useLocation();
  const { uploadProcessingMode, showToast, maxImages } = useApp();
  const { batchImages, clearBatch } = useBatchContext();

  const [enabled, setEnabled] = useState(CAPTURE_SESSION_ENABLED);
  const [token, setToken] = useState(null);
  const [session, setSession] = useState(null);
  const [loading, setLoading] = useState(false);
  const completedHandledRef = useRef(null);

  const refreshSession = useCallback(async (activeToken) => {
    if (!activeToken) return null;
    const data = await fetchCaptureSession(activeToken);
    setSession(data);
    return data;
  }, []);

  const clearSession = useCallback(() => {
    setToken(null);
    setSession(null);
    completedHandledRef.current = null;
  }, []);

  const attachToken = useCallback((activeToken) => {
    setToken(activeToken);
    completedHandledRef.current = null;
  }, []);

  const startSession = useCallback(async () => {
    if (!enabled) {
      showToast('Add from phone is not available', 'warning');
      return null;
    }
    setLoading(true);
    try {
      const created = await createCaptureSession({
        processing_mode: uploadProcessingMode,
      });
      const activeToken = created.session_token;
      setToken(activeToken);
      setSession(created);

      if (batchImages.length > 0) {
        const files = batchImages.map((img) => img.file).filter((f) => f instanceof File);
        if (files.length > 0) {
          const updated = await uploadSessionImagesPrepared(activeToken, files, 'laptop');
          setSession(updated);
        }
        clearBatch();
      }
      return activeToken;
    } catch (err) {
      if (isSessionUnavailableError(err)) {
        setEnabled(false);
      }
      showToast(err?.message || 'Could not start phone session', 'error');
      return null;
    } finally {
      setLoading(false);
    }
  }, [enabled, uploadProcessingMode, batchImages, clearBatch, showToast]);

  const uploadImage = useCallback(
    async (fileOrFiles, source = 'laptop') => {
      if (!token) {
        showToast('Tap Add from phone first', 'warning');
        return null;
      }
      try {
        const updated = await uploadSessionImagesPrepared(token, fileOrFiles, source, {
          sessionImages: session?.images,
        });
        setSession(updated);
        return updated;
      } catch (err) {
        showToast(err?.message || 'Upload failed', 'error');
        return null;
      }
    },
    [token, session?.images, showToast],
  );

  const removeImage = useCallback(
    async (imageId) => {
      if (!token) return null;
      try {
        const updated = await deleteSessionImage(token, imageId);
        setSession(updated);
        return updated;
      } catch (err) {
        showToast(err?.message || 'Could not remove image', 'error');
        return null;
      }
    },
    [token, showToast],
  );

  const startAnalyze = useCallback(async () => {
    if (!token) return null;
    try {
      const result = await analyzeCaptureSession(token);
      if (result.status === 'analyzing' || result.status === 'completed') {
        await refreshSession(token);
      }
      return result;
    } catch (err) {
      showToast(err?.message || 'Analysis could not start', 'error');
      return null;
    }
  }, [token, refreshSession, showToast]);

  useEffect(() => {
    if (!token || !enabled) return undefined;

    let cancelled = false;

    const poll = async () => {
      try {
        const data = await fetchCaptureSession(token);
        if (cancelled) return;
        setSession(data);

        if (data.status === 'analyzing') {
          const onLaptopSyncPage = LAPTOP_SYNC_PATHS.some((p) =>
            location.pathname.startsWith(p),
          );
          if (onLaptopSyncPage) {
            navigate(`/processing?session=${encodeURIComponent(token)}`, { replace: true });
          }
        }

        if (data.status === 'completed' && data.entry_id) {
          if (completedHandledRef.current === data.entry_id) return;
          completedHandledRef.current = data.entry_id;
          clearBatch();
          clearSession();
          navigate(`/result/${data.entry_id}`, { replace: true });
        }
      } catch (err) {
        if (!cancelled && !isSessionUnavailableError(err)) {
          console.warn('Session poll failed', err);
        }
      }
    };

    poll();
    const id = setInterval(poll, POLL_MS);
    return () => {
      cancelled = true;
      clearInterval(id);
    };
  }, [token, enabled, location.pathname, navigate, clearBatch, clearSession]);

  const isSessionActive = Boolean(token && session?.status === 'active');
  const hasSessionBatch = Boolean(
    token && session && ['active', 'analyzing'].includes(session.status),
  );
  const sessionImages = session?.images || [];
  const sessionCount = session?.image_count ?? sessionImages.length;

  const value = useMemo(
    () => ({
      enabled,
      token,
      session,
      sessionImages,
      sessionCount,
      isSessionActive,
      hasSessionBatch,
      loading,
      maxImages,
      startSession,
      refreshSession,
      uploadImage,
      removeImage,
      startAnalyze,
      clearSession,
      attachToken,
    }),
    [
      enabled,
      token,
      session,
      sessionImages,
      sessionCount,
      isSessionActive,
      hasSessionBatch,
      loading,
      maxImages,
      startSession,
      refreshSession,
      uploadImage,
      removeImage,
      startAnalyze,
      clearSession,
      attachToken,
    ],
  );

  return <SessionContext.Provider value={value}>{children}</SessionContext.Provider>;
}

export function useSessionContext() {
  const ctx = useContext(SessionContext);
  if (!ctx) throw new Error('useSessionContext must be used within SessionProvider');
  return ctx;
}
