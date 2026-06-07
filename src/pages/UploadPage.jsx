import { useNavigate } from 'react-router-dom';
import { AnimatePresence } from 'framer-motion';
import { CompactHeader, ProgressPill } from '../components/layout/AppHeader';
import { BackButton } from '../components/ui/BackButton';
import { ProceedButton } from '../components/ui/ProceedButton';
import { DropZone } from '../components/upload/DropZone';
import { BatchTray } from '../components/batch/BatchTray';
import { PageWrapper } from '../components/layout/PageWrapper';
import { HeroSection } from '../components/layout/HeroSection';
import { useBatch } from '../hooks/useBatch';
import { useApp } from '../context/AppContext';

export function UploadPage() {
  const navigate = useNavigate();
  const { maxImages, setPreviewImage, showToast } = useApp();
  const { batchImages, batchCount, removeImage, tryAddImages, canAddMore } = useBatch();

  const handleFiles = (files) => {
    if (!files.length) return;

    if (files.length === 1) {
      const file = files[0];
      const previewUrl = URL.createObjectURL(file);
      const payload = { file, previewUrl, source: 'upload' };
      setPreviewImage(payload);
      navigate('/preview?source=upload', { state: payload });
      return;
    }

    tryAddImages(files);
    navigate('/batch');
  };

  return (
    <div className="flex min-h-[100dvh] flex-col bg-zinc-50">
      <CompactHeader
        title="Upload Images"
        left={<BackButton label="Back" onClick={() => navigate('/')} />}
        right={<ProgressPill current={batchCount} max={maxImages} />}
      />

      <HeroSection fill className="flex-1">
        <PageWrapper className="py-6 pb-32 sm:py-8 sm:pb-36">
          <header className="mb-8 max-w-2xl">
            <h2 className="text-2xl font-bold tracking-tight text-gray-900">Add asset images</h2>
            <p className="mt-2 text-sm leading-relaxed text-gray-600">
              Upload up to {maxImages} images per batch. Supported formats: JPEG, PNG, and WebP.
            </p>
          </header>

          <DropZone
            onFilesSelected={handleFiles}
            onRejectedFiles={(count) =>
              showToast(
                `${count} file${count === 1 ? '' : 's'} skipped — use JPEG, PNG, or WebP only`,
                'warning',
              )
            }
            disabled={!canAddMore && batchCount >= maxImages}
          />

          {batchCount > 0 && (
            <section className="mt-10 rounded-2xl border border-gray-200 bg-white/80 p-5 shadow-sm backdrop-blur-sm">
              <div className="mb-4 flex items-center justify-between gap-2">
                <h3 className="text-sm font-semibold text-gray-900">Current batch</h3>
                <span className="text-xs font-medium text-gray-500">
                  {batchCount} / {maxImages} images
                </span>
              </div>
              <BatchTray
                images={batchImages}
                maxImages={maxImages}
                onRemove={removeImage}
                showCounter={false}
              />
            </section>
          )}
        </PageWrapper>
      </HeroSection>

      <AnimatePresence>
        {batchCount >= 1 && (
          <div className="fixed bottom-0 left-0 right-0 z-30 border-t border-gray-200 bg-white/95 p-3 pb-safe backdrop-blur-md sm:p-4">
            <ProceedButton
              label="Proceed to Analysis"
              onClick={() => navigate('/batch')}
              count={batchCount}
            />
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
