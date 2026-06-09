import { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { AnimatePresence, motion } from 'framer-motion';
import { AlertCircle, X } from 'lucide-react';
import { CompactHeader } from '../components/layout/AppHeader';
import { BackButton } from '../components/ui/BackButton';
import { Button } from '@/components/ui/button';
import { AssetResultCard } from '../components/result/AssetResultCard';
import { PageWrapper } from '../components/layout/PageWrapper';
import { HeroSection } from '../components/layout/HeroSection';
import { useHistory } from '../hooks/useHistory';
import { buildResultGallery } from '../utils/blobUrls';

export function AssetDetailPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { getEntryById, ensureEntry, hydrated } = useHistory();
  const [lightboxIndex, setLightboxIndex] = useState(null);
  const [entry, setEntry] = useState(() => getEntryById(id));
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!hydrated || !id) return;

    let cancelled = false;
    setLoading(true);
    ensureEntry(id)
      .then((fetched) => {
        if (!cancelled) setEntry(fetched);
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });

    return () => {
      cancelled = true;
    };
  }, [hydrated, id, getEntryById, ensureEntry]);

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-zinc-50 text-gray-600">
        Loading report…
      </div>
    );
  }

  if (!entry) {
    return (
      <div className="flex min-h-screen flex-col items-center justify-center gap-4 bg-zinc-50 p-8">
        <AlertCircle size={48} className="text-amber-400" />
        <h1 className="text-xl font-bold text-gray-900">Asset Not Found</h1>
        <p className="text-gray-600">This asset may have been removed from your history.</p>
        <Button onClick={() => navigate('/')}>Return Home</Button>
      </div>
    );
  }

  const uploadedImages = entry.previewUrls || [];
  const galleryImages = buildResultGallery(entry);

  return (
    <div className="flex min-h-screen flex-col bg-zinc-50 pb-8">
      <CompactHeader
        title="Asset Report"
        left={<BackButton label="Back" onClick={() => navigate('/')} />}
      />

      <HeroSection>
        <PageWrapper className="py-6">
          <AssetResultCard
            result={entry}
            images={uploadedImages}
            onImageClick={setLightboxIndex}
            showExport
          />
        </PageWrapper>
      </HeroSection>

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
            />
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
