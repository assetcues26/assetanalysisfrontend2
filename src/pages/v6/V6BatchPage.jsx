import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { ImageOff } from 'lucide-react';
import { CompactHeader, ProgressPill } from '../../components/layout/AppHeader';
import { BackButton } from '../../components/ui/BackButton';
import { ProceedButton } from '../../components/ui/ProceedButton';
import { Button } from '@/components/ui/button';
import { BatchThumbnail } from '../../components/batch/BatchThumbnail';
import { PageWrapper } from '../../components/layout/PageWrapper';
import { HeroSection } from '../../components/layout/HeroSection';
import { useV6 } from '../../hooks/useV6';

export function V6BatchPage() {
  const navigate = useNavigate();
  const {
    editedContext,
    batchImages,
    batchCount,
    maxImages,
    removeImage,
    setAnalysisError,
  } = useV6();

  useEffect(() => {
    if (!editedContext) navigate('/v6', { replace: true });
    else if (batchCount === 0) navigate('/v6/upload', { replace: true });
  }, [editedContext, batchCount, navigate]);

  if (!editedContext || batchCount === 0) return null;

  return (
    <div className="flex min-h-screen flex-col bg-zinc-50 pb-28">
      <CompactHeader
        title="Batch"
        left={<BackButton label="Back" onClick={() => navigate('/v6/upload')} />}
        right={<ProgressPill current={batchCount} max={maxImages} />}
      />

      <HeroSection>
        <PageWrapper className="py-6">
          <h2 className="text-2xl font-bold text-gray-900">
            {batchCount} image{batchCount === 1 ? '' : 's'} for {editedContext.asset_name}
          </h2>
          <p className="mt-1 text-sm text-gray-500">
            ERP context + photos sent to the V6 analysis endpoint
          </p>

          <div className="mt-8 grid grid-cols-3 gap-3 sm:grid-cols-4">
            {batchImages.map((img, idx) => (
              <motion.div
                key={img.id}
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
              >
                <BatchThumbnail image={img} index={idx + 1} onRemove={removeImage} />
              </motion.div>
            ))}
          </div>

          {batchCount === 0 && (
            <div className="flex flex-col items-center gap-4 py-16">
              <ImageOff size={48} className="text-gray-600" />
              <Button variant="outline" onClick={() => navigate('/v6/upload')}>
                Add images
              </Button>
            </div>
          )}
        </PageWrapper>
      </HeroSection>

      <div className="fixed bottom-0 left-0 right-0 flex gap-3 border-t border-gray-200 bg-white/95 p-4 backdrop-blur-md">
        <Button variant="outline" className="flex-1" onClick={() => navigate('/v6/upload')}>
          Add more
        </Button>
        <ProceedButton
          fullWidth
          className="flex-[2]"
          label="Run V6 analysis"
          count={batchCount}
          onClick={() => {
            setAnalysisError(null);
            navigate('/v6/processing');
          }}
        />
      </div>
    </div>
  );
}
