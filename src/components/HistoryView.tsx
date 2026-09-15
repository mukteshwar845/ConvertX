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
} from 'lucide-react';
import { HistoryRecord } from '../types';
import { getFormatVisual } from './ConversionCard';

interface HistoryViewProps {
  records: HistoryRecord[];
  onDownloadRecord: (record: HistoryRecord) => void;
  onPreviewRecord: (record: HistoryRecord) => void;
  onDeleteRecord: (id: string) => void;
  onClearHistory: () => void;
  onDownloadAllZip: () => void;
}

export const HistoryView: React.FC<HistoryViewProps> = ({
  records,
  onDownloadRecord,
  onPreviewRecord,
  onDeleteRecord,
  onClearHistory,
  onDownloadAllZip,
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedFormat, setSelectedFormat] = useState<string>('all');

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

  return (
    <div className="space-y-6">
      {/* Header & Overview Stats */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h2 className="text-xl font-bold tracking-tight text-slate-900 dark:text-white flex items-center gap-2">
            <History className="h-5 w-5 text-blue-600 dark:text-blue-400" />
            Conversion History & Downloads
          </h2>
          <p className="mt-1 text-xs text-slate-500 dark:text-slate-400">
            {records.length} document{records.length === 1 ? '' : 's'} converted • Total {formatBytes(totalBytes)}
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
            <button
              onClick={onClearHistory}
              className="flex items-center gap-1.5 rounded-lg border border-slate-200 bg-white px-3 py-1.5 text-xs font-medium text-slate-600 hover:bg-rose-50 hover:text-rose-600 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-300 dark:hover:bg-rose-950/40 dark:hover:text-rose-400 transition"
            >
              <Trash2 className="h-3.5 w-3.5" />
              Clear All
            </button>
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
        <div className="rounded-2xl border border-dashed border-slate-300 bg-white p-12 text-center dark:border-slate-800 dark:bg-slate-900">
          <History className="mx-auto h-10 w-10 text-slate-400" />
          <h3 className="mt-3 text-sm font-semibold text-slate-900 dark:text-white">
            {records.length === 0 ? 'No conversion history yet' : 'No matching records found'}
          </h3>
          <p className="mt-1 text-xs text-slate-500 dark:text-slate-400">
            {records.length === 0
              ? 'Files you convert will automatically be logged here for quick downloads and previews.'
              : 'Try adjusting your search terms or format filters.'}
          </p>
        </div>
      ) : (
        <div className="space-y-3">
          {filteredRecords.map((rec) => {
            const visual = getFormatVisual(rec.targetFormat);
            return (
              <div
                key={rec.id}
                className={`flex flex-col gap-3 rounded-xl border border-slate-200 bg-white p-4 shadow-sm transition hover:shadow-md dark:border-slate-800 dark:bg-slate-900 sm:flex-row sm:items-center sm:justify-between ${visual.borderClass}`}
              >
                {/* Left File details */}
                <div className="flex items-start gap-3 min-w-0">
                  <div
                    className={`flex h-11 w-11 shrink-0 flex-col items-center justify-center rounded-xl border ${visual.containerClass}`}
                  >
                    {visual.icon}
                  </div>

                  <div className="min-w-0 flex-1">
                    <div className="flex flex-wrap items-center gap-2">
                      <span className="truncate text-sm font-bold text-slate-900 dark:text-white" title={rec.convertedName}>
                        {rec.convertedName}
                      </span>
                      <span className={`rounded px-1.5 py-0.5 text-[10px] font-black uppercase ${visual.badgeClass}`}>
                        {visual.shortLabel}
                      </span>
                      {rec.cached && (
                        <span className="inline-flex items-center gap-1 rounded bg-amber-50 px-1.5 py-0.5 text-[10px] font-bold text-amber-700 dark:bg-amber-950/50 dark:text-amber-300 border border-amber-200/80">
                          <Zap className="h-3 w-3 text-amber-500" />
                          Cached
                        </span>
                      )}
                      {rec.fidelityScore !== undefined && (
                        <span className="inline-flex items-center gap-1 rounded bg-emerald-50 px-1.5 py-0.5 text-[10px] font-bold text-emerald-700 dark:bg-emerald-950/50 dark:text-emerald-300 border border-emerald-200/80">
                          <Sparkles className="h-3 w-3 text-emerald-500" />
                          {rec.fidelityScore}% Fidelity
                        </span>
                      )}
                    </div>

                    <div className="mt-1 flex flex-wrap items-center gap-2 text-xs text-slate-500 dark:text-slate-400">
                      <span>From: {rec.originalName}</span>
                      <span>•</span>
                      <span>{formatBytes(rec.convertedSize)}</span>
                      <span>•</span>
                      <span className="flex items-center gap-1">
                        <Calendar className="h-3 w-3" />
                        {new Date(rec.timestamp).toLocaleDateString([], {
                          month: 'short',
                          day: 'numeric',
                          hour: '2-digit',
                          minute: '2-digit',
                        })}
                      </span>

                      {rec.ocrExtracted && (
                        <span className="inline-flex items-center gap-1 text-[10px] font-semibold text-purple-600 dark:text-purple-400">
                          <ScanText className="h-3 w-3" />
                          OCR Extracted
                        </span>
                      )}
                    </div>
                  </div>
                </div>

              {/* Action buttons */}
              <div className="flex items-center justify-end gap-2 shrink-0">
                <button
                  onClick={() => onPreviewRecord(rec)}
                  className="flex items-center gap-1 rounded-lg border border-slate-200 px-2.5 py-1.5 text-xs font-medium text-slate-700 hover:bg-slate-50 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-200 dark:hover:bg-slate-700 transition"
                  title="Preview"
                >
                  <Eye className="h-3.5 w-3.5" />
                  <span className="hidden sm:inline">Preview</span>
                </button>

                <button
                  onClick={() => onDownloadRecord(rec)}
                  className="flex items-center gap-1.5 rounded-lg bg-blue-600 px-3 py-1.5 text-xs font-bold text-white shadow-sm hover:bg-blue-700 transition"
                  title="Download File"
                >
                  <Download className="h-3.5 w-3.5" />
                  <span>Download</span>
                </button>

                <button
                  onClick={() => onDeleteRecord(rec.id)}
                  className="rounded-lg p-1.5 text-slate-400 hover:bg-rose-50 hover:text-rose-600 dark:hover:bg-rose-950/40 dark:hover:text-rose-400 transition"
                  title="Delete from history"
                >
                  <Trash2 className="h-4 w-4" />
                </button>
              </div>
            </div>
            );
          })}
        </div>
      )}
    </div>
  );
};
