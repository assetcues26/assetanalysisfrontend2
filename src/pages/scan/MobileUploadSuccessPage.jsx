import { useNavigate, useParams } from 'react-router-dom';
import { CheckCircle2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { PageWrapper } from '../../components/layout/PageWrapper';
import { useMobileSession } from '../../hooks/useMobileSession';

export function MobileUploadSuccessPage() {
  const { token } = useParams();
  const navigate = useNavigate();
  const { imageCount, startAnalyze } = useMobileSession(token);

  return (
    <div className="flex min-h-[100dvh] flex-col bg-zinc-50">
      <PageWrapper className="flex flex-1 flex-col items-center justify-center py-10 text-center">
        <CheckCircle2 className="text-emerald-500" size={56} aria-hidden />
        <h1 className="mt-4 text-xl font-bold text-gray-900">Images added successfully</h1>
        <p className="mt-2 max-w-sm text-sm text-gray-600">
          {imageCount} image{imageCount === 1 ? '' : 's'} added — they are syncing to your laptop
          batch. Tap Proceed on your computer to analyze.
        </p>

        <div className="mt-8 flex w-full max-w-sm flex-col gap-3">
          <Button
            variant="primary"
            className="w-full"
            onClick={() => navigate(`/scan/${token}/waiting`)}
          >
            Return to laptop — images syncing
          </Button>
          <Button
            variant="ghost"
            className="w-full"
            disabled={imageCount < 1}
            onClick={() => startAnalyze()}
          >
            Analyze on this device
          </Button>
          <Button variant="ghost" className="w-full" onClick={() => navigate(`/scan/${token}/capture`)}>
            Take more photos
          </Button>
          <Button variant="ghost" className="w-full" onClick={() => navigate(`/scan/${token}`)}>
            Back to options
          </Button>
        </div>
      </PageWrapper>
    </div>
  );
}
