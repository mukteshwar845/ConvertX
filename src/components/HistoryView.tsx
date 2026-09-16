import React, { useState } from 'react';
import {
  History,
  Search,
  Download,
  Trash2,
  Eye,
  Archive,
  Calendar,
  ScanText,
  Zap,
  Sparkles,
  AlertTriangle,
  X,
  Check,
} from 'lucide-react';
import { HistoryRecord } from '../types';
import { getFormatVisual } from './ConversionCard';

interface HistoryViewProps {
  records: HistoryRecord[];
  isLoading?: boolean;
  onDownloadRecord: (record: HistoryRecord) => void;
  onPreviewRecord: (record: HistoryRecord) => void;
  onDeleteRecord: (id: string) => void;
  onClearHistory: () => void;
  onDownloadAllZip: () => void;
}

export const HistoryView: React.FC<HistoryViewProps> = ({
  records,
  isLoading = false,
  onDownloadRecord,
  onPreviewRecord,
  onDeleteRecord,
  onClearHistory,
  onDownloadAllZip,
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedFormat, setSelectedFormat] = useState<string>('all');
  // Tracks which record id is pending inline delete confirmation
  const [pendingDeleteId, setPendingDeleteId] = useState<string | null>(null);
  // Tracks whether "Clear All" confirmation is visible
  const [showClearConfirm, setShowClearConfirm] = useState(false);

  const formatBytes = (bytes: number) => {
    if (!bytes || bytes === 0) return '0 B';
    const k = 1024;
    const sizes = ['B', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(1)) + ' ' + sizes[i];
  };

  const filteredRecords = records.filter((r) => {
    const matchesSearch =
      r.convertedName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      r.originalName.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesFormat = selectedFormat === 'all' || r.targetFormat === selectedFormat;
    return matchesSearch && matchesFormat;
  });

  const totalBytes = records.reduce((acc, r) => acc + (r.convertedSize || 0), 0);

  const handleDeleteClick = (id: string) => {
    setPendingDeleteId(id);
  };

  const handleDeleteConfirm = (id: string) => {
    onDeleteRecord(id);
    setPendingDeleteId(null);
  };

  const handleDeleteCancel = () => {
    setPendingDeleteId(null);
  };

  const handleClearClick = () => {
    setShowClearConfirm(true);
  };

  const handleClearConfirm = () => {
    onClearHistory();
    setShowClearConfirm(false);
  };

  const handleClearCancel = () => {
    setShowClearConfirm(false);
  };

  // Loading skeleton
  if (isLoading) {
    return (
      <div className="space-y-6 animate-pulse">
        <div className="h-8 w-64 rounded-xl bg-slate-200 dark:bg-slate-800" />
        <div className="h-12 rounded-xl bg-slate-100 dark:bg-slate-900" />
        {[1, 2, 3].map((i) => (
          <div key={i} className="h-20 rounded-xl bg-slate-100 dark:bg-slate-900" />
        ))}
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header & Overview Stats */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h2 className="text-xl font-bold tracking-tight text-slate-900 dark:text-white flex items-center gap-2">
            <History className="h-5 w-5 text-blue-600 dark:text-blue-400" />
            Conversion History
          </h2>
          <p className="mt-1 text-xs text-slate-500 dark:text-slate-400">
            {records.length} document{records.length === 1 ? '' : 's'} converted · {formatBytes(totalBytes)} total ·{' '}
            <span className="inline-flex items-center gap-1 text-emerald-600 dark:text-emerald-400 font-semibold">
              <span className="h-1.5 w-1.5 rounded-full bg-emerald-500 inline-block" />
              Stored only on this device
            </span>
          </p>
        </div>

        {records.length > 0 && (
          <div className="flex items-center gap-2">
            <button
              onClick={onDownloadAllZip}
              className="flex items-center gap-1.5 rounded-lg bg-emerald-600 px-3 py-1.5 text-xs font-bold text-white shadow-sm hover:bg-emerald-700 transition"
            >
              <Archive className="h-3.5 w-3.5" />
              Download All (ZIP)
            </button>

            {/* Clear All — inline confirmation */}
            {showClearConfirm ? (
              <div className="flex items-center gap-1.5 rounded-lg border border-rose-300 bg-rose-50 px-3 py-1.5 dark:border-rose-800 dark:bg-rose-950/60 shadow-sm">
                <AlertTriangle className="h-3.5 w-3.5 text-rose-600 dark:text-rose-400 shrink-0" />
                <span className="text-xs font-semibold text-rose-700 dark:text-rose-300 whitespace-nowrap">
                  Delete all {records.length} records?
                </span>
                <button
                  onClick={handleClearConfirm}
                  className="ml-1 flex items-center gap-0.5 rounded-md bg-rose-600 px-2 py-0.5 text-[11px] font-bold text-white hover:bg-rose-700 transition"
                >
                  <Check className="h-3 w-3" />
                  Yes, clear
                </button>
                <button
                  onClick={handleClearCancel}
                  className="flex items-center rounded-md p-1 text-rose-500 hover:bg-rose-100 dark:hover:bg-rose-900/40 transition"
                >
                  <X className="h-3 w-3" />
                </button>
              </div>
            ) : (
              <button
                onClick={handleClearClick}
                className="flex items-center gap-1.5 rounded-lg border border-slate-200 bg-white px-3 py-1.5 text-xs font-medium text-slate-600 hover:bg-rose-50 hover:text-rose-600 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-300 dark:hover:bg-rose-950/40 dark:hover:text-rose-400 transition"
              >
                <Trash2 className="h-3.5 w-3.5" />
                Clear All
              </button>
            )}
          </div>
        )}
      </div>

      {/* Filter & Search Bar */}
      <div className="flex flex-col gap-3 rounded-xl border border-slate-200 bg-white p-3 shadow-sm dark:border-slate-800 dark:bg-slate-900 sm:flex-row sm:items-center sm:justify-between">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
          <input
            type="text"
            placeholder="Search by file name..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full rounded-lg border border-slate-200 bg-slate-50 py-1.5 pl-9 pr-3 text-xs text-slate-900 focus:border-blue-500 focus:bg-white focus:outline-none dark:border-slate-700 dark:bg-slate-800 dark:text-white"
          />
        </div>

        {/* Format Filter Tabs */}
        <div className="flex flex-wrap gap-1">
          {['all', 'pdf', 'pptx', 'docx', 'txt', 'html'].map((fmt) => (
            <button
              key={fmt}
              onClick={() => setSelectedFormat(fmt)}
              className={`rounded-lg px-2.5 py-1 text-xs font-semibold uppercase transition ${
                selectedFormat === fmt
                  ? 'bg-blue-600 text-white shadow-xs'
                  : 'bg-slate-100 text-slate-600 hover:bg-slate-200 dark:bg-slate-800 dark:text-slate-300 dark:hover:bg-slate-700'
              }`}
            >
              {fmt}
            </button>
          ))}
        </div>
      </div>

      {/* History Records List */}
      {filteredRecords.length === 0 ? (
        <div className="rounded-2xl border border-dashed border-slate-300 bg-white p-10 text-center dark:border-slate-800 dark:bg-slate-900">
          <History className="mx-auto h-10 w-10 text-slate-400" />
          <h3 className="mt-3 text-sm font-semibold text-slate-900 dark:text-white">
            {records.length === 0 ? 'No conversion history yet' : 'No matching records found'}
          </h3>
          <p className="mt-1 text-xs text-slate-500 dark:text-slate-400 max-w-xs mx-auto">
            {records.length === 0
              ? 'Files you convert are logged here automatically. History is stored locally on this device only.'
              : 'Try adjusting your search terms or format filters.'}
          </p>
        </div>
      ) : (
        <div className="space-y-3">
          {filteredRecords.map((rec) => {
            const visual = getFormatVisual(rec.targetFormat);
            const isPendingDelete = pendingDeleteId === rec.id;

            return (
              <div
                key={rec.id}
                className={`card-lift rounded-2xl border bg-white dark:bg-slate-900 shadow-sm transition-all ${
                  isPendingDelete
                    ? 'border-rose-300 dark:border-rose-800 bg-rose-50/30 dark:bg-rose-950/20'
                    : 'border-slate-200/80 dark:border-slate-800/80'
                }`}
              >
                {/* Card content */}
                <div className="flex items-start gap-3 p-4">
                  {/* Format icon */}
                  <div
                    className={`flex h-12 w-12 shrink-0 flex-col items-center justify-center rounded-2xl border ${visual.containerClass} ${
                      isPendingDelete ? 'opacity-50' : ''
                    }`}
                  >
                    {visual.icon}
                  </div>

                  {/* File info */}
                  <div className={`min-w-0 flex-1 ${isPendingDelete ? 'opacity-60' : ''}`}>
                    <div className="flex flex-wrap items-center gap-1.5">
                      <span className="truncate text-sm font-bold text-slate-900 dark:text-white max-w-[200px]" title={rec.convertedName}>
                        {rec.convertedName}
                      </span>
                      <span className={`rounded-lg px-1.5 py-0.5 text-[10px] font-black uppercase ${visual.badgeClass}`}>
                        {rec.sourceFormat.toUpperCase()} → {visual.shortLabel}
                      </span>
                    </div>

                    <div className="mt-1 flex flex-wrap items-center gap-x-2 gap-y-0.5 text-xs text-slate-500 dark:text-slate-400">
                      <span>{formatBytes(rec.convertedSize)}</span>
                      <span>·</span>
                      <span className="flex items-center gap-1">
                        <Calendar className="h-3 w-3" />
                        {new Date(rec.timestamp).toLocaleDateString([], {
                          month: 'short',
                          day: 'numeric',
                          hour: '2-digit',
                          minute: '2-digit',
                        })}
                      </span>
                      {rec.fidelityScore !== undefined && (
                        <span className="inline-flex items-center gap-0.5 text-emerald-600 dark:text-emerald-400 font-semibold">
                          <Sparkles className="h-3 w-3" />
                          {rec.fidelityScore}%
                        </span>
                      )}
                      {rec.cached && (
                        <span className="inline-flex items-center gap-0.5 text-amber-600 dark:text-amber-400 font-semibold">
                          <Zap className="h-3 w-3" />
                          Cached
                        </span>
                      )}
                      {rec.ocrExtracted && (
                        <span className="inline-flex items-center gap-0.5 text-purple-600 dark:text-purple-400 font-semibold">
                          <ScanText className="h-3 w-3" />
                          OCR
                        </span>
                      )}
                    </div>
                  </div>
                </div>

                {/* Action row — full width, touch-friendly */}
                <div className="flex items-center gap-2 border-t border-slate-100 dark:border-slate-800 px-3 pb-3 pt-2">
                  {isPendingDelete ? (
                    /* Delete confirmation */
                    <div className="flex items-center gap-2 w-full rounded-xl bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-800 px-3 py-2">
                      <AlertTriangle className="h-4 w-4 text-rose-500 shrink-0" />
                      <span className="text-xs font-semibold text-rose-700 dark:text-rose-300 flex-1">Remove this record?</span>
                      <button
                        onClick={() => handleDeleteConfirm(rec.id)}
                        className="flex items-center gap-1 rounded-xl bg-rose-600 px-3 py-1.5 text-xs font-bold text-white hover:bg-rose-700 active:scale-95 transition min-h-[36px]"
                      >
                        <Check className="h-3.5 w-3.5" />
                        Yes
                      </button>
                      <button
                        onClick={handleDeleteCancel}
                        className="flex items-center rounded-xl border border-slate-200 bg-white p-1.5 text-slate-500 hover:bg-slate-100 dark:border-slate-700 dark:bg-slate-800 dark:hover:bg-slate-700 transition min-h-[36px] min-w-[36px] justify-center"
                      >
                        <X className="h-3.5 w-3.5" />
                      </button>
                    </div>
                  ) : (
                    <>
                      <button
                        onClick={() => onPreviewRecord(rec)}
                        className="flex flex-1 items-center justify-center gap-1.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 px-3 py-2.5 text-xs font-bold text-slate-700 dark:text-slate-200 hover:bg-slate-50 dark:hover:bg-slate-700 transition min-h-[44px]"
                      >
                        <Eye className="h-4 w-4" />
                        Preview
                      </button>
                      <button
                        onClick={() => onDownloadRecord(rec)}
                        className="flex flex-1 items-center justify-center gap-1.5 rounded-xl bg-blue-600 px-3 py-2.5 text-xs font-bold text-white shadow-sm hover:bg-blue-700 active:scale-[0.98] transition min-h-[44px]"
                      >
                        <Download className="h-4 w-4" />
                        Download
                      </button>
                      <button
                        onClick={() => handleDeleteClick(rec.id)}
                        className="flex items-center justify-center rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 p-2.5 text-slate-400 hover:bg-rose-50 hover:text-rose-600 dark:hover:bg-rose-950/40 dark:hover:text-rose-400 transition min-h-[44px] min-w-[44px]"
                        title="Delete from history"
                      >
                        <Trash2 className="h-4 w-4" />
                      </button>
                    </>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};
