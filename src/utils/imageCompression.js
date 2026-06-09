import imageCompression from 'browser-image-compression';

export const UPLOAD_MAX_TOTAL_MB = 15;
export const UPLOAD_MAX_IMAGES = 10;

const BYTES_PER_MB = 1024 * 1024;

/**
 * @param {number} bytes
 */
export function bytesToMb(bytes) {
  return bytes / BYTES_PER_MB;
}

/**
 * Compresses a single image file in the browser.
 *
 * @param {File} file
 * @param {{ maxSizeMB?: number, maxWidthOrHeight?: number, useWebWorker?: boolean }} [overrides]
 * @returns {Promise<File>}
 */
export async function compressImage(file, overrides = {}) {
  const options = {
    maxSizeMB: overrides.maxSizeMB ?? 0.4,
    maxWidthOrHeight: overrides.maxWidthOrHeight ?? 1920,
    useWebWorker: overrides.useWebWorker ?? true,
  };

  try {
    const compressedBlob = await imageCompression(file, options);
    return new File([compressedBlob], file.name, {
      type: compressedBlob.type,
      lastModified: Date.now(),
    });
  } catch (error) {
    if (options.useWebWorker) {
      try {
        const compressedBlob = await imageCompression(file, {
          ...options,
          useWebWorker: false,
        });
        return new File([compressedBlob], file.name, {
          type: compressedBlob.type,
          lastModified: Date.now(),
        });
      } catch (retryError) {
        console.error('Image compression failed (no worker):', retryError);
      }
    } else {
      console.error('Image compression failed:', error);
    }

    const perFileCap = overrides.maxSizeMB ?? 0.4;
    if (file.size > perFileCap * BYTES_PER_MB) {
      throw new Error(
        `Could not compress "${file.name}". Try a smaller image or fewer photos.`,
      );
    }
    return file;
  }
}

/**
 * @param {File[]} files
 * @param {number} maxTotalBytes
 * @param {number} existingBytes
 */
async function compressWithBudget(files, maxTotalBytes, existingBytes) {
  const budget = Math.max(0, maxTotalBytes - existingBytes);
  if (budget <= 0) {
    throw new Error(
      `Total upload size cannot exceed ${UPLOAD_MAX_TOTAL_MB} MB. Remove some images first.`,
    );
  }

  const perFileMb = Math.min(1.5, budget / BYTES_PER_MB / Math.max(files.length, 1));
  let maxEdge = 1920;

  for (let round = 0; round < 6; round += 1) {
    const compressed = await Promise.all(
      files.map((file) =>
        compressImage(file, {
          maxSizeMB: Math.max(0.05, perFileMb),
          maxWidthOrHeight: maxEdge,
        }),
      ),
    );

    const total = compressed.reduce((sum, f) => sum + f.size, 0);
    if (total + existingBytes <= maxTotalBytes) {
      return compressed;
    }

    maxEdge = Math.round(maxEdge * 0.75);
  }

  throw new Error(
    `Images are too large — keep total upload under ${UPLOAD_MAX_TOTAL_MB} MB (max ${UPLOAD_MAX_IMAGES} images).`,
  );
}

/**
 * Prepare files for session/API upload with per-batch size budget.
 *
 * @param {File | File[]} input
 * @param {{ maxTotalMB?: number, existingBytes?: number }} [options]
 * @returns {Promise<File[]>}
 */
export async function prepareImagesForUpload(input, options = {}) {
  const maxTotalMB = options.maxTotalMB ?? UPLOAD_MAX_TOTAL_MB;
  const existingBytes = options.existingBytes ?? 0;
  const maxTotalBytes = maxTotalMB * BYTES_PER_MB;
  const files = Array.isArray(input) ? input : [input];

  if (!files.length) {
    throw new Error('No images provided');
  }
  if (files.length > UPLOAD_MAX_IMAGES) {
    throw new Error(`Maximum ${UPLOAD_MAX_IMAGES} images per batch`);
  }

  return compressWithBudget(files, maxTotalBytes, existingBytes);
}

/**
 * Sum byte_size from session image list.
 * @param {Array<{ byte_size?: number | null }>} images
 */
export function sumSessionImageBytes(images) {
  return (images || []).reduce((sum, img) => sum + (img.byte_size || 0), 0);
}
