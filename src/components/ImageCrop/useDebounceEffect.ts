import { useEffect } from 'react';
import { PixelCrop } from 'react-image-crop';

export function useDebounceEffect(
  fn: () => void,
  waitTime: number,
  completedCrop: PixelCrop | undefined,
  scale: number,
  rotate: number,
) {
  useEffect(() => {
    const t = setTimeout(() => {
      fn();
    }, waitTime);

    return () => {
      clearTimeout(t);
    };
  }, [fn, waitTime, completedCrop, scale, rotate]);
}
