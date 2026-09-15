import React, { useState, useEffect, useCallback } from 'react';
import JSZip from 'jszip';
import {
  ShieldCheck,
  Sparkles,
  Columns2,
} from 'lucide-react';
import {
  ConversionItem,
  HistoryRecord,
  TargetFormat,
  SupportedFormat,
} from './types';
import { Navbar, NavTab } from './components/Navbar';
import { BatchUploader } from './components/BatchUploader';
import { ConversionCard } from './components/ConversionCard';
import { ImageConverterView } from './components/ImageConverterView';
import { HistoryView } from './components/HistoryView';
import { FileCompareView } from './components/FileCompareView';
import { ZipCreatorView } from './components/ZipCreatorView';
import { PreviewModal } from './components/PreviewModal';
import { PWAInstallModal } from './components/PWAInstallModal';
import { PrivacyPolicyModal } from './components/PrivacyPolicyModal';
import { Footer } from './components/Footer';
import { ToastContainer, ToastMessage } from './components/Toast';
import {
  detectFormat,
  convertDocument,
  getAvailableTargets,
} from './utils/conversionEngine';
import { clearConversionCache } from './utils/universalConverter';

export default function App() {
  // Theme state
  const [isDark, setIsDark] = useState<boolean>(() => {
    const saved = localStorage.getItem('docuconvert_theme');
    if (saved) return saved === 'dark';
    return window.matchMedia('(prefers-color-scheme: dark)').matches;
  });

  // Active navigation tab
  const [activeTab, setActiveTab] = useState<NavTab>('documents');

  const [globalTarget, setGlobalTarget] = useState<TargetFormat>('pdf');
  const [ocrEnabled, setOcrEnabled] = useState<boolean>(true);

  // File queues & History
  const [queue, setQueue] = useState<ConversionItem[]>([]);
  const [history, setHistory] = useState<HistoryRecord[]>(() => {
    try {
      const saved = localStorage.getItem('docuconvert_history');
      return saved ? JSON.parse(saved) : [];
    } catch {
      return [];
    }
  });

  // Modals
  const [previewItem, setPreviewItem] = useState<ConversionItem | HistoryRecord | null>(null);
  const [previewMode, setPreviewMode] = useState<'preview' | 'compare' | 'fidelity'>('preview');
  const [showInstallModal, setShowInstallModal] = useState<boolean>(false);
  const [showPrivacyModal, setShowPrivacyModal] = useState<boolean>(false);
  const [deferredPrompt, setDeferredPrompt] = useState<any>(null);
  const [isIOS, setIsIOS] = useState<boolean>(false);
  const [isConvertingBatch, setIsConvertingBatch] = useState<boolean>(false);

  // In-app non-blocking Toast Notifications (iframe resilient)
  const [toasts, setToasts] = useState<ToastMessage[]>([]);

  const addToast = (
    type: 'success' | 'error' | 'warning' | 'info',
    message: string,
    title?: string
  ) => {
    const id = `toast_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`;
    setToasts((prev) => [...prev, { id, type, message, title }]);
  };

  const removeToast = (id: string) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  };

  const handleOpenPreview = (
    item: ConversionItem | HistoryRecord,
    mode: 'preview' | 'compare' | 'fidelity' = 'preview'
  ) => {
    setPreviewItem(item);
    setPreviewMode(mode);
  };

  // Sync dark class on documentElement
  useEffect(() => {
    if (isDark) {
      document.documentElement.classList.add('dark');
      localStorage.setItem('docuconvert_theme', 'dark');
    } else {
      document.documentElement.classList.remove('dark');
      localStorage.setItem('docuconvert_theme', 'light');
    }
  }, [isDark]);

  useEffect(() => {
    try {
      localStorage.setItem('docuconvert_history', JSON.stringify(history));
    } catch (e) {
      console.warn('History storage exceeded limit', e);
    }
  }, [history]);

  // PWA beforeinstallprompt handler
  useEffect(() => {
    const isIOSDevice = /iphone|ipad|ipod/.test(navigator.userAgent.toLowerCase());
    setIsIOS(isIOSDevice);

    const handleBeforeInstallPrompt = (e: Event) => {
      e.preventDefault();
      setDeferredPrompt(e);
    };

    window.addEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
    return () => {
      window.removeEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
    };
  }, []);

  // Add files to batch queue
  const handleFilesAdded = (files: File[]) => {
    const validFiles: File[] = [];
    let emptyCount = 0;

    for (const f of files) {
      if (f.size === 0) {
        emptyCount++;
      } else {
        validFiles.push(f);
      }
    }

    if (emptyCount > 0) {
      addToast(
        'warning',
        `${emptyCount} empty file${emptyCount > 1 ? 's were' : ' was'} skipped because the content is 0 bytes.`,
        'Zero-Byte Files Skipped'
      );
    }

    if (validFiles.length === 0) return;

    const newItems: ConversionItem[] = validFiles.map((file) => {
      const source = detectFormat(file);
      const targets = getAvailableTargets(source, ocrEnabled);
      const target = targets.includes(globalTarget) ? globalTarget : targets[0] || 'pdf';

      return {
        id: `conv_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`,
        file,
        originalName: file.name,
        originalSize: file.size,
        sourceFormat: source,
        targetFormat: target,
        status: 'queued',
        progress: 0,
        timestamp: Date.now(),
        ocrEnabled,
      };
    });

    setQueue((prev) => [...prev, ...newItems]);
    setActiveTab('converter');
    addToast(
      'info',
      `Queued ${newItems.length} file${newItems.length > 1 ? 's' : ''} for conversion.`,
      'Batch Ready'
    );
  };

  // Toggle OCR across current queue and future uploads
  const handleOcrToggle = (enabled: boolean) => {
    setOcrEnabled(enabled);
    setQueue((prev) =>
      prev.map((item) => {
        if (item.status === 'queued') {
          const targets = getAvailableTargets(item.sourceFormat, enabled);
          const target = targets.includes(item.targetFormat) ? item.targetFormat : targets[0] || 'pdf';
          return { ...item, ocrEnabled: enabled, targetFormat: target };
        }
        return item;
      })
    );
  };

  // Change target for a specific file
  const handleTargetChange = (id: string, target: TargetFormat) => {
    setQueue((prev) =>
      prev.map((item) => (item.id === id ? { ...item, targetFormat: target } : item))
    );
  };

  // Convert Single Item
  const convertSingle = async (id: string) => {
    const targetItem = queue.find((i) => i.id === id);
    if (!targetItem) return;

    setQueue((prev) =>
      prev.map((i) => (i.id === id ? { ...i, status: 'converting', progress: 10 } : i))
    );

    const startTime = Date.now();
    try {
      const itemOcr = targetItem.ocrEnabled ?? ocrEnabled;
      const result = await convertDocument(
        targetItem.file,
        targetItem.targetFormat,
        {
          ocrEnabled: itemOcr,
          onProgress: (prog, text) => {
            setQueue((prev) =>
              prev.map((i) => (i.id === id ? { ...i, progress: prog } : i))
            );
          },
        }
      );

      const durationMs = Date.now() - startTime;
      const convertedUrl = URL.createObjectURL(result.blob);

      // Update queue item
      setQueue((prev) =>
        prev.map((i) =>
          i.id === id
            ? {
                ...i,
                status: 'completed',
                progress: 100,
                convertedBlob: result.blob,
                convertedUrl,
                convertedSize: result.size,
                convertedName: result.name,
                durationMs,
                ocrExtracted: result.ocrUsed,
                extractedPreview: result.preview,
                fidelity: result.fidelity,
                sourceModel: result.sourceModel,
                cached: result.cached,
              }
            : i
        )
      );

      // Add to History
      const histRecord: HistoryRecord = {
        id: targetItem.id,
        originalName: targetItem.originalName,
        originalSize: targetItem.originalSize,
        convertedName: result.name,
        convertedSize: result.size,
        sourceFormat: targetItem.sourceFormat,
        targetFormat: targetItem.targetFormat,
        timestamp: Date.now(),
        durationMs,
        ocrExtracted: result.ocrUsed,
        cached: result.cached,
        fidelityScore: result.fidelity?.overallScore,
        previewSnippet: result.preview.type === 'text' ? result.preview.content.slice(0, 300) : undefined,
      };
      setHistory((prev) => [histRecord, ...prev]);
    } catch (err: any) {
      console.error('Conversion error:', err);
      setQueue((prev) =>
        prev.map((i) =>
          i.id === id
            ? { ...i, status: 'error', progress: 0, errorMessage: err.message || 'Conversion failed' }
            : i
        )
      );
    }
  };

  // Convert All items in Queue
  const handleConvertAll = async () => {
    setIsConvertingBatch(true);
    const uncompleted = queue.filter((i) => i.status !== 'completed');
    for (const item of uncompleted) {
      await convertSingle(item.id);
    }
    setIsConvertingBatch(false);
  };

  // Download Single File
  const triggerDownload = (blob: Blob, fileName: string) => {
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = fileName;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    setTimeout(() => URL.revokeObjectURL(url), 2000);
  };

  const handleDownloadItem = (item: ConversionItem) => {
    if (item.convertedBlob && item.convertedName) {
      triggerDownload(item.convertedBlob, item.convertedName);
    }
  };

  // Batch Download as ZIP
  const handleDownloadAllZip = async () => {
    const completedItems = queue.filter((i) => i.status === 'completed' && i.convertedBlob);
    if (completedItems.length === 0) return;

    const zip = new JSZip();
    for (const item of completedItems) {
      if (item.convertedBlob && item.convertedName) {
        zip.file(item.convertedName, item.convertedBlob);
      }
    }

    const zipBlob = await zip.generateAsync({ type: 'blob' });
    triggerDownload(zipBlob, `ConvertX_Batch_${Date.now()}.zip`);
    addToast('success', `Created ZIP archive with ${completedItems.length} files.`, 'Batch Download');
  };

  // Download record from history
  const handleDownloadRecord = (record: HistoryRecord) => {
    const queueMatch = queue.find((q) => q.id === record.id && q.convertedBlob);
    if (queueMatch && queueMatch.convertedBlob) {
      triggerDownload(queueMatch.convertedBlob, record.convertedName);
      return;
    }

    addToast(
      'info',
      'The converted file memory was released. You can re-convert the file anytime from the converter tab.',
      'Memory Released'
    );
  };

  // Remove from queue
  const handleRemoveQueueItem = (id: string) => {
    const item = queue.find((i) => i.id === id);
    if (item?.convertedUrl) {
      URL.revokeObjectURL(item.convertedUrl);
    }
    setQueue((prev) => prev.filter((i) => i.id !== id));
  };

  const handleClearQueue = () => {
    queue.forEach((item) => {
      if (item.convertedUrl) {
        URL.revokeObjectURL(item.convertedUrl);
      }
    });
    setQueue([]);
    clearConversionCache();
    addToast('info', 'Queue cleared and memory released.', 'Queue Reset');
  };

  const handleDeleteHistoryRecord = (id: string) => {
    setHistory((prev) => prev.filter((h) => h.id !== id));
  };

  const handleClearHistory = () => {
    if (window.confirm('Clear all conversion history?')) {
      setHistory([]);
      localStorage.removeItem('docuconvert_history');
    }
  };

  // Native PWA install
  const handleNativeInstall = async () => {
    if (!deferredPrompt) return;
    deferredPrompt.prompt();
    const choice = await deferredPrompt.userChoice;
    if (choice.outcome === 'accepted') {
      setDeferredPrompt(null);
    }
  };

  const completedCount = queue.filter((i) => i.status === 'completed').length;

  return (
    <div className="flex min-h-screen flex-col bg-slate-50 text-slate-900 dark:bg-slate-950 dark:text-slate-100 transition-colors">
      {/* Top Navigation */}
      <Navbar
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        isDark={isDark}
        setIsDark={setIsDark}
        historyCount={history.length}
        isInstallable={!!deferredPrompt || isIOS}
        onInstallClick={() => setShowInstallModal(true)}
      />

      {/* Main Content Area */}
      <main className="mx-auto flex-1 w-full max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
        {/* Document Converter View */}
        {activeTab === 'documents' && (
          <div className="space-y-6">
            {/* Hero Header */}
            <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
              <div>
                <div className="flex items-center gap-2">
                  <h1 className="text-2xl font-extrabold tracking-tight text-slate-900 dark:text-white sm:text-3xl">
                    Document & File Converter
                  </h1>
                </div>
                <p className="mt-1 text-xs sm:text-sm text-slate-600 dark:text-slate-400 max-w-2xl">
                  Convert Word, PDF, Excel, PowerPoint, Text, and Data files instantly in your browser with 100% layout fidelity.
                </p>
              </div>

              {/* Status Badges */}
              <div className="flex flex-wrap items-center gap-2">
                <span className="inline-flex items-center gap-1.5 rounded-xl bg-emerald-50 px-3 py-1.5 text-xs font-bold text-emerald-700 dark:bg-emerald-950/60 dark:text-emerald-300 border border-emerald-200/60 dark:border-emerald-800/60">
                  <ShieldCheck className="h-4 w-4 text-emerald-500" />
                  <span>100% Private (No Uploads)</span>
                </span>
                <span className="hidden sm:inline-flex items-center gap-1.5 rounded-xl bg-blue-50 px-3 py-1.5 text-xs font-bold text-blue-700 dark:bg-blue-950/60 dark:text-blue-300 border border-blue-200/60 dark:border-blue-800/60">
                  <Sparkles className="h-4 w-4 text-blue-500" />
                  <span>High Fidelity Engine</span>
                </span>
              </div>
            </div>

            {/* Batch Uploader & Controls */}
            <BatchUploader
              onFilesAdded={handleFilesAdded}
              queueLength={queue.length}
              completedCount={completedCount}
              isConvertingBatch={isConvertingBatch}
              onConvertAll={handleConvertAll}
              onDownloadZip={handleDownloadAllZip}
              onClearAll={handleClearQueue}
              globalTarget={globalTarget}
              onGlobalTargetChange={(tgt) => {
                setGlobalTarget(tgt);
                setQueue((prev) =>
                  prev.map((i) => {
                    const targets = getAvailableTargets(i.sourceFormat, ocrEnabled);
                    return targets.includes(tgt) ? { ...i, targetFormat: tgt } : i;
                  })
                );
              }}
              ocrEnabled={ocrEnabled}
              onOcrToggle={handleOcrToggle}
            />

            {/* Queue Cards */}
            {queue.length > 0 && (
              <div className="space-y-3 pt-2">
                <div className="flex items-center justify-between text-xs font-bold text-slate-700 dark:text-slate-300">
                  <span>Selected Files ({queue.length})</span>
                  <span>{completedCount} of {queue.length} ready</span>
                </div>

                <div className="space-y-3">
                  {queue.map((item) => (
                    <ConversionCard
                      key={item.id}
                      item={item}
                      onTargetChange={handleTargetChange}
                      onConvertSingle={convertSingle}
                      onDownload={handleDownloadItem}
                      onPreview={(itm) => handleOpenPreview(itm, 'preview')}
                      onCompare={(itm) => handleOpenPreview(itm, 'compare')}
                      onRemove={handleRemoveQueueItem}
                    />
                  ))}
                </div>
              </div>
            )}

            {/* Feature Highlights Bento */}
            <div className="mt-10 grid grid-cols-1 md:grid-cols-3 gap-4 pt-8 border-t border-slate-200/80 dark:border-slate-800/80">
              <div className="rounded-2xl border border-slate-200/80 bg-white/70 p-5 dark:border-slate-800/80 dark:bg-slate-900/60 shadow-2xs backdrop-blur-sm">
                <div className="flex items-center gap-2.5 text-blue-600 dark:text-blue-400 font-bold text-xs uppercase tracking-wider">
                  <Sparkles className="h-4 w-4" />
                  <span>High Quality & Formatting</span>
                </div>
                <p className="mt-2 text-xs sm:text-sm text-slate-600 dark:text-slate-400 leading-relaxed">
                  Preserves typography, lists, headings, tables, and colors so your output document looks clean and professional.
                </p>
              </div>

              <div className="rounded-2xl border border-slate-200/80 bg-white/70 p-5 dark:border-slate-800/80 dark:bg-slate-900/60 shadow-2xs backdrop-blur-sm">
                <div className="flex items-center gap-2.5 text-emerald-600 dark:text-emerald-400 font-bold text-xs uppercase tracking-wider">
                  <ShieldCheck className="h-4 w-4" />
                  <span>100% Client-Side Privacy</span>
                </div>
                <p className="mt-2 text-xs sm:text-sm text-slate-600 dark:text-slate-400 leading-relaxed">
                  Files are processed directly inside your browser. No third-party servers see or store your private documents.
                </p>
              </div>

              <div className="rounded-2xl border border-slate-200/80 bg-white/70 p-5 dark:border-slate-800/80 dark:bg-slate-900/60 shadow-2xs backdrop-blur-sm">
                <div className="flex items-center gap-2.5 text-purple-600 dark:text-purple-400 font-bold text-xs uppercase tracking-wider">
                  <Columns2 className="h-4 w-4" />
                  <span>Compare & ZIP Archiver</span>
                </div>
                <p className="mt-2 text-xs sm:text-sm text-slate-600 dark:text-slate-400 leading-relaxed">
                  Compare two documents side-by-side with similarity scoring, or package files and entire folders into a single ZIP archive.
                </p>
              </div>
            </div>
          </div>
        )}

        {/* Image Converter View */}
        {activeTab === 'images' && (
          <ImageConverterView
            onAddToHistory={(rec) => setHistory((prev) => [rec, ...prev])}
            addToast={addToast}
          />
        )}

        {/* Compare Files View */}
        {activeTab === 'compare' && <FileCompareView />}

        {/* Zip Creator View */}
        {activeTab === 'zip' && <ZipCreatorView />}

        {/* History View */}
        {activeTab === 'history' && (
          <HistoryView
            records={history}
            onDownloadRecord={handleDownloadRecord}
            onPreviewRecord={(rec) => setPreviewItem(rec)}
            onDeleteRecord={handleDeleteHistoryRecord}
            onClearHistory={handleClearHistory}
            onDownloadAllZip={handleDownloadAllZip}
          />
        )}
      </main>

      {/* Preview Modal */}
      <PreviewModal
        item={previewItem}
        initialMode={previewMode}
        onClose={() => setPreviewItem(null)}
        onDownload={(itm) => {
          if ('convertedBlob' in itm && itm.convertedBlob) {
            handleDownloadItem(itm);
          } else {
            handleDownloadRecord(itm);
          }
        }}
      />

      {/* PWA Install Modal */}
      <PWAInstallModal
        isOpen={showInstallModal}
        onClose={() => setShowInstallModal(false)}
        isIOS={isIOS}
        onNativeInstall={handleNativeInstall}
        canNativeInstall={!!deferredPrompt}
      />

      {/* Toast Notification Container */}
      <ToastContainer toasts={toasts} onDismiss={removeToast} />

      {/* Professional Multi-Column Footer */}
      <Footer
        onNavigateTab={setActiveTab}
        onOpenPrivacyModal={() => setShowPrivacyModal(true)}
      />

      {/* Privacy Policy & Legal Terms Modal */}
      <PrivacyPolicyModal
        isOpen={showPrivacyModal}
        onClose={() => setShowPrivacyModal(false)}
      />
    </div>
  );
}
