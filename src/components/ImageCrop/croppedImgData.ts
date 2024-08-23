import { PixelCrop } from 'react-image-crop';
import { canvasPreview } from './canvasPreview';

let previewUrl = '';

function toBlob(canvas: HTMLCanvasElement, type?: string, quality?: number): Promise<Blob> {
  return new Promise((resolve) => {
    canvas.toBlob((blob) => resolve(blob!), type, quality);
  });
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
  type = 'image/png',
  quality = 1,
}: {
  image: HTMLImageElement;
  crop: PixelCrop;
  scale?: number;
  rotate?: number;
  type?: string;
  quality?: number;
}) {
  const canvas = document.createElement('canvas');
  canvasPreview(image, canvas, crop, scale, rotate);

  const blob = await toBlob(canvas, type, quality);
  if (previewUrl) {
    URL.revokeObjectURL(previewUrl);
  }

  previewUrl = URL.createObjectURL(blob);

  return { blob, previewUrl };
}
