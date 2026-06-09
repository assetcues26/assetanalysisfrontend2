import { useEffect, useRef, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { SwitchCamera } from 'lucide-react';
import { CompactHeader, ProgressPill } from '../../components/layout/AppHeader';
import { BackButton } from '../../components/ui/BackButton';
import { CameraView } from '../../components/capture/CameraView';
import { FlashToggle } from '../../components/capture/FlashToggle';
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
  const {
    enqueueCapture,
    pendingCount,
    uploading,
    canCaptureMore,
    displayImageCount,
  } = useMobileCaptureUpload({
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

  const hasPhotos = displayImageCount > 0 || pendingCount > 0;
  const flashSupported = camera.facingMode === 'environment';

  const statusText = (() => {
    if (uploading || pendingCount > 0) {
      const syncing = pendingCount === 1 ? '1 photo syncing' : `${pendingCount} photos syncing`;
      return `${syncing} — tap Done anytime`;
    }
    if (displayImageCount > 0) {
      return `${displayImageCount} in batch — tap Done when finished`;
    }
    if (!flashSupported) {
      return 'Front camera has no flash — flip to rear camera for flash';
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
            <FlashToggle
              mode={camera.flashMode}
              onCycle={camera.cycleFlash}
              theme="dark"
              size="compact"
            />
            <ProgressPill current={displayImageCount} max={maxImages} variant="dark" />
            {hasPhotos && (
              <button
                type="button"
                className="rounded-full bg-blue-600 px-3 py-1 text-xs font-semibold text-white"
                onClick={() => navigate(`/scan/${token}/done`)}
              >
                Done
              </button>
            )}
          </div>
        }
      />
      <div className="relative flex min-h-0 flex-1 flex-col pb-[9.5rem]">
        <CameraView
          videoRef={camera.videoRef}
          facingMode={camera.facingMode}
          zoomLevel={camera.previewZoom}
          status={camera.status}
          error={camera.error}
          onRetry={camera.retry}
          className="min-h-0 flex-1 rounded-none border-0"
        />
      </div>

      <div className="fixed bottom-0 left-0 right-0 z-50 border-t border-gray-800 bg-gray-950/95 pb-safe backdrop-blur-md">
        <p className="px-4 pb-2 pt-3 text-center text-xs text-white/90">{statusText}</p>
        <div className="flex items-center justify-between px-4 pb-4 pt-1">
          <button
            type="button"
            onClick={camera.flipCamera}
            disabled={camera.status === 'denied'}
            aria-label="Flip camera"
            className="touch-target touch-manipulation flex h-14 w-14 shrink-0 items-center justify-center rounded-full bg-gray-800 text-gray-100 active:bg-gray-700 disabled:opacity-40"
          >
            <SwitchCamera size={24} />
          </button>

          <ShutterButton
            onClick={handleCapture}
            disabled={!camera.isReady || capturing || !canCaptureMore}
          />

          <FlashToggle
            mode={camera.flashMode}
            onCycle={camera.cycleFlash}
            theme="dark"
          />
        </div>
      </div>
    </div>
  );
}
