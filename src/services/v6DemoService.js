import { UPLOAD_PROCESSING_MODES } from '../constants/uploadMode';
import { forkBlobUrl } from '../utils/blobUrls';
import {
  extractUploadedImagesFromApi,
  mapAnalysisResponse,
} from '../utils/mapAnalysisResponse';
import { compressImage } from '../utils/imageCompression';
import { V6_DEMO_ENDPOINT } from '../config/api';
import { analyzeDemoOnServer } from './v6DemoApi';

/**
 * @param {Array<{ id: string, file?: File, previewUrl: string, name?: string }>} images
 * @param {object} demoContext
 * @param {{ locale?: string }} [options]
 */
export async function analyzeDemoImages(images, demoContext, options = {}) {
  if (!images?.length) {
    throw new Error('No images provided for analysis');
  }
  if (!demoContext?.catalog_id) {
    throw new Error('Demo context is required');
  }

  const withFiles = images.filter((img) => img.file instanceof File);
  if (withFiles.length !== images.length) {
    throw new Error(
      `${images.length - withFiles.length} image(s) are missing file data — re-add from capture or upload`,
    );
  }

  const compressedFiles = await Promise.all(
    withFiles.map(async (img) => ({
      ...img,
      file: await compressImage(img.file),
    })),
  );

  const apiResponse = await analyzeDemoOnServer(compressedFiles, demoContext, {
    locale: options.locale,
  });

  let fallbackPreviewUrls = [];
  if (extractUploadedImagesFromApi(apiResponse).length === 0) {
    fallbackPreviewUrls = await Promise.all(
      images.map((img) => forkBlobUrl(img.previewUrl)),
    );
  }

  return mapAnalysisResponse(apiResponse, {
    fallbackPreviewUrls,
    processingMode: UPLOAD_PROCESSING_MODES.DIRECT,
    apiRoute: V6_DEMO_ENDPOINT,
  });
}
