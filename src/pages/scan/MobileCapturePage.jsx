import { useEffect, useRef, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { CompactHeader, ProgressPill } from '../../components/layout/AppHeader';
import { BackButton } from '../../components/ui/BackButton';
import { CameraView } from '../../components/capture/CameraView';
import { ShutterButton } from '../../components/capture/ShutterButton';
import { useCamera } from '../../hooks/useCamera';
import { useMobileSession } from '../../hooks/useMobileSession';

export function MobileCapturePage() {
  const { token } = useParams();
  const navigate = useNavigate();
  const camera = useCamera();
  const cameraApiRef = useRef(camera);
  cameraApiRef.current = camera;
  const { imageCount, maxImages, canAdd } = useMobileSession(token);
  const [capturing, setCapturing] = useState(false);

  useEffect(() => () => cameraApiRef.current.handleUnmount(), []);

  const handleCapture = async () => {
    if (!canAdd || imageCount >= maxImages || !camera.isReady || capturing) return;
    setCapturing(true);
    const file = await camera.captureFrame();
    setCapturing(false);
    if (!file) return;

    const previewUrl = URL.createObjectURL(file);
    navigate(`/scan/${token}/preview`, {
      state: { file, previewUrl },
    });
  };

  return (
    <div className="flex min-h-[100dvh] flex-col bg-black">
      <CompactHeader
        title="Take photo"
        variant="dark"
        left={<BackButton label="Back" variant="dark" onClick={() => navigate(`/scan/${token}`)} />}
        right={<ProgressPill current={imageCount} max={maxImages} variant="dark" />}
      />
      <div className="relative flex flex-1 flex-col">
        <CameraView camera={camera} />
        <div className="absolute bottom-8 left-0 right-0 flex justify-center pb-safe">
          <ShutterButton onClick={handleCapture} disabled={!camera.isReady || capturing} />
        </div>
      </div>
    </div>
  );
}
