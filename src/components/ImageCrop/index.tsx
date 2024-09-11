import React, { useCallback, useEffect, useRef, useState } from 'react';
import ReactCrop, { Crop, PixelCrop, centerCrop, makeAspectCrop } from 'react-image-crop';
import 'react-image-crop/dist/ReactCrop.css';
import { canvasPreview } from './canvasPreview';
import croppedImgData from './croppedImgData';
import { useDebounceEffect } from './useDebounceEffect';

// This is to demonstate how to make and center a % aspect crop
// which is a bit trickier so we use some helper functions.
function centerAspectCrop(mediaWidth: number, mediaHeight: number, aspect: number) {
  return centerCrop(
    makeAspectCrop(
      {
        unit: '%',
        width: 90,
      },
      aspect,
      mediaWidth,
      mediaHeight,
    ),
    mediaWidth,
    mediaHeight,
  );
}

export default function ImageCrop({
  selectedFile,
  getBlob,
  aspectValue,
  enableCircularCrop,
  enableScale,
  enableRotate,
  showPreview,
}: {
  selectedFile: File | null;
  getBlob: (blob: Blob) => void;
  aspectValue?: number;
  enableCircularCrop?: boolean;
  enableScale?: boolean;
  enableRotate?: boolean;
  showPreview?: boolean;
}) {
  const [imgSrc, setImgSrc] = useState('');
  const previewCanvasRef = useRef<HTMLCanvasElement>(null);
  const imgRef = useRef<HTMLImageElement>(null);
  const [crop, setCrop] = useState<Crop>();
  const [completedCrop, setCompletedCrop] = useState<PixelCrop>();
  const [scale, setScale] = useState(1);
  const [rotate, setRotate] = useState(0);
  const [aspect] = useState<number | undefined>(aspectValue || 16 / 9);

  useEffect(() => {
    if (selectedFile) {
      setCrop(undefined); // Makes crop preview update between images.
      const reader = new FileReader();
      reader.addEventListener('load', () => setImgSrc(reader.result?.toString() || ''));
      reader.readAsDataURL(selectedFile);
    } else {
      setImgSrc('');
    }
  }, [selectedFile]);

  function onImageLoad(e: React.SyntheticEvent<HTMLImageElement>) {
    if (aspect) {
      const { width, height } = e.currentTarget;
      setCrop(centerAspectCrop(width, height, aspect));
    }
  }

  useDebounceEffect(
    useCallback(async () => {
      if (
        completedCrop?.width &&
        completedCrop?.height &&
        imgRef.current &&
        previewCanvasRef.current
      ) {
        // We use canvasPreview as it's much faster than imgPreview.
        canvasPreview(imgRef.current, previewCanvasRef.current, completedCrop, scale, rotate);

        const blob = await croppedImgData({
          image: imgRef.current!,
          crop: completedCrop!,
          scale,
          rotate,
          type: 'image/webp',
        }).then((response) => {
          return response.blob;
        });
        getBlob(blob);
      }
    }, [completedCrop, scale, rotate, getBlob]),
    100,
    completedCrop,
    scale,
    rotate,
  );

  return (
    <div className="App space-y-3">
      <div className="Crop-Controls">
        {enableScale && (
          <div>
            <label htmlFor="scale-input">Scale: </label>
            <input
              id="scale-input"
              type="number"
              step="0.1"
              value={scale}
              disabled={!imgSrc}
              onChange={(e) => setScale(Number(e.target.value))}
            />
          </div>
        )}
        {enableRotate && (
          <div>
            <label htmlFor="rotate-input">Rotate: </label>
            <input
              id="rotate-input"
              type="number"
              value={rotate}
              disabled={!imgSrc}
              onChange={(e) => setRotate(Math.min(180, Math.max(-180, Number(e.target.value))))}
            />
          </div>
        )}
      </div>
      {!!imgSrc && (
        <ReactCrop
          crop={crop}
          onChange={(_, percentCrop) => setCrop(percentCrop)}
          onComplete={(c) => setCompletedCrop(c)}
          aspect={aspect}
          // minWidth={400}
          minHeight={100}
          circularCrop={enableCircularCrop}
        >
          <img
            ref={imgRef}
            alt="Crop me"
            src={imgSrc}
            style={{ transform: `scale(${scale}) rotate(${rotate}deg)` }}
            onLoad={onImageLoad}
          />
        </ReactCrop>
      )}
      {!!completedCrop && (
        <>
          <div style={{ display: showPreview ? 'inline' : 'none' }}>
            <canvas
              ref={previewCanvasRef}
              style={{
                border: '1px solid black',
                objectFit: 'contain',
                width: completedCrop.width,
                height: completedCrop.height,
              }}
            />
          </div>
        </>
      )}
    </div>
  );
}
