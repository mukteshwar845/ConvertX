import React, { useState, useRef } from 'react';
import {
  Image as ImageIcon,
  UploadCloud,
  Download,
  Trash2,
  RefreshCw,
  Sparkles,
  CheckCircle2,
  Archive,
  ArrowRight,
  Sliders,
  Eye,
  Zap,
} from 'lucide-react';
import JSZip from 'jszip';
import { convertImage } from '../utils/imageConverter';
import { HistoryRecord } from '../types';

export type ImageTargetFormat = 'png' | 'jpg' | 'webp' | 'pdf' | 'bmp' | 'svg';

export interface ImageItem {
  id: string;
  file: File;
  name: string;
  originalSize: number;
  originalWidth: number;
  originalHeight: number;
  thumbnailUrl: string;
  targetFormat: ImageTargetFormat;
  status: 'queued' | 'converting' | 'completed' | 'error';
  progress: number;
  convertedBlob?: Blob;
  convertedUrl?: string;
  convertedSize?: number;
  convertedName?: string;
  errorMessage?: string;
}

interface ImageConverterViewProps {
  onAddToHistory?: (record: HistoryRecord) => void;
  addToast: (type: 'success' | 'error' | 'warning' | 'info', message: string, title?: string) => void;
}

export const ImageConverterView: React.FC<ImageConverterViewProps> = ({
  onAddToHistory,
  addToast,
}) => {
  const [images, setImages] = useState<ImageItem[]>([]);
  const [globalFormat, setGlobalFormat] = useState<ImageTargetFormat>('webp');
  const [quality, setQuality] = useState<number>(90); // 10 to 100
  const [resolution, setResolution] = useState<'original' | '1080p' | '4k' | '720p'>('original');
  const [isConvertingBatch, setIsConvertingBatch] = useState(false);
  const [isDragging, setIsDragging] = useState(false);
  const [previewImage, setPreviewImage] = useState<{ url: string; title: string } | null>(null);

  const fileInputRef = useRef<HTMLInputElement>(null);

  const formatBytes = (bytes: number) => {
    if (!bytes || bytes === 0) return '0 B';
    const k = 1024;
    const sizes = ['B', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(1)) + ' ' + sizes[i];
  };

  const getFormatBadge = (fmt: string) => {
    switch (fmt.toLowerCase()) {
      case 'png':
        return 'bg-cyan-50 text-cyan-700 dark:bg-cyan-950/60 dark:text-cyan-300 border-cyan-200 dark:border-cyan-800';
      case 'jpg':
      case 'jpeg':
        return 'bg-blue-50 text-blue-700 dark:bg-blue-950/60 dark:text-blue-300 border-blue-200 dark:border-blue-800';
      case 'webp':
        return 'bg-emerald-50 text-emerald-700 dark:bg-emerald-950/60 dark:text-emerald-300 border-emerald-200 dark:border-emerald-800';
      case 'pdf':
        return 'bg-rose-50 text-rose-700 dark:bg-rose-950/60 dark:text-rose-300 border-rose-200 dark:border-rose-800';
      case 'svg':
        return 'bg-amber-50 text-amber-700 dark:bg-amber-950/60 dark:text-amber-300 border-amber-200 dark:border-amber-800';
      default:
        return 'bg-purple-50 text-purple-700 dark:bg-purple-950/60 dark:text-purple-300 border-purple-200 dark:border-purple-800';
    }
  };

  // Helper to read image dimensions
  const readImageMeta = (file: File): Promise<{ width: number; height: number; url: string }> => {
    return new Promise((resolve) => {
      const url = URL.createObjectURL(file);
      const img = new Image();
      img.onload = () => {
        resolve({
          width: img.naturalWidth || img.width || 0,
          height: img.naturalHeight || img.height || 0,
          url,
        });
      };
      img.onerror = () => {
        resolve({ width: 0, height: 0, url });
      };
      img.src = url;
    });
  };

  const handleAddFiles = async (files: File[]) => {
    const validImageFiles = files.filter(
      (f) =>
        f.type.startsWith('image/') ||
        /\.(png|jpe?g|webp|svg|bmp|gif|tiff|ico)$/i.test(f.name)
    );

    if (validImageFiles.length === 0) {
      addToast('warning', 'Please select valid image files (PNG, JPG, WEBP, SVG, BMP, GIF, etc.).');
      return;
    }

    const newItems: ImageItem[] = [];
    for (const file of validImageFiles) {
      const meta = await readImageMeta(file);
      newItems.push({
        id: `img_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`,
        file,
        name: file.name,
        originalSize: file.size,
        originalWidth: meta.width,
        originalHeight: meta.height,
        thumbnailUrl: meta.url,
        targetFormat: globalFormat,
        status: 'queued',
        progress: 0,
      });
    }

    setImages((prev) => [...prev, ...newItems]);
    addToast('info', `Added ${newItems.length} image${newItems.length === 1 ? '' : 's'} to queue.`);
  };

  const handleConvertSingle = async (id: string) => {
    const item = images.find((i) => i.id === id);
    if (!item) return;

    setImages((prev) =>
      prev.map((i) => (i.id === id ? { ...i, status: 'converting', progress: 30 } : i))
    );

    try {
      const result = await convertImage(
        item.file,
        item.targetFormat,
        {
          imageQuality: quality / 100,
          imageResolution: resolution,
        },
        (prog) => {
          setImages((prev) =>
            prev.map((i) => (i.id === id ? { ...i, progress: prog } : i))
          );
        }
      );

      const convertedUrl = URL.createObjectURL(result.blob);

      setImages((prev) =>
        prev.map((i) =>
          i.id === id
            ? {
                ...i,
                status: 'completed',
                progress: 100,
                convertedBlob: result.blob,
                convertedUrl,
                convertedSize: result.size,
                convertedName: result.name,
              }
            : i
        )
      );

      if (onAddToHistory) {
        onAddToHistory({
          id: item.id,
          originalName: item.name,
          originalSize: item.originalSize,
          convertedName: result.name,
          convertedSize: result.size,
          sourceFormat: 'png',
          targetFormat: item.targetFormat as any,
          timestamp: Date.now(),
        });
      }

      addToast('success', `Converted ${result.name} successfully!`);
    } catch (err: any) {
      console.error('Image conversion error:', err);
      setImages((prev) =>
        prev.map((i) =>
          i.id === id
            ? { ...i, status: 'error', progress: 0, errorMessage: err.message || 'Conversion failed' }
            : i
        )
      );
      addToast('error', `Failed to convert ${item.name}: ${err.message || 'Error'}`);
    }
  };

  const handleConvertAll = async () => {
    const queued = images.filter((i) => i.status === 'queued' || i.status === 'error');
    if (queued.length === 0) return;

    setIsConvertingBatch(true);
    for (const item of queued) {
      await handleConvertSingle(item.id);
    }
    setIsConvertingBatch(false);
  };

  const handleDownloadSingle = (item: ImageItem) => {
    if (!item.convertedBlob || !item.convertedName) return;
    const link = document.createElement('a');
    link.href = item.convertedUrl || URL.createObjectURL(item.convertedBlob);
    link.download = item.convertedName;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const handleDownloadAllZip = async () => {
    const completed = images.filter((i) => i.status === 'completed' && i.convertedBlob);
    if (completed.length === 0) return;

    try {
      const zip = new JSZip();
      completed.forEach((item) => {
        if (item.convertedBlob && item.convertedName) {
          zip.file(item.convertedName, item.convertedBlob);
        }
      });

      const zipBlob = await zip.generateAsync({ type: 'blob' });
      const link = document.createElement('a');
      link.href = URL.createObjectURL(zipBlob);
      link.download = `Converted_Images_${Date.now()}.zip`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);

      addToast('success', `Downloaded ${completed.length} images in ZIP archive!`);
    } catch (err: any) {
      addToast('error', 'Failed to generate ZIP archive.');
    }
  };

  const handleRemove = (id: string) => {
    setImages((prev) => prev.filter((i) => i.id !== id));
  };

  const handleClearAll = () => {
    images.forEach((i) => {
      if (i.thumbnailUrl) URL.revokeObjectURL(i.thumbnailUrl);
      if (i.convertedUrl) URL.revokeObjectURL(i.convertedUrl);
    });
    setImages([]);
  };

  // Sample generators for quick test
  const createSampleWallpaper = async () => {
    const canvas = document.createElement('canvas');
    canvas.width = 1920;
    canvas.height = 1080;
    const ctx = canvas.getContext('2d');
    if (ctx) {
      // Modern sunset mesh gradient
      const grad = ctx.createLinearGradient(0, 0, 1920, 1080);
      grad.addColorStop(0, '#3b82f6');
      grad.addColorStop(0.5, '#8b5cf6');
      grad.addColorStop(1, '#ec4899');
      ctx.fillStyle = grad;
      ctx.fillRect(0, 0, 1920, 1080);

      // Geometric shapes
      ctx.fillStyle = 'rgba(255, 255, 255, 0.15)';
      ctx.beginPath();
      ctx.arc(960, 540, 320, 0, Math.PI * 2);
      ctx.fill();

      ctx.fillStyle = '#ffffff';
      ctx.font = 'bold 72px sans-serif';
      ctx.textAlign = 'center';
      ctx.fillText('ConvertX Ultra HD Wallpaper', 960, 520);

      ctx.font = '36px sans-serif';
      ctx.fillStyle = 'rgba(255, 255, 255, 0.85)';
      ctx.fillText('1920 × 1080 • Ready for WebP, JPG, or PDF Conversion', 960, 580);
    }

    const blob = await new Promise<Blob>((res) => canvas.toBlob((b) => res(b!), 'image/png'));
    const file = new File([blob], 'Sample_Wallpaper_HD.png', { type: 'image/png' });
    await handleAddFiles([file]);
  };

  const createSampleGraphic = async () => {
    const canvas = document.createElement('canvas');
    canvas.width = 800;
    canvas.height = 800;
    const ctx = canvas.getContext('2d');
    if (ctx) {
      ctx.fillStyle = '#0f172a';
      ctx.fillRect(0, 0, 800, 800);

      const grad = ctx.createRadialGradient(400, 400, 50, 400, 400, 350);
      grad.addColorStop(0, '#10b981');
      grad.addColorStop(1, '#065f46');
      ctx.fillStyle = grad;
      ctx.beginPath();
      ctx.arc(400, 400, 260, 0, Math.PI * 2);
      ctx.fill();

      ctx.fillStyle = '#ffffff';
      ctx.font = 'bold 50px sans-serif';
      ctx.textAlign = 'center';
      ctx.fillText('ConvertX Logo Badge', 400, 415);
    }

    const blob = await new Promise<Blob>((res) => canvas.toBlob((b) => res(b!), 'image/png'));
    const file = new File([blob], 'Sample_Logo_Badge.png', { type: 'image/png' });
    await handleAddFiles([file]);
  };

  const completedCount = images.filter((i) => i.status === 'completed').length;

  return (
    <div className="space-y-6">
      {/* Header Banner */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <div className="flex items-center gap-2">
            <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-purple-100 text-purple-700 dark:bg-purple-950/80 dark:text-purple-300 shadow-xs">
              <ImageIcon className="h-5 w-5" />
            </span>
            <h1 className="text-xl sm:text-2xl font-black tracking-tight text-slate-900 dark:text-white">
              Image Converter & Compressor
            </h1>
          </div>
          <p className="mt-1 text-xs sm:text-sm text-slate-600 dark:text-slate-400 max-w-2xl">
            Convert pictures between PNG, JPG, WEBP, PDF, SVG, and BMP with adjustable quality and resolution. 100% private in your browser.
          </p>
        </div>

        {/* Header Badges */}
        <div className="flex flex-wrap items-center gap-2">
          <span className="inline-flex items-center gap-1.5 rounded-xl bg-purple-50 px-3 py-1.5 text-xs font-bold text-purple-700 dark:bg-purple-950/60 dark:text-purple-300 border border-purple-200/60 dark:border-purple-800/60">
            <Zap className="h-3.5 w-3.5" />
            <span>Instant WebP / JPG / PNG</span>
          </span>
          <span className="hidden sm:inline-flex items-center gap-1.5 rounded-xl bg-emerald-50 px-3 py-1.5 text-xs font-bold text-emerald-700 dark:bg-emerald-950/60 dark:text-emerald-300 border border-emerald-200/60 dark:border-emerald-800/60">
            <CheckCircle2 className="h-3.5 w-3.5" />
            <span>Zero Uploads</span>
          </span>
        </div>
      </div>

      {/* Main Drag & Drop Zone */}
      <div
        id="image-drop-zone"
        onDragOver={(e) => {
          e.preventDefault();
          setIsDragging(true);
        }}
        onDragLeave={(e) => {
          e.preventDefault();
          setIsDragging(false);
        }}
        onDrop={(e) => {
          e.preventDefault();
          setIsDragging(false);
          if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
            handleAddFiles(Array.from(e.dataTransfer.files));
          }
        }}
        onClick={() => fileInputRef.current?.click()}
        className={`group relative flex cursor-pointer flex-col items-center justify-center rounded-3xl border-2 border-dashed p-8 sm:p-10 text-center transition-all duration-200 ${
          isDragging
            ? 'border-purple-500 bg-purple-50/70 scale-[1.005] dark:border-purple-400 dark:bg-purple-950/30 shadow-lg shadow-purple-500/10'
            : 'border-slate-300/90 bg-white/80 hover:border-purple-400 hover:bg-purple-50/20 dark:border-slate-700/80 dark:bg-slate-900/70 dark:hover:border-purple-500/60 dark:hover:bg-slate-800/40 shadow-xs'
        }`}
      >
        <input
          ref={fileInputRef}
          type="file"
          multiple
          accept="image/*,.png,.jpg,.jpeg,.webp,.svg,.bmp,.gif,.tiff,.ico"
          onChange={(e) => {
            if (e.target.files && e.target.files.length > 0) {
              handleAddFiles(Array.from(e.target.files));
              e.target.value = '';
            }
          }}
          className="hidden"
        />

        <div className="relative flex h-16 w-16 items-center justify-center rounded-2xl bg-gradient-to-tr from-purple-600 via-indigo-600 to-pink-600 text-white shadow-lg shadow-purple-500/25 transition-transform group-hover:scale-110">
          <UploadCloud className="h-8 w-8" />
        </div>

        <h3 className="mt-4 text-base sm:text-lg font-bold text-slate-900 dark:text-white">
          Drag & Drop your images here, or{' '}
          <span className="text-purple-600 dark:text-purple-400 underline decoration-2 underline-offset-2">
            Browse Photos
          </span>
        </h3>
        <p className="mt-1.5 text-xs sm:text-sm text-slate-500 dark:text-slate-400 max-w-md">
          Supports PNG, JPEG, WEBP, SVG, BMP, GIF, and TIFF photos or illustrations.
        </p>

        {/* Quick Sample Buttons */}
        <div className="mt-5 flex flex-wrap items-center justify-center gap-2">
          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation();
              createSampleWallpaper();
            }}
            className="flex items-center gap-1.5 rounded-xl border border-purple-200 bg-purple-50/80 px-3 py-1.5 text-xs font-semibold text-purple-700 hover:bg-purple-100 dark:border-purple-900/60 dark:bg-purple-950/40 dark:text-purple-300 dark:hover:bg-purple-900/60 transition active:scale-95"
          >
            <Sparkles className="h-3.5 w-3.5" />
            <span>Try Sample Wallpaper (1080p)</span>
          </button>

          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation();
              createSampleGraphic();
            }}
            className="flex items-center gap-1.5 rounded-xl border border-slate-200 bg-slate-50 px-3 py-1.5 text-xs font-semibold text-slate-700 hover:bg-slate-100 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-300 dark:hover:bg-slate-700 transition active:scale-95"
          >
            <ImageIcon className="h-3.5 w-3.5" />
            <span>Try Sample Logo Graphic</span>
          </button>
        </div>
      </div>

      {/* Global Image Controls (Target format, Quality slider, Resolution) */}
      <div className="rounded-2xl border border-slate-200/80 bg-white/80 p-4 dark:border-slate-800/80 dark:bg-slate-900/70 shadow-2xs backdrop-blur-sm">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
          {/* Target Format */}
          <div className="flex flex-wrap items-center gap-3">
            <div className="flex items-center gap-1.5 text-xs font-bold text-slate-800 dark:text-slate-200">
              <span className="font-semibold text-slate-500 dark:text-slate-400">Convert all to:</span>
              <select
                value={globalFormat}
                onChange={(e) => {
                  const val = e.target.value as ImageTargetFormat;
                  setGlobalFormat(val);
                  setImages((prev) => prev.map((i) => ({ ...i, targetFormat: val })));
                }}
                className="rounded-xl border border-slate-300 bg-white px-3 py-1.5 text-xs font-bold text-slate-900 shadow-2xs focus:outline-none dark:border-slate-700 dark:bg-slate-800 dark:text-white"
              >
                <option value="webp">WEBP (Modern & Compact)</option>
                <option value="png">PNG (Lossless & Transparent)</option>
                <option value="jpg">JPG / JPEG (Universal Photo)</option>
                <option value="pdf">PDF (Print & Document)</option>
                <option value="svg">SVG (Vector Container)</option>
                <option value="bmp">BMP (Bitmap)</option>
              </select>
            </div>

            {/* Resolution Scaling */}
            <div className="flex items-center gap-1.5 text-xs font-bold text-slate-800 dark:text-slate-200">
              <span className="font-semibold text-slate-500 dark:text-slate-400">Size:</span>
              <select
                value={resolution}
                onChange={(e) => setResolution(e.target.value as any)}
                className="rounded-xl border border-slate-300 bg-white px-2.5 py-1.5 text-xs font-bold text-slate-900 shadow-2xs focus:outline-none dark:border-slate-700 dark:bg-slate-800 dark:text-white"
              >
                <option value="original">Original Dimensions</option>
                <option value="1080p">1080p (Full HD Max)</option>
                <option value="720p">720p (HD Max)</option>
                <option value="4k">4K (Ultra HD Max)</option>
              </select>
            </div>
          </div>

          {/* Quality Slider */}
          <div className="flex items-center gap-3">
            <div className="flex items-center gap-1 text-xs text-slate-600 dark:text-slate-300">
              <Sliders className="h-3.5 w-3.5 text-purple-500" />
              <span className="font-semibold">Quality:</span>
              <span className="font-bold text-purple-600 dark:text-purple-400">{quality}%</span>
            </div>
            <input
              type="range"
              min="20"
              max="100"
              step="5"
              value={quality}
              onChange={(e) => setQuality(Number(e.target.value))}
              className="w-32 sm:w-44 accent-purple-600 cursor-pointer"
            />
            <span className="text-[11px] text-slate-400 hidden sm:inline">
              {quality >= 90 ? 'Maximum Quality' : quality >= 70 ? 'Balanced' : 'Small Size'}
            </span>
          </div>
        </div>
      </div>

      {/* Batch Action Toolbar */}
      {images.length > 0 && (
        <div className="sticky top-20 z-30 flex flex-col gap-3 rounded-2xl border border-purple-200 bg-gradient-to-r from-purple-50/95 to-indigo-50/95 p-4 dark:border-purple-900/60 dark:from-slate-900/95 dark:to-purple-950/95 shadow-md backdrop-blur-md sm:flex-row sm:items-center sm:justify-between transition-all">
          <div className="flex items-center gap-2">
            <span className="flex h-7 w-7 items-center justify-center rounded-xl bg-purple-600 text-white font-extrabold text-xs">
              {images.length}
            </span>
            <span className="text-sm font-bold text-slate-900 dark:text-white">
              {images.length === 1 ? '1 Image Queued' : `${images.length} Images Queued`}
            </span>
            {completedCount > 0 && (
              <span className="rounded-md bg-emerald-100 px-2 py-0.5 text-xs font-bold text-emerald-800 dark:bg-emerald-950/60 dark:text-emerald-300">
                {completedCount} of {images.length} converted
              </span>
            )}
          </div>

          <div className="flex flex-wrap items-center gap-2">
            <button
              onClick={handleConvertAll}
              disabled={isConvertingBatch}
              className="flex items-center gap-1.5 rounded-xl bg-gradient-to-r from-purple-600 to-indigo-600 px-5 py-2 text-xs font-extrabold text-white shadow-md shadow-purple-500/20 hover:from-purple-700 hover:to-indigo-700 disabled:opacity-60 transition active:scale-95"
            >
              <RefreshCw className={`h-3.5 w-3.5 ${isConvertingBatch ? 'animate-spin' : ''}`} />
              <span>{isConvertingBatch ? 'Converting...' : `Convert All (${images.length})`}</span>
            </button>

            {completedCount > 0 && (
              <button
                onClick={handleDownloadAllZip}
                className="flex items-center gap-1.5 rounded-xl bg-emerald-600 px-4 py-2 text-xs font-bold text-white shadow-md shadow-emerald-500/20 hover:bg-emerald-700 transition active:scale-95"
              >
                <Archive className="h-3.5 w-3.5" />
                <span>Download ZIP ({completedCount})</span>
              </button>
            )}

            <button
              onClick={handleClearAll}
              disabled={isConvertingBatch}
              className="rounded-xl border border-slate-200 bg-white p-2 text-slate-400 hover:bg-rose-50 hover:text-rose-600 dark:border-slate-700 dark:bg-slate-800 dark:hover:bg-rose-950/40 dark:hover:text-rose-400 transition"
              title="Clear all"
            >
              <Trash2 className="h-4 w-4" />
            </button>
          </div>
        </div>
      )}

      {/* Image Cards Grid / List */}
      {images.length > 0 && (
        <div className="space-y-3">
          {images.map((item) => (
            <div
              key={item.id}
              className={`flex flex-col sm:flex-row sm:items-center justify-between gap-3 rounded-2xl border bg-white/90 p-3.5 shadow-xs transition dark:bg-slate-900/90 backdrop-blur-sm ${
                item.status === 'completed'
                  ? 'border-emerald-200/80 dark:border-emerald-900/60'
                  : item.status === 'converting'
                  ? 'border-purple-300 dark:border-purple-800'
                  : 'border-slate-200/90 dark:border-slate-800/90'
              }`}
            >
              {/* Left: Thumbnail & Details */}
              <div className="flex items-center gap-3.5 min-w-0">
                <div
                  onClick={() =>
                    setPreviewImage({
                      url: item.convertedUrl || item.thumbnailUrl,
                      title: item.convertedName || item.name,
                    })
                  }
                  className="group/thumb relative h-16 w-16 sm:h-20 sm:w-20 shrink-0 overflow-hidden rounded-xl border border-slate-200 bg-slate-100 dark:border-slate-700 dark:bg-slate-800 cursor-pointer shadow-2xs"
                  title="Click to view full preview"
                >
                  <img
                    src={item.thumbnailUrl}
                    alt={item.name}
                    className="h-full w-full object-cover transition-transform group-hover/thumb:scale-110"
                  />
                  <div className="absolute inset-0 bg-black/30 opacity-0 group-hover/thumb:opacity-100 flex items-center justify-center transition-opacity text-white">
                    <Eye className="h-5 w-5 drop-shadow" />
                  </div>
                </div>

                <div className="min-w-0 flex-1">
                  <div className="flex flex-wrap items-center gap-2">
                    <span className="truncate text-sm font-bold text-slate-900 dark:text-white" title={item.name}>
                      {item.name}
                    </span>
                    <span
                      className={`rounded px-1.5 py-0.5 text-[10px] font-black uppercase border ${getFormatBadge(
                        item.file.name.split('.').pop() || 'png'
                      )}`}
                    >
                      {item.file.name.split('.').pop()?.toUpperCase() || 'IMG'}
                    </span>
                  </div>

                  <div className="mt-1 flex flex-wrap items-center gap-2 text-xs text-slate-500 dark:text-slate-400">
                    <span>{formatBytes(item.originalSize)}</span>
                    {item.originalWidth > 0 && (
                      <>
                        <span>•</span>
                        <span>
                          {item.originalWidth} × {item.originalHeight} px
                        </span>
                      </>
                    )}
                    <span>•</span>

                    {/* Individual format selector */}
                    <div className="flex items-center gap-1">
                      <span className="text-[11px] text-slate-400">To:</span>
                      <select
                        value={item.targetFormat}
                        onChange={(e) => {
                          const val = e.target.value as ImageTargetFormat;
                          setImages((prev) =>
                            prev.map((i) => (i.id === item.id ? { ...i, targetFormat: val } : i))
                          );
                        }}
                        disabled={item.status === 'converting'}
                        className="rounded-lg border border-slate-300 bg-white px-1.5 py-0.5 text-xs font-bold text-slate-800 dark:border-slate-700 dark:bg-slate-800 dark:text-white"
                      >
                        <option value="webp">WEBP</option>
                        <option value="png">PNG</option>
                        <option value="jpg">JPG</option>
                        <option value="pdf">PDF</option>
                        <option value="svg">SVG</option>
                        <option value="bmp">BMP</option>
                      </select>
                    </div>
                  </div>

                  {/* Completed summary line with size saving */}
                  {item.status === 'completed' && item.convertedSize && (
                    <div className="mt-1.5 flex flex-wrap items-center gap-2 text-xs font-semibold text-emerald-600 dark:text-emerald-400">
                      <CheckCircle2 className="h-3.5 w-3.5" />
                      <span>{item.convertedName}</span>
                      <span className="rounded bg-emerald-100 px-1.5 py-0.5 text-[10px] font-bold text-emerald-800 dark:bg-emerald-950/60 dark:text-emerald-300">
                        {formatBytes(item.convertedSize)}
                      </span>
                      {item.convertedSize < item.originalSize && (
                        <span className="text-[11px] text-emerald-600 dark:text-emerald-400">
                          (-{Math.round((1 - item.convertedSize / item.originalSize) * 100)}% smaller)
                        </span>
                      )}
                    </div>
                  )}
                </div>
              </div>

              {/* Right: Actions */}
              <div className="flex items-center justify-end gap-2 shrink-0 pt-2 sm:pt-0 border-t sm:border-t-0 border-slate-100 dark:border-slate-800">
                {item.status === 'queued' && (
                  <button
                    onClick={() => handleConvertSingle(item.id)}
                    className="flex items-center gap-1 rounded-xl bg-purple-600 px-3.5 py-1.5 text-xs font-bold text-white shadow-sm hover:bg-purple-700 active:scale-95 transition"
                  >
                    <RefreshCw className="h-3.5 w-3.5" />
                    <span>Convert</span>
                  </button>
                )}

                {item.status === 'converting' && (
                  <div className="flex items-center gap-1.5 rounded-xl bg-purple-50 px-3 py-1.5 text-xs font-bold text-purple-700 dark:bg-purple-950/50 dark:text-purple-300 border border-purple-200 dark:border-purple-900/50">
                    <RefreshCw className="h-3.5 w-3.5 animate-spin" />
                    <span>{item.progress}%</span>
                  </div>
                )}

                {item.status === 'completed' && (
                  <>
                    <button
                      onClick={() =>
                        setPreviewImage({
                          url: item.convertedUrl || item.thumbnailUrl,
                          title: item.convertedName || item.name,
                        })
                      }
                      className="rounded-xl border border-slate-200 bg-white p-2 text-slate-700 hover:bg-slate-50 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-200 dark:hover:bg-slate-700 transition shadow-2xs"
                      title="Preview Image"
                    >
                      <Eye className="h-4 w-4" />
                    </button>
                    <button
                      onClick={() => handleDownloadSingle(item)}
                      className="flex items-center gap-1.5 rounded-xl bg-emerald-600 px-3.5 py-1.5 text-xs font-bold text-white shadow-sm hover:bg-emerald-700 active:scale-95 transition"
                      title="Download converted image"
                    >
                      <Download className="h-3.5 w-3.5" />
                      <span>Save</span>
                    </button>
                  </>
                )}

                <button
                  onClick={() => handleRemove(item.id)}
                  disabled={item.status === 'converting'}
                  className="rounded-xl p-1.5 text-slate-400 hover:bg-rose-50 hover:text-rose-600 dark:hover:bg-rose-950/40 dark:hover:text-rose-400 transition"
                  title="Remove image"
                >
                  <Trash2 className="h-4 w-4" />
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Lightbox Preview Modal for Image */}
      {previewImage && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 p-4 backdrop-blur-sm"
          onClick={() => setPreviewImage(null)}
        >
          <div
            className="relative max-h-[90vh] max-w-4xl overflow-hidden rounded-2xl bg-white p-2 shadow-2xl dark:bg-slate-900"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between border-b border-slate-200 p-3 dark:border-slate-800">
              <span className="font-bold text-sm text-slate-900 dark:text-white truncate">
                {previewImage.title}
              </span>
              <button
                onClick={() => setPreviewImage(null)}
                className="rounded-lg p-1 text-slate-500 hover:bg-slate-100 dark:text-slate-400 dark:hover:bg-slate-800"
              >
                ✕
              </button>
            </div>
            <div className="flex items-center justify-center p-4 max-h-[75vh] overflow-auto">
              <img
                src={previewImage.url}
                alt={previewImage.title}
                className="max-h-[70vh] max-w-full rounded-lg object-contain shadow-md"
              />
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
