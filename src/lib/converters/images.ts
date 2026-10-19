/**
 * Browser-oriented image helpers. Heavy codecs (HEIC, PSD) are loaded by callers.
 */

export type RasterMime = 'image/png' | 'image/jpeg' | 'image/webp';

export function extensionForMime(mime: RasterMime): string {
  if (mime === 'image/jpeg') return 'jpg';
  if (mime === 'image/webp') return 'webp';
  return 'png';
}

export async function blobToImageBitmap(blob: Blob): Promise<ImageBitmap> {
  return createImageBitmap(blob);
}

export async function canvasToBlob(
  canvas: HTMLCanvasElement | OffscreenCanvas,
  mime: RasterMime,
  quality = 0.92,
): Promise<Blob> {
  if (canvas instanceof OffscreenCanvas) {
    return canvas.convertToBlob({ type: mime, quality });
  }
  return new Promise((resolve, reject) => {
    canvas.toBlob(
      (b) => (b ? resolve(b) : reject(new Error('Canvas export failed.'))),
      mime,
      quality,
    );
  });
}

export async function convertRasterBlob(
  blob: Blob,
  mime: RasterMime,
  quality = 0.92,
): Promise<Blob> {
  const bitmap = await blobToImageBitmap(blob);
  const canvas = document.createElement('canvas');
  canvas.width = bitmap.width;
  canvas.height = bitmap.height;
  const ctx = canvas.getContext('2d');
  if (!ctx) throw new Error('2D canvas unavailable.');
  if (mime === 'image/jpeg') {
    ctx.fillStyle = '#ffffff';
    ctx.fillRect(0, 0, canvas.width, canvas.height);
  }
  ctx.drawImage(bitmap, 0, 0);
  bitmap.close();
  return canvasToBlob(canvas, mime, quality);
}

export async function svgTextToPngBlob(svgText: string, scale = 1): Promise<Blob> {
  const svg = svgText.trim();
  if (!svg.includes('<svg')) throw new Error('Not a valid SVG document.');
  const blob = new Blob([svg], { type: 'image/svg+xml;charset=utf-8' });
  const url = URL.createObjectURL(blob);
  try {
    const img = await loadHtmlImage(url);
    const width = Math.max(1, Math.round((img.naturalWidth || 512) * scale));
    const height = Math.max(1, Math.round((img.naturalHeight || 512) * scale));
    const canvas = document.createElement('canvas');
    canvas.width = width;
    canvas.height = height;
    const ctx = canvas.getContext('2d');
    if (!ctx) throw new Error('2D canvas unavailable.');
    ctx.drawImage(img, 0, 0, width, height);
    return canvasToBlob(canvas, 'image/png');
  } finally {
    URL.revokeObjectURL(url);
  }
}

function loadHtmlImage(url: string): Promise<HTMLImageElement> {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.onload = () => resolve(img);
    img.onerror = () => reject(new Error('Failed to decode SVG.'));
    img.src = url;
  });
}

/** Draw ag-psd canvas/layer tree onto a PNG blob. */
export async function psdCanvasToPng(width: number, height: number, source: CanvasImageSource): Promise<Blob> {
  const canvas = document.createElement('canvas');
  canvas.width = width;
  canvas.height = height;
  const ctx = canvas.getContext('2d');
  if (!ctx) throw new Error('2D canvas unavailable.');
  ctx.drawImage(source, 0, 0);
  return canvasToBlob(canvas, 'image/png');
}
