import React, { useState, useRef } from 'react';
import {
  ShieldAlert,
  ShieldCheck,
  Lock,
  UploadCloud,
  Download,
  AlertTriangle,
  Info,
  CheckCircle2,
  FileText,
  Loader2,
  Sparkles,
  RefreshCw,
  User,
  Cpu,
  Clock,
  Smartphone,
} from 'lucide-react';
import {
  inspectFileMetadata,
  sanitizeFileMetadata,
  MetadataInspectionReport,
  MetadataRiskLevel,
} from '../utils/metadataCleanerEngine';
import { downloadBlob } from '../utils/downloadHelper';
import { HistoryRecord } from '../types';

interface MetadataCleanerViewProps {
  onAddToHistory?: (record: HistoryRecord) => void;
  addToast?: (type: 'success' | 'error' | 'warning' | 'info', message: string, title?: string) => void;
}

export const MetadataCleanerView: React.FC<MetadataCleanerViewProps> = ({
  onAddToHistory,
  addToast,
}) => {
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [report, setReport] = useState<MetadataInspectionReport | null>(null);
  const [isInspecting, setIsInspecting] = useState<boolean>(false);
  const [isSanitizing, setIsSanitizing] = useState<boolean>(false);
  const [sanitizeProgress, setSanitizeProgress] = useState<number>(0);
  const [cleanBlob, setCleanBlob] = useState<Blob | null>(null);
  const [cleanFileName, setCleanFileName] = useState<string>('');
  const [removedCount, setRemovedCount] = useState<number>(0);

  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleSelectFile = async (file: File) => {
    setSelectedFile(file);
    setCleanBlob(null);
    setCleanFileName('');
    setReport(null);
    setIsInspecting(true);

    try {
      const rep = await inspectFileMetadata(file);
      setReport(rep);
    } catch (err: any) {
      addToast?.('error', 'Failed to inspect metadata: ' + err.message);
    } finally {
      setIsInspecting(false);
    }
  };

  const handleSanitize = async () => {
    if (!selectedFile) return;
    setIsSanitizing(true);
    setSanitizeProgress(10);

    try {
      const result = await sanitizeFileMetadata(selectedFile, (pct) => setSanitizeProgress(pct));
      setCleanBlob(result.cleanBlob);
      setCleanFileName(result.cleanFileName);
      setRemovedCount(result.removedCount);

      if (onAddToHistory) {
        const ext = result.cleanFileName.split('.').pop()?.toLowerCase() || 'pdf';
        const rec: HistoryRecord = {
          id: `hist_clean_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`,
          originalName: selectedFile.name,
          originalSize: selectedFile.size,
          convertedName: result.cleanFileName,
          convertedSize: result.cleanBlob.size,
          sourceFormat: ext as any,
          targetFormat: ext as any,
          timestamp: Date.now(),
        };
        onAddToHistory(rec);
      }

      addToast?.('success', `Sanitized ${result.removedCount} identifying tags from document!`);
    } catch (err: any) {
      addToast?.('error', err.message || 'Sanitization failed.');
    } finally {
      setIsSanitizing(false);
    }
  };

  const handleDownloadClean = () => {
    if (cleanBlob && cleanFileName) {
      downloadBlob(cleanBlob, cleanFileName);
      addToast?.('info', `Downloaded ${cleanFileName}`);
    }
  };

  const getRiskBadge = (risk: MetadataRiskLevel) => {
    switch (risk) {
      case 'high':
        return (
          <span className="inline-flex items-center gap-1 rounded-full bg-rose-100 px-2 py-0.5 text-[10px] font-extrabold text-rose-700 dark:bg-rose-950/60 dark:text-rose-300">
            <AlertTriangle className="h-3 w-3" /> High Privacy Risk
          </span>
        );
      case 'medium':
        return (
          <span className="inline-flex items-center gap-1 rounded-full bg-amber-100 px-2 py-0.5 text-[10px] font-extrabold text-amber-700 dark:bg-amber-950/60 dark:text-amber-300">
            <Info className="h-3 w-3" /> Tracking Trace
          </span>
        );
      case 'low':
      default:
        return (
          <span className="inline-flex items-center gap-1 rounded-full bg-slate-100 px-2 py-0.5 text-[10px] font-semibold text-slate-600 dark:bg-slate-800 dark:text-slate-400">
            Document Tag
          </span>
        );
    }
  };

  const getCategoryIcon = (category: string) => {
    switch (category) {
      case 'identity':
        return <User className="h-4 w-4 text-rose-500" />;
      case 'software':
        return <Cpu className="h-4 w-4 text-blue-500" />;
      case 'timestamps':
        return <Clock className="h-4 w-4 text-amber-500" />;
      case 'device':
        return <Smartphone className="h-4 w-4 text-purple-500" />;
      default:
        return <FileText className="h-4 w-4 text-slate-500" />;
    }
  };

  return (
    <div className="mx-auto max-w-5xl space-y-6">
      {/* Header Banner */}
      <div className="relative overflow-hidden rounded-3xl border border-emerald-500/20 bg-gradient-to-br from-emerald-500/10 via-teal-500/5 to-blue-500/10 p-6 sm:p-8 backdrop-blur-xl">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <div className="inline-flex items-center gap-2 rounded-full bg-emerald-500/10 px-3 py-1 text-xs font-bold text-emerald-600 dark:text-emerald-400">
              <Lock className="h-3.5 w-3.5" />
              <span>Security & Privacy Suite</span>
            </div>
            <h1 className="mt-2 text-2xl sm:text-3xl font-extrabold tracking-tight text-slate-900 dark:text-white">
              Privacy Sanitizer & Metadata Stripper
            </h1>
            <p className="mt-1 text-sm text-slate-600 dark:text-slate-400 max-w-xl">
              Inspect and wipe hidden author names, edit history, organization tags, and device fingerprints before sharing documents or images.
            </p>
          </div>
          <div className="flex items-center gap-2 text-xs font-semibold text-emerald-600 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-950/50 px-3 py-2 rounded-2xl border border-emerald-500/20 w-fit">
            <ShieldCheck className="h-4 w-4" />
            <span>100% In-Browser Privacy</span>
          </div>
        </div>
      </div>

      {/* Upload Zone */}
      <input
        ref={fileInputRef}
        type="file"
        accept=".pdf,.docx,.dotx,.png,.jpg,.jpeg,.webp"
        className="hidden"
        onChange={(e) => e.target.files?.[0] && handleSelectFile(e.target.files[0])}
      />

      {!selectedFile ? (
        <div
          onClick={() => fileInputRef.current?.click()}
          className="flex flex-col items-center justify-center rounded-3xl border-2 border-dashed border-slate-300 dark:border-slate-700 bg-white/60 dark:bg-slate-900/60 p-12 text-center cursor-pointer hover:border-emerald-500 hover:bg-emerald-50/20 dark:hover:bg-emerald-950/10 transition shadow-xs"
        >
          <div className="flex h-16 w-16 items-center justify-center rounded-3xl bg-emerald-50 text-emerald-600 dark:bg-emerald-950/60 mb-4 shadow-sm">
            <ShieldAlert className="h-8 w-8" />
          </div>
          <h2 className="text-lg font-bold text-slate-900 dark:text-white">
            Choose File to Audit & Sanitize
          </h2>
          <p className="mt-1 text-sm text-slate-500 dark:text-slate-400 max-w-md">
            Upload any PDF, Word (DOCX), or image to inspect hidden tracking tags and remove them in 1-click.
          </p>
          <div className="mt-4 flex flex-wrap justify-center gap-2 text-xs text-slate-400">
            <span className="rounded-lg bg-slate-100 dark:bg-slate-800 px-2.5 py-1 font-semibold">PDF</span>
            <span className="rounded-lg bg-slate-100 dark:bg-slate-800 px-2.5 py-1 font-semibold">DOCX</span>
            <span className="rounded-lg bg-slate-100 dark:bg-slate-800 px-2.5 py-1 font-semibold">PNG / JPG</span>
          </div>
        </div>
      ) : (
        <div className="space-y-6">
          {/* File Selected Banner */}
          <div className="flex flex-col sm:flex-row items-center justify-between gap-4 rounded-3xl border border-slate-200/90 bg-white p-5 dark:border-slate-800/90 dark:bg-slate-900/90 shadow-xs">
            <div className="flex items-center gap-3">
              <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-emerald-50 text-emerald-600 dark:bg-emerald-950/60">
                <FileText className="h-6 w-6" />
              </div>
              <div>
                <h3 className="text-base font-bold text-slate-900 dark:text-white">{selectedFile.name}</h3>
                <p className="text-xs text-slate-400">
                  {(selectedFile.size / 1024 / 1024).toFixed(2)} MB · {selectedFile.type || 'Document'}
                </p>
              </div>
            </div>

            <button
              onClick={() => fileInputRef.current?.click()}
              className="text-xs font-bold text-emerald-600 hover:underline"
            >
              Choose Different File
            </button>
          </div>

          {/* Audit Results Card */}
          {isInspecting ? (
            <div className="flex flex-col items-center justify-center rounded-3xl border border-slate-200 bg-white p-12 dark:border-slate-800 dark:bg-slate-900 text-center">
              <Loader2 className="h-8 w-8 animate-spin text-emerald-500 mb-3" />
              <p className="text-sm font-bold text-slate-700 dark:text-slate-300">
                Inspecting document structures for hidden metadata...
              </p>
            </div>
          ) : report ? (
            <div className="rounded-3xl border border-slate-200/90 bg-white p-6 dark:border-slate-800/90 dark:bg-slate-900/90 shadow-xs space-y-6">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-100 dark:border-slate-800 pb-4">
                <div>
                  <div className="flex items-center gap-2">
                    <h2 className="text-lg font-bold text-slate-900 dark:text-white">
                      Privacy Security Audit
                    </h2>
                    {report.totalTags > 0 ? (
                      <span className="rounded-full bg-rose-100 dark:bg-rose-950/60 px-2.5 py-0.5 text-xs font-extrabold text-rose-700 dark:text-rose-300">
                        {report.totalTags} Hidden Tags Detected
                      </span>
                    ) : (
                      <span className="rounded-full bg-emerald-100 dark:bg-emerald-950/60 px-2.5 py-0.5 text-xs font-extrabold text-emerald-700 dark:text-emerald-300">
                        Pristine · Zero Tags Found
                      </span>
                    )}
                  </div>
                  <p className="mt-1 text-xs text-slate-500 dark:text-slate-400">
                    Below are the hidden identifiers, editing software, and timestamps found in this file.
                  </p>
                </div>

                <button
                  onClick={handleSanitize}
                  disabled={isSanitizing}
                  className="flex items-center justify-center gap-2 rounded-2xl bg-gradient-to-r from-emerald-600 to-teal-600 px-6 py-3 text-sm font-bold text-white shadow-lg shadow-emerald-500/25 hover:from-emerald-500 hover:to-teal-500 disabled:opacity-50 transition"
                >
                  {isSanitizing ? (
                    <>
                      <Loader2 className="h-4 w-4 animate-spin" />
                      <span>Sanitizing {sanitizeProgress}%...</span>
                    </>
                  ) : (
                    <>
                      <ShieldCheck className="h-4 w-4" />
                      <span>Sanitize & Strip All Metadata</span>
                    </>
                  )}
                </button>
              </div>

              {/* Items List */}
              {report.items.length > 0 ? (
                <div className="space-y-3">
                  {report.items.map((item) => (
                    <div
                      key={item.id}
                      className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 rounded-2xl border border-slate-200/60 bg-slate-50/60 p-3.5 dark:border-slate-800/60 dark:bg-slate-950/40"
                    >
                      <div className="flex items-start gap-3">
                        <div className="mt-0.5 rounded-xl bg-white p-2 shadow-xs dark:bg-slate-900">
                          {getCategoryIcon(item.category)}
                        </div>
                        <div>
                          <div className="flex items-center gap-2">
                            <span className="text-xs font-bold text-slate-900 dark:text-white">
                              {item.label}
                            </span>
                            {getRiskBadge(item.risk)}
                          </div>
                          <p className="mt-0.5 text-sm font-mono font-semibold text-slate-700 dark:text-slate-300 break-all">
                            "{item.value}"
                          </p>
                          <p className="mt-0.5 text-[11px] text-slate-400">
                            {item.description}
                          </p>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="flex items-center gap-3 rounded-2xl bg-emerald-50/80 dark:bg-emerald-950/30 p-4 border border-emerald-500/20 text-emerald-800 dark:text-emerald-200 text-xs font-semibold">
                  <CheckCircle2 className="h-5 w-5 text-emerald-500 flex-shrink-0" />
                  <span>No embedded author names, EXIF markers, or revision history detected in this document.</span>
                </div>
              )}
            </div>
          ) : null}

          {/* Cleaned Result Card */}
          {cleanBlob && (
            <div className="flex flex-col sm:flex-row items-center justify-between gap-4 rounded-3xl border border-emerald-500/30 bg-emerald-50/80 p-6 dark:border-emerald-500/30 dark:bg-emerald-950/30 shadow-lg">
              <div className="flex items-center gap-3">
                <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-emerald-500 text-white shadow-md shadow-emerald-500/20">
                  <ShieldCheck className="h-6 w-6" />
                </div>
                <div>
                  <h3 className="text-base font-bold text-emerald-900 dark:text-emerald-100">
                    File Sanitized & Cleaned!
                  </h3>
                  <p className="text-xs text-emerald-700 dark:text-emerald-300">
                    {cleanFileName} ({(cleanBlob.size / 1024 / 1024).toFixed(2)} MB) · All {removedCount} metadata tags stripped
                  </p>
                </div>
              </div>

              <button
                onClick={handleDownloadClean}
                className="w-full sm:w-auto flex items-center justify-center gap-2 rounded-2xl bg-emerald-600 hover:bg-emerald-500 px-6 py-3 text-sm font-bold text-white shadow-lg shadow-emerald-600/20 transition active:scale-95"
              >
                <Download className="h-4 w-4" />
                <span>Download Clean File</span>
              </button>
            </div>
          )}
        </div>
      )}
    </div>
  );
};
