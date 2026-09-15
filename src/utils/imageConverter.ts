import { jsPDF } from 'jspdf';
import { ConversionOptions } from '../types';

export interface ImageConversionResult {
  blob: Blob;
  name: string;
  size: number;
  previewUrl: string;
}

/**
 * Universal Image Transcoder & PDF Rasterizer
 * Handles PNG, JPG, WEBP, BMP, SVG with resolution scaling & quality options
 */
export async function convertImage(
  file: File,
  targetFormat: 'png' | 'jpg' | 'webp' | 'pdf' | 'bmp' | 'svg',
  options?: ConversionOptions,
  onProgress?: (prog: number, msg: string) => void
): Promise<ImageConversionResult> {
  onProgress?.(20, 'Loading image canvas buffer...');

  const baseName = file.name.replace(/\.[^/.]+$/, '');
  const isSvg = file.type === 'image/svg+xml' || file.name.toLowerCase().endsWith('.svg');

  // Read data URL
  const dataUrl = await new Promise<string>((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(reader.result as string);
    reader.onerror = reject;
    reader.readAsDataURL(file);
  });

  // Load image element
  const img = await new Promise<HTMLImageElement>((resolve, reject) => {
    const image = new Image();
    image.crossOrigin = 'anonymous';
    image.onload = () => resolve(image);
    image.onerror = reject;
    image.src = dataUrl;
  });

  onProgress?.(50, 'Applying geometric scaling and color space preserving filters...');

  let targetWidth = img.naturalWidth || img.width || 1200;
  let targetHeight = img.naturalHeight || img.height || 800;

  // Handle resolution setting
  if (options?.imageResolution) {
    const res = options.imageResolution;
    if (res === '1080p') {
      const scale = 1080 / Math.max(targetWidth, targetHeight);
      targetWidth = Math.round(targetWidth * scale);
      targetHeight = Math.round(targetHeight * scale);
    } else if (res === '4k') {
      const scale = 2160 / Math.max(targetWidth, targetHeight);
      targetWidth = Math.round(targetWidth * scale);
      targetHeight = Math.round(targetHeight * scale);
    } else if (res === '720p') {
      const scale = 720 / Math.max(targetWidth, targetHeight);
      targetWidth = Math.round(targetWidth * scale);
      targetHeight = Math.round(targetHeight * scale);
    }
  }

  // If Target is PDF
  if (targetFormat === 'pdf') {
    onProgress?.(80, 'Embedding high-DPI raster in PDF container...');
    const orientation = targetWidth > targetHeight ? 'landscape' : 'portrait';
    const doc = new jsPDF({
      orientation,
      unit: 'pt',
      format: [targetWidth * 0.75, targetHeight * 0.75],
    });

    const pWidth = doc.internal.pageSize.getWidth();
    const pHeight = doc.internal.pageSize.getHeight();
    doc.addImage(dataUrl, 'JPEG', 0, 0, pWidth, pHeight);

    const pdfBlob = doc.output('blob');
    onProgress?.(100, 'Image PDF conversion complete');
    return {
      blob: pdfBlob,
      name: `${baseName}.pdf`,
      size: pdfBlob.size,
      previewUrl: dataUrl,
    };
  }

  // If Target is SVG
  if (targetFormat === 'svg') {
    onProgress?.(85, 'Generating SVG vector container...');
    const svgContent = `<?xml version="1.0" encoding="UTF-8"?>
<svg xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink" width="${targetWidth}" height="${targetHeight}" viewBox="0 0 ${targetWidth} ${targetHeight}">
  <image width="${targetWidth}" height="${targetHeight}" href="${dataUrl}" />
</svg>`;
    const svgBlob = new Blob([svgContent], { type: 'image/svg+xml;charset=utf-8' });
    const previewUrl = URL.createObjectURL(svgBlob);
    onProgress?.(100, 'Image SVG conversion complete');
    return {
      blob: svgBlob,
      name: `${baseName}.svg`,
      size: svgBlob.size,
      previewUrl,
    };
  }

  // Draw to offscreen canvas
  const canvas = document.createElement('canvas');
  canvas.width = targetWidth;
  canvas.height = targetHeight;
  const ctx = canvas.getContext('2d');
  if (!ctx) throw new Error('Could not initialize 2D canvas context');

  // Fill background white for JPEG to avoid black alpha channel artifacts
  if (targetFormat === 'jpg' || targetFormat === 'bmp') {
    ctx.fillStyle = '#FFFFFF';
    ctx.fillRect(0, 0, targetWidth, targetHeight);
  }

  ctx.drawImage(img, 0, 0, targetWidth, targetHeight);

  const quality = options?.imageQuality ?? 0.92;
  let mimeType = 'image/png';
  let outExt = targetFormat;

  if (targetFormat === 'jpg') {
    mimeType = 'image/jpeg';
    outExt = 'jpg';
  } else if (targetFormat === 'webp') {
    mimeType = 'image/webp';
    outExt = 'webp';
  } else if (targetFormat === 'bmp') {
    mimeType = 'image/bmp';
  }

  onProgress?.(85, `Encoding ${targetFormat.toUpperCase()} stream...`);

  const blob = await new Promise<Blob>((resolve, reject) => {
    canvas.toBlob(
      (b) => {
        if (b) resolve(b);
        else reject(new Error('Canvas toBlob failed'));
      },
      mimeType,
      quality
    );
  });

  const previewUrl = URL.createObjectURL(blob);
  onProgress?.(100, 'Image conversion complete');

  return {
    blob,
    name: `${baseName}.${outExt}`,
    size: blob.size,
    previewUrl,
  };
}
