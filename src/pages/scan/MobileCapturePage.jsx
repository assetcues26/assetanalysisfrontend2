import { useEffect, useRef, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { CompactHeader, ProgressPill } from '../../components/layout/AppHeader';
import { BackButton } from '../../components/ui/BackButton';
import { CameraView } from '../../components/capture/CameraView';
import { ShutterButton } from '../../components/capture/ShutterButton';
import { useCamera } from '../../hooks/useCamera';
import { useMobileCaptureUpload } from '../../hooks/useMobileCaptureUpload';
import { useMobileSession } from '../../hooks/useMobileSession';
import { useApp } from '../../context/AppContext';

export function MobileCapturePage() {
  const { token } = useParams();
  const navigate = useNavigate();
  const { showToast } = useApp();
  const camera = useCamera();
  const cameraApiRef = useRef(camera);
  cameraApiRef.current = camera;
  const { imageCount, maxImages, canAdd, session, refresh } = useMobileSession(token);
  const { enqueueCapture, pendingCount, uploading, canCaptureMore } = useMobileCaptureUpload({
    token,
    session,
    refresh,
    imageCount,
    maxImages,
    canAdd,
    showToast,
  });
  const [capturing, setCapturing] = useState(false);

  useEffect(() => () => cameraApiRef.current.handleUnmount(), []);

  const handleCapture = async () => {
    if (!canCaptureMore || !camera.isReady || capturing) return;
    setCapturing(true);
    const file = await camera.captureFrame();
    setCapturing(false);
    if (!file) return;

    const added = enqueueCapture(file);
    if (!added) {
      showToast(`Maximum ${maxImages} images per batch`, 'warning');
    }
  };

  const statusText = (() => {
    if (uploading || pendingCount > 0) {
      const suffix = pendingCount > 1 ? ` (${pendingCount} syncing)` : '…';
      return `Adding to batch${suffix}`;
    }
    if (imageCount > 0) {
      return `${imageCount} in batch — tap Done when finished`;
    }
    return 'Each photo adds automatically to your laptop batch';
  })();

  return (
    <div className="flex min-h-[100dvh] flex-col bg-black">
      <CompactHeader
        title="Take photo"
        variant="dark"
        left={<BackButton label="Back" variant="dark" onClick={() => navigate(`/scan/${token}`)} />}
        right={
          <div className="flex items-center gap-2">
            <ProgressPill current={imageCount} max={maxImages} variant="dark" />
            {(imageCount > 0 || pendingCount > 0) && (
              <button
                type="button"
                className="rounded-full bg-blue-600 px-3 py-1 text-xs font-semibold text-white disabled:opacity-50"
                disabled={pendingCount > 0}
                onClick={() => navigate(`/scan/${token}/done`)}
              >
                Done
              </button>
            )}
          </div>
        }
      />
      <div className="relative flex flex-1 flex-col">
        <CameraView
          videoRef={camera.videoRef}
          facingMode={camera.facingMode}
          zoomLevel={camera.previewZoom}
          status={camera.status}
          error={camera.error}
          onRetry={camera.retry}
          className="min-h-0 flex-1 rounded-none border-0"
        />
        <div className="absolute bottom-8 left-0 right-0 flex flex-col items-center gap-3 pb-safe">
          <p className="max-w-xs px-4 text-center text-xs text-white/90">{statusText}</p>
          <ShutterButton
            onClick={handleCapture}
            disabled={!camera.isReady || capturing || !canCaptureMore}
          />
        </div>
      </div>
    </div>
  );
}
