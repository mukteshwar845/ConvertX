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
} from 'lucide-react';
import { TargetFormat } from '../types';
import { createSampleDocxFile, createSampleTxtFile, createSampleImageFile } from '../utils/sampleDocs';

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

  return (
    <div className="space-y-4">
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
          accept=".docx,.pdf,.pptx,.ppt,.txt,.md,.markdown,.html,.htm,.png,.jpg,.jpeg"
          onChange={handleFileInputChange}
          className="hidden"
        />

        <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-blue-50 text-blue-600 shadow-inner dark:bg-blue-950/60 dark:text-blue-400">
          <UploadCloud className="h-7 w-7" />
        </div>

        <h3 className="mt-4 text-base font-semibold text-slate-900 dark:text-white">
          Drop your files here, or <span className="text-blue-600 dark:text-blue-400 underline">browse</span>
        </h3>
        <p className="mt-1.5 text-xs text-slate-500 dark:text-slate-400 max-w-md">
          Supports DOCX, PDF, PPTX, TXT, Markdown, HTML, PNG, and JPG. Multi-file batch processing with original formatting preservation.
        </p>

        {/* Supported Format Badges */}
        <div className="mt-4 flex flex-wrap justify-center gap-1.5">
          {['.DOCX', '.PDF', '.PPTX', '.TXT', '.MD', '.HTML', '.PNG', '.JPG'].map((ext) => (
            <span
              key={ext}
              className="rounded-md bg-slate-100 px-2 py-0.5 text-[11px] font-semibold text-slate-600 dark:bg-slate-800 dark:text-slate-300"
            >
              {ext}
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
            onClick={loadSampleDocx}
            className="rounded-lg border border-slate-200 bg-white px-2.5 py-1 font-medium text-slate-700 hover:bg-slate-50 hover:text-blue-600 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-300 dark:hover:bg-slate-800 transition"
          >
            + Sample DOCX (Report)
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
            onClick={loadSampleImg}
            className="rounded-lg border border-slate-200 bg-white px-2.5 py-1 font-medium text-slate-700 hover:bg-slate-50 hover:text-blue-600 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-300 dark:hover:bg-slate-800 transition"
          >
            + Sample Slide Image
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
