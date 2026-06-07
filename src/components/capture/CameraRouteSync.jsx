import { useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import { useCamera } from '../../hooks/useCamera';

/**
 * Keeps the device camera active only on /capture. Releases the stream on every
 * other route so upload, preview, batch, etc. do not leave the camera running.
 */
export function CameraRouteSync() {
  const { pathname } = useLocation();
  const { ensureActive, releaseStream } = useCamera();

  useEffect(() => {
    if (pathname === '/capture') {
      ensureActive();
      return () => releaseStream();
    }
    releaseStream();
  }, [pathname, ensureActive, releaseStream]);

  return null;
}
