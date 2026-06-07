import { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { AnimatePresence, motion } from 'framer-motion';
import { FileDown, X } from 'lucide-react';
import { exportAssetReportPdf } from '../../services/assetReportPdf';
import { CompactHeader } from '../../components/layout/AppHeader';
import { BackButton } from '../../components/ui/BackButton';
import { Button } from '@/components/ui/button';
import { AssetResultCard } from '../../components/result/AssetResultCard';
import { PageWrapper } from '../../components/layout/PageWrapper';
import { HeroSection } from '../../components/layout/HeroSection';
import { useDemoV6 } from '../../hooks/useDemoV6';
import { useApp } from '../../context/AppContext';
import { buildResultGallery } from '../../utils/blobUrls';

export function DemoV6ResultPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { getSessionResultById } = useDemoV6();
  const { showToast } = useApp();
  const [lightboxIndex, setLightboxIndex] = useState(null);
  const [exportingPdf, setExportingPdf] = useState(false);

  const entry = getSessionResultById(id);

  useEffect(() => {
    if (!entry) {
      const t = setTimeout(() => {
        if (!getSessionResultById(id)) navigate('/demo/v6', { replace: true });
      }, 150);
      return () => clearTimeout(t);
    }
  }, [entry, id, getSessionResultById, navigate]);

  if (!entry) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-zinc-50 text-gray-600">
        Loading demo report…
      </div>
    );
  }

  const galleryImages = buildResultGallery(entry);

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
          title="V6 Demo Report"
          left={
            <BackButton label="Catalog" onClick={() => navigate('/demo/v6')} />
          }
        />
      </div>

      <main className="min-h-0 flex-1 overflow-x-hidden overflow-y-auto">
        <HeroSection>
          <PageWrapper className="py-6 pb-8">
            <p className="mb-4 text-xs font-medium uppercase tracking-wide text-blue-600">
              prompt_version: {entry.prompt_version || 'v6-demo'}
            </p>
            <AssetResultCard
              result={entry}
              images={entry.previewUrls || []}
              onImageClick={setLightboxIndex}
            />
          </PageWrapper>
        </HeroSection>
      </main>

      <footer className="shrink-0 border-t border-gray-200 bg-white/95 p-4 backdrop-blur-md pb-safe">
        <div className="mx-auto flex max-w-lg flex-col gap-2 sm:flex-row">
          <Button
            variant="outline"
            className="flex-1"
            onClick={() => navigate(`/demo/v6/asset/${entry.demoContext?.catalog_id || ''}`)}
          >
            New demo scan
          </Button>
          <Button
            variant="outline"
            className="flex-1"
            disabled={exportingPdf}
            onClick={handleExportPdf}
          >
            <FileDown size={16} className="mr-2" />
            {exportingPdf ? 'Exporting…' : 'Download PDF'}
          </Button>
        </div>
      </footer>

      <AnimatePresence>
        {lightboxIndex != null && galleryImages[lightboxIndex] && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[100] flex items-center justify-center bg-black/90 p-4"
            onClick={() => setLightboxIndex(null)}
          >
            <button
              type="button"
              className="absolute right-4 top-4 rounded-full bg-white/10 p-2 text-white"
              onClick={() => setLightboxIndex(null)}
              aria-label="Close"
            >
              <X size={24} />
            </button>
            <img
              src={galleryImages[lightboxIndex]}
              alt=""
              className="max-h-[90vh] max-w-full object-contain"
              onClick={(e) => e.stopPropagation()}
            />
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
