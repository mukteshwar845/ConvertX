import React, { useState, useEffect, useCallback } from 'react';
import JSZip from 'jszip';
import {
  FileText,
  ShieldCheck,
  Cloud,
  CheckCircle2,
  Sparkles,
  Lock,
  Layers,
  Archive,
  Download,
  Smartphone,
  Info,
} from 'lucide-react';
import {
  ConversionItem,
  HistoryRecord,
  SyncedCloudDocument,
  TargetFormat,
  SupportedFormat,
} from './types';
import { Navbar } from './components/Navbar';
import { BatchUploader } from './components/BatchUploader';
import { ConversionCard } from './components/ConversionCard';
import { HistoryView } from './components/HistoryView';
import { CloudVaultView } from './components/CloudVaultView';
import { SecurityView } from './components/SecurityView';
import { PreviewModal } from './components/PreviewModal';
import { PWAInstallModal } from './components/PWAInstallModal';
import {
  detectFormat,
  convertDocument,
  getAvailableTargets,
} from './utils/conversionEngine';
import {
  encryptBuffer,
  decryptBuffer,
  generateSyncCode,
  generateDefaultPassphrase,
  computeChecksum,
} from './utils/crypto';

export default function App() {
  // Theme state
  const [isDark, setIsDark] = useState<boolean>(() => {
    const saved = localStorage.getItem('docuconvert_theme');
    if (saved) return saved === 'dark';
    return window.matchMedia('(prefers-color-scheme: dark)').matches;
  });

  // Active navigation tab
  const [activeTab, setActiveTab] = useState<'converter' | 'history' | 'vault' | 'security'>('converter');

  // Encryption & Sync Settings
  const [passphrase, setPassphrase] = useState<string>(() => {
    const saved = localStorage.getItem('docuconvert_passphrase');
    if (saved) return saved;
    const fresh = generateDefaultPassphrase();
    localStorage.setItem('docuconvert_passphrase', fresh);
    return fresh;
  });

  const [roomCode, setRoomCode] = useState<string>(() => {
    const saved = localStorage.getItem('docuconvert_room');
    if (saved) return saved;
    const fresh = generateSyncCode();
    localStorage.setItem('docuconvert_room', fresh);
    return fresh;
  });

  const [deviceLabel, setDeviceLabel] = useState<string>(() => {
    const saved = localStorage.getItem('docuconvert_device');
    if (saved) return saved;
    const ua = navigator.userAgent;
    if (/iPhone|iPad|iPod/.test(ua)) return 'Apple iOS Device';
    if (/Android/.test(ua)) return 'Android Device';
    if (/Macintosh/.test(ua)) return 'macOS Device';
    if (/Windows/.test(ua)) return 'Windows PC';
    return 'Web Client';
  });

  const [autoSync, setAutoSync] = useState<boolean>(() => {
    const saved = localStorage.getItem('docuconvert_autosync');
    return saved !== null ? saved === 'true' : true;
  });

  const [autoEncrypt, setAutoEncrypt] = useState<boolean>(true);
  const [globalTarget, setGlobalTarget] = useState<TargetFormat>('pdf');
  const [ocrEnabled, setOcrEnabled] = useState<boolean>(() => {
    const saved = localStorage.getItem('docuconvert_ocr');
    return saved !== null ? saved === 'true' : true;
  });

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

  // Cloud synced docs
  const [cloudDocs, setCloudDocs] = useState<SyncedCloudDocument[]>([]);
  const [isCloudLoading, setIsCloudLoading] = useState<boolean>(false);

  // Modals
  const [previewItem, setPreviewItem] = useState<ConversionItem | HistoryRecord | null>(null);
  const [showInstallModal, setShowInstallModal] = useState<boolean>(false);
  const [deferredPrompt, setDeferredPrompt] = useState<any>(null);
  const [isIOS, setIsIOS] = useState<boolean>(false);
  const [isConvertingBatch, setIsConvertingBatch] = useState<boolean>(false);

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

  // Persist settings
  useEffect(() => {
    localStorage.setItem('docuconvert_passphrase', passphrase);
  }, [passphrase]);

  useEffect(() => {
    localStorage.setItem('docuconvert_room', roomCode);
  }, [roomCode]);

  useEffect(() => {
    localStorage.setItem('docuconvert_device', deviceLabel);
  }, [deviceLabel]);

  useEffect(() => {
    localStorage.setItem('docuconvert_autosync', String(autoSync));
  }, [autoSync]);

  useEffect(() => {
    localStorage.setItem('docuconvert_ocr', String(ocrEnabled));
  }, [ocrEnabled]);

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

  // Fetch Cloud Documents
  const fetchCloudDocs = useCallback(async () => {
    if (!roomCode) return;
    try {
      setIsCloudLoading(true);
      const res = await fetch(`/api/sync/${encodeURIComponent(roomCode)}`);
      if (res.ok) {
        const data = await res.json();
        if (data.documents && Array.isArray(data.documents)) {
          setCloudDocs(data.documents);
        }
      }
    } catch (err) {
      console.error('Failed to fetch cloud docs:', err);
    } finally {
      setIsCloudLoading(false);
    }
  }, [roomCode]);

  useEffect(() => {
    fetchCloudDocs();
  }, [fetchCloudDocs]);

  // Add files to batch queue
  const handleFilesAdded = (files: File[]) => {
    const newItems: ConversionItem[] = files.map((file) => {
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

      let encryptedPayload: string | undefined;
      let iv: string | undefined;
      let salt: string | undefined;
      let checksum: string | undefined;

      const arrayBuf = await result.blob.arrayBuffer();
      checksum = await computeChecksum(arrayBuf);

      if (autoEncrypt) {
        const enc = await encryptBuffer(arrayBuf, passphrase);
        encryptedPayload = enc.ciphertextBase64;
        iv = enc.ivBase64;
        salt = enc.saltBase64;
      }

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
                encrypted: autoEncrypt,
                encryptedPayload,
                iv,
                salt,
                checksum,
                ocrExtracted: result.ocrUsed,
                extractedPreview: result.preview,
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
        checksum,
        encrypted: autoEncrypt,
        synced: false,
        ocrExtracted: result.ocrUsed,
        previewSnippet: result.preview.type === 'text' ? result.preview.content.slice(0, 300) : undefined,
      };
      setHistory((prev) => [histRecord, ...prev]);

      // Auto-sync if enabled
      if (autoSync) {
        await syncItemToCloud({
          ...targetItem,
          convertedName: result.name,
          convertedSize: result.size,
          encrypted: autoEncrypt,
          encryptedPayload,
          iv,
          salt,
          checksum,
        });
      }
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

  // Sync to Cloud Vault
  const syncItemToCloud = async (item: Partial<ConversionItem>) => {
    if (!item.convertedName || !item.id) return;
    try {
      const payload: SyncedCloudDocument = {
        id: item.id,
        name: item.convertedName,
        originalName: item.originalName || item.convertedName,
        format: item.targetFormat || 'pdf',
        originalFormat: item.sourceFormat || 'docx',
        size: item.convertedSize || 0,
        encrypted: !!item.encrypted,
        encryptedPayload: item.encryptedPayload,
        iv: item.iv,
        salt: item.salt,
        checksum: item.checksum,
        createdAt: Date.now(),
        deviceLabel,
      };

      const res = await fetch(`/api/sync/${encodeURIComponent(roomCode)}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      if (res.ok) {
        // Mark as synced
        setQueue((prev) =>
          prev.map((i) => (i.id === item.id ? { ...i, synced: true } : i))
        );
        setHistory((prev) =>
          prev.map((h) => (h.id === item.id ? { ...h, synced: true } : h))
        );
        fetchCloudDocs();
      }
    } catch (err) {
      console.error('Failed to sync to cloud:', err);
    }
  };

  // Decrypt & Download from Cloud Vault
  const handleDecryptAndDownloadCloud = async (doc: SyncedCloudDocument) => {
    try {
      if (doc.encrypted && doc.encryptedPayload && doc.iv && doc.salt) {
        const decryptedBuf = await decryptBuffer(
          doc.encryptedPayload,
          doc.iv,
          doc.salt,
          passphrase
        );
        const mimeType = doc.format === 'pdf' ? 'application/pdf' : 'application/octet-stream';
        const blob = new Blob([decryptedBuf], { type: mimeType });
        triggerDownload(blob, doc.name);
      } else {
        alert('Document is missing encryption payload or already expired.');
      }
    } catch (err: any) {
      alert(`Decryption failed: Please ensure your Master Encryption Key matches. (${err.message})`);
    }
  };

  // Delete from Cloud Room
  const handleDeleteCloudDoc = async (docId: string) => {
    try {
      await fetch(`/api/sync/${encodeURIComponent(roomCode)}/${docId}`, {
        method: 'DELETE',
      });
      fetchCloudDocs();
    } catch (err) {
      console.error('Failed to delete cloud doc:', err);
    }
  };

  // Clear Cloud Room
  const handleClearRoom = async () => {
    if (!window.confirm('Are you sure you want to clear all synced documents from this room?')) return;
    try {
      await fetch(`/api/sync/${encodeURIComponent(roomCode)}/clear`, {
        method: 'POST',
      });
      fetchCloudDocs();
    } catch (err) {
      console.error('Failed to clear cloud room:', err);
    }
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
    triggerDownload(zipBlob, `DocuConvert_Batch_${Date.now()}.zip`);
  };

  // Download record from history
  const handleDownloadRecord = (record: HistoryRecord) => {
    // If active in current queue, use its blob
    const queueMatch = queue.find((q) => q.id === record.id && q.convertedBlob);
    if (queueMatch && queueMatch.convertedBlob) {
      triggerDownload(queueMatch.convertedBlob, record.convertedName);
      return;
    }

    // If synced in cloud room, attempt decrypt & download
    const cloudMatch = cloudDocs.find((c) => c.id === record.id);
    if (cloudMatch) {
      handleDecryptAndDownloadCloud(cloudMatch);
      return;
    }

    alert('The converted file memory was cleared. You can re-convert the file anytime from the converter tab.');
  };

  // Remove from queue
  const handleRemoveQueueItem = (id: string) => {
    setQueue((prev) => prev.filter((i) => i.id !== id));
  };

  const handleClearQueue = () => {
    setQueue([]);
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
        syncedCount={cloudDocs.length}
        roomCode={roomCode}
        isInstallable={!!deferredPrompt || isIOS}
        onInstallClick={() => setShowInstallModal(true)}
        isEncrypted={autoEncrypt}
      />

      {/* Main Content Area */}
      <main className="mx-auto flex-1 w-full max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
        {/* Converter View */}
        {activeTab === 'converter' && (
          <div className="space-y-6">
            {/* Header Description */}
            <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
              <div>
                <h1 className="text-2xl font-extrabold tracking-tight text-slate-900 dark:text-white sm:text-3xl">
                  Batch Document Converter
                </h1>
                <p className="mt-1 text-xs sm:text-sm text-slate-600 dark:text-slate-400">
                  Direct conversion for DOCX, PDF, PPTX, and more with original text formatting integrity and client-side encryption.
                </p>
              </div>

              {/* Status Pill */}
              <div className="flex items-center gap-2">
                <span className="inline-flex items-center gap-1.5 rounded-full bg-emerald-50 px-3 py-1 text-xs font-semibold text-emerald-700 dark:bg-emerald-950/60 dark:text-emerald-300">
                  <ShieldCheck className="h-3.5 w-3.5 text-emerald-500" />
                  AES-256 E2EE Active
                </span>
                <span className="hidden sm:inline-flex items-center gap-1.5 rounded-full bg-blue-50 px-3 py-1 text-xs font-semibold text-blue-700 dark:bg-blue-950/60 dark:text-blue-300">
                  <Cloud className="h-3.5 w-3.5 text-blue-500" />
                  Cloud Sync Ready
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
                // Also update existing queued files if they support it
                setQueue((prev) =>
                  prev.map((i) => {
                    const targets = getAvailableTargets(i.sourceFormat, ocrEnabled);
                    return targets.includes(tgt) ? { ...i, targetFormat: tgt } : i;
                  })
                );
              }}
              autoEncrypt={autoEncrypt}
              onAutoEncryptChange={setAutoEncrypt}
              ocrEnabled={ocrEnabled}
              onOcrToggle={handleOcrToggle}
            />

            {/* Queue Cards */}
            {queue.length > 0 && (
              <div className="space-y-3">
                <div className="flex items-center justify-between text-xs font-semibold text-slate-600 dark:text-slate-400">
                  <span>Files in Batch ({queue.length})</span>
                  <span>{completedCount} of {queue.length} completed</span>
                </div>

                <div className="space-y-2.5">
                  {queue.map((item) => (
                    <ConversionCard
                      key={item.id}
                      item={item}
                      onTargetChange={handleTargetChange}
                      onConvertSingle={convertSingle}
                      onDownload={handleDownloadItem}
                      onPreview={(itm) => setPreviewItem(itm)}
                      onSyncToCloud={syncItemToCloud}
                      onRemove={handleRemoveQueueItem}
                    />
                  ))}
                </div>
              </div>
            )}

            {/* Feature Highlights Bento */}
            <div className="mt-8 grid grid-cols-1 md:grid-cols-3 gap-4 pt-6 border-t border-slate-200 dark:border-slate-800">
              <div className="rounded-xl border border-slate-200 bg-white p-4 dark:border-slate-800 dark:bg-slate-900 shadow-xs">
                <div className="flex items-center gap-2 text-blue-600 dark:text-blue-400 font-bold text-xs uppercase">
                  <Sparkles className="h-4 w-4" />
                  <span>Formatting Integrity</span>
                </div>
                <p className="mt-1.5 text-xs text-slate-600 dark:text-slate-300">
                  Maintains headings, bullet lists, typography, tables, and internal structures without alterations during direct conversions.
                </p>
              </div>

              <div className="rounded-xl border border-slate-200 bg-white p-4 dark:border-slate-800 dark:bg-slate-900 shadow-xs">
                <div className="flex items-center gap-2 text-emerald-600 dark:text-emerald-400 font-bold text-xs uppercase">
                  <Lock className="h-4 w-4" />
                  <span>End-to-End Encryption</span>
                </div>
                <p className="mt-1.5 text-xs text-slate-600 dark:text-slate-300">
                  Every file is secured client-side using Web Crypto AES-256-GCM. Your private passphrase never leaves your device.
                </p>
              </div>

              <div className="rounded-xl border border-slate-200 bg-white p-4 dark:border-slate-800 dark:bg-slate-900 shadow-xs">
                <div className="flex items-center gap-2 text-purple-600 dark:text-purple-400 font-bold text-xs uppercase">
                  <Cloud className="h-4 w-4" />
                  <span>Cross-Device Cloud Sync</span>
                </div>
                <p className="mt-1.5 text-xs text-slate-600 dark:text-slate-300">
                  Pair with your phone, tablet, or secondary computer using your secure 6-character room code for seamless access.
                </p>
              </div>
            </div>
          </div>
        )}

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

        {/* Cloud Vault View */}
        {activeTab === 'vault' && (
          <CloudVaultView
            roomCode={roomCode}
            onRoomCodeChange={(newCode) => {
              setRoomCode(newCode);
              setTimeout(() => fetchCloudDocs(), 100);
            }}
            deviceLabel={deviceLabel}
            onDeviceLabelChange={setDeviceLabel}
            autoSync={autoSync}
            onAutoSyncChange={setAutoSync}
            cloudDocs={cloudDocs}
            isLoading={isCloudLoading}
            onRefreshCloud={fetchCloudDocs}
            onDecryptAndDownload={handleDecryptAndDownloadCloud}
            onDeleteCloudDoc={handleDeleteCloudDoc}
            onClearRoom={handleClearRoom}
            passphrase={passphrase}
          />
        )}

        {/* Security & Key View */}
        {activeTab === 'security' && (
          <SecurityView
            passphrase={passphrase}
            onPassphraseChange={setPassphrase}
          />
        )}
      </main>

      {/* Preview Modal */}
      <PreviewModal
        item={previewItem}
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

      {/* Footer */}
      <footer className="border-t border-slate-200 bg-white py-6 dark:border-slate-800 dark:bg-slate-900 transition-colors">
        <div className="mx-auto flex max-w-7xl flex-col sm:flex-row items-center justify-between gap-4 px-4 sm:px-6 lg:px-8 text-xs text-slate-500 dark:text-slate-400">
          <div className="flex items-center gap-2">
            <span className="font-bold text-slate-900 dark:text-white">DocuConvert</span>
            <span>•</span>
            <span>Client-Side AES-256-GCM Zero-Knowledge Document System</span>
          </div>

          <div className="flex items-center gap-4">
            <span>DOCX</span>
            <span>PDF</span>
            <span>PPTX</span>
            <span>HTML</span>
            <span>TXT</span>
            <span>MD</span>
            <span>PNG</span>
            <span>JPG</span>
          </div>
        </div>
      </footer>
    </div>
  );
}
