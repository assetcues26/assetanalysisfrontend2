/**
 * Shared gallery for result/history: collage output + uploaded frames.
 */
export function ScanImageGallery({
  mergedImageUrl,
  previewUrls = [],
  processingMode,
  analysisMethod,
  onImageClick,
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
              index={index}
              onImageClick={onImageClick}
              lightboxIndex={index}
              label={`Uploaded image ${index + 1}`}
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
            <button
              type="button"
              onClick={() => onImageClick?.(0)}
              className="overflow-hidden rounded-xl border border-gray-300 focus:ring-2 focus:ring-blue-500"
              aria-label="View processing collage"
            >
              <img
                src={mergedImageUrl}
                alt="Processing collage sent to AI"
                className="mx-auto max-h-64 w-auto max-w-full object-contain"
              />
            </button>
          </div>
        </div>
      )}

      {uploads.length > 0 && (
        <div className="border-b border-gray-200 bg-gray-50/80 p-4">
          <p className="mb-3 text-center text-xs font-medium uppercase tracking-wide text-gray-500">
            Original uploads ({uploads.length})
          </p>
          <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 md:grid-cols-4">
            {uploads.map((url, index) => (
              <GalleryThumb
                key={`${url}-${index}`}
                url={url}
                index={index}
                onImageClick={onImageClick}
                lightboxIndex={mergedImageUrl ? index + 1 : index}
                label={`Original upload ${index + 1}`}
              />
            ))}
          </div>
        </div>
      )}
    </>
  );
}

function GalleryThumb({ url, index, onImageClick, lightboxIndex, label }) {
  return (
    <button
      type="button"
      onClick={() => onImageClick?.(lightboxIndex)}
      className="overflow-hidden rounded-lg border border-gray-300 bg-white focus:ring-2 focus:ring-blue-500"
      aria-label={`View ${label}`}
    >
      <img
        src={url}
        alt={label}
        className="aspect-square w-full object-cover"
      />
    </button>
  );
}
