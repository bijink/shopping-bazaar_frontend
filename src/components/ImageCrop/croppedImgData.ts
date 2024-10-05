import { PixelCrop } from 'react-image-crop';
import { canvasPreview } from './canvasPreview';

let previewUrl = '';

async function toBlob(canvas: HTMLCanvasElement, maxSizeBytes: number, type: string) {
  let quality = 1.0; // Start with the highest quality
  // Use a loop to progressively reduce the quality or resize the image
  while (quality > 0) {
    const blob: Blob = await new Promise((resolve) => {
      canvas.toBlob((blob) => resolve(blob!), type, quality);
    });
    // Check the file size
    if (blob.size <= maxSizeBytes) {
      return blob; // Return the image blob if it's under the size limit
    }
    // Reduce quality in steps (e.g., decrease by 0.1 each iteration)
    quality -= 0.1;
  }
  // Return image with quality 0.0 if unable to compress image below the target size
  const blob: Blob = await new Promise((resolve) => {
    canvas.toBlob((blob) => resolve(blob!), type, 0.0);
  });
  return blob;
}

// Returns an object contained with -
// an image blob you should set to state &
// an image source you should set to state and pass
// `{previewSrc && <img alt="Crop preview" src={previewSrc} />}`
export default async function croppedImgData({
  image,
  crop,
  scale = 1,
  rotate = 0,
  type = 'image/jpeg',
}: {
  image: HTMLImageElement;
  crop: PixelCrop;
  scale?: number;
  rotate?: number;
  type?: string;
}) {
  const maxSizeBytes = 0.5 * 1024 * 1024;
  const canvas = document.createElement('canvas');
  canvasPreview(image, canvas, crop, scale, rotate);

  const blob = await toBlob(canvas, maxSizeBytes, type);
  if (previewUrl) {
    URL.revokeObjectURL(previewUrl);
  }

  previewUrl = URL.createObjectURL(blob);

  return { blob, previewUrl };
}
