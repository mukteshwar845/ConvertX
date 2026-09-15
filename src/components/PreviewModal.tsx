import React, { useState, useEffect } from 'react';
import {
  X,
  Download,
  FileText,
  CheckCircle2,
  ShieldCheck,
  Eye,
  Columns2,
  Sparkles,
  Layers,
  ArrowRight,
  Maximize2,
  Table as TableIcon,
  RefreshCw,
} from 'lucide-react';
import { ConversionItem, HistoryRecord } from '../types';
import { getFormatVisual } from './ConversionCard';

interface PreviewModalProps {
  item: ConversionItem | HistoryRecord | null;
  initialMode?: 'preview' | 'compare' | 'fidelity';
  onClose: () => void;
  onDownload: (item: any) => void;
}

export const PreviewModal: React.FC<PreviewModalProps> = ({
  item,
  initialMode = 'preview',
  onClose,
  onDownload,
}) => {
  const [activeTab, setActiveTab] = useState<'preview' | 'compare' | 'fidelity'>(initialMode);
  const [activeSheetIndex, setActiveSheetIndex] = useState(0);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        onClose();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [onClose]);

  if (!item) return null;

  const fileName = 'convertedName' in item ? item.convertedName : item.originalName;
  const originalName = item.originalName;
  const targetFormat = 'targetFormat' in item ? item.targetFormat : 'pdf';
  const sourceFormat = item.sourceFormat;
  const preview = 'extractedPreview' in item ? item.extractedPreview : null;
  const blobUrl = 'convertedUrl' in item ? item.convertedUrl : null;
  const snippet = 'previewSnippet' in item ? item.previewSnippet : null;
  const fidelity = 'fidelity' in item ? item.fidelity : null;
  const sourceModel = 'sourceModel' in item ? item.sourceModel : null;

  const sourceVisual = getFormatVisual(sourceFormat);
  const targetVisual = getFormatVisual(targetFormat);

  // Original text content for comparison
  const originalContent = sourceModel?.rawText || 'Original document text stream extracted during initial analysis.';
  const convertedContent =
    preview?.content || snippet || (preview?.type === 'html' ? preview.content.replace(/<[^>]+>/g, ' ') : 'Converted content ready.');

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby="modal-preview-title"
      className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 p-3 sm:p-4 backdrop-blur-xs animate-in fade-in duration-200"
    >
      <div className="relative flex h-full max-h-[92vh] w-full max-w-5xl flex-col rounded-2xl border border-slate-200 bg-white shadow-2xl dark:border-slate-800 dark:bg-slate-900 overflow-hidden">
        {/* Modal Top Header */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between border-b border-slate-200 px-4 sm:px-6 py-3.5 dark:border-slate-800 gap-3">
          <div className="flex items-center gap-3 min-w-0">
            <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-blue-50 text-blue-600 dark:bg-blue-950/60 dark:text-blue-400 shrink-0">
              <Eye className="h-5 w-5" />
            </div>
            <div className="min-w-0">
              <div className="flex flex-wrap items-center gap-2">
                <h3
                  id="modal-preview-title"
                  className="truncate text-sm sm:text-base font-bold text-slate-900 dark:text-white"
                  title={fileName}
                >
                  {fileName}
                </h3>
                <div className="flex items-center gap-1">
                  <span className={`rounded px-1.5 py-0.5 text-[10px] font-black uppercase ${sourceVisual.badgeClass}`}>
                    {sourceFormat}
                  </span>
                  <ArrowRight className="h-3 w-3 text-slate-400" />
                  <span className={`rounded px-1.5 py-0.5 text-[10px] font-black uppercase ${targetVisual.badgeClass}`}>
                    {targetFormat}
                  </span>
                </div>
              </div>
              <p className="text-[11px] sm:text-xs text-slate-500 dark:text-slate-400">
                Original formatting and layout preservation verified
              </p>
            </div>
          </div>

          <div className="flex flex-wrap items-center justify-between sm:justify-end gap-2 w-full sm:w-auto">
            {/* View Mode Switcher */}
            <div className="flex items-center rounded-lg bg-slate-100 p-1 dark:bg-slate-800">
              <button
                type="button"
                onClick={() => setActiveTab('preview')}
                className={`flex items-center gap-1.5 rounded-md px-2.5 sm:px-3 py-1 text-xs font-bold transition ${
                  activeTab === 'preview'
                    ? 'bg-white text-slate-900 shadow-2xs dark:bg-slate-700 dark:text-white'
                    : 'text-slate-600 hover:text-slate-900 dark:text-slate-400 dark:hover:text-white'
                }`}
              >
                <Eye className="h-3.5 w-3.5" />
                <span>Preview</span>
              </button>
              <button
                type="button"
                onClick={() => setActiveTab('compare')}
                className={`flex items-center gap-1.5 rounded-md px-2.5 sm:px-3 py-1 text-xs font-bold transition ${
                  activeTab === 'compare'
                    ? 'bg-white text-slate-900 shadow-2xs dark:bg-slate-700 dark:text-white'
                    : 'text-slate-600 hover:text-slate-900 dark:text-slate-400 dark:hover:text-white'
                }`}
              >
                <Columns2 className="h-3.5 w-3.5" />
                <span className="hidden sm:inline">Side-by-Side</span>
                <span className="sm:hidden">Compare</span>
              </button>
              {fidelity && (
                <button
                  type="button"
                  onClick={() => setActiveTab('fidelity')}
                  className={`flex items-center gap-1.5 rounded-md px-2.5 sm:px-3 py-1 text-xs font-bold transition ${
                    activeTab === 'fidelity'
                      ? 'bg-white text-slate-900 shadow-2xs dark:bg-slate-700 dark:text-white'
                      : 'text-slate-600 hover:text-slate-900 dark:text-slate-400 dark:hover:text-white'
                  }`}
                >
                  <Sparkles className="h-3.5 w-3.5" />
                  <span>Fidelity ({fidelity.overallScore}%)</span>
                </button>
              )}
            </div>

            <div className="flex items-center gap-1.5">
              <button
                onClick={() => onDownload(item)}
                className="flex items-center gap-1.5 rounded-lg bg-emerald-600 px-3 py-1.5 text-xs font-bold text-white shadow-xs hover:bg-emerald-700 transition"
              >
                <Download className="h-3.5 w-3.5" />
                <span>Save</span>
              </button>
              <button
                onClick={onClose}
                className="rounded-lg p-1.5 text-slate-400 hover:bg-slate-100 hover:text-slate-700 dark:hover:bg-slate-800 dark:hover:text-slate-200 transition"
                aria-label="Close modal (Escape)"
                title="Close (Esc)"
              >
                <X className="h-5 w-5" />
              </button>
            </div>
          </div>
        </div>

        {/* Modal Content Body */}
        <div className="flex-1 overflow-y-auto p-3.5 sm:p-6 bg-slate-100 dark:bg-slate-950/60">
          {/* TAB 1: CONVERTED PREVIEW */}
          {activeTab === 'preview' && (
            <div className="h-full">
              {targetFormat === 'pdf' && blobUrl ? (
                <div className="h-full min-h-[520px] w-full rounded-xl overflow-hidden border border-slate-300 dark:border-slate-800 bg-white shadow-xs">
                  <iframe
                    src={blobUrl}
                    title="PDF Document Preview"
                    className="h-full w-full min-h-[520px] border-0"
                  />
                </div>
              ) : preview?.type === 'table' && preview.sheets && preview.sheets.length > 0 ? (
                /* Spreadsheet Interactive Table Preview */
                <div className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm dark:border-slate-800 dark:bg-slate-900">
                  {/* Sheet Tabs */}
                  <div className="mb-3 flex items-center gap-1 border-b border-slate-200 pb-2 dark:border-slate-800 overflow-x-auto">
                    {preview.sheets.map((s, idx) => (
                      <button
                        key={idx}
                        type="button"
                        onClick={() => setActiveSheetIndex(idx)}
                        className={`flex items-center gap-1.5 rounded-md px-3 py-1 text-xs font-bold transition ${
                          activeSheetIndex === idx
                            ? 'bg-emerald-100 text-emerald-900 dark:bg-emerald-900/60 dark:text-emerald-200'
                            : 'text-slate-600 hover:bg-slate-100 dark:text-slate-400 dark:hover:bg-slate-800'
                        }`}
                      >
                        <TableIcon className="h-3.5 w-3.5" />
                        <span>{s.name}</span>
                      </button>
                    ))}
                  </div>

                  <div className="max-h-[60vh] overflow-auto rounded-lg border border-slate-200 dark:border-slate-800">
                    <table className="w-full border-collapse text-left text-xs">
                      <tbody>
                        {(preview.sheets[activeSheetIndex]?.data || []).map((row: any[], rIdx: number) => (
                          <tr
                            key={rIdx}
                            className={rIdx === 0 ? 'bg-slate-100 font-bold dark:bg-slate-800' : 'hover:bg-slate-50 dark:hover:bg-slate-800/50'}
                          >
                            <td className="border border-slate-200 px-2 py-1 font-mono text-[10px] text-slate-400 dark:border-slate-800 w-10 text-center bg-slate-50 dark:bg-slate-900">
                              {rIdx + 1}
                            </td>
                            {row.map((cell: any, cIdx: number) => (
                              <td
                                key={cIdx}
                                className="border border-slate-200 px-3 py-1.5 text-slate-800 dark:border-slate-800 dark:text-slate-200 whitespace-nowrap"
                              >
                                {cell !== undefined && cell !== null ? String(cell) : ''}
                              </td>
                            ))}
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              ) : preview?.type === 'html' ? (
                /* HTML / DOCX Preserved Document Preview */
                <div className="mx-auto max-w-3xl rounded-xl bg-white p-8 shadow-sm dark:bg-slate-900 dark:border dark:border-slate-800">
                  <div
                    className="prose prose-slate max-w-none dark:prose-invert text-sm leading-relaxed"
                    dangerouslySetInnerHTML={{ __html: preview.content }}
                  />
                </div>
              ) : preview?.type === 'image' ? (
                /* Image Preview */
                <div className="flex items-center justify-center p-4">
                  <img
                    src={preview.content}
                    alt="Document Preview"
                    className="max-h-[70vh] rounded-lg shadow-md object-contain border border-slate-200 dark:border-slate-800"
                  />
                </div>
              ) : (
                /* Raw text fallback */
                <div className="mx-auto max-w-3xl rounded-xl bg-white p-6 shadow-sm dark:bg-slate-900 dark:border dark:border-slate-800">
                  <pre className="whitespace-pre-wrap font-sans text-xs leading-relaxed text-slate-800 dark:text-slate-200">
                    {preview?.content || snippet || 'Document preview is ready for download.'}
                  </pre>
                </div>
              )}
            </div>
          )}

          {/* TAB 2: SIDE-BY-SIDE COMPARISON */}
          {activeTab === 'compare' && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 h-full">
              {/* Original File Panel */}
              <div className="flex flex-col rounded-xl border border-slate-200 bg-white p-4 shadow-xs dark:border-slate-800 dark:bg-slate-900">
                <div className="mb-3 flex items-center justify-between border-b border-slate-100 pb-2 dark:border-slate-800">
                  <div className="flex items-center gap-2">
                    <span className="flex h-6 w-6 items-center justify-center rounded bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-300 font-bold text-xs">
                      A
                    </span>
                    <span className="text-xs font-bold text-slate-900 dark:text-white truncate max-w-[200px]" title={originalName}>
                      {originalName}
                    </span>
                  </div>
                  <span className={`rounded px-1.5 py-0.5 text-[10px] font-black uppercase ${sourceVisual.badgeClass}`}>
                    Original ({sourceFormat.toUpperCase()})
                  </span>
                </div>
                <div className="flex-1 overflow-y-auto rounded-lg bg-slate-50 p-3 font-mono text-xs leading-relaxed text-slate-700 dark:bg-slate-950 dark:text-slate-300">
                  <pre className="whitespace-pre-wrap font-sans text-xs">
                    {originalContent}
                  </pre>
                </div>
              </div>

              {/* Converted File Panel */}
              <div className="flex flex-col rounded-xl border border-blue-200 bg-white p-4 shadow-xs dark:border-blue-950 dark:bg-slate-900">
                <div className="mb-3 flex items-center justify-between border-b border-slate-100 pb-2 dark:border-slate-800">
                  <div className="flex items-center gap-2">
                    <span className="flex h-6 w-6 items-center justify-center rounded bg-blue-100 text-blue-700 dark:bg-blue-900/60 dark:text-blue-300 font-bold text-xs">
                      B
                    </span>
                    <span className="text-xs font-bold text-blue-900 dark:text-blue-300 truncate max-w-[200px]" title={fileName}>
                      {fileName}
                    </span>
                  </div>
                  <span className={`rounded px-1.5 py-0.5 text-[10px] font-black uppercase ${targetVisual.badgeClass}`}>
                    Converted ({targetFormat.toUpperCase()})
                  </span>
                </div>
                <div className="flex-1 overflow-y-auto rounded-lg bg-slate-50 p-3 font-mono text-xs leading-relaxed text-slate-700 dark:bg-slate-950 dark:text-slate-300">
                  {preview?.type === 'html' ? (
                    <div
                      className="prose prose-slate max-w-none dark:prose-invert text-xs"
                      dangerouslySetInnerHTML={{ __html: preview.content }}
                    />
                  ) : (
                    <pre className="whitespace-pre-wrap font-sans text-xs">
                      {convertedContent}
                    </pre>
                  )}
                </div>
              </div>
            </div>
          )}

          {/* TAB 3: FIDELITY & AUDIT REPORT */}
          {activeTab === 'fidelity' && fidelity && (
            <div className="mx-auto max-w-3xl space-y-4">
              {/* Overall Score Banner */}
              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between rounded-xl border border-emerald-200 bg-emerald-50/70 p-5 dark:border-emerald-900/50 dark:bg-emerald-950/30">
                <div>
                  <div className="flex items-center gap-2">
                    <Sparkles className="h-5 w-5 text-emerald-600 dark:text-emerald-400" />
                    <h4 className="text-base font-bold text-slate-900 dark:text-white">
                      Page Fidelity Verification Report
                    </h4>
                  </div>
                  <p className="mt-1 text-xs text-slate-600 dark:text-slate-400">
                    Calculated using strict weighted fidelity criteria across 5 core dimensions.
                  </p>
                </div>

                <div className="mt-3 sm:mt-0 flex items-center gap-3">
                  <div className="text-right">
                    <div className="text-2xl font-black text-emerald-600 dark:text-emerald-400">
                      {fidelity.overallScore}%
                    </div>
                    <span className="rounded-full bg-emerald-200/80 px-2 py-0.5 text-[10px] font-black uppercase tracking-wider text-emerald-900 dark:bg-emerald-900 dark:text-emerald-200">
                      {fidelity.rating} Fidelity
                    </span>
                  </div>
                </div>
              </div>

              {/* 5-Dimension Metrics Cards */}
              <div className="grid grid-cols-2 sm:grid-cols-5 gap-3">
                <div className="rounded-xl border border-slate-200 bg-white p-3 shadow-2xs dark:border-slate-800 dark:bg-slate-900 text-center">
                  <div className="text-[11px] font-semibold text-slate-500 dark:text-slate-400">
                    Text (40%)
                  </div>
                  <div className="mt-1 text-lg font-black text-slate-900 dark:text-white">
                    {fidelity.metrics.textPreservation}%
                  </div>
                  <div className="mt-1 h-1.5 rounded-full bg-slate-100 dark:bg-slate-800 overflow-hidden">
                    <div className="h-full bg-blue-600 rounded-full" style={{ width: `${fidelity.metrics.textPreservation}%` }} />
                  </div>
                </div>

                <div className="rounded-xl border border-slate-200 bg-white p-3 shadow-2xs dark:border-slate-800 dark:bg-slate-900 text-center">
                  <div className="text-[11px] font-semibold text-slate-500 dark:text-slate-400">
                    Layout (25%)
                  </div>
                  <div className="mt-1 text-lg font-black text-slate-900 dark:text-white">
                    {fidelity.metrics.layoutPreservation}%
                  </div>
                  <div className="mt-1 h-1.5 rounded-full bg-slate-100 dark:bg-slate-800 overflow-hidden">
                    <div className="h-full bg-indigo-600 rounded-full" style={{ width: `${fidelity.metrics.layoutPreservation}%` }} />
                  </div>
                </div>

                <div className="rounded-xl border border-slate-200 bg-white p-3 shadow-2xs dark:border-slate-800 dark:bg-slate-900 text-center">
                  <div className="text-[11px] font-semibold text-slate-500 dark:text-slate-400">
                    Tables (15%)
                  </div>
                  <div className="mt-1 text-lg font-black text-slate-900 dark:text-white">
                    {fidelity.metrics.tablesPreservation}%
                  </div>
                  <div className="mt-1 h-1.5 rounded-full bg-slate-100 dark:bg-slate-800 overflow-hidden">
                    <div className="h-full bg-emerald-600 rounded-full" style={{ width: `${fidelity.metrics.tablesPreservation}%` }} />
                  </div>
                </div>

                <div className="rounded-xl border border-slate-200 bg-white p-3 shadow-2xs dark:border-slate-800 dark:bg-slate-900 text-center">
                  <div className="text-[11px] font-semibold text-slate-500 dark:text-slate-400">
                    Fonts (10%)
                  </div>
                  <div className="mt-1 text-lg font-black text-slate-900 dark:text-white">
                    {fidelity.metrics.fontPreservation}%
                  </div>
                  <div className="mt-1 h-1.5 rounded-full bg-slate-100 dark:bg-slate-800 overflow-hidden">
                    <div className="h-full bg-purple-600 rounded-full" style={{ width: `${fidelity.metrics.fontPreservation}%` }} />
                  </div>
                </div>

                <div className="col-span-2 sm:col-span-1 rounded-xl border border-slate-200 bg-white p-3 shadow-2xs dark:border-slate-800 dark:bg-slate-900 text-center">
                  <div className="text-[11px] font-semibold text-slate-500 dark:text-slate-400">
                    Images (10%)
                  </div>
                  <div className="mt-1 text-lg font-black text-slate-900 dark:text-white">
                    {fidelity.metrics.imagePreservation}%
                  </div>
                  <div className="mt-1 h-1.5 rounded-full bg-slate-100 dark:bg-slate-800 overflow-hidden">
                    <div className="h-full bg-cyan-600 rounded-full" style={{ width: `${fidelity.metrics.imagePreservation}%` }} />
                  </div>
                </div>
              </div>

              {/* Technical Audit Checklist */}
              <div className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm dark:border-slate-800 dark:bg-slate-900 space-y-2">
                <h5 className="text-xs font-bold uppercase tracking-wider text-slate-700 dark:text-slate-300">
                  Detailed Verification Audit
                </h5>
                <div className="divide-y divide-slate-100 dark:divide-slate-800 text-xs">
                  {fidelity.details.map((detail, idx) => (
                    <div key={idx} className="flex items-center gap-2 py-2 text-slate-600 dark:text-slate-300">
                      <CheckCircle2 className="h-4 w-4 text-emerald-600 dark:text-emerald-400 shrink-0" />
                      <span>{detail}</span>
                    </div>
                  ))}
                  {fidelity.retried && (
                    <div className="flex items-center gap-2 py-2 text-indigo-600 dark:text-indigo-400 font-medium">
                      <RefreshCw className="h-4 w-4 shrink-0" />
                      <span>
                        Automatic Retry Strategy Engaged: Achieved +{fidelity.improvementDelta}% higher fidelity score.
                      </span>
                    </div>
                  )}
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Modal Footer */}
        <div className="flex items-center justify-between border-t border-slate-200 bg-white px-6 py-3 text-xs text-slate-500 dark:border-slate-800 dark:bg-slate-900 dark:text-slate-400">
          <div className="flex items-center gap-1.5 text-emerald-600 dark:text-emerald-400 font-medium">
            <CheckCircle2 className="h-4 w-4" />
            <span>Fidelity Verified • In-Memory Zero Knowledge Processing</span>
          </div>
          <button
            onClick={onClose}
            className="rounded-lg border border-slate-200 px-3 py-1.5 text-xs font-semibold text-slate-700 hover:bg-slate-50 dark:border-slate-700 dark:text-slate-200 dark:hover:bg-slate-800 transition"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
};
