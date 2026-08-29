/**
 * Utility to compress and resize images client-side before storage or upload.
 * Prevents localStorage QuotaExceededError, ensures fast uploads, and boosts web performance.
 */
export async function compressImage(
  fileOrDataUrl: File | string,
  maxWidth = 900,
  maxHeight = 900,
  quality = 0.76
): Promise<string> {
  return new Promise((resolve, reject) => {
    const processImg = (imgSrc: string) => {
      const img = new Image();
      img.onerror = () => reject(new Error('Failed to load image.'));
      img.onload = () => {
        let width = img.width;
        let height = img.height;

        // Maintain aspect ratio while fitting within maxWidth and maxHeight
        if (width > height) {
          if (width > maxWidth) {
            height = Math.round((height * maxWidth) / width);
            width = maxWidth;
          }
        } else {
          if (height > maxHeight) {
            width = Math.round((width * maxHeight) / height);
            height = maxHeight;
          }
        }

        const canvas = document.createElement('canvas');
        canvas.width = Math.max(1, width);
        canvas.height = Math.max(1, height);

        const ctx = canvas.getContext('2d');
        if (!ctx) {
          resolve(imgSrc);
          return;
        }

        // Enable high quality image smoothing
        ctx.imageSmoothingEnabled = true;
        ctx.imageSmoothingQuality = 'high';

        // Draw image onto canvas
        ctx.drawImage(img, 0, 0, width, height);

        // Convert to web JPEG data URL with optimized quality
        try {
          const dataUrl = canvas.toDataURL('image/jpeg', quality);
          resolve(dataUrl);
        } catch (e) {
          resolve(imgSrc);
        }
      };
      img.src = imgSrc;
    };

    if (typeof fileOrDataUrl === 'string') {
      processImg(fileOrDataUrl);
    } else {
      if (!fileOrDataUrl.type.startsWith('image/')) {
        reject(new Error('Selected file is not a supported image.'));
        return;
      }
      const reader = new FileReader();
      reader.onerror = (err) => reject(err);
      reader.onload = (event) => {
        processImg(event.target?.result as string);
      };
      reader.readAsDataURL(fileOrDataUrl);
    }
  });
}
