/**
 * Optimizes, sharpens and compresses an image data URL on the client
 * for high-precision Optical Character Recognition (OCR).
 * Preserves high resolution (up to 1800px) so fine print, unit numbers,
 * and date ranges are clearly readable by Gemini Vision OCR.
 */
export async function compressImageForUpload(
  dataUrlOrUrl: string,
  maxDimension: number = 1800,
  quality: number = 0.88
): Promise<{ base64: string; mimeType: string }> {
  return new Promise((resolve) => {
    const img = new Image();
    img.crossOrigin = 'anonymous';

    img.onload = () => {
      try {
        let width = img.naturalWidth || img.width;
        let height = img.naturalHeight || img.height;

        // Calculate proportional scale preserving high clarity for OCR text
        if (width > maxDimension || height > maxDimension) {
          if (width > height) {
            height = Math.round((height * maxDimension) / width);
            width = maxDimension;
          } else {
            width = Math.round((width * maxDimension) / height);
            height = maxDimension;
          }
        }

        const canvas = document.createElement('canvas');
        canvas.width = width;
        canvas.height = height;

        const ctx = canvas.getContext('2d');
        if (!ctx) {
          resolve({ base64: dataUrlOrUrl, mimeType: 'image/jpeg' });
          return;
        }

        // Apply high-quality image smoothing & subtle contrast enhancement for OCR text
        ctx.imageSmoothingEnabled = true;
        ctx.imageSmoothingQuality = 'high';

        // Apply contrast boost if supported by canvas
        if ('filter' in ctx) {
          ctx.filter = 'contrast(106%) brightness(102%)';
        }

        ctx.drawImage(img, 0, 0, width, height);

        const compressed = canvas.toDataURL('image/jpeg', quality);
        resolve({ base64: compressed, mimeType: 'image/jpeg' });
      } catch (err) {
        console.warn('Canvas image optimization error:', err);
        resolve({ base64: dataUrlOrUrl, mimeType: 'image/jpeg' });
      }
    };

    img.onerror = () => {
      resolve({ base64: dataUrlOrUrl, mimeType: 'image/jpeg' });
    };

    img.src = dataUrlOrUrl;
  });
}
