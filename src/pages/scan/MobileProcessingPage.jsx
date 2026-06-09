import { motion } from 'framer-motion';
import {
  ProcessingAnimation,
  ShimmerProgressBar,
} from '../../components/processing/ProcessingAnimation';
import { StatusCycler } from '../../components/processing/StatusCycler';
import { HeroSection } from '../../components/layout/HeroSection';
import { useMobileSession } from '../../hooks/useMobileSession';
import { useParams } from 'react-router-dom';

export function MobileProcessingPage() {
  const { token } = useParams();
  const { session, imageCount } = useMobileSession(token);
  const analyzing = session?.status === 'analyzing';

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
            {analyzing
              ? `Analyzing ${imageCount} image${imageCount === 1 ? '' : 's'}…`
              : 'Preparing analysis…'}
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
