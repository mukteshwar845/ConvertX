import React, { useState } from 'react';
import {
  Cloud,
  RefreshCw,
  Copy,
  Check,
  Smartphone,
  Laptop,
  ShieldCheck,
  Lock,
  Download,
  Trash2,
  ArrowRight,
  ExternalLink,
  Shield,
  UploadCloud,
} from 'lucide-react';
import { SyncedCloudDocument, EncryptionConfig } from '../types';

interface CloudVaultViewProps {
  roomCode: string;
  onRoomCodeChange: (newCode: string) => void;
  deviceLabel: string;
  onDeviceLabelChange: (label: string) => void;
  autoSync: boolean;
  onAutoSyncChange: (auto: boolean) => void;
  cloudDocs: SyncedCloudDocument[];
  isLoading: boolean;
  onRefreshCloud: () => void;
  onDecryptAndDownload: (doc: SyncedCloudDocument) => void;
  onDeleteCloudDoc: (docId: string) => void;
  onClearRoom: () => void;
  passphrase: string;
}

export const CloudVaultView: React.FC<CloudVaultViewProps> = ({
  roomCode,
  onRoomCodeChange,
  deviceLabel,
  onDeviceLabelChange,
  autoSync,
  onAutoSyncChange,
  cloudDocs,
  isLoading,
  onRefreshCloud,
  onDecryptAndDownload,
  onDeleteCloudDoc,
  onClearRoom,
  passphrase,
}) => {
  const [newRoomInput, setNewRoomInput] = useState('');
  const [copied, setCopied] = useState(false);

  const handleCopy = () => {
    navigator.clipboard.writeText(roomCode);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleJoinRoom = (e: React.FormEvent) => {
    e.preventDefault();
    if (newRoomInput.trim()) {
      onRoomCodeChange(newRoomInput.trim().toUpperCase());
      setNewRoomInput('');
    }
  };

  const formatBytes = (bytes: number) => {
    if (!bytes || bytes === 0) return '0 B';
    const k = 1024;
    const sizes = ['B', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(1)) + ' ' + sizes[i];
  };

  return (
    <div className="space-y-6">
      {/* Title & Sync Overview */}
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h2 className="text-xl font-bold tracking-tight text-slate-900 dark:text-white flex items-center gap-2">
            <Cloud className="h-5 w-5 text-blue-600 dark:text-blue-400" />
            Cross-Device Cloud Synchronization
          </h2>
          <p className="mt-1 text-xs text-slate-500 dark:text-slate-400">
            Access your converted files on iOS, Android, and Desktop with zero-knowledge AES-256 client encryption.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={onRefreshCloud}
            disabled={isLoading}
            className="flex items-center gap-1.5 rounded-lg border border-slate-200 bg-white px-3 py-1.5 text-xs font-semibold text-slate-700 hover:bg-slate-50 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-200 dark:hover:bg-slate-700 transition"
          >
            <RefreshCw className={`h-3.5 w-3.5 ${isLoading ? 'animate-spin text-blue-600' : ''}`} />
            Refresh
          </button>
        </div>
      </div>

      {/* Sync Room Pairing Card */}
      <div className="grid grid-cols-1 gap-4 lg:grid-cols-3">
        {/* Active Room Code Card */}
        <div className="rounded-2xl border border-blue-200 bg-gradient-to-br from-blue-50/80 to-indigo-50/50 p-5 dark:border-blue-900/60 dark:from-blue-950/40 dark:to-indigo-950/20">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold uppercase tracking-wider text-blue-600 dark:text-blue-400">
              Active Sync Room
            </span>
            <span className="relative flex h-2.5 w-2.5">
              <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-emerald-400 opacity-75"></span>
              <span className="relative inline-flex h-2.5 w-2.5 rounded-full bg-emerald-500"></span>
            </span>
          </div>

          <div className="mt-3 flex items-center justify-between rounded-xl bg-white p-3 shadow-xs dark:bg-slate-900">
            <span className="font-mono text-lg font-extrabold text-slate-900 dark:text-white">
              {roomCode}
            </span>
            <button
              onClick={handleCopy}
              className="flex items-center gap-1 rounded-lg bg-blue-50 px-2.5 py-1 text-xs font-semibold text-blue-700 hover:bg-blue-100 dark:bg-blue-950/60 dark:text-blue-300 transition"
            >
              {copied ? <Check className="h-3.5 w-3.5" /> : <Copy className="h-3.5 w-3.5" />}
              <span>{copied ? 'Copied' : 'Copy'}</span>
            </button>
          </div>

          <p className="mt-3 text-[11px] text-slate-600 dark:text-slate-300">
            Enter this code on your iPhone, iPad, Android phone, or secondary computer to mirror your converted documents.
          </p>
        </div>

        {/* Join Another Device Room */}
        <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-xs dark:border-slate-800 dark:bg-slate-900">
          <span className="text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">
            Connect Existing Device
          </span>

          <form onSubmit={handleJoinRoom} className="mt-3 flex gap-2">
            <input
              type="text"
              placeholder="e.g. DOCS-9A82..."
              value={newRoomInput}
              onChange={(e) => setNewRoomInput(e.target.value)}
              className="flex-1 rounded-xl border border-slate-300 bg-slate-50 px-3 py-2 text-xs font-mono font-bold uppercase text-slate-900 focus:border-blue-500 focus:bg-white focus:outline-none dark:border-slate-700 dark:bg-slate-800 dark:text-white"
            />
            <button
              type="submit"
              className="rounded-xl bg-blue-600 px-3 py-2 text-xs font-bold text-white hover:bg-blue-700 transition"
            >
              Join
            </button>
          </form>

          <p className="mt-3 text-[11px] text-slate-500 dark:text-slate-400">
            Sync rooms let you immediately view and download your documents across any mobile or desktop browser.
          </p>
        </div>

        {/* Device Settings & Auto-sync */}
        <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-xs dark:border-slate-800 dark:bg-slate-900">
          <span className="text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">
            Sync Preferences
          </span>

          <div className="mt-3 space-y-3">
            <div>
              <label className="text-[11px] font-medium text-slate-600 dark:text-slate-300">
                This Device Name:
              </label>
              <input
                type="text"
                value={deviceLabel}
                onChange={(e) => onDeviceLabelChange(e.target.value)}
                placeholder="e.g. iPhone 16 / Chrome"
                className="mt-1 w-full rounded-lg border border-slate-200 bg-slate-50 px-2.5 py-1 text-xs text-slate-900 focus:border-blue-500 focus:outline-none dark:border-slate-700 dark:bg-slate-800 dark:text-white"
              />
            </div>

            <label className="flex items-center gap-2 cursor-pointer text-xs font-medium text-slate-700 dark:text-slate-300">
              <input
                type="checkbox"
                checked={autoSync}
                onChange={(e) => onAutoSyncChange(e.target.checked)}
                className="rounded border-slate-300 text-blue-600 focus:ring-blue-500"
              />
              <span>Auto-sync converted files to cloud</span>
            </label>
          </div>
        </div>
      </div>

      {/* Zero Knowledge Security Guarantee */}
      <div className="flex items-start gap-3 rounded-xl border border-emerald-200 bg-emerald-50/60 p-4 dark:border-emerald-900/60 dark:bg-emerald-950/30">
        <ShieldCheck className="h-5 w-5 shrink-0 text-emerald-600 dark:text-emerald-400" />
        <div className="text-xs">
          <span className="font-bold text-emerald-900 dark:text-emerald-200">
            End-to-End Encrypted Cloud Storage
          </span>
          <p className="mt-0.5 text-emerald-800/90 dark:text-emerald-300/80">
            All documents sent to the cloud sync room are encrypted client-side using Web Crypto AES-GCM-256. The server only stores ciphertext. Only devices holding your secret passphrase can decrypt and view documents.
          </p>
        </div>
      </div>

      {/* Cloud Documents List */}
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <h3 className="text-sm font-bold text-slate-900 dark:text-white">
            Documents in Cloud Room ({cloudDocs.length})
          </h3>
          {cloudDocs.length > 0 && (
            <button
              onClick={onClearRoom}
              className="text-xs text-rose-600 hover:text-rose-700 dark:text-rose-400 font-medium"
            >
              Clear Room
            </button>
          )}
        </div>

        {cloudDocs.length === 0 ? (
          <div className="rounded-2xl border border-dashed border-slate-300 bg-white p-10 text-center dark:border-slate-800 dark:bg-slate-900">
            <Cloud className="mx-auto h-8 w-8 text-slate-400" />
            <p className="mt-2 text-xs font-semibold text-slate-800 dark:text-slate-200">
              No documents synced in this room yet
            </p>
            <p className="mt-1 text-[11px] text-slate-500 dark:text-slate-400">
              Convert any file in the Converter tab and click "Sync" to upload it to this cloud room.
            </p>
          </div>
        ) : (
          <div className="space-y-2">
            {cloudDocs.map((doc) => (
              <div
                key={doc.id}
                className="flex flex-col gap-3 rounded-xl border border-slate-200 bg-white p-3.5 shadow-xs transition hover:shadow-sm dark:border-slate-800 dark:bg-slate-900 sm:flex-row sm:items-center sm:justify-between"
              >
                <div className="flex items-center gap-3 min-w-0">
                  <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-blue-50 text-blue-600 dark:bg-blue-950/60 dark:text-blue-400">
                    <Lock className="h-4 w-4 text-emerald-500" />
                  </div>
                  <div className="min-w-0">
                    <div className="flex items-center gap-2">
                      <span className="truncate text-xs font-bold text-slate-900 dark:text-white">
                        {doc.name}
                      </span>
                      <span className="rounded bg-blue-100 px-1.5 py-0.2 text-[10px] font-bold uppercase text-blue-700 dark:bg-blue-900/40 dark:text-blue-300">
                        {doc.format}
                      </span>
                    </div>
                    <div className="mt-0.5 flex flex-wrap items-center gap-2 text-[11px] text-slate-500 dark:text-slate-400">
                      <span>{formatBytes(doc.size)}</span>
                      <span>•</span>
                      <span>Uploaded from {doc.deviceLabel || 'Web'}</span>
                      <span>•</span>
                      <span>{new Date(doc.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                      {doc.checksum && (
                        <span className="font-mono text-[10px] text-slate-400">
                          Hash: {doc.checksum.slice(0, 8)}...
                        </span>
                      )}
                    </div>
                  </div>
                </div>

                <div className="flex items-center justify-end gap-2 shrink-0">
                  <button
                    onClick={() => onDecryptAndDownload(doc)}
                    className="flex items-center gap-1.5 rounded-lg bg-blue-600 px-3 py-1.5 text-xs font-bold text-white shadow-xs hover:bg-blue-700 transition"
                  >
                    <Download className="h-3.5 w-3.5" />
                    <span>Decrypt & Save</span>
                  </button>

                  <button
                    onClick={() => onDeleteCloudDoc(doc.id)}
                    className="rounded-lg p-1.5 text-slate-400 hover:bg-rose-50 hover:text-rose-600 dark:hover:bg-rose-950/40 dark:hover:text-rose-400 transition"
                    title="Delete from cloud"
                  >
                    <Trash2 className="h-4 w-4" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};
