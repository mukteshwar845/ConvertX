import { jsPDF } from 'jspdf';
import { ConversionOptions } from '../types';

export interface ImageConversionResult {
  blob: Blob;
  name: string;
  size: number;
  previewUrl: string;
}

/**
 * Pure TypeScript BMP Encoder for 100% Cross-Browser Bitmap Export
 * Ensures Windows, macOS, Linux, iOS & Android produce valid uncompressed .bmp files
 */
function encodeBmp(imageData: ImageData): Blob {
  const width = imageData.width;
  const height = imageData.height;
  const data = imageData.data;
  const rowSize = Math.floor((24 * width + 31) / 32) * 4;
  const pixelArraySize = rowSize * height;
  const fileHeaderSize = 14;
  const infoHeaderSize = 40;
  const totalSize = fileHeaderSize + infoHeaderSize + pixelArraySize;
  const buffer = new ArrayBuffer(totalSize);
  const view = new DataView(buffer);

  // File Header (BM)
  view.setUint16(0, 0x424d, false); // 'BM'
  view.setUint32(2, totalSize, true);
  view.setUint32(6, 0, true);
  view.setUint32(10, fileHeaderSize + infoHeaderSize, true);

  // DIB Header (BITMAPINFOHEADER)
  view.setUint32(14, infoHeaderSize, true);
  view.setInt32(18, width, true);
  view.setInt32(22, height, true); // bottom-up
  view.setUint16(26, 1, true); // color planes
  view.setUint16(28, 24, true); // bits per pixel
  view.setUint32(30, 0, true); // compression BI_RGB
  view.setUint32(34, pixelArraySize, true);
  view.setInt32(38, 2835, true); // 72 DPI
  view.setInt32(42, 2835, true);
  view.setUint32(46, 0, true);
  view.setUint32(50, 0, true);

  // Pixels (BGR, bottom to top)
  const bytes = new Uint8Array(buffer);
  let offset = fileHeaderSize + infoHeaderSize;
  for (let y = height - 1; y >= 0; y--) {
    for (let x = 0; x < width; x++) {
      const srcIdx = (y * width + x) * 4;
      bytes[offset++] = data[srcIdx + 2]; // B
      bytes[offset++] = data[srcIdx + 1]; // G
      bytes[offset++] = data[srcIdx];     // R
    }
    const padding = rowSize - width * 3;
    for (let p = 0; p < padding; p++) {
      bytes[offset++] = 0;
    }
  }

  return new Blob([buffer], { type: 'image/bmp' });
}

/**
 * Universal High-Speed Image Transcoder & PDF Rasterizer
 * Supports PNG, JPG, JPEG, WEBP, SVG, BMP, GIF, TIFF, AVIF, and ICO
 */
export async function convertImage(
  file: File,
  targetFormat: 'png' | 'jpg' | 'webp' | 'pdf' | 'bmp' | 'svg' | 'ico',
  options?: ConversionOptions,
  onProgress?: (prog: number, msg: string) => void
): Promise<ImageConversionResult> {
  onProgress?.(15, 'Loading image into GPU-accelerated canvas buffer...');

  const baseName = file.name.replace(/\.[^/.]+$/, '');
  const objectUrl = URL.createObjectURL(file);

  try {
    // Load image element via fast object URL
    const img = await new Promise<HTMLImageElement>((resolve, reject) => {
      const image = new Image();
      image.crossOrigin = 'anonymous';
      image.onload = () => resolve(image);
      image.onerror = () => {
        reject(
          new Error(
            `Unable to decode "${file.name}". Please ensure this is a supported graphic format (PNG, JPG, WEBP, SVG, BMP, GIF, AVIF, TIFF).`
          )
        );
      };
      image.src = objectUrl;
    });

    onProgress?.(45, 'Applying resolution scaling and geometric transformations...');

    let targetWidth = img.naturalWidth || img.width || 1200;
    let targetHeight = img.naturalHeight || img.height || 800;

    // Handle resolution scaling setting
    if (options?.imageResolution) {
      const res = options.imageResolution;
      if (res === '1080p') {
        const scale = 1080 / Math.max(targetWidth, targetHeight);
        targetWidth = Math.max(1, Math.round(targetWidth * scale));
        targetHeight = Math.max(1, Math.round(targetHeight * scale));
      } else if (res === '4k') {
        const scale = 2160 / Math.max(targetWidth, targetHeight);
        targetWidth = Math.max(1, Math.round(targetWidth * scale));
        targetHeight = Math.max(1, Math.round(targetHeight * scale));
      } else if (res === '720p') {
        const scale = 720 / Math.max(targetWidth, targetHeight);
        targetWidth = Math.max(1, Math.round(targetWidth * scale));
        targetHeight = Math.max(1, Math.round(targetHeight * scale));
      }
    }

    // Special limit for ICO (max 256x256)
    if (targetFormat === 'ico') {
      const icoScale = 256 / Math.max(targetWidth, targetHeight);
      if (icoScale < 1) {
        targetWidth = Math.max(1, Math.round(targetWidth * icoScale));
        targetHeight = Math.max(1, Math.round(targetHeight * icoScale));
      }
    }

    // Prepare offscreen canvas
    const canvas = document.createElement('canvas');
    canvas.width = targetWidth;
    canvas.height = targetHeight;
    const ctx = canvas.getContext('2d', { alpha: true });
    if (!ctx) throw new Error('Could not initialize 2D canvas context');

    // Smooth image rendering
    ctx.imageSmoothingEnabled = true;
    ctx.imageSmoothingQuality = 'high';

    // Fill white background for formats without alpha channel (JPG, BMP)
    if (targetFormat === 'jpg' || targetFormat === 'bmp') {
      ctx.fillStyle = '#FFFFFF';
      ctx.fillRect(0, 0, targetWidth, targetHeight);
    }

    // Draw the image
    ctx.drawImage(img, 0, 0, targetWidth, targetHeight);

    // 1. TARGET: PDF
    if (targetFormat === 'pdf') {
      onProgress?.(75, 'Embedding high-DPI raster in vector PDF container...');
      const orientation = targetWidth > targetHeight ? 'landscape' : 'portrait';
      const doc = new jsPDF({
        orientation,
        unit: 'pt',
        format: [targetWidth * 0.75, targetHeight * 0.75],
      });

      const pWidth = doc.internal.pageSize.getWidth();
      const pHeight = doc.internal.pageSize.getHeight();

      // Convert canvas to pristine JPEG data URL for seamless jsPDF embedding
      const jpegData = canvas.toDataURL('image/jpeg', 0.95);
      doc.addImage(jpegData, 'JPEG', 0, 0, pWidth, pHeight);

      const pdfBlob = doc.output('blob');
      const previewUrl = URL.createObjectURL(pdfBlob);
      onProgress?.(100, 'Image to PDF conversion complete');
      return {
        blob: pdfBlob,
        name: `${baseName}.pdf`,
        size: pdfBlob.size,
        previewUrl,
      };
    }

    // 2. TARGET: SVG
    if (targetFormat === 'svg') {
      onProgress?.(80, 'Generating vector XML container...');
      const pngData = canvas.toDataURL('image/png');
      const svgContent = `<?xml version="1.0" encoding="UTF-8"?>
<svg xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink" width="${targetWidth}" height="${targetHeight}" viewBox="0 0 ${targetWidth} ${targetHeight}">
  <image width="${targetWidth}" height="${targetHeight}" href="${pngData}" />
</svg>`;
      const svgBlob = new Blob([svgContent], { type: 'image/svg+xml;charset=utf-8' });
      const previewUrl = URL.createObjectURL(svgBlob);
      onProgress?.(100, 'Image to SVG conversion complete');
      return {
        blob: svgBlob,
        name: `${baseName}.svg`,
        size: svgBlob.size,
        previewUrl,
      };
    }

    // 3. TARGET: BMP
    if (targetFormat === 'bmp') {
      onProgress?.(85, 'Encoding uncompressed 24-bit Windows Bitmap...');
      const imgData = ctx.getImageData(0, 0, targetWidth, targetHeight);
      const bmpBlob = encodeBmp(imgData);
      const previewUrl = URL.createObjectURL(bmpBlob);
      onProgress?.(100, 'Image to BMP conversion complete');
      return {
        blob: bmpBlob,
        name: `${baseName}.bmp`,
        size: bmpBlob.size,
        previewUrl,
      };
    }

    // 4. TARGET: PNG, JPG, WEBP, ICO
    onProgress?.(80, `Encoding ${targetFormat.toUpperCase()} stream...`);
    const quality = options?.imageQuality ?? 0.92;
    let mimeType = 'image/png';
    let outExt: string = targetFormat;

    if (targetFormat === 'jpg') {
      mimeType = 'image/jpeg';
      outExt = 'jpg';
    } else if (targetFormat === 'webp') {
      mimeType = 'image/webp';
      outExt = 'webp';
    } else if (targetFormat === 'ico') {
      mimeType = 'image/png';
      outExt = 'ico';
    }

    const blob = await new Promise<Blob>((resolve, reject) => {
      canvas.toBlob(
        (b) => {
          if (b) resolve(b);
          else reject(new Error('Canvas image encoding failed.'));
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
  } finally {
    URL.revokeObjectURL(objectUrl);
  }
}
