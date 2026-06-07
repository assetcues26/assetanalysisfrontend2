import { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { AnimatePresence, motion } from 'framer-motion';
import { FileDown, X } from 'lucide-react';
import { exportAssetReportPdf } from '../services/assetReportPdf';
import { CompactHeader } from '../components/layout/AppHeader';
import { BackButton } from '../components/ui/BackButton';
import { Button } from '@/components/ui/button';
import { AssetResultCard } from '../components/result/AssetResultCard';
import { PageWrapper } from '../components/layout/PageWrapper';
import { HeroSection } from '../components/layout/HeroSection';
import { useHistory } from '../hooks/useHistory';
import { useBatch } from '../hooks/useBatch';
import { useApp } from '../context/AppContext';
import { buildResultGallery } from '../utils/blobUrls';

export function ResultPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { getEntryById, isSaved, hydrated } = useHistory();
  const { clearBatch } = useBatch();
  const { lastResult, showToast } = useApp();
  const [lightboxIndex, setLightboxIndex] = useState(null);
  const [exportingPdf, setExportingPdf] = useState(false);

  const entry = getEntryById(id) || (lastResult?.id === id ? lastResult : null);

  useEffect(() => {
    if (!hydrated) return;
    if (!entry) {
      const t = setTimeout(() => {
        if (!getEntryById(id)) navigate('/', { replace: true });
      }, 100);
      return () => clearTimeout(t);
    }
  }, [entry, hydrated, id, getEntryById, navigate]);

  if (!entry) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-zinc-50 text-gray-600">
        Loading report…
      </div>
    );
  }

  const galleryImages = buildResultGallery(entry);
  const saved = isSaved(entry.request_id);

  const handleExportPdf = async () => {
    setExportingPdf(true);
    try {
      await exportAssetReportPdf(entry);
      showToast('PDF report downloaded', 'success');
    } catch (err) {
      showToast(err?.message || 'Could not generate PDF', 'error');
    } finally {
      setExportingPdf(false);
    }
  };

  return (
    <div className="flex h-[100dvh] flex-col overflow-hidden bg-zinc-50">
      <div className="shrink-0">
        <CompactHeader
          title="Asset Report"
          left={<BackButton label="New Scan" onClick={() => navigate('/')} />}
        />
      </div>

      <main className="min-h-0 flex-1 overflow-x-hidden overflow-y-auto">
        <HeroSection>
          <PageWrapper className="py-6 pb-8">
            <AssetResultCard
              result={entry}
              images={entry.previewUrls || []}
              onImageClick={setLightboxIndex}
            />
          </PageWrapper>
        </HeroSection>
      </main>

      <footer className="z-10 flex shrink-0 flex-wrap gap-3 border-t border-gray-200 bg-white/95 p-4 pb-safe backdrop-blur-md">
        <Button
          variant="outline"
          className="min-w-[7rem] flex-1"
          onClick={() => {
            clearBatch();
            navigate('/');
          }}
        >
          New Scan
        </Button>
        <Button
          variant="outline"
          className="min-w-[7rem] flex-1"
          disabled={exportingPdf}
          onClick={handleExportPdf}
        >
          <FileDown className="me-2 shrink-0" size={18} aria-hidden />
          {exportingPdf ? 'Generating…' : 'Download PDF'}
        </Button>
        <Button
          variant="primary"
          className="min-w-[7rem] flex-1"
          onClick={() => {
            if (saved) navigate('/history');
            else showToast('Saving to history…', 'info');
          }}
        >
          {saved ? 'View in History' : 'Save to History'}
        </Button>
      </footer>

      <AnimatePresence>
        {lightboxIndex != null && galleryImages[lightboxIndex] && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center bg-black/90 p-4"
            onClick={() => setLightboxIndex(null)}
          >
            <button
              type="button"
              className="absolute right-4 top-4 rounded-full bg-white p-2 text-gray-900 shadow-md"
              onClick={() => setLightboxIndex(null)}
              aria-label="Close lightbox"
            >
              <X size={24} />
            </button>
            <img
              src={galleryImages[lightboxIndex]}
              alt="Fullscreen asset"
              className="max-h-full max-w-full object-contain"
              onClick={(e) => e.stopPropagation()}
            />
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
