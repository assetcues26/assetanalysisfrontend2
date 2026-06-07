import imageCompression from 'browser-image-compression';

/**
 * Compresses an image file in the browser to reduce payload size.
 * Targets a maximum file size of 400KB and limits dimensions to 1920px.
 * 
 * @param {File} file The original image file
 * @returns {Promise<File>} A promise resolving to the compressed File, or the original file if compression fails.
 */
export async function compressImage(file) {
  const options = {
    maxSizeMB: 0.4,
    maxWidthOrHeight: 1920,
    useWebWorker: true,
  };

  try {
    const compressedBlob = await imageCompression(file, options);
    // Convert Blob to File to maintain the original filename
    return new File([compressedBlob], file.name, {
      type: compressedBlob.type,
      lastModified: Date.now(),
    });
  } catch (error) {
    console.error('Image compression failed:', error);
    return file; // Fallback to original file
  }
}
