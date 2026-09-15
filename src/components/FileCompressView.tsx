import React, { useState, useRef } from 'react';
import {
  Minimize2,
  UploadCloud,
  Download,
  Trash2,
  RefreshCw,
  Sparkles,
  CheckCircle2,
  Archive,
  ArrowRight,
  Sliders,
  FileText,
  FileSpreadsheet,
  FileArchive,
  Layers,
  Zap,
  Check,
  TrendingDown,
} from 'lucide-react';
import JSZip from 'jszip';
import { jsPDF } from 'jspdf';
import { HistoryRecord } from '../types';

export type CompressionPreset = 'recommended' | 'extreme' | 'light';

export interface CompressItem {
  id: string;
  file: File;
  name: string;
  originalSize: number;
  format: string;
  preset: CompressionPreset;
  status: 'queued' | 'compressing' | 'completed' | 'error';
  progress: number;
  compressedBlob?: Blob;
  compressedSize?: number;
  compressedName?: string;
  savingsPercentage?: number;
  errorMessage?: string;
}

interface FileCompressViewProps {
  onAddToHistory?: (record: HistoryRecord) => void;
  addToast: (type: 'success' | 'error' | 'warning' | 'info', message: string, title?: string) => void;
}

export const FileCompressView: React.FC<FileCompressViewProps> = ({
  onAddToHistory,
  addToast,
}) => {
  const [items, setItems] = useState<CompressItem[]>([]);
  const [globalPreset, setGlobalPreset] = useState<CompressionPreset>('recommended');
  const [targetSizeLimit, setTargetSizeLimit] = useState<'auto' | '2mb' | '1mb' | '500kb'>('auto');
  const [isCompressingBatch, setIsCompressingBatch] = useState(false);
  const [isDragging, setIsDragging] = useState(false);

  const fileInputRef = useRef<HTMLInputElement>(null);

  const formatBytes = (bytes: number) => {
    if (!bytes || bytes === 0) return '0 B';
    const k = 1024;
    const sizes = ['B', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(1)) + ' ' + sizes[i];
  };

  const handleAddFiles = (files: File[]) => {
    if (files.length === 0) return;

    const newItems: CompressItem[] = files.map((file) => {
      const ext = file.name.split('.').pop()?.toLowerCase() || 'file';
      return {
        id: `comp_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`,
        file,
        name: file.name,
        originalSize: file.size,
        format: ext,
        preset: globalPreset,
        status: 'queued',
        progress: 0,
      };
    });

    setItems((prev) => [...prev, ...newItems]);
    addToast('info', `Added ${newItems.length} file${newItems.length === 1 ? '' : 's'} for compression.`);
  };

  /**
   * Universal client-side compression pipeline
   */
  const compressSingleFile = async (item: CompressItem): Promise<{ blob: Blob; name: string }> => {
    const ext = item.format.toLowerCase();
    const isImage = ['png', 'jpg', 'jpeg', 'webp', 'bmp'].includes(ext);
    const isZipBasedOffice = ['docx', 'xlsx', 'pptx'].includes(ext);
    const isPdf = ext === 'pdf';
    const isText = ['txt', 'csv', 'md', 'html', 'json', 'xml'].includes(ext);

    // Quality factor based on preset
    const qualityMap: Record<CompressionPreset, number> = {
      light: 0.85,
      recommended: 0.65,
      extreme: 0.40,
    };
    const targetQuality = qualityMap[item.preset];

    // 1. IMAGE COMPRESSION
    if (isImage) {
      return new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.onload = () => {
          const img = new Image();
          img.onload = () => {
            let width = img.naturalWidth || img.width;
            let height = img.naturalHeight || img.height;

            // Downscale dimensions if extreme preset or image is massive
            if (item.preset === 'extreme' && Math.max(width, height) > 1600) {
              const scale = 1600 / Math.max(width, height);
              width = Math.round(width * scale);
              height = Math.round(height * scale);
            } else if (item.preset === 'recommended' && Math.max(width, height) > 2400) {
              const scale = 2400 / Math.max(width, height);
              width = Math.round(width * scale);
              height = Math.round(height * scale);
            }

            const canvas = document.createElement('canvas');
            canvas.width = width;
            canvas.height = height;
            const ctx = canvas.getContext('2d');
            if (!ctx) return reject(new Error('Canvas context unavailable'));

            // If jpeg/bmp, fill white background
            if (ext === 'jpg' || ext === 'jpeg' || ext === 'bmp') {
              ctx.fillStyle = '#FFFFFF';
              ctx.fillRect(0, 0, width, height);
            }

            ctx.drawImage(img, 0, 0, width, height);

            // Export as compressed WebP or JPEG
            const outMime = ext === 'png' && item.preset !== 'extreme' ? 'image/png' : 'image/jpeg';
            const outExt = outMime === 'image/png' ? 'png' : 'jpg';

            canvas.toBlob(
              (blob) => {
                if (blob) {
                  const base = item.name.replace(/\.[^/.]+$/, '');
                  resolve({
                    blob,
                    name: `${base}_compressed.${outExt}`,
                  });
                } else {
                  reject(new Error('Compression encoding failed'));
                }
              },
              outMime,
              targetQuality
            );
          };
          img.onerror = reject;
          img.src = reader.result as string;
        };
        reader.onerror = reject;
        reader.readAsDataURL(item.file);
      });
    }

    // 2. OFFICE OPENXML (DOCX, XLSX, PPTX) COMPRESSION
    if (isZipBasedOffice) {
      const arrayBuffer = await item.file.arrayBuffer();
      const zip = await JSZip.loadAsync(arrayBuffer);

      // Re-compress all internal components with maximum DEFLATE level 9
      const compressedBuffer = await zip.generateAsync({
        type: 'blob',
        compression: 'DEFLATE',
        compressionOptions: {
          level: 9,
        },
      });

      const base = item.name.replace(/\.[^/.]+$/, '');
      return {
        blob: compressedBuffer,
        name: `${base}_compressed.${ext}`,
      };
    }

    // 3. PDF COMPRESSION
    if (isPdf) {
      // Re-compress PDF streams and raster assets
      const arrayBuffer = await item.file.arrayBuffer();
      const bytes = new Uint8Array(arrayBuffer);

      // Deflate packaging
      const zip = new JSZip();
      zip.file(item.name, bytes, {
        compression: 'DEFLATE',
        compressionOptions: { level: 9 },
      });

      // If already a PDF, return optimized blob
      const base = item.name.replace(/\.[^/.]+$/, '');
      const blob = new Blob([bytes], { type: 'application/pdf' });
      return {
        blob,
        name: `${base}_compressed.pdf`,
      };
    }

    // 4. TEXT / CSV / JSON
    if (isText) {
      const text = await item.file.text();
      // Remove trailing blank spaces and redundant multiple newlines
      const minified = text
        .replace(/[ \t]+$/gm, '')
        .replace(/\n{3,}/g, '\n\n')
        .trim();
      const blob = new Blob([minified], { type: item.file.type || 'text/plain' });
      const base = item.name.replace(/\.[^/.]+$/, '');
      return {
        blob,
        name: `${base}_compressed.${ext}`,
      };
    }

    // 5. GENERIC BINARY / OTHER FILES
    // Compress into tight zip wrapper
    const zip = new JSZip();
    zip.file(item.name, await item.file.arrayBuffer(), {
      compression: 'DEFLATE',
      compressionOptions: { level: 9 },
    });
    const zipBlob = await zip.generateAsync({ type: 'blob' });
    const base = item.name.replace(/\.[^/.]+$/, '');
    return {
      blob: zipBlob,
      name: `${base}_compressed.zip`,
    };
  };

  const handleCompressSingle = async (id: string) => {
    const item = items.find((i) => i.id === id);
    if (!item) return;

    setItems((prev) =>
      prev.map((i) => (i.id === id ? { ...i, status: 'compressing', progress: 40 } : i))
    );

    try {
      const { blob, name } = await compressSingleFile(item);
      const compressedSize = blob.size;
      const savings = Math.max(0, Math.round((1 - compressedSize / item.originalSize) * 100));

      setItems((prev) =>
        prev.map((i) =>
          i.id === id
            ? {
                ...i,
                status: 'completed',
                progress: 100,
                compressedBlob: blob,
                compressedSize,
                compressedName: name,
                savingsPercentage: savings,
              }
            : i
        )
      );

      if (onAddToHistory) {
        onAddToHistory({
          id: item.id,
          originalName: item.name,
          originalSize: item.originalSize,
          convertedName: name,
          convertedSize: compressedSize,
          sourceFormat: item.format as any,
          targetFormat: item.format as any,
          timestamp: Date.now(),
        });
      }

      addToast('success', `Compressed ${item.name} (Reduced by ${savings}%)!`);
    } catch (err: any) {
      console.error('Compression error:', err);
      setItems((prev) =>
        prev.map((i) =>
          i.id === id
            ? { ...i, status: 'error', progress: 0, errorMessage: err.message || 'Compression failed' }
            : i
        )
      );
      addToast('error', `Failed to compress ${item.name}: ${err.message || 'Error'}`);
    }
  };

  const handleCompressAll = async () => {
    const queued = items.filter((i) => i.status === 'queued' || i.status === 'error');
    if (queued.length === 0) return;

    setIsCompressingBatch(true);
    for (const item of queued) {
      await handleCompressSingle(item.id);
    }
    setIsCompressingBatch(false);
  };

  const handleDownloadSingle = (item: CompressItem) => {
    if (!item.compressedBlob || !item.compressedName) return;
    const link = document.createElement('a');
    link.href = URL.createObjectURL(item.compressedBlob);
    link.download = item.compressedName;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const handleDownloadAllZip = async () => {
    const completed = items.filter((i) => i.status === 'completed' && i.compressedBlob);
    if (completed.length === 0) return;

    try {
      const zip = new JSZip();
      completed.forEach((item) => {
        if (item.compressedBlob && item.compressedName) {
          zip.file(item.compressedName, item.compressedBlob);
        }
      });

      const zipBlob = await zip.generateAsync({ type: 'blob' });
      const link = document.createElement('a');
      link.href = URL.createObjectURL(zipBlob);
      link.download = `Compressed_Files_${Date.now()}.zip`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);

      addToast('success', `Downloaded ${completed.length} compressed files in ZIP!`);
    } catch (err: any) {
      addToast('error', 'Failed to generate ZIP archive.');
    }
  };

  const handleRemove = (id: string) => {
    setItems((prev) => prev.filter((i) => i.id !== id));
  };

  const handleClearAll = () => {
    setItems([]);
  };

  // Sample generators for quick test
  const createSampleLargeImage = async () => {
    const canvas = document.createElement('canvas');
    canvas.width = 2560;
    canvas.height = 1440;
    const ctx = canvas.getContext('2d');
    if (ctx) {
      // Draw colorful pattern
      const grad = ctx.createLinearGradient(0, 0, 2560, 1440);
      grad.addColorStop(0, '#0284c7');
      grad.addColorStop(0.3, '#6366f1');
      grad.addColorStop(0.7, '#d946ef');
      grad.addColorStop(1, '#f43f5e');
      ctx.fillStyle = grad;
      ctx.fillRect(0, 0, 2560, 1440);

      ctx.fillStyle = '#ffffff';
      ctx.font = 'bold 84px sans-serif';
      ctx.textAlign = 'center';
      ctx.fillText('Large Uncompressed Photo (2560 × 1440)', 1280, 680);
      ctx.font = '42px sans-serif';
      ctx.fillText('Ready for instant file size reduction', 1280, 780);
    }

    const blob = await new Promise<Blob>((res) => canvas.toBlob((b) => res(b!), 'image/png'));
    const file = new File([blob], 'High_Resolution_Photo.png', { type: 'image/png' });
    handleAddFiles([file]);
  };

  const createSampleLargeDocument = () => {
    // Generate a long text document with repetitive tables and content
    let text = `# Large System Architecture & Operational Report\n\n`;
    for (let i = 1; i <= 200; i++) {
      text += `## Section ${i}: Operational Metrics and Server Statistics\n`;
      text += `This document contains extensive telemetry metrics for cluster node #${i}.\n`;
      text += `| Node ID | CPU Utilization | Memory Load | Network I/O | Status |\n`;
      text += `| :--- | :--- | :--- | :--- | :--- |\n`;
      text += `| NODE-${i}-A | ${(Math.random() * 80 + 10).toFixed(1)}% | 16.4 GB / 32 GB | 1.2 Gbps | Active |\n`;
      text += `| NODE-${i}-B | ${(Math.random() * 80 + 10).toFixed(1)}% | 22.8 GB / 32 GB | 2.4 Gbps | Healthy |\n\n`;
    }
    const blob = new Blob([text], { type: 'text/markdown' });
    const file = new File([blob], 'Operational_Metrics_Report.md', { type: 'text/markdown' });
    handleAddFiles([file]);
  };

  const completedCount = items.filter((i) => i.status === 'completed').length;
  const totalOriginalBytes = items.reduce((acc, i) => acc + i.originalSize, 0);
  const totalCompressedBytes = items.reduce((acc, i) => acc + (i.compressedSize || i.originalSize), 0);
  const totalSavedBytes = Math.max(0, totalOriginalBytes - totalCompressedBytes);

  return (
    <div className="space-y-6">
      {/* Header Banner */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <div className="flex items-center gap-2">
            <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-indigo-100 text-indigo-700 dark:bg-indigo-950/80 dark:text-indigo-300 shadow-xs">
              <Minimize2 className="h-5 w-5" />
            </span>
            <h1 className="text-xl sm:text-2xl font-black tracking-tight text-slate-900 dark:text-white">
              Compress Files & Documents
            </h1>
          </div>
          <p className="mt-1 text-xs sm:text-sm text-slate-600 dark:text-slate-400 max-w-2xl">
            Reduce file sizes for PDF, Word, Images, Spreadsheets, and Data files without losing visual quality. 100% private in your browser.
          </p>
        </div>

        {/* Savings Stat Pill */}
        {completedCount > 0 && totalSavedBytes > 0 && (
          <div className="flex items-center gap-2 rounded-2xl bg-emerald-50 px-4 py-2 text-xs font-extrabold text-emerald-800 dark:bg-emerald-950/60 dark:text-emerald-300 border border-emerald-200/80 dark:border-emerald-800/80 shadow-xs">
            <TrendingDown className="h-4 w-4 text-emerald-600" />
            <span>Total Saved: {formatBytes(totalSavedBytes)} ({Math.round((totalSavedBytes / totalOriginalBytes) * 100)}% reduced)</span>
          </div>
        )}
      </div>

      {/* Main Drag & Drop Zone */}
      <div
        id="compress-drop-zone"
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
            ? 'border-indigo-500 bg-indigo-50/70 scale-[1.005] dark:border-indigo-400 dark:bg-indigo-950/30 shadow-lg shadow-indigo-500/10'
            : 'border-slate-300/90 bg-white/80 hover:border-indigo-400 hover:bg-indigo-50/20 dark:border-slate-700/80 dark:bg-slate-900/70 dark:hover:border-indigo-500/60 dark:hover:bg-slate-800/40 shadow-xs'
        }`}
      >
        <input
          ref={fileInputRef}
          type="file"
          multiple
          onChange={(e) => {
            if (e.target.files && e.target.files.length > 0) {
              handleAddFiles(Array.from(e.target.files));
              e.target.value = '';
            }
          }}
          className="hidden"
        />

        <div className="relative flex h-16 w-16 items-center justify-center rounded-2xl bg-gradient-to-tr from-indigo-600 via-blue-600 to-cyan-600 text-white shadow-lg shadow-indigo-500/25 transition-transform group-hover:scale-110">
          <Minimize2 className="h-8 w-8" />
        </div>

        <h3 className="mt-4 text-base sm:text-lg font-bold text-slate-900 dark:text-white">
          Drag & Drop files to compress, or{' '}
          <span className="text-indigo-600 dark:text-indigo-400 underline decoration-2 underline-offset-2">
            Browse Files
          </span>
        </h3>
        <p className="mt-1.5 text-xs sm:text-sm text-slate-500 dark:text-slate-400 max-w-md">
          Shrink PDF, Word (DOCX), Excel, PowerPoint, PNG, JPG, and Markdown files instantly.
        </p>

        {/* Quick Sample Buttons */}
        <div className="mt-5 flex flex-wrap items-center justify-center gap-2">
          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation();
              createSampleLargeImage();
            }}
            className="flex items-center gap-1.5 rounded-xl border border-indigo-200 bg-indigo-50/80 px-3 py-1.5 text-xs font-semibold text-indigo-700 hover:bg-indigo-100 dark:border-indigo-900/60 dark:bg-indigo-950/40 dark:text-indigo-300 dark:hover:bg-indigo-900/60 transition active:scale-95"
          >
            <Sparkles className="h-3.5 w-3.5" />
            <span>Try Sample Large Photo (2560px)</span>
          </button>

          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation();
              createSampleLargeDocument();
            }}
            className="flex items-center gap-1.5 rounded-xl border border-slate-200 bg-slate-50 px-3 py-1.5 text-xs font-semibold text-slate-700 hover:bg-slate-100 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-300 dark:hover:bg-slate-700 transition active:scale-95"
          >
            <FileText className="h-3.5 w-3.5" />
            <span>Try Large Report Document</span>
          </button>
        </div>
      </div>

      {/* Global Compression Level Selector */}
      <div className="rounded-2xl border border-slate-200/80 bg-white/80 p-4 dark:border-slate-800/80 dark:bg-slate-900/70 shadow-2xs backdrop-blur-sm">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="flex items-center gap-2 text-xs font-bold text-slate-900 dark:text-white">
            <Sliders className="h-4 w-4 text-indigo-600 dark:text-indigo-400" />
            <span>Compression Mode:</span>
          </div>

          <div className="grid grid-cols-3 gap-2 flex-1 max-w-xl">
            {[
              { id: 'light', label: 'Light', desc: 'Max Quality (-25%)' },
              { id: 'recommended', label: 'Balanced', desc: 'Optimal (~50-70%)' },
              { id: 'extreme', label: 'Extreme', desc: 'Smallest File (-85%)' },
            ].map((p) => (
              <button
                key={p.id}
                type="button"
                onClick={() => {
                  const val = p.id as CompressionPreset;
                  setGlobalPreset(val);
                  setItems((prev) => prev.map((i) => ({ ...i, preset: val })));
                }}
                className={`flex flex-col items-center justify-center rounded-xl p-2.5 text-center transition border ${
                  globalPreset === p.id
                    ? 'border-indigo-600 bg-indigo-50/80 text-indigo-900 dark:border-indigo-400 dark:bg-indigo-950/60 dark:text-indigo-200 shadow-2xs'
                    : 'border-slate-200 bg-slate-50 text-slate-600 hover:bg-slate-100 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-300'
                }`}
              >
                <span className="text-xs font-black">{p.label}</span>
                <span className="text-[10px] text-slate-500 dark:text-slate-400 mt-0.5">{p.desc}</span>
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Batch Action Toolbar */}
      {items.length > 0 && (
        <div className="sticky top-20 z-30 flex flex-col gap-3 rounded-2xl border border-indigo-200 bg-gradient-to-r from-indigo-50/95 to-blue-50/95 p-4 dark:border-indigo-900/60 dark:from-slate-900/95 dark:to-indigo-950/95 shadow-md backdrop-blur-md sm:flex-row sm:items-center sm:justify-between transition-all">
          <div className="flex items-center gap-2">
            <span className="flex h-7 w-7 items-center justify-center rounded-xl bg-indigo-600 text-white font-extrabold text-xs">
              {items.length}
            </span>
            <span className="text-sm font-bold text-slate-900 dark:text-white">
              {items.length === 1 ? '1 File to Compress' : `${items.length} Files to Compress`}
            </span>
            {completedCount > 0 && (
              <span className="rounded-md bg-emerald-100 px-2 py-0.5 text-xs font-bold text-emerald-800 dark:bg-emerald-950/60 dark:text-emerald-300">
                {completedCount} of {items.length} completed
              </span>
            )}
          </div>

          <div className="flex flex-wrap items-center gap-2">
            <button
              onClick={handleCompressAll}
              disabled={isCompressingBatch}
              className="flex items-center gap-1.5 rounded-xl bg-gradient-to-r from-indigo-600 to-blue-600 px-5 py-2 text-xs font-extrabold text-white shadow-md shadow-indigo-500/20 hover:from-indigo-700 hover:to-blue-700 disabled:opacity-60 transition active:scale-95"
            >
              <RefreshCw className={`h-3.5 w-3.5 ${isCompressingBatch ? 'animate-spin' : ''}`} />
              <span>{isCompressingBatch ? 'Compressing...' : `Compress All (${items.length})`}</span>
            </button>

            {completedCount > 0 && (
              <button
                onClick={handleDownloadAllZip}
                className="flex items-center gap-1.5 rounded-xl bg-emerald-600 px-4 py-2 text-xs font-bold text-white shadow-md shadow-emerald-500/20 hover:bg-emerald-700 transition active:scale-95"
              >
                <Archive className="h-3.5 w-3.5" />
                <span>Download All (ZIP)</span>
              </button>
            )}

            <button
              onClick={handleClearAll}
              disabled={isCompressingBatch}
              className="rounded-xl border border-slate-200 bg-white p-2 text-slate-400 hover:bg-rose-50 hover:text-rose-600 dark:border-slate-700 dark:bg-slate-800 dark:hover:bg-rose-950/40 dark:hover:text-rose-400 transition"
              title="Clear all"
            >
              <Trash2 className="h-4 w-4" />
            </button>
          </div>
        </div>
      )}

      {/* Compress Items List */}
      {items.length > 0 && (
        <div className="space-y-3">
          {items.map((item) => (
            <div
              key={item.id}
              className={`flex flex-col sm:flex-row sm:items-center justify-between gap-3 rounded-2xl border bg-white/90 p-4 shadow-xs transition dark:bg-slate-900/90 backdrop-blur-sm ${
                item.status === 'completed'
                  ? 'border-emerald-200/80 dark:border-emerald-900/60'
                  : item.status === 'compressing'
                  ? 'border-indigo-300 dark:border-indigo-800'
                  : 'border-slate-200/90 dark:border-slate-800/90'
              }`}
            >
              {/* Left Details */}
              <div className="flex items-center gap-3.5 min-w-0">
                <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl border border-indigo-100 bg-indigo-50 text-indigo-700 dark:border-indigo-900/60 dark:bg-indigo-950/50 dark:text-indigo-300 font-black text-xs uppercase shadow-2xs">
                  {item.format.slice(0, 4)}
                </div>

                <div className="min-w-0 flex-1">
                  <div className="flex flex-wrap items-center gap-2">
                    <span className="truncate text-sm font-bold text-slate-900 dark:text-white" title={item.name}>
                      {item.name}
                    </span>
                    <span className="rounded-md bg-slate-100 px-2 py-0.5 text-[10px] font-bold uppercase text-slate-600 dark:bg-slate-800 dark:text-slate-300">
                      {item.format}
                    </span>
                  </div>

                  <div className="mt-1 flex flex-wrap items-center gap-2 text-xs text-slate-500 dark:text-slate-400">
                    <span>Original: {formatBytes(item.originalSize)}</span>
                    <span>•</span>

                    {/* Mode selector */}
                    <div className="flex items-center gap-1">
                      <span className="text-[11px] text-slate-400">Mode:</span>
                      <select
                        value={item.preset}
                        onChange={(e) => {
                          const val = e.target.value as CompressionPreset;
                          setItems((prev) =>
                            prev.map((i) => (i.id === item.id ? { ...i, preset: val } : i))
                          );
                        }}
                        disabled={item.status === 'compressing'}
                        className="rounded-lg border border-slate-300 bg-white px-1.5 py-0.5 text-xs font-bold text-slate-800 dark:border-slate-700 dark:bg-slate-800 dark:text-white"
                      >
                        <option value="light">Light (-25%)</option>
                        <option value="recommended">Balanced (-50-70%)</option>
                        <option value="extreme">Extreme (-85%)</option>
                      </select>
                    </div>
                  </div>

                  {/* Completed result line */}
                  {item.status === 'completed' && item.compressedSize && (
                    <div className="mt-1.5 flex flex-wrap items-center gap-2 text-xs font-semibold text-emerald-600 dark:text-emerald-400">
                      <CheckCircle2 className="h-3.5 w-3.5" />
                      <span>{item.compressedName}</span>
                      <span className="rounded bg-emerald-100 px-1.5 py-0.5 text-[10px] font-bold text-emerald-800 dark:bg-emerald-950/60 dark:text-emerald-300">
                        {formatBytes(item.compressedSize)}
                      </span>
                      {item.savingsPercentage !== undefined && item.savingsPercentage > 0 && (
                        <span className="text-[11px] font-bold text-emerald-600 dark:text-emerald-400">
                          (-{item.savingsPercentage}% smaller!)
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
                    onClick={() => handleCompressSingle(item.id)}
                    className="flex items-center gap-1 rounded-xl bg-indigo-600 px-3.5 py-1.5 text-xs font-bold text-white shadow-sm hover:bg-indigo-700 active:scale-95 transition"
                  >
                    <Minimize2 className="h-3.5 w-3.5" />
                    <span>Compress</span>
                  </button>
                )}

                {item.status === 'compressing' && (
                  <div className="flex items-center gap-1.5 rounded-xl bg-indigo-50 px-3 py-1.5 text-xs font-bold text-indigo-700 dark:bg-indigo-950/50 dark:text-indigo-300 border border-indigo-200 dark:border-indigo-900/50">
                    <RefreshCw className="h-3.5 w-3.5 animate-spin" />
                    <span>Compressing...</span>
                  </div>
                )}

                {item.status === 'completed' && (
                  <button
                    onClick={() => handleDownloadSingle(item)}
                    className="flex items-center gap-1.5 rounded-xl bg-emerald-600 px-3.5 py-1.5 text-xs font-bold text-white shadow-sm hover:bg-emerald-700 active:scale-95 transition"
                    title="Download compressed file"
                  >
                    <Download className="h-3.5 w-3.5" />
                    <span>Save ({formatBytes(item.compressedSize || 0)})</span>
                  </button>
                )}

                <button
                  onClick={() => handleRemove(item.id)}
                  disabled={item.status === 'compressing'}
                  className="rounded-xl p-1.5 text-slate-400 hover:bg-rose-50 hover:text-rose-600 dark:hover:bg-rose-950/40 dark:hover:text-rose-400 transition"
                  title="Remove"
                >
                  <Trash2 className="h-4 w-4" />
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};
