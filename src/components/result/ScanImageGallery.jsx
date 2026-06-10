import { motion } from 'framer-motion';

const thumbClass = (active, clickable) =>
  [
    'touch-manipulation overflow-hidden rounded-lg border bg-white transition-shadow duration-150 focus:outline-none focus:ring-2 focus:ring-blue-500',
    clickable ? 'cursor-pointer' : 'cursor-default',
    active
      ? 'border-blue-500 shadow-md ring-2 ring-blue-400'
      : clickable
        ? 'border-gray-300 hover:border-blue-400 hover:shadow-md hover:ring-2 hover:ring-blue-200'
        : 'border-gray-300',
  ].join(' ');

/**
 * Shared gallery for result/history: collage output + uploaded frames.
 */
export function ScanImageGallery({
  mergedImageUrl,
  previewUrls = [],
  processingMode,
  analysisMethod,
  onImageClick,
  activeIndex = null,
}) {
  const isCollage =
    analysisMethod === 'collage' || processingMode === 'collage';
  const isMulti =
    analysisMethod === 'multi_image' || processingMode === 'direct';

  const uploads = (previewUrls || []).filter(
    (url) => url && url !== mergedImageUrl,
  );

  if (isMulti) {
    const all = previewUrls?.length ? previewUrls : [];
    if (!all.length) return null;
    return (
      <div className="border-b border-gray-200 bg-gray-50/80 p-4">
        <p className="mb-3 text-center text-xs font-medium uppercase tracking-wide text-gray-500">
          Uploaded images ({all.length})
        </p>
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 md:grid-cols-4">
          {all.map((url, index) => (
            <GalleryThumb
              key={`${url}-${index}`}
              url={url}
              onImageClick={onImageClick}
              lightboxIndex={index}
              label={`Uploaded image ${index + 1}`}
              active={activeIndex === index}
            />
          ))}
        </div>
      </div>
    );
  }

  return (
    <>
      {isCollage && mergedImageUrl && (
        <div className="border-b border-gray-200 bg-gray-100/70 p-4">
          <p className="mb-3 text-center text-xs font-medium uppercase tracking-wide text-gray-500">
            Processing collage (sent to AI)
          </p>
          <div className="flex w-full justify-center">
            <GalleryThumb
              url={mergedImageUrl}
              onImageClick={onImageClick}
              lightboxIndex={0}
              label="Processing collage sent to AI"
              active={activeIndex === 0}
              contain
            />
          </div>
        </div>
      )}

      {uploads.length > 0 && (
        <div className="border-b border-gray-200 bg-gray-50/80 p-4">
          <p className="mb-3 text-center text-xs font-medium uppercase tracking-wide text-gray-500">
            Original uploads ({uploads.length})
          </p>
          <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 md:grid-cols-4">
            {uploads.map((url, index) => {
              const lightboxIndex = mergedImageUrl ? index + 1 : index;
              return (
                <GalleryThumb
                  key={`${url}-${index}`}
                  url={url}
                  onImageClick={onImageClick}
                  lightboxIndex={lightboxIndex}
                  label={`Original upload ${index + 1}`}
                  active={activeIndex === lightboxIndex}
                />
              );
            })}
          </div>
        </div>
      )}
    </>
  );
}

function GalleryThumb({
  url,
  onImageClick,
  lightboxIndex,
  label,
  active = false,
  contain = false,
}) {
  const clickable = Boolean(onImageClick);

  return (
    <motion.button
      type="button"
      onClick={() => onImageClick?.(lightboxIndex)}
      whileTap={clickable ? { scale: 0.96 } : undefined}
      whileHover={clickable ? { scale: 1.02 } : undefined}
      transition={{ type: 'spring', stiffness: 420, damping: 28 }}
      className={`${thumbClass(active, clickable)} ${contain ? 'rounded-xl' : ''}`}
      aria-label={clickable ? `View ${label}` : label}
      aria-pressed={clickable && active ? true : undefined}
    >
      <img
        src={url}
        alt={label}
        className={
          contain
            ? 'mx-auto max-h-64 w-auto max-w-full object-contain'
            : 'aspect-square w-full object-cover'
        }
      />
    </motion.button>
  );
}
