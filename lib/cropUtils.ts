/**
 * Utility to extract a cropped image of a product from a flyer image
 * using an HTML5 Canvas and percentage-based bounding box coordinates.
 */
export async function cropFlyerImage(
  imageSrc: string,
  box: { x: number; y: number; width: number; height: number },
  paddingPct: number = 2
): Promise<string> {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.crossOrigin = 'anonymous';

    img.onload = () => {
      try {
        const canvas = document.createElement('canvas');
        const ctx = canvas.getContext('2d');
        if (!ctx) {
          resolve(imageSrc);
          return;
        }

        const naturalWidth = img.naturalWidth || img.width;
        const naturalHeight = img.naturalHeight || img.height;

        // Apply slight padding around the box if requested to catch labels
        const padX = (box.width * paddingPct) / 100;
        const padY = (box.height * paddingPct) / 100;

        const leftPct = Math.max(0, box.x - padX);
        const topPct = Math.max(0, box.y - padY);
        const widthPct = Math.min(100 - leftPct, box.width + padX * 2);
        const heightPct = Math.min(100 - topPct, box.height + padY * 2);

        const sourceX = (leftPct / 100) * naturalWidth;
        const sourceY = (topPct / 100) * naturalHeight;
        const sourceWidth = (widthPct / 100) * naturalWidth;
        const sourceHeight = (heightPct / 100) * naturalHeight;

        // Target canvas resolution (high density)
        const targetWidth = Math.max(200, Math.round(sourceWidth));
        const targetHeight = Math.max(200, Math.round(sourceHeight));

        canvas.width = targetWidth;
        canvas.height = targetHeight;

        // High quality smoothing
        ctx.imageSmoothingEnabled = true;
        ctx.imageSmoothingQuality = 'high';

        ctx.drawImage(
          img,
          sourceX,
          sourceY,
          sourceWidth,
          sourceHeight,
          0,
          0,
          targetWidth,
          targetHeight
        );

        const dataUrl = canvas.toDataURL('image/jpeg', 0.92);
        resolve(dataUrl);
      } catch (err) {
        console.warn('Could not crop canvas due to cross-origin or canvas error:', err);
        resolve(imageSrc);
      }
    };

    img.onerror = () => {
      resolve(imageSrc);
    };

    img.src = imageSrc;
  });
}
