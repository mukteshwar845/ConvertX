import React, { useState, useRef } from 'react';
import {
  UploadCloud,
  FilePlus,
  Layers,
  Sparkles,
  Archive,
  Trash2,
  Lock,
  CheckCircle,
  Play,
  ScanText,
} from 'lucide-react';
import { TargetFormat } from '../types';
import {
  createSampleDocxFile,
  createSampleTxtFile,
  createSampleImageFile,
  createSampleScannedPdfFile,
  createSampleScannedDocumentImage,
  createSampleCsvFile,
  createSampleJsonFile,
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
  autoEncrypt: boolean;
  onAutoEncryptChange: (enabled: boolean) => void;
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
  autoEncrypt,
  onAutoEncryptChange,
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

  const loadSampleDocx = async () => {
    const file = await createSampleDocxFile();
    onFilesAdded([file]);
  };

  const loadSampleMd = () => {
    const file = createSampleTxtFile();
    onFilesAdded([file]);
  };

  const loadSampleImg = async () => {
    const file = await createSampleImageFile();
    onFilesAdded([file]);
  };

  const loadSampleScannedPdf = async () => {
    onOcrToggle(true);
    const file = await createSampleScannedPdfFile();
    onFilesAdded([file]);
  };

  const loadSampleScannedImage = async () => {
    onOcrToggle(true);
    const file = await createSampleScannedDocumentImage();
    onFilesAdded([file]);
  };

  const loadSampleCsv = () => {
    const file = createSampleCsvFile();
    onFilesAdded([file]);
  };

  const loadSampleJson = () => {
    const file = createSampleJsonFile();
    onFilesAdded([file]);
  };

  return (
    <div className="space-y-4">
      {/* OCR Text Extraction Toggle Banner */}
      <div
        id="ocr-banner"
        className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 rounded-xl border border-purple-200/80 bg-purple-50/60 p-3.5 text-xs dark:border-purple-900/50 dark:bg-purple-950/25 transition-all shadow-2xs"
      >
        <div className="flex items-center gap-3">
          <div
            className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-lg transition-colors ${
              ocrEnabled
                ? 'bg-purple-600 text-white shadow-xs'
                : 'bg-slate-200 text-slate-600 dark:bg-slate-800 dark:text-slate-400'
            }`}
          >
            <ScanText className="h-5 w-5" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="font-bold text-slate-900 dark:text-white">
                Optical Character Recognition (OCR)
              </span>
              <span
                className={`rounded-full px-2 py-0.5 text-[10px] font-black uppercase tracking-wider ${
                  ocrEnabled
                    ? 'bg-purple-200/80 text-purple-900 dark:bg-purple-900/80 dark:text-purple-200'
                    : 'bg-slate-200 text-slate-600 dark:bg-slate-800 dark:text-slate-400'
                }`}
              >
                {ocrEnabled ? 'Active' : 'Off'}
              </span>
            </div>
            <p className="text-[11px] text-slate-600 dark:text-slate-400">
              Extract readable text and document hierarchy from image-based PDFs, paper scans, and photo documents.
            </p>
          </div>
        </div>

        <button
          type="button"
          id="ocr-toggle-pill"
          onClick={() => onOcrToggle(!ocrEnabled)}
          className={`flex items-center justify-center gap-1.5 rounded-lg px-3.5 py-1.5 text-xs font-bold transition shrink-0 ${
            ocrEnabled
              ? 'bg-purple-600 text-white shadow-xs hover:bg-purple-700'
              : 'border border-slate-300 bg-white text-slate-700 hover:bg-slate-50 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-200 dark:hover:bg-slate-700'
          }`}
        >
          <ScanText className="h-3.5 w-3.5" />
          <span>{ocrEnabled ? 'OCR Enabled' : 'Enable OCR'}</span>
        </button>
      </div>

      {/* Drag & Drop Upload Zone */}
      <div
        id="drop-zone"
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
        onClick={() => fileInputRef.current?.click()}
        className={`relative flex cursor-pointer flex-col items-center justify-center rounded-2xl border-2 border-dashed p-8 text-center transition ${
          isDragging
            ? 'border-blue-500 bg-blue-50/50 dark:border-blue-400 dark:bg-blue-950/20'
            : 'border-slate-300 bg-white hover:border-slate-400 hover:bg-slate-50/50 dark:border-slate-700 dark:bg-slate-900 dark:hover:border-slate-600 dark:hover:bg-slate-800/50'
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

        <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-blue-50 text-blue-600 shadow-inner dark:bg-blue-950/60 dark:text-blue-400">
          <UploadCloud className="h-7 w-7" />
        </div>

        <h3 className="mt-4 text-base font-semibold text-slate-900 dark:text-white">
          Drop your files here, or <span className="text-blue-600 dark:text-blue-400 underline">browse</span>
        </h3>
        <p className="mt-1.5 text-xs text-slate-500 dark:text-slate-400 max-w-lg">
          Universal conversion across Documents (PDF, Word), Presentations, Spreadsheets (Excel, CSV), Images, and Data with fidelity preservation.
        </p>

        {/* Supported Format Badges */}
        <div className="mt-4 flex flex-wrap justify-center gap-1.5 max-w-xl">
          {[
            { label: 'PDF / DOCX', color: 'bg-rose-50 text-rose-700 dark:bg-rose-950/40 dark:text-rose-300' },
            { label: 'XLSX / CSV', color: 'bg-emerald-50 text-emerald-700 dark:bg-emerald-950/40 dark:text-emerald-300' },
            { label: 'PPTX / ODP', color: 'bg-amber-50 text-amber-700 dark:bg-amber-950/40 dark:text-amber-300' },
            { label: 'PNG / JPG / WEBP', color: 'bg-cyan-50 text-cyan-700 dark:bg-cyan-950/40 dark:text-cyan-300' },
            { label: 'HTML / MD / JSON', color: 'bg-indigo-50 text-indigo-700 dark:bg-indigo-950/40 dark:text-indigo-300' },
          ].map((cat) => (
            <span
              key={cat.label}
              className={`rounded-md px-2 py-0.5 text-[11px] font-bold ${cat.color}`}
            >
              {cat.label}
            </span>
          ))}
        </div>
      </div>

      {/* Quick Test Samples */}
      <div className="flex flex-wrap items-center justify-between gap-2 text-xs text-slate-600 dark:text-slate-400">
        <div className="flex items-center gap-1 font-medium">
          <Sparkles className="h-3.5 w-3.5 text-amber-500" />
          <span>Quick test samples:</span>
        </div>
        <div className="flex flex-wrap items-center gap-1.5">
          <button
            type="button"
            onClick={loadSampleScannedPdf}
            className="rounded-lg border border-purple-200 bg-purple-50/80 px-2.5 py-1 font-semibold text-purple-800 hover:bg-purple-100 dark:border-purple-800 dark:bg-purple-950/40 dark:text-purple-300 dark:hover:bg-purple-900/60 transition flex items-center gap-1"
            title="Load an image-based scanned PDF with zero embedded text to test OCR"
          >
            <ScanText className="h-3 w-3" />
            + Scanned PDF (OCR)
          </button>
          <button
            type="button"
            onClick={loadSampleDocx}
            className="rounded-lg border border-blue-200 bg-blue-50/80 px-2.5 py-1 font-medium text-blue-800 hover:bg-blue-100 dark:border-blue-800 dark:bg-blue-950/40 dark:text-blue-300 dark:hover:bg-blue-900/60 transition"
          >
            + Sample DOCX
          </button>
          <button
            type="button"
            onClick={loadSampleCsv}
            className="rounded-lg border border-emerald-200 bg-emerald-50/80 px-2.5 py-1 font-semibold text-emerald-800 hover:bg-emerald-100 dark:border-emerald-800 dark:bg-emerald-950/40 dark:text-emerald-300 dark:hover:bg-emerald-900/60 transition flex items-center gap-1"
            title="Load a financial tabular spreadsheet (CSV) to test XLSX / PDF / Table conversions"
          >
            + Financial CSV (Sheet)
          </button>
          <button
            type="button"
            onClick={loadSampleMd}
            className="rounded-lg border border-slate-200 bg-white px-2.5 py-1 font-medium text-slate-700 hover:bg-slate-50 hover:text-blue-600 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-300 dark:hover:bg-slate-800 transition"
          >
            + Sample Markdown
          </button>
          <button
            type="button"
            onClick={loadSampleJson}
            className="rounded-lg border border-sky-200 bg-sky-50/80 px-2.5 py-1 font-semibold text-sky-800 hover:bg-sky-100 dark:border-sky-800 dark:bg-sky-950/40 dark:text-sky-300 dark:hover:bg-sky-900/60 transition"
          >
            + JSON Records
          </button>
          <button
            type="button"
            onClick={loadSampleScannedImage}
            className="rounded-lg border border-teal-200 bg-teal-50/80 px-2.5 py-1 font-semibold text-teal-800 hover:bg-teal-100 dark:border-teal-800 dark:bg-teal-950/40 dark:text-teal-300 dark:hover:bg-teal-900/60 transition flex items-center gap-1"
          >
            <ScanText className="h-3 w-3" />
            + Scanned Doc Image
          </button>
          <button
            type="button"
            onClick={loadSampleImg}
            className="rounded-lg border border-slate-200 bg-white px-2.5 py-1 font-medium text-slate-700 hover:bg-slate-50 hover:text-blue-600 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-300 dark:hover:bg-slate-800 transition"
          >
            + Slide Image
          </button>
        </div>
      </div>

      {/* Batch Control Toolbar (Visible when files are in queue) */}
      {queueLength > 0 && (
        <div
          id="batch-toolbar"
          className="flex flex-col gap-3 rounded-xl border border-blue-200 bg-blue-50/70 p-4 dark:border-blue-900/60 dark:bg-blue-950/30 sm:flex-row sm:items-center sm:justify-between"
        >
          <div className="flex flex-wrap items-center gap-3">
            <div className="flex items-center gap-2">
              <Layers className="h-4 w-4 text-blue-600 dark:text-blue-400" />
              <span className="text-xs font-bold text-slate-900 dark:text-white">
                Batch Queue ({queueLength} files)
              </span>
            </div>

            <div className="flex items-center gap-1.5 text-xs text-slate-600 dark:text-slate-300">
              <span>Set all to:</span>
              <select
                value={globalTarget}
                onChange={(e) => onGlobalTargetChange(e.target.value as TargetFormat)}
                className="rounded-lg border border-slate-300 bg-white px-2 py-1 text-xs font-bold text-slate-800 shadow-sm focus:outline-none dark:border-slate-700 dark:bg-slate-800 dark:text-white"
              >
                <option value="pdf">PDF (.pdf)</option>
                <option value="pptx">PowerPoint (.pptx)</option>
                <option value="docx">Word (.docx)</option>
                <option value="txt">Text (.txt)</option>
                <option value="html">HTML (.html)</option>
                <option value="md">Markdown (.md)</option>
              </select>
            </div>

            {/* OCR Toggle in Toolbar */}
            <label
              id="batch-ocr-toggle-label"
              className={`flex items-center gap-1.5 cursor-pointer text-xs font-semibold px-2 py-1 rounded-md border shadow-2xs transition ${
                ocrEnabled
                  ? 'border-purple-300 bg-purple-100/90 text-purple-900 dark:border-purple-800 dark:bg-purple-950/80 dark:text-purple-200'
                  : 'border-slate-200 bg-white/80 text-slate-700 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-300'
              }`}
              title="Extract text from image-based PDFs and scanned documents"
            >
              <input
                id="batch-ocr-checkbox"
                type="checkbox"
                checked={ocrEnabled}
                onChange={(e) => onOcrToggle(e.target.checked)}
                className="rounded border-slate-300 text-purple-600 focus:ring-purple-500 h-3.5 w-3.5"
              />
              <ScanText className="h-3.5 w-3.5 text-purple-600 dark:text-purple-400" />
              <span>OCR Extraction</span>
            </label>

            {/* Auto-Encrypt Toggle */}
            <label className="flex items-center gap-1.5 cursor-pointer text-xs font-medium text-slate-700 dark:text-slate-300">
              <input
                type="checkbox"
                checked={autoEncrypt}
                onChange={(e) => onAutoEncryptChange(e.target.checked)}
                className="rounded border-slate-300 text-blue-600 focus:ring-blue-500"
              />
              <Lock className="h-3.5 w-3.5 text-emerald-500" />
              <span>Auto-Encrypt (E2EE)</span>
            </label>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            {/* Convert All Button */}
            <button
              id="batch-convert-btn"
              onClick={onConvertAll}
              disabled={isConvertingBatch}
              className="flex items-center gap-1.5 rounded-lg bg-blue-600 px-4 py-2 text-xs font-bold text-white shadow-sm hover:bg-blue-700 disabled:opacity-60 transition"
            >
              <Play className="h-3.5 w-3.5 fill-current" />
              {isConvertingBatch ? 'Converting Batch...' : `Convert All (${queueLength})`}
            </button>

            {/* Download All as ZIP (When any converted) */}
            {completedCount > 0 && (
              <button
                id="batch-download-zip-btn"
                onClick={onDownloadZip}
                className="flex items-center gap-1.5 rounded-lg bg-emerald-600 px-3 py-2 text-xs font-bold text-white shadow-sm hover:bg-emerald-700 transition"
                title="Download all converted files in a ZIP archive"
              >
                <Archive className="h-3.5 w-3.5" />
                <span>ZIP Download ({completedCount})</span>
              </button>
            )}

            {/* Clear All */}
            <button
              onClick={onClearAll}
              disabled={isConvertingBatch}
              className="flex items-center gap-1 rounded-lg border border-slate-200 bg-white p-2 text-xs font-medium text-slate-600 hover:bg-slate-50 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-300 dark:hover:bg-slate-700 transition"
              title="Clear queue"
            >
              <Trash2 className="h-3.5 w-3.5" />
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

