import React, { useState, useRef } from 'react';
import {
  FileText,
  Layers,
  Scissors,
  RotateCw,
  Stamp,
  UploadCloud,
  ArrowUp,
  ArrowDown,
  Trash2,
  Download,
  CheckCircle2,
  AlertCircle,
  Loader2,
  Eye,
  Sparkles,
  ShieldCheck,
  Check,
} from 'lucide-react';
import {
  mergePdfFiles,
  splitPdfFile,
  rotatePdfPages,
  watermarkPdfFile,
  getPdfInfo,
  PdfMetadataInfo,
  WatermarkOptions,
} from '../utils/pdfStudioEngine';
import { downloadBlob } from '../utils/downloadHelper';
import { HistoryRecord } from '../types';

export type PDFStudioTab = 'merge' | 'split' | 'rotate' | 'watermark';

interface PDFStudioViewProps {
  onAddToHistory?: (record: HistoryRecord) => void;
  addToast?: (type: 'success' | 'error' | 'warning' | 'info', message: string, title?: string) => void;
}

export const PDFStudioView: React.FC<PDFStudioViewProps> = ({ onAddToHistory, addToast }) => {
  const [activeTab, setActiveTab] = useState<PDFStudioTab>('merge');
  const [isProcessing, setIsProcessing] = useState<boolean>(false);
  const [progressPercent, setProgressPercent] = useState<number>(0);
  const [statusMessage, setStatusMessage] = useState<string>('');
  const [resultBlob, setResultBlob] = useState<Blob | null>(null);
  const [resultFileName, setResultFileName] = useState<string>('');

  // ── Merge State ──
  const [mergeFiles, setMergeFiles] = useState<File[]>([]);
  const mergeInputRef = useRef<HTMLInputElement>(null);

  // ── Split State ──
  const [splitFile, setSplitFile] = useState<File | null>(null);
  const [splitMeta, setSplitMeta] = useState<PdfMetadataInfo | null>(null);
  const [pageRange, setPageRange] = useState<string>('1');
  const splitInputRef = useRef<HTMLInputElement>(null);

  // ── Rotate State ──
  const [rotateFile, setRotateFile] = useState<File | null>(null);
  const [rotateMeta, setRotateMeta] = useState<PdfMetadataInfo | null>(null);
  const [rotationDegrees, setRotationDegrees] = useState<90 | 180 | 270>(90);
  const [rotateScope, setRotateScope] = useState<'all' | 'odd' | 'even'>('all');
  const rotateInputRef = useRef<HTMLInputElement>(null);

  // ── Watermark State ──
  const [watermarkFile, setWatermarkFile] = useState<File | null>(null);
  const [watermarkMeta, setWatermarkMeta] = useState<PdfMetadataInfo | null>(null);
  const [watermarkText, setWatermarkText] = useState<string>('CONFIDENTIAL');
  const [watermarkOpacity, setWatermarkOpacity] = useState<number>(0.25);
  const [watermarkFontSize, setWatermarkFontSize] = useState<number>(48);
  const [watermarkColor, setWatermarkColor] = useState<string>('#e11d48');
  const [watermarkDiagonal, setWatermarkDiagonal] = useState<boolean>(true);
  const [watermarkScope, setWatermarkScope] = useState<'all' | 'first' | 'odd' | 'even'>('all');
  const watermarkInputRef = useRef<HTMLInputElement>(null);

  const resetResult = () => {
    setResultBlob(null);
    setResultFileName('');
    setProgressPercent(0);
    setStatusMessage('');
  };

  const handleTabChange = (tab: PDFStudioTab) => {
    setActiveTab(tab);
    resetResult();
  };

  const recordToHistory = (name: string, blob: Blob, _actionLabel?: string) => {
    if (!onAddToHistory) return;
    const rec: HistoryRecord = {
      id: `hist_pdf_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`,
      originalName: name,
      originalSize: blob.size,
      convertedName: name,
      convertedSize: blob.size,
      sourceFormat: 'pdf',
      targetFormat: 'pdf',
      timestamp: Date.now(),
    };
    onAddToHistory(rec);
  };

  // ── Merge Handlers ──
  const handleAddMergeFiles = (files: FileList | null) => {
    if (!files) return;
    const pdfs = Array.from(files).filter((f) => f.name.toLowerCase().endsWith('.pdf'));
    if (pdfs.length === 0) {
      addToast?.('warning', 'Please select PDF documents only.');
      return;
    }
    setMergeFiles((prev) => [...prev, ...pdfs]);
    resetResult();
  };

  const moveMergeFile = (index: number, direction: 'up' | 'down') => {
    const targetIndex = direction === 'up' ? index - 1 : index + 1;
    if (targetIndex < 0 || targetIndex >= mergeFiles.length) return;
    const updated = [...mergeFiles];
    const temp = updated[index];
    updated[index] = updated[targetIndex];
    updated[targetIndex] = temp;
    setMergeFiles(updated);
  };

  const removeMergeFile = (index: number) => {
    setMergeFiles((prev) => prev.filter((_, i) => i !== index));
  };

  const handleExecuteMerge = async () => {
    if (mergeFiles.length < 2) {
      addToast?.('warning', 'Please select at least 2 PDF files to merge.');
      return;
    }
    setIsProcessing(true);
    resetResult();
    try {
      const mergedBlob = await mergePdfFiles(mergeFiles, (pct, msg) => {
        setProgressPercent(pct);
        setStatusMessage(msg);
      });
      const outName = `merged_${mergeFiles.length}_docs.pdf`;
      setResultBlob(mergedBlob);
      setResultFileName(outName);
      recordToHistory(outName, mergedBlob, 'Merged PDFs');
      addToast?.('success', `Merged ${mergeFiles.length} PDFs into a single file!`);
    } catch (err: any) {
      addToast?.('error', err.message || 'Failed to merge PDFs.');
    } finally {
      setIsProcessing(false);
    }
  };

  // ── Split Handlers ──
  const handleSelectSplitFile = async (file: File) => {
    if (!file.name.toLowerCase().endsWith('.pdf')) {
      addToast?.('warning', 'Please select a PDF document.');
      return;
    }
    resetResult();
    setSplitFile(file);
    try {
      const meta = await getPdfInfo(file);
      setSplitMeta(meta);
      setPageRange(`1-${Math.min(meta.pageCount, 3)}`);
    } catch (err: any) {
      addToast?.('error', 'Could not read PDF metadata: ' + err.message);
    }
  };

  const handleExecuteSplit = async () => {
    if (!splitFile) return;
    setIsProcessing(true);
    resetResult();
    try {
      const splitBlob = await splitPdfFile(splitFile, pageRange, (pct) => setProgressPercent(pct));
      const baseName = splitFile.name.replace(/\.[^/.]+$/, '');
      const outName = `${baseName}_pages_${pageRange.replace(/[\s,]+/g, '_')}.pdf`;
      setResultBlob(splitBlob);
      setResultFileName(outName);
      recordToHistory(outName, splitBlob, 'Split PDF');
      addToast?.('success', 'Selected pages extracted successfully!');
    } catch (err: any) {
      addToast?.('error', err.message || 'Failed to split PDF.');
    } finally {
      setIsProcessing(false);
    }
  };

  // ── Rotate Handlers ──
  const handleSelectRotateFile = async (file: File) => {
    if (!file.name.toLowerCase().endsWith('.pdf')) {
      addToast?.('warning', 'Please select a PDF document.');
      return;
    }
    resetResult();
    setRotateFile(file);
    try {
      const meta = await getPdfInfo(file);
      setRotateMeta(meta);
    } catch (err: any) {
      addToast?.('error', 'Could not read PDF: ' + err.message);
    }
  };

  const handleExecuteRotate = async () => {
    if (!rotateFile) return;
    setIsProcessing(true);
    resetResult();
    try {
      const rotatedBlob = await rotatePdfPages(rotateFile, rotationDegrees, rotateScope, (pct) =>
        setProgressPercent(pct)
      );
      const baseName = rotateFile.name.replace(/\.[^/.]+$/, '');
      const outName = `${baseName}_rotated_${rotationDegrees}deg.pdf`;
      setResultBlob(rotatedBlob);
      setResultFileName(outName);
      recordToHistory(outName, rotatedBlob, 'Rotated PDF');
      addToast?.('success', `PDF rotated ${rotationDegrees}° successfully!`);
    } catch (err: any) {
      addToast?.('error', err.message || 'Failed to rotate PDF.');
    } finally {
      setIsProcessing(false);
    }
  };

  // ── Watermark Handlers ──
  const handleSelectWatermarkFile = async (file: File) => {
    if (!file.name.toLowerCase().endsWith('.pdf')) {
      addToast?.('warning', 'Please select a PDF document.');
      return;
    }
    resetResult();
    setWatermarkFile(file);
    try {
      const meta = await getPdfInfo(file);
      setWatermarkMeta(meta);
    } catch (err: any) {
      addToast?.('error', 'Could not read PDF: ' + err.message);
    }
  };

  const handleExecuteWatermark = async () => {
    if (!watermarkFile || !watermarkText.trim()) {
      addToast?.('warning', 'Please enter watermark text.');
      return;
    }
    setIsProcessing(true);
    resetResult();
    try {
      const options: WatermarkOptions = {
        text: watermarkText,
        opacity: watermarkOpacity,
        fontSize: watermarkFontSize,
        colorHex: watermarkColor,
        isDiagonal: watermarkDiagonal,
        pages: watermarkScope,
      };
      const markedBlob = await watermarkPdfFile(watermarkFile, options, (pct) =>
        setProgressPercent(pct)
      );
      const baseName = watermarkFile.name.replace(/\.[^/.]+$/, '');
      const outName = `${baseName}_watermarked.pdf`;
      setResultBlob(markedBlob);
      setResultFileName(outName);
      recordToHistory(outName, markedBlob, 'Watermarked PDF');
      addToast?.('success', 'Watermark applied successfully across pages!');
    } catch (err: any) {
      addToast?.('error', err.message || 'Failed to watermark PDF.');
    } finally {
      setIsProcessing(false);
    }
  };

  const handleDownload = () => {
    if (resultBlob && resultFileName) {
      downloadBlob(resultBlob, resultFileName);
      addToast?.('info', `Downloaded ${resultFileName}`);
    }
  };

  return (
    <div className="mx-auto max-w-5xl space-y-6">
      {/* Header Banner */}
      <div className="relative overflow-hidden rounded-3xl border border-rose-500/20 bg-gradient-to-br from-rose-500/10 via-pink-500/5 to-purple-500/10 p-6 sm:p-8 backdrop-blur-xl">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <div className="inline-flex items-center gap-2 rounded-full bg-rose-500/10 px-3 py-1 text-xs font-bold text-rose-600 dark:text-rose-400">
              <Stamp className="h-3.5 w-3.5" />
              <span>Unique Feature · 100% Client-Side</span>
            </div>
            <h1 className="mt-2 text-2xl sm:text-3xl font-extrabold tracking-tight text-slate-900 dark:text-white">
              ConvertX PDF Studio
            </h1>
            <p className="mt-1 text-sm text-slate-600 dark:text-slate-400 max-w-xl">
              Merge, extract, rotate, and stamp watermarks on PDF documents entirely inside your browser. No files are ever sent to any remote server.
            </p>
          </div>
          <div className="flex items-center gap-2 text-xs font-semibold text-emerald-600 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-950/50 px-3 py-2 rounded-2xl border border-emerald-500/20 w-fit">
            <ShieldCheck className="h-4 w-4" />
            <span>Zero-Cloud Processing</span>
          </div>
        </div>

        {/* Tab Switcher */}
        <div className="mt-6 flex flex-wrap gap-2 border-t border-rose-200/40 dark:border-rose-900/40 pt-4">
          {[
            { id: 'merge' as PDFStudioTab, label: 'Merge PDFs', icon: <Layers className="h-4 w-4" /> },
            { id: 'split' as PDFStudioTab, label: 'Split & Extract', icon: <Scissors className="h-4 w-4" /> },
            { id: 'rotate' as PDFStudioTab, label: 'Rotate Pages', icon: <RotateCw className="h-4 w-4" /> },
            { id: 'watermark' as PDFStudioTab, label: 'Watermark', icon: <Stamp className="h-4 w-4" /> },
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => handleTabChange(tab.id)}
              className={`flex items-center gap-2 rounded-xl px-4 py-2 text-xs font-bold transition-all ${
                activeTab === tab.id
                  ? 'bg-rose-600 text-white shadow-md shadow-rose-500/25'
                  : 'bg-white/80 text-slate-700 hover:bg-white hover:text-slate-900 dark:bg-slate-900/80 dark:text-slate-300 dark:hover:bg-slate-800'
              }`}
            >
              {tab.icon}
              <span>{tab.label}</span>
            </button>
          ))}
        </div>
      </div>

      {/* ── 1. MERGE TAB ── */}
      {activeTab === 'merge' && (
        <div className="space-y-4 rounded-3xl border border-slate-200/80 bg-white/80 p-6 dark:border-slate-800/80 dark:bg-slate-900/80 shadow-xs">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-lg font-bold text-slate-900 dark:text-white flex items-center gap-2">
                <Layers className="h-5 w-5 text-rose-500" />
                Combine Multiple PDFs
              </h2>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                Arrange documents in your desired order. Pages will be merged seamlessly into a single file.
              </p>
            </div>
            <button
              onClick={() => mergeInputRef.current?.click()}
              className="flex items-center gap-2 rounded-xl bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 px-3 py-1.5 text-xs font-bold text-slate-800 dark:text-slate-200 transition"
            >
              <UploadCloud className="h-4 w-4" />
              <span>Add PDFs</span>
            </button>
          </div>

          <input
            ref={mergeInputRef}
            type="file"
            accept=".pdf,application/pdf"
            multiple
            className="hidden"
            onChange={(e) => handleAddMergeFiles(e.target.files)}
          />

          {mergeFiles.length === 0 ? (
            <div
              onClick={() => mergeInputRef.current?.click()}
              className="flex flex-col items-center justify-center rounded-2xl border-2 border-dashed border-slate-300 dark:border-slate-700 p-8 text-center cursor-pointer hover:border-rose-400 hover:bg-rose-50/20 dark:hover:bg-rose-950/10 transition"
            >
              <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-rose-50 text-rose-500 dark:bg-rose-950/60 mb-3">
                <UploadCloud className="h-6 w-6" />
              </div>
              <p className="text-sm font-bold text-slate-800 dark:text-slate-200">
                Click to choose PDF files to combine
              </p>
              <p className="mt-1 text-xs text-slate-500 dark:text-slate-400">
                Select 2 or more PDF files from your device
              </p>
            </div>
          ) : (
            <div className="space-y-2">
              <div className="text-xs font-bold text-slate-500 dark:text-slate-400 px-1">
                {mergeFiles.length} files selected (drag or use arrows to reorder)
              </div>
              {mergeFiles.map((f, i) => (
                <div
                  key={`${f.name}_${i}`}
                  className="flex items-center justify-between gap-3 rounded-2xl border border-slate-200 dark:border-slate-800 bg-slate-50/60 dark:bg-slate-950/40 p-3"
                >
                  <div className="flex items-center gap-3 min-w-0">
                    <span className="flex h-6 w-6 items-center justify-center rounded-lg bg-rose-100 dark:bg-rose-950 text-xs font-black text-rose-600 dark:text-rose-400 flex-shrink-0">
                      {i + 1}
                    </span>
                    <div className="truncate">
                      <p className="text-sm font-semibold text-slate-900 dark:text-white truncate">
                        {f.name}
                      </p>
                      <p className="text-[11px] text-slate-400">
                        {(f.size / 1024 / 1024).toFixed(2)} MB
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center gap-1 flex-shrink-0">
                    <button
                      onClick={() => moveMergeFile(i, 'up')}
                      disabled={i === 0}
                      className="rounded-lg p-1.5 text-slate-400 hover:text-slate-900 dark:hover:text-white disabled:opacity-30"
                      title="Move up"
                    >
                      <ArrowUp className="h-4 w-4" />
                    </button>
                    <button
                      onClick={() => moveMergeFile(i, 'down')}
                      disabled={i === mergeFiles.length - 1}
                      className="rounded-lg p-1.5 text-slate-400 hover:text-slate-900 dark:hover:text-white disabled:opacity-30"
                      title="Move down"
                    >
                      <ArrowDown className="h-4 w-4" />
                    </button>
                    <button
                      onClick={() => removeMergeFile(i)}
                      className="rounded-lg p-1.5 text-rose-400 hover:text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-950/50"
                      title="Remove"
                    >
                      <Trash2 className="h-4 w-4" />
                    </button>
                  </div>
                </div>
              ))}

              <div className="pt-4 flex justify-end">
                <button
                  onClick={handleExecuteMerge}
                  disabled={isProcessing || mergeFiles.length < 2}
                  className="flex items-center gap-2 rounded-2xl bg-gradient-to-r from-rose-600 to-pink-600 px-6 py-3 text-sm font-bold text-white shadow-lg shadow-rose-500/25 hover:from-rose-500 hover:to-pink-500 disabled:opacity-50 transition"
                >
                  {isProcessing ? (
                    <>
                      <Loader2 className="h-4 w-4 animate-spin" />
                      <span>{statusMessage || 'Merging PDFs...'}</span>
                    </>
                  ) : (
                    <>
                      <Layers className="h-4 w-4" />
                      <span>Merge {mergeFiles.length} PDFs</span>
                    </>
                  )}
                </button>
              </div>
            </div>
          )}
        </div>
      )}

      {/* ── 2. SPLIT & EXTRACT TAB ── */}
      {activeTab === 'split' && (
        <div className="space-y-5 rounded-3xl border border-slate-200/80 bg-white/80 p-6 dark:border-slate-800/80 dark:bg-slate-900/80 shadow-xs">
          <div>
            <h2 className="text-lg font-bold text-slate-900 dark:text-white flex items-center gap-2">
              <Scissors className="h-5 w-5 text-rose-500" />
              Split & Extract Pages
            </h2>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              Extract individual pages or custom page ranges into a separate PDF.
            </p>
          </div>

          <input
            ref={splitInputRef}
            type="file"
            accept=".pdf,application/pdf"
            className="hidden"
            onChange={(e) => e.target.files?.[0] && handleSelectSplitFile(e.target.files[0])}
          />

          {!splitFile ? (
            <div
              onClick={() => splitInputRef.current?.click()}
              className="flex flex-col items-center justify-center rounded-2xl border-2 border-dashed border-slate-300 dark:border-slate-700 p-8 text-center cursor-pointer hover:border-rose-400 hover:bg-rose-50/20 dark:hover:bg-rose-950/10 transition"
            >
              <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-rose-50 text-rose-500 dark:bg-rose-950/60 mb-3">
                <Scissors className="h-6 w-6" />
              </div>
              <p className="text-sm font-bold text-slate-800 dark:text-slate-200">
                Choose PDF to split or extract
              </p>
              <p className="mt-1 text-xs text-slate-500 dark:text-slate-400">
                Supports any size PDF document
              </p>
            </div>
          ) : (
            <div className="space-y-4">
              <div className="flex items-center justify-between rounded-2xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950/50 p-4">
                <div className="flex items-center gap-3">
                  <FileText className="h-8 w-8 text-rose-500" />
                  <div>
                    <h3 className="text-sm font-bold text-slate-900 dark:text-white">{splitFile.name}</h3>
                    <p className="text-xs text-slate-400">
                      {splitMeta?.pageCount || '...'} pages · {(splitFile.size / 1024 / 1024).toFixed(2)} MB
                    </p>
                  </div>
                </div>
                <button
                  onClick={() => splitInputRef.current?.click()}
                  className="text-xs font-bold text-rose-600 hover:underline"
                >
                  Change File
                </button>
              </div>

              {/* Range Options */}
              <div className="space-y-2">
                <label className="text-xs font-bold text-slate-700 dark:text-slate-300">
                  Pages to Extract (e.g. 1-3, 5, 8-10):
                </label>
                <input
                  type="text"
                  value={pageRange}
                  onChange={(e) => setPageRange(e.target.value)}
                  placeholder="e.g. 1-3, 5"
                  className="w-full rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm font-medium text-slate-900 focus:border-rose-500 focus:outline-hidden dark:border-slate-800 dark:bg-slate-950 dark:text-white"
                />
                <div className="flex flex-wrap gap-2 pt-1">
                  {[
                    { label: 'Page 1 Only', value: '1' },
                    { label: 'Pages 1-3', value: '1-3' },
                    { label: 'All Pages', value: 'all' },
                    { label: 'First Half', value: `1-${Math.ceil((splitMeta?.pageCount || 2) / 2)}` },
                  ].map((preset) => (
                    <button
                      key={preset.label}
                      onClick={() => setPageRange(preset.value)}
                      className="rounded-lg bg-slate-100 px-2 py-1 text-[11px] font-semibold text-slate-600 hover:bg-rose-50 hover:text-rose-600 dark:bg-slate-800 dark:text-slate-300 dark:hover:bg-slate-700 transition"
                    >
                      {preset.label}
                    </button>
                  ))}
                </div>
              </div>

              <div className="flex justify-end pt-2">
                <button
                  onClick={handleExecuteSplit}
                  disabled={isProcessing || !pageRange.trim()}
                  className="flex items-center gap-2 rounded-2xl bg-rose-600 px-6 py-3 text-sm font-bold text-white shadow-md shadow-rose-500/25 hover:bg-rose-500 disabled:opacity-50 transition"
                >
                  {isProcessing ? (
                    <>
                      <Loader2 className="h-4 w-4 animate-spin" />
                      <span>Extracting Pages...</span>
                    </>
                  ) : (
                    <>
                      <Scissors className="h-4 w-4" />
                      <span>Extract Selected Pages</span>
                    </>
                  )}
                </button>
              </div>
            </div>
          )}
        </div>
      )}

      {/* ── 3. ROTATE TAB ── */}
      {activeTab === 'rotate' && (
        <div className="space-y-5 rounded-3xl border border-slate-200/80 bg-white/80 p-6 dark:border-slate-800/80 dark:bg-slate-900/80 shadow-xs">
          <div>
            <h2 className="text-lg font-bold text-slate-900 dark:text-white flex items-center gap-2">
              <RotateCw className="h-5 w-5 text-rose-500" />
              Rotate PDF Pages
            </h2>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              Fix orientation of upside-down or sideways scans in 1 click.
            </p>
          </div>

          <input
            ref={rotateInputRef}
            type="file"
            accept=".pdf,application/pdf"
            className="hidden"
            onChange={(e) => e.target.files?.[0] && handleSelectRotateFile(e.target.files[0])}
          />

          {!rotateFile ? (
            <div
              onClick={() => rotateInputRef.current?.click()}
              className="flex flex-col items-center justify-center rounded-2xl border-2 border-dashed border-slate-300 dark:border-slate-700 p-8 text-center cursor-pointer hover:border-rose-400 hover:bg-rose-50/20 dark:hover:bg-rose-950/10 transition"
            >
              <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-rose-50 text-rose-500 dark:bg-rose-950/60 mb-3">
                <RotateCw className="h-6 w-6" />
              </div>
              <p className="text-sm font-bold text-slate-800 dark:text-slate-200">
                Choose PDF to rotate
              </p>
              <p className="mt-1 text-xs text-slate-500 dark:text-slate-400">
                Rotate 90°, 180°, or 270° clockwise
              </p>
            </div>
          ) : (
            <div className="space-y-4">
              <div className="flex items-center justify-between rounded-2xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950/50 p-4">
                <div className="flex items-center gap-3">
                  <FileText className="h-8 w-8 text-rose-500" />
                  <div>
                    <h3 className="text-sm font-bold text-slate-900 dark:text-white">{rotateFile.name}</h3>
                    <p className="text-xs text-slate-400">
                      {rotateMeta?.pageCount || '...'} pages · {(rotateFile.size / 1024 / 1024).toFixed(2)} MB
                    </p>
                  </div>
                </div>
                <button
                  onClick={() => rotateInputRef.current?.click()}
                  className="text-xs font-bold text-rose-600 hover:underline"
                >
                  Change File
                </button>
              </div>

              {/* Rotation Angle Selection */}
              <div className="space-y-2">
                <label className="text-xs font-bold text-slate-700 dark:text-slate-300">
                  Clockwise Rotation Angle:
                </label>
                <div className="grid grid-cols-3 gap-3">
                  {[
                    { deg: 90 as const, label: '90° Clockwise' },
                    { deg: 180 as const, label: '180° Upside Down' },
                    { deg: 270 as const, label: '270° (90° Counter)' },
                  ].map((ang) => (
                    <button
                      key={ang.deg}
                      onClick={() => setRotationDegrees(ang.deg)}
                      className={`flex flex-col items-center justify-center rounded-2xl border p-4 transition ${
                        rotationDegrees === ang.deg
                          ? 'border-rose-500 bg-rose-50 text-rose-700 dark:border-rose-500 dark:bg-rose-950/40 dark:text-rose-300 shadow-xs'
                          : 'border-slate-200 bg-white text-slate-700 hover:bg-slate-50 dark:border-slate-800 dark:bg-slate-950 dark:text-slate-300'
                      }`}
                    >
                      <RotateCw
                        className="h-5 w-5 mb-1.5 transition-transform"
                        style={{ transform: `rotate(${ang.deg}deg)` }}
                      />
                      <span className="text-xs font-bold">{ang.label}</span>
                    </button>
                  ))}
                </div>
              </div>

              {/* Scope */}
              <div className="space-y-2">
                <label className="text-xs font-bold text-slate-700 dark:text-slate-300">
                  Apply to Pages:
                </label>
                <div className="flex gap-2">
                  {[
                    { id: 'all' as const, label: 'All Pages' },
                    { id: 'odd' as const, label: 'Odd Pages Only' },
                    { id: 'even' as const, label: 'Even Pages Only' },
                  ].map((sc) => (
                    <button
                      key={sc.id}
                      onClick={() => setRotateScope(sc.id)}
                      className={`rounded-xl px-3 py-1.5 text-xs font-semibold transition ${
                        rotateScope === sc.id
                          ? 'bg-rose-600 text-white'
                          : 'bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-300 hover:bg-slate-200'
                      }`}
                    >
                      {sc.label}
                    </button>
                  ))}
                </div>
              </div>

              <div className="flex justify-end pt-2">
                <button
                  onClick={handleExecuteRotate}
                  disabled={isProcessing}
                  className="flex items-center gap-2 rounded-2xl bg-rose-600 px-6 py-3 text-sm font-bold text-white shadow-md shadow-rose-500/25 hover:bg-rose-500 disabled:opacity-50 transition"
                >
                  {isProcessing ? (
                    <>
                      <Loader2 className="h-4 w-4 animate-spin" />
                      <span>Rotating Pages...</span>
                    </>
                  ) : (
                    <>
                      <RotateCw className="h-4 w-4" />
                      <span>Rotate & Save PDF</span>
                    </>
                  )}
                </button>
              </div>
            </div>
          )}
        </div>
      )}

      {/* ── 4. WATERMARK TAB ── */}
      {activeTab === 'watermark' && (
        <div className="space-y-5 rounded-3xl border border-slate-200/80 bg-white/80 p-6 dark:border-slate-800/80 dark:bg-slate-900/80 shadow-xs">
          <div>
            <h2 className="text-lg font-bold text-slate-900 dark:text-white flex items-center gap-2">
              <Stamp className="h-5 w-5 text-rose-500" />
              Stamp Custom Watermark
            </h2>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              Protect your documents with diagonal or centered watermark text, opacity, and custom styling.
            </p>
          </div>

          <input
            ref={watermarkInputRef}
            type="file"
            accept=".pdf,application/pdf"
            className="hidden"
            onChange={(e) => e.target.files?.[0] && handleSelectWatermarkFile(e.target.files[0])}
          />

          {!watermarkFile ? (
            <div
              onClick={() => watermarkInputRef.current?.click()}
              className="flex flex-col items-center justify-center rounded-2xl border-2 border-dashed border-slate-300 dark:border-slate-700 p-8 text-center cursor-pointer hover:border-rose-400 hover:bg-rose-50/20 dark:hover:bg-rose-950/10 transition"
            >
              <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-rose-50 text-rose-500 dark:bg-rose-950/60 mb-3">
                <Stamp className="h-6 w-6" />
              </div>
              <p className="text-sm font-bold text-slate-800 dark:text-slate-200">
                Choose PDF to watermark
              </p>
              <p className="mt-1 text-xs text-slate-500 dark:text-slate-400">
                Stamp "CONFIDENTIAL", "DRAFT", or custom text
              </p>
            </div>
          ) : (
            <div className="space-y-4">
              <div className="flex items-center justify-between rounded-2xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950/50 p-4">
                <div className="flex items-center gap-3">
                  <FileText className="h-8 w-8 text-rose-500" />
                  <div>
                    <h3 className="text-sm font-bold text-slate-900 dark:text-white">{watermarkFile.name}</h3>
                    <p className="text-xs text-slate-400">
                      {watermarkMeta?.pageCount || '...'} pages · {(watermarkFile.size / 1024 / 1024).toFixed(2)} MB
                    </p>
                  </div>
                </div>
                <button
                  onClick={() => watermarkInputRef.current?.click()}
                  className="text-xs font-bold text-rose-600 hover:underline"
                >
                  Change File
                </button>
              </div>

              {/* Watermark text input & presets */}
              <div className="space-y-2">
                <label className="text-xs font-bold text-slate-700 dark:text-slate-300">
                  Watermark Text:
                </label>
                <input
                  type="text"
                  value={watermarkText}
                  onChange={(e) => setWatermarkText(e.target.value)}
                  placeholder="e.g. CONFIDENTIAL"
                  className="w-full rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm font-bold text-slate-900 focus:border-rose-500 focus:outline-hidden dark:border-slate-800 dark:bg-slate-950 dark:text-white"
                />
                <div className="flex flex-wrap gap-2 pt-1">
                  {['CONFIDENTIAL', 'DRAFT', 'COPY', 'ORIGINAL', 'FOR REVIEW ONLY', 'PRIVATE'].map((preset) => (
                    <button
                      key={preset}
                      onClick={() => setWatermarkText(preset)}
                      className="rounded-lg bg-slate-100 px-2.5 py-1 text-[11px] font-semibold text-slate-700 hover:bg-rose-50 hover:text-rose-600 dark:bg-slate-800 dark:text-slate-300 dark:hover:bg-slate-700 transition"
                    >
                      {preset}
                    </button>
                  ))}
                </div>
              </div>

              {/* Controls Grid */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 pt-2">
                {/* Opacity */}
                <div className="rounded-2xl border border-slate-200/80 dark:border-slate-800/80 bg-slate-50/50 dark:bg-slate-950/50 p-3">
                  <div className="flex justify-between text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                    <span>Opacity</span>
                    <span>{Math.round(watermarkOpacity * 100)}%</span>
                  </div>
                  <input
                    type="range"
                    min="0.05"
                    max="0.8"
                    step="0.05"
                    value={watermarkOpacity}
                    onChange={(e) => setWatermarkOpacity(parseFloat(e.target.value))}
                    className="w-full accent-rose-600 cursor-pointer"
                  />
                </div>

                {/* Font Size */}
                <div className="rounded-2xl border border-slate-200/80 dark:border-slate-800/80 bg-slate-50/50 dark:bg-slate-950/50 p-3">
                  <div className="flex justify-between text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                    <span>Font Size</span>
                    <span>{watermarkFontSize} pt</span>
                  </div>
                  <input
                    type="range"
                    min="24"
                    max="72"
                    step="4"
                    value={watermarkFontSize}
                    onChange={(e) => setWatermarkFontSize(parseInt(e.target.value, 10))}
                    className="w-full accent-rose-600 cursor-pointer"
                  />
                </div>

                {/* Orientation & Color */}
                <div className="rounded-2xl border border-slate-200/80 dark:border-slate-800/80 bg-slate-50/50 dark:bg-slate-950/50 p-3 flex items-center justify-between">
                  <div>
                    <span className="text-xs font-bold text-slate-700 dark:text-slate-300 block mb-1">
                      Angle:
                    </span>
                    <button
                      onClick={() => setWatermarkDiagonal(!watermarkDiagonal)}
                      className="rounded-lg bg-rose-100 dark:bg-rose-950/60 px-2.5 py-1 text-xs font-bold text-rose-700 dark:text-rose-300"
                    >
                      {watermarkDiagonal ? 'Diagonal 45°' : 'Horizontal'}
                    </button>
                  </div>
                  <div>
                    <span className="text-xs font-bold text-slate-700 dark:text-slate-300 block mb-1">
                      Color:
                    </span>
                    <div className="flex items-center gap-1.5">
                      {['#e11d48', '#0f172a', '#2563eb', '#059669'].map((c) => (
                        <button
                          key={c}
                          onClick={() => setWatermarkColor(c)}
                          style={{ backgroundColor: c }}
                          className={`h-6 w-6 rounded-full border-2 transition ${
                            watermarkColor === c ? 'border-white ring-2 ring-rose-500 scale-110' : 'border-transparent'
                          }`}
                        />
                      ))}
                    </div>
                  </div>
                </div>
              </div>

              <div className="flex justify-end pt-2">
                <button
                  onClick={handleExecuteWatermark}
                  disabled={isProcessing || !watermarkText.trim()}
                  className="flex items-center gap-2 rounded-2xl bg-rose-600 px-6 py-3 text-sm font-bold text-white shadow-md shadow-rose-500/25 hover:bg-rose-500 disabled:opacity-50 transition"
                >
                  {isProcessing ? (
                    <>
                      <Loader2 className="h-4 w-4 animate-spin" />
                      <span>Stamping Watermark...</span>
                    </>
                  ) : (
                    <>
                      <Stamp className="h-4 w-4" />
                      <span>Apply Watermark to PDF</span>
                    </>
                  )}
                </button>
              </div>
            </div>
          )}
        </div>
      )}

      {/* ── Result & Download Card ── */}
      {resultBlob && (
        <div className="flex flex-col sm:flex-row items-center justify-between gap-4 rounded-3xl border border-emerald-500/30 bg-emerald-50/70 p-6 dark:border-emerald-500/30 dark:bg-emerald-950/30 shadow-lg">
          <div className="flex items-center gap-3">
            <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-emerald-500 text-white shadow-md shadow-emerald-500/20">
              <CheckCircle2 className="h-6 w-6" />
            </div>
            <div>
              <h3 className="text-base font-bold text-emerald-900 dark:text-emerald-100">
                PDF Generated Successfully!
              </h3>
              <p className="text-xs text-emerald-700 dark:text-emerald-300">
                {resultFileName} ({(resultBlob.size / 1024 / 1024).toFixed(2)} MB) · 100% Client-Side
              </p>
            </div>
          </div>

          <button
            onClick={handleDownload}
            className="w-full sm:w-auto flex items-center justify-center gap-2 rounded-2xl bg-emerald-600 hover:bg-emerald-500 px-6 py-3 text-sm font-bold text-white shadow-lg shadow-emerald-600/20 transition active:scale-95"
          >
            <Download className="h-4 w-4" />
            <span>Download PDF</span>
          </button>
        </div>
      )}
    </div>
  );
};
