import { motion } from 'framer-motion';
import { AlertCircle } from 'lucide-react';
import { useNavigate, useParams } from 'react-router-dom';
import {
  ProcessingAnimation,
  ShimmerProgressBar,
} from '../../components/processing/ProcessingAnimation';
import { StatusCycler } from '../../components/processing/StatusCycler';
import { HeroSection } from '../../components/layout/HeroSection';
import { Button } from '@/components/ui/button';
import { useMobileSession } from '../../hooks/useMobileSession';

export function MobileProcessingPage() {
  const { token } = useParams();
  const navigate = useNavigate();
  const { session, imageCount, error, isAnalyzing } = useMobileSession(token);

  if (error) {
    return (
      <div className="flex min-h-[100dvh] flex-col items-center justify-center gap-6 bg-zinc-50 p-8">
        <AlertCircle size={48} className="text-red-400" aria-hidden />
        <h1 className="text-lg font-bold text-gray-900">Analysis failed</h1>
        <p className="max-w-sm text-center text-sm text-gray-600">{error}</p>
        <Button variant="primary" onClick={() => navigate(`/scan/${token}/done`)}>
          Try again
        </Button>
      </div>
    );
  }

  return (
    <HeroSection className="min-h-[100dvh]">
      <div className="relative flex min-h-[100dvh] flex-col items-center justify-center px-6 py-16">
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          className="relative z-10 flex flex-col items-center"
        >
          <ProcessingAnimation />
          <p className="mt-6 text-center text-sm text-gray-600">
            {isAnalyzing
              ? `Analyzing ${imageCount} image${imageCount === 1 ? '' : 's'}…`
              : 'Preparing analysis…'}
          </p>
          <p className="mt-2 text-center text-xs text-gray-500">
            This usually takes under a minute. Keep this tab open.
          </p>
          <div className="mt-10 w-full max-w-md">
            <StatusCycler />
          </div>
        </motion.div>
        <div className="absolute bottom-16 left-6 right-6 z-10 mx-auto max-w-2xl">
          <ShimmerProgressBar />
        </div>
      </div>
    </HeroSection>
  );
}
