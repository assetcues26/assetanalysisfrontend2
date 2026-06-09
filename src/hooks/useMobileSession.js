import { useCallback, useEffect, useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import {
  analyzeCaptureSession,
  fetchCaptureSession,
  isSessionUnavailableError,
} from '../services/sessionApi';

const POLL_MS = 2500;

/**
 * Poll capture session on mobile routes.
 * @param {string | undefined} token
 */
export function useMobileSession(token) {
  const navigate = useNavigate();
  const location = useLocation();
  const [session, setSession] = useState(null);
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(true);

  const refresh = useCallback(async () => {
    if (!token) return null;
    try {
      const data = await fetchCaptureSession(token);
      setSession(data);
      setError(null);
      return data;
    } catch (err) {
      setError(err?.message || 'Session unavailable');
      return null;
    }
  }, [token]);

  useEffect(() => {
    if (!token) {
      setLoading(false);
      setError('Invalid scan link');
      return undefined;
    }

    let cancelled = false;
    setLoading(true);

    const load = async () => {
      const data = await refresh();
      if (!cancelled) setLoading(false);
      if (data?.status === 'expired') {
        setError('This scan link has expired. Start a new scan on your computer.');
      }
      if (data?.status === 'completed' && data.entry_id) {
        navigate(`/result/${data.entry_id}`, { replace: true });
      }
    };

    load();
    const id = setInterval(() => {
      refresh().then((data) => {
        if (data?.status === 'analyzing' && !location.pathname.includes('/processing')) {
          navigate(`/scan/${token}/processing`, { replace: true });
        }
        if (data?.status === 'completed' && data.entry_id) {
          navigate(`/result/${data.entry_id}`, { replace: true });
        }
      });
    }, POLL_MS);

    return () => {
      cancelled = true;
      clearInterval(id);
    };
  }, [token, refresh, navigate]);

  const startAnalyze = useCallback(async () => {
    if (!token) return null;
    try {
      const result = await analyzeCaptureSession(token);
      await refresh();
      if (result.status === 'analyzing' || result.status === 'completed') {
        navigate(`/scan/${token}/processing`, { replace: true });
      }
      return result;
    } catch (err) {
      setError(err?.message || 'Analysis failed');
      return null;
    }
  }, [token, refresh, navigate]);

  return {
    session,
    error,
    loading,
    refresh,
    startAnalyze,
    isUnavailable: error && isSessionUnavailableError({ message: error }),
    imageCount: session?.image_count ?? 0,
    maxImages: session?.max_images ?? 10,
    canAdd: session?.status === 'active',
  };
}
