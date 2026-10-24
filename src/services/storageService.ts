import { ref, uploadBytesResumable, getDownloadURL } from 'firebase/storage';
import { storage } from '../lib/firebase';

export interface UploadProgressCallback {
  (progress: number): void;
}

/**
 * Compresses and resizes an image on the client side using HTML Canvas.
 * Keeps aspect ratio with max dimension 1200px and produces clean WebP/JPEG.
 */
export async function compressImage(file: File, maxWidth = 1200, maxHeight = 1200, quality = 0.85): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.readAsDataURL(file);
    reader.onload = (event) => {
      const img = new Image();
      img.src = event.target?.result as string;
      img.onload = () => {
        let width = img.width;
        let height = img.height;

        if (width > maxWidth || height > maxHeight) {
          if (width > height) {
            height = Math.round((height * maxWidth) / width);
            width = maxWidth;
          } else {
            width = Math.round((width * maxHeight) / height);
            maxHeight = height;
          }
        }

        const canvas = document.createElement('canvas');
        canvas.width = width;
        canvas.height = height;
        const ctx = canvas.getContext('2d');

        if (!ctx) {
          // If canvas context fails, fallback to original DataURL
          resolve(event.target?.result as string);
          return;
        }

        ctx.drawImage(img, 0, 0, width, height);
        // Prefer WebP if supported, fallback to JPEG
        try {
          const dataUrl = canvas.toDataURL('image/webp', quality);
          resolve(dataUrl);
        } catch {
          const dataUrl = canvas.toDataURL('image/jpeg', quality);
          resolve(dataUrl);
        }
      };
      img.onerror = (err) => reject(err);
    };
    reader.onerror = (err) => reject(err);
  });
}

/**
 * Uploads a product image with automatic compression, live progress reporting,
 * and resilient fallback so uploads never hang.
 */
export async function uploadProductImage(
  file: File,
  onProgress?: UploadProgressCallback
): Promise<string> {
  if (!file.type.startsWith('image/')) {
    throw new Error('يرجى اختيار ملف صورة صالح (PNG, JPEG, WebP, SVG).');
  }

  // Fast progress update: reading & optimizing
  if (onProgress) onProgress(20);

  // 1. Client-side compress first to ensure optimal performance & fast uploads
  const optimizedDataUrl = await compressImage(file);
  if (onProgress) onProgress(45);

  const timestamp = Date.now();
  const cleanFileName = file.name.replace(/[^a-zA-Z0-9.]/g, '_');
  const storagePath = `products/${timestamp}_${cleanFileName}`;

  // 2. Attempt Cloud Storage upload with a strict 3.5-second timeout
  try {
    const storagePromise = new Promise<string>((resolve, reject) => {
      try {
        const storageRef = ref(storage, storagePath);
        const uploadTask = uploadBytesResumable(storageRef, file, {
          contentType: file.type,
        });

        uploadTask.on(
          'state_changed',
          (snapshot) => {
            const progress = (snapshot.bytesTransferred / (snapshot.totalBytes || 1)) * 100;
            if (onProgress) {
              onProgress(Math.min(95, Math.max(50, Math.round(progress))));
            }
          },
          (error) => {
            console.warn('Firebase Storage upload error, using optimized image URL:', error);
            resolve(optimizedDataUrl);
          },
          async () => {
            try {
              const downloadUrl = await getDownloadURL(uploadTask.snapshot.ref);
              if (onProgress) onProgress(100);
              resolve(downloadUrl);
            } catch (err) {
              resolve(optimizedDataUrl);
            }
          }
        );
      } catch (err) {
        resolve(optimizedDataUrl);
      }
    });

    // Timeout race: if Firebase Storage hangs or bucket CORS blocks for >3.5s, resolve with optimized Data URL
    const timeoutPromise = new Promise<string>((resolve) => {
      setTimeout(() => {
        if (onProgress) onProgress(100);
        resolve(optimizedDataUrl);
      }, 3500);
    });

    return await Promise.race([storagePromise, timeoutPromise]);
  } catch (err) {
    if (onProgress) onProgress(100);
    return optimizedDataUrl;
  }
}
