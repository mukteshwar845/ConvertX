import React, { useState, useRef } from 'react';
import {
  UploadCloud,
  Sparkles,
  Archive,
  Trash2,
  Play,
  ScanText,
  FileText,
  Table,
} from 'lucide-react';
import { TargetFormat } from '../types';
import {
  createSampleDocxFile,
  createSampleTxtFile,
  createSampleScannedPdfFile,
  createSampleCsvFile,
} from '../utils/sampleDocs';

interface BatchUploaderProps {
  onFilesAdded: (files: File[]) => void;
  queueLength: number;
  completedCount: number;
  isConvertingBatch: boolean;
  onConvertAll: () => void;
  onDownloadZip: () => void;
  onClearAll: () => void;
  globalTarget: TargetFormat;
  onGlobalTargetChange: (target: TargetFormat) => void;
  ocrEnabled: boolean;
  onOcrToggle: (enabled: boolean) => void;
}

export const BatchUploader: React.FC<BatchUploaderProps> = ({
  onFilesAdded,
  queueLength,
  completedCount,
  isConvertingBatch,
  onConvertAll,
  onDownloadZip,
  onClearAll,
  globalTarget,
  onGlobalTargetChange,
  ocrEnabled,
  onOcrToggle,
}) => {
  const [isDragging, setIsDragging] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      onFilesAdded(Array.from(e.dataTransfer.files));
    }
  };

  const handleFileInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      onFilesAdded(Array.from(e.target.files));
      e.target.value = ''; // Reset for re-selection
    }
  };

  return (
    <div className="space-y-5">
      {/* Visual Step Guide for Non-Tech Users */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
        <div className="flex items-center gap-3 rounded-2xl border border-slate-200/80 bg-white/70 p-3 dark:border-slate-800/80 dark:bg-slate-900/60 shadow-2xs backdrop-blur-sm">
          <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-xl bg-blue-100 text-blue-700 dark:bg-blue-950/80 dark:text-blue-300 font-bold text-sm">
            1
          </div>
          <div>
            <div className="text-xs font-bold text-slate-900 dark:text-white">Select or Drop Files</div>
            <div className="text-[11px] text-slate-500 dark:text-slate-400">Word, PDF, Excel, Images & more</div>
          </div>
        </div>

        <div className="flex items-center gap-3 rounded-2xl border border-slate-200/80 bg-white/70 p-3 dark:border-slate-800/80 dark:bg-slate-900/60 shadow-2xs backdrop-blur-sm">
          <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-xl bg-indigo-100 text-indigo-700 dark:bg-indigo-950/80 dark:text-indigo-300 font-bold text-sm">
            2
          </div>
          <div>
            <div className="text-xs font-bold text-slate-900 dark:text-white">Choose Target Format</div>
            <div className="text-[11px] text-slate-500 dark:text-slate-400">PDF, Word, PNG, CSV & more</div>
          </div>
        </div>

        <div className="flex items-center gap-3 rounded-2xl border border-slate-200/80 bg-white/70 p-3 dark:border-slate-800/80 dark:bg-slate-900/60 shadow-2xs backdrop-blur-sm">
          <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-xl bg-emerald-100 text-emerald-700 dark:bg-emerald-950/80 dark:text-emerald-300 font-bold text-sm">
            3
          </div>
          <div>
            <div className="text-xs font-bold text-slate-900 dark:text-white">Convert & Download</div>
            <div className="text-[11px] text-slate-500 dark:text-slate-400">1-click instant local conversion</div>
          </div>
        </div>
      </div>

      {/* Main Drag & Drop Zone */}
      <div
        id="drop-zone"
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
        onClick={() => fileInputRef.current?.click()}
        className={`group relative flex cursor-pointer flex-col items-center justify-center rounded-3xl border-2 border-dashed p-8 sm:p-10 text-center transition-all duration-200 ${
          isDragging
            ? 'border-blue-500 bg-blue-50/70 scale-[1.005] dark:border-blue-400 dark:bg-blue-950/30 shadow-lg shadow-blue-500/10'
            : 'border-slate-300/90 bg-white/80 hover:border-blue-400 hover:bg-blue-50/20 dark:border-slate-700/80 dark:bg-slate-900/70 dark:hover:border-blue-500/60 dark:hover:bg-slate-800/40 shadow-xs'
        }`}
      >
        <input
          ref={fileInputRef}
          type="file"
          multiple
          accept=".docx,.doc,.pdf,.pptx,.ppt,.odp,.xlsx,.xls,.csv,.ods,.png,.jpg,.jpeg,.webp,.svg,.bmp,.gif,.tiff,.txt,.rtf,.odt,.html,.htm,.md,.json,.xml"
          onChange={handleFileInputChange}
          className="hidden"
        />

        {/* Upload Icon with animated gradient circle */}
        <div className="relative flex h-16 w-16 items-center justify-center rounded-2xl bg-gradient-to-tr from-blue-600 to-indigo-600 text-white shadow-lg shadow-blue-500/25 transition-transform group-hover:scale-110">
          <UploadCloud className="h-8 w-8" />
        </div>

        <h3 className="mt-4 text-base sm:text-lg font-bold text-slate-900 dark:text-white">
          Drag & Drop your files here, or{' '}
          <span className="text-blue-600 dark:text-blue-400 underline decoration-2 underline-offset-2">
            Browse Files
          </span>
        </h3>
        <p className="mt-1.5 text-xs sm:text-sm text-slate-500 dark:text-slate-400 max-w-md">
          Supports Documents, Spreadsheets, Presentations, Photos & Data files.
        </p>

        {/* Visual Supported Formats Chips */}
        <div className="mt-5 flex flex-wrap justify-center gap-1.5 max-w-xl">
          {[
            { label: 'PDF Document', ext: 'PDF', bg: 'bg-rose-50 text-rose-700 dark:bg-rose-950/50 dark:text-rose-300 border-rose-200/60 dark:border-rose-900/60' },
            { label: 'Word Document', ext: 'DOCX', bg: 'bg-blue-50 text-blue-700 dark:bg-blue-950/50 dark:text-blue-300 border-blue-200/60 dark:border-blue-900/60' },
            { label: 'Excel & Sheet', ext: 'XLSX / CSV', bg: 'bg-emerald-50 text-emerald-700 dark:bg-emerald-950/50 dark:text-emerald-300 border-emerald-200/60 dark:border-emerald-900/60' },
            { label: 'PowerPoint', ext: 'PPTX', bg: 'bg-amber-50 text-amber-700 dark:bg-amber-950/50 dark:text-amber-300 border-amber-200/60 dark:border-amber-900/60' },
            { label: 'Images', ext: 'PNG / JPG / WEBP', bg: 'bg-cyan-50 text-cyan-700 dark:bg-cyan-950/50 dark:text-cyan-300 border-cyan-200/60 dark:border-cyan-900/60' },
            { label: 'Text & Code', ext: 'MD / HTML / JSON', bg: 'bg-violet-50 text-violet-700 dark:bg-violet-950/50 dark:text-violet-300 border-violet-200/60 dark:border-violet-900/60' },
          ].map((fmt) => (
            <span
              key={fmt.ext}
              className={`rounded-xl border px-2.5 py-1 text-[11px] font-bold ${fmt.bg}`}
            >
              {fmt.ext}
            </span>
          ))}
        </div>
      </div>

      {/* Quick Test Samples Bar */}
      <div className="rounded-2xl border border-slate-200/80 bg-white/70 p-3.5 dark:border-slate-800/80 dark:bg-slate-900/60 shadow-2xs">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2.5">
          <div className="flex items-center gap-1.5 text-xs font-bold text-slate-700 dark:text-slate-300">
            <Sparkles className="h-4 w-4 text-amber-500" />
            <span>Try with ready sample files:</span>
          </div>

          <div className="flex flex-wrap items-center gap-1.5">
            <button
              type="button"
              onClick={async () => onFilesAdded([await createSampleDocxFile()])}
              className="flex items-center gap-1 rounded-xl border border-blue-200 bg-blue-50/80 px-2.5 py-1 text-xs font-semibold text-blue-700 hover:bg-blue-100 dark:border-blue-900/60 dark:bg-blue-950/40 dark:text-blue-300 dark:hover:bg-blue-900/60 transition active:scale-95"
            >
              <FileText className="h-3.5 w-3.5" />
              <span>Word Doc (.docx)</span>
            </button>

            <button
              type="button"
              onClick={() => onFilesAdded([createSampleCsvFile()])}
              className="flex items-center gap-1 rounded-xl border border-emerald-200 bg-emerald-50/80 px-2.5 py-1 text-xs font-semibold text-emerald-700 hover:bg-emerald-100 dark:border-emerald-900/60 dark:bg-emerald-950/40 dark:text-emerald-300 dark:hover:bg-emerald-900/60 transition active:scale-95"
            >
              <Table className="h-3.5 w-3.5" />
              <span>Spreadsheet (.csv)</span>
            </button>

            <button
              type="button"
              onClick={async () => {
                onOcrToggle(true);
                onFilesAdded([await createSampleScannedPdfFile()]);
              }}
              className="flex items-center gap-1 rounded-xl border border-purple-200 bg-purple-50/80 px-2.5 py-1 text-xs font-semibold text-purple-700 hover:bg-purple-100 dark:border-purple-900/60 dark:bg-purple-950/40 dark:text-purple-300 dark:hover:bg-purple-900/60 transition active:scale-95"
            >
              <ScanText className="h-3.5 w-3.5" />
              <span>Scanned PDF (OCR)</span>
            </button>

            <button
              type="button"
              onClick={() => onFilesAdded([createSampleTxtFile()])}
              className="flex items-center gap-1 rounded-xl border border-slate-200 bg-slate-50 px-2.5 py-1 text-xs font-semibold text-slate-700 hover:bg-slate-100 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-300 dark:hover:bg-slate-700 transition active:scale-95"
            >
              <span>Markdown (.md)</span>
            </button>
          </div>
        </div>
      </div>

      {/* Batch Control Toolbar (Active when files are queued) */}
      {queueLength > 0 && (
        <div
          id="batch-toolbar"
          className="sticky top-20 z-30 flex flex-col gap-3 rounded-2xl border border-blue-200 bg-gradient-to-r from-blue-50/95 to-indigo-50/95 p-4 dark:border-blue-900/60 dark:from-slate-900/95 dark:to-blue-950/95 shadow-md backdrop-blur-md sm:flex-row sm:items-center sm:justify-between transition-all"
        >
          <div className="flex flex-wrap items-center gap-3">
            <div className="flex items-center gap-2">
              <span className="flex h-7 w-7 items-center justify-center rounded-xl bg-blue-600 text-white font-extrabold text-xs">
                {queueLength}
              </span>
              <span className="text-sm font-bold text-slate-900 dark:text-white">
                {queueLength === 1 ? '1 File Ready' : `${queueLength} Files in Queue`}
              </span>
            </div>

            <div className="flex items-center gap-1.5 text-xs text-slate-700 dark:text-slate-300">
              <span className="font-semibold">Convert all to:</span>
              <select
                value={globalTarget}
                onChange={(e) => onGlobalTargetChange(e.target.value as TargetFormat)}
                className="rounded-xl border border-slate-300 bg-white px-2.5 py-1.5 text-xs font-bold text-slate-800 shadow-2xs focus:outline-none dark:border-slate-700 dark:bg-slate-800 dark:text-white"
              >
                <option value="pdf">PDF Document (.pdf)</option>
                <option value="docx">Word Document (.docx)</option>
                <option value="pptx">PowerPoint Presentation (.pptx)</option>
                <option value="png">PNG Image (.png)</option>
                <option value="jpg">JPEG Image (.jpg)</option>
                <option value="txt">Plain Text (.txt)</option>
                <option value="html">Web Page (.html)</option>
                <option value="md">Markdown (.md)</option>
                <option value="csv">Table (.csv)</option>
              </select>
            </div>

            {/* OCR Toggle */}
            <button
              type="button"
              onClick={() => onOcrToggle(!ocrEnabled)}
              className={`flex items-center gap-1.5 rounded-xl px-2.5 py-1.5 text-xs font-bold transition ${
                ocrEnabled
                  ? 'bg-purple-600 text-white shadow-xs'
                  : 'border border-slate-300 bg-white/80 text-slate-700 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-300'
              }`}
              title="Optical Character Recognition: Read text inside scanned documents"
            >
              <ScanText className="h-3.5 w-3.5" />
              <span>{ocrEnabled ? 'OCR On' : 'OCR Off'}</span>
            </button>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            {/* Convert All Button */}
            <button
              id="batch-convert-btn"
              onClick={onConvertAll}
              disabled={isConvertingBatch}
              className="flex items-center gap-2 rounded-xl bg-gradient-to-r from-blue-600 to-indigo-600 px-5 py-2 text-xs font-extrabold text-white shadow-md shadow-blue-500/20 hover:from-blue-700 hover:to-indigo-700 disabled:opacity-60 transition active:scale-95"
            >
              <Play className="h-3.5 w-3.5 fill-current" />
              <span>{isConvertingBatch ? 'Converting...' : `Convert All (${queueLength})`}</span>
            </button>

            {/* Download ZIP */}
            {completedCount > 0 && (
              <button
                id="batch-download-zip-btn"
                onClick={onDownloadZip}
                className="flex items-center gap-1.5 rounded-xl bg-emerald-600 px-4 py-2 text-xs font-bold text-white shadow-md shadow-emerald-500/20 hover:bg-emerald-700 transition active:scale-95"
                title="Download all converted files in one ZIP file"
              >
                <Archive className="h-3.5 w-3.5" />
                <span>Download ZIP ({completedCount})</span>
              </button>
            )}

            {/* Clear All */}
            <button
              onClick={onClearAll}
              disabled={isConvertingBatch}
              className="flex items-center gap-1 rounded-xl border border-slate-200 bg-white p-2 text-xs font-medium text-slate-500 hover:bg-rose-50 hover:text-rose-600 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-400 dark:hover:bg-rose-950/40 dark:hover:text-rose-400 transition"
              title="Clear all queued files"
            >
              <Trash2 className="h-4 w-4" />
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
