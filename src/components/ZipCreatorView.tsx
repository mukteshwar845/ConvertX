import React, { useState, useRef } from 'react';
import {
  Archive,
  UploadCloud,
  FolderPlus,
  FilePlus,
  Trash2,
  Download,
  CheckCircle2,
  FileText,
  Folder,
  Layers,
  Sparkles,
} from 'lucide-react';
import JSZip from 'jszip';
import { triggerBlobDownload } from '../utils/downloadHelper';

interface ZipFileEntry {
  file: File;
  relativePath: string;
  size: number;
}

export const ZipCreatorView: React.FC = () => {
  const [entries, setEntries] = useState<ZipFileEntry[]>([]);
  const [zipName, setZipName] = useState<string>(() => {
    const d = new Date().toISOString().split('T')[0];
    return `Archive_${d}.zip`;
  });
  const [compressionLevel, setCompressionLevel] = useState<number>(6);
  const [isCompressing, setIsCompressing] = useState<boolean>(false);
  const [progress, setProgress] = useState<number>(0);
  const [downloadUrl, setDownloadUrl] = useState<string | null>(null);
  const [generatedSize, setGeneratedSize] = useState<number | null>(null);
  const [isDragging, setIsDragging] = useState<boolean>(false);

  const fileInputRef = useRef<HTMLInputElement>(null);
  const folderInputRef = useRef<HTMLInputElement>(null);

  const formatBytes = (bytes: number) => {
    if (!bytes || bytes === 0) return '0 B';
    const k = 1024;
    const sizes = ['B', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(1)) + ' ' + sizes[i];
  };

  const handleFilesAdded = (files: FileList | File[]) => {
    const newEntries: ZipFileEntry[] = [];
    for (let i = 0; i < files.length; i++) {
      const file = files[i];
      // webkitRelativePath contains the full relative path if chosen via folder picker
      const relativePath = file.webkitRelativePath || file.name;
      newEntries.push({
        file,
        relativePath,
        size: file.size,
      });
    }

    setEntries((prev) => [...prev, ...newEntries]);
    setDownloadUrl(null);
    setGeneratedSize(null);
  };

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
      handleFilesAdded(e.dataTransfer.files);
    }
  };

  const handleRemoveEntry = (index: number) => {
    setEntries((prev) => prev.filter((_, i) => i !== index));
    setDownloadUrl(null);
  };

  const handleClearAll = () => {
    setEntries([]);
    setDownloadUrl(null);
    setGeneratedSize(null);
    setProgress(0);
  };

  const handleCreateZip = async () => {
    if (entries.length === 0) return;
    setIsCompressing(true);
    setProgress(10);

    try {
      const zip = new JSZip();

      for (let i = 0; i < entries.length; i++) {
        const entry = entries[i];
        zip.file(entry.relativePath, entry.file);
        setProgress(Math.round(10 + ((i + 1) / entries.length) * 50));
      }

      const zipBlob = await zip.generateAsync(
        {
          type: 'blob',
          compression: 'DEFLATE',
          compressionOptions: {
            level: compressionLevel,
          },
        },
        (metadata) => {
          setProgress(Math.round(60 + metadata.percent * 0.4));
        }
      );

      const url = URL.createObjectURL(zipBlob);
      setDownloadUrl(url);
      setGeneratedSize(zipBlob.size);
      setProgress(100);

      // Auto-trigger download with robust helper
      const cleanName = zipName.endsWith('.zip') ? zipName : `${zipName}.zip`;
      triggerBlobDownload(zipBlob, cleanName);
    } catch (err) {
      console.error('Failed to create ZIP archive:', err);
    } finally {
      setIsCompressing(false);
    }
  };

  const totalUncompressedSize = entries.reduce((acc, e) => acc + e.size, 0);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
        <div>
          <h2 className="text-xl font-extrabold tracking-tight text-slate-900 dark:text-white flex items-center gap-2">
            <Archive className="h-5 w-5 text-emerald-600 dark:text-emerald-400" />
            Universal Zip Compressor (Files & Folders)
          </h2>
          <p className="mt-1 text-xs text-slate-500 dark:text-slate-400">
            Combine any files or entire folders into a single compressed `.zip` archive. 100% in-browser with zero size limits.
          </p>
        </div>

        {entries.length > 0 && (
          <button
            onClick={handleClearAll}
            disabled={isCompressing}
            className="flex items-center gap-1.5 rounded-xl border border-slate-200 bg-white px-3 py-1.5 text-xs font-semibold text-slate-600 hover:bg-rose-50 hover:text-rose-600 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-300 dark:hover:bg-rose-950/40 dark:hover:text-rose-400 transition"
          >
            <Trash2 className="h-3.5 w-3.5" />
            <span>Clear Files</span>
          </button>
        )}
      </div>

      {/* Drag and Drop Zone */}
      <div
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
        className={`relative flex flex-col items-center justify-center rounded-3xl border-2 border-dashed p-8 sm:p-10 text-center transition ${
          isDragging
            ? 'border-emerald-500 bg-emerald-50/50 dark:border-emerald-400 dark:bg-emerald-950/30'
            : 'border-slate-300/90 bg-white/80 hover:border-emerald-400 hover:bg-emerald-50/20 dark:border-slate-700/80 dark:bg-slate-900/70 dark:hover:border-emerald-500/60 shadow-xs'
        }`}
      >
        <input
          ref={fileInputRef}
          type="file"
          multiple
          onChange={(e) => e.target.files && handleFilesAdded(e.target.files)}
          className="hidden"
        />

        <input
          ref={folderInputRef}
          type="file"
          // @ts-ignore
          webkitdirectory=""
          directory=""
          multiple
          onChange={(e) => e.target.files && handleFilesAdded(e.target.files)}
          className="hidden"
        />

        <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-gradient-to-tr from-emerald-600 to-teal-600 text-white shadow-lg shadow-emerald-500/25">
          <Archive className="h-8 w-8" />
        </div>

        <h3 className="mt-4 text-base sm:text-lg font-bold text-slate-900 dark:text-white">
          Drop any files or folders here
        </h3>
        <p className="mt-1 text-xs text-slate-500 dark:text-slate-400 max-w-md">
          Folder directory hierarchy and subfolders will be preserved inside the ZIP.
        </p>

        {/* Buttons for File vs Folder selection */}
        <div className="mt-5 flex flex-wrap items-center justify-center gap-2.5">
          <button
            type="button"
            onClick={() => fileInputRef.current?.click()}
            className="flex items-center gap-1.5 rounded-xl bg-emerald-600 px-4 py-2 text-xs font-extrabold text-white shadow-sm hover:bg-emerald-700 transition active:scale-95"
          >
            <FilePlus className="h-4 w-4" />
            <span>Add Files</span>
          </button>

          <button
            type="button"
            onClick={() => folderInputRef.current?.click()}
            className="flex items-center gap-1.5 rounded-xl border border-emerald-300 bg-emerald-50 px-4 py-2 text-xs font-bold text-emerald-800 hover:bg-emerald-100 dark:border-emerald-800 dark:bg-emerald-950/60 dark:text-emerald-300 dark:hover:bg-emerald-900/60 transition active:scale-95"
          >
            <FolderPlus className="h-4 w-4" />
            <span>Add Entire Folder</span>
          </button>
        </div>
      </div>

      {/* Configuration & File List (When files are added) */}
      {entries.length > 0 && (
        <div className="space-y-4">
          {/* Settings Bar */}
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 rounded-2xl border border-slate-200/90 bg-white/90 p-4 dark:border-slate-800/90 dark:bg-slate-900/90 shadow-xs">
            <div className="flex flex-wrap items-center gap-3 flex-1">
              <div className="flex items-center gap-2">
                <span className="text-xs font-bold text-slate-700 dark:text-slate-300">ZIP Name:</span>
                <input
                  type="text"
                  value={zipName}
                  onChange={(e) => setZipName(e.target.value)}
                  className="rounded-xl border border-slate-300 bg-slate-50 px-3 py-1.5 text-xs font-bold text-slate-900 focus:border-emerald-500 focus:bg-white focus:outline-none dark:border-slate-700 dark:bg-slate-800 dark:text-white"
                />
              </div>

              <div className="flex items-center gap-2">
                <span className="text-xs font-bold text-slate-700 dark:text-slate-300">Compression:</span>
                <select
                  value={compressionLevel}
                  onChange={(e) => setCompressionLevel(Number(e.target.value))}
                  className="rounded-xl border border-slate-300 bg-slate-50 px-3 py-1.5 text-xs font-bold text-slate-900 focus:border-emerald-500 focus:bg-white focus:outline-none dark:border-slate-700 dark:bg-slate-800 dark:text-white"
                >
                  <option value={1}>Fast (Level 1)</option>
                  <option value={6}>Standard (Level 6)</option>
                  <option value={9}>Maximum (Level 9)</option>
                </select>
              </div>
            </div>

            <div className="flex items-center gap-3 shrink-0">
              <div className="text-right text-xs">
                <div className="font-bold text-slate-900 dark:text-white">{entries.length} files</div>
                <div className="text-slate-400">{formatBytes(totalUncompressedSize)}</div>
              </div>

              <button
                onClick={handleCreateZip}
                disabled={isCompressing}
                className="flex items-center gap-2 rounded-xl bg-gradient-to-r from-emerald-600 to-teal-600 px-5 py-2.5 text-xs font-extrabold text-white shadow-md shadow-emerald-500/20 hover:from-emerald-700 hover:to-teal-700 disabled:opacity-60 transition active:scale-95"
              >
                <Download className="h-4 w-4" />
                <span>{isCompressing ? `Compressing (${progress}%)...` : 'Create & Download ZIP'}</span>
              </button>
            </div>
          </div>

          {/* Progress bar */}
          {isCompressing && (
            <div className="overflow-hidden rounded-full bg-slate-100 dark:bg-slate-800">
              <div
                className="h-2 rounded-full bg-gradient-to-r from-emerald-500 to-teal-500 transition-all duration-300"
                style={{ width: `${progress}%` }}
              />
            </div>
          )}

          {/* File Entries Table */}
          <div className="rounded-2xl border border-slate-200/90 bg-white/90 overflow-hidden shadow-xs dark:border-slate-800/90 dark:bg-slate-900/90">
            <div className="max-h-80 overflow-y-auto divide-y divide-slate-100 dark:divide-slate-800/80">
              {entries.map((entry, idx) => (
                <div key={idx} className="flex items-center justify-between px-4 py-2.5 hover:bg-slate-50/70 dark:hover:bg-slate-800/40 text-xs">
                  <div className="flex items-center gap-2 min-w-0">
                    {entry.relativePath.includes('/') ? (
                      <Folder className="h-4 w-4 text-amber-500 shrink-0" />
                    ) : (
                      <FileText className="h-4 w-4 text-emerald-500 shrink-0" />
                    )}
                    <span className="font-mono text-slate-800 dark:text-slate-200 truncate" title={entry.relativePath}>
                      {entry.relativePath}
                    </span>
                  </div>

                  <div className="flex items-center gap-3 shrink-0">
                    <span className="text-slate-400 font-mono text-[11px]">{formatBytes(entry.size)}</span>
                    <button
                      onClick={() => handleRemoveEntry(idx)}
                      className="p-1 text-slate-400 hover:text-rose-600 transition"
                      title="Remove file"
                    >
                      <Trash2 className="h-3.5 w-3.5" />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
