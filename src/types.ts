export type SupportedFormat =
  | 'docx'
  | 'pdf'
  | 'pptx'
  | 'txt'
  | 'html'
  | 'md'
  | 'png'
  | 'jpg';

export type TargetFormat = 'pdf' | 'pptx' | 'docx' | 'txt' | 'html' | 'md';

export interface FormatOption {
  format: TargetFormat;
  label: string;
  description: string;
  extension: string;
  badgeColor: string;
}

export interface ConversionItem {
  id: string;
  file: File;
  originalName: string;
  originalSize: number;
  sourceFormat: SupportedFormat;
  targetFormat: TargetFormat;
  status: 'queued' | 'converting' | 'completed' | 'error';
  progress: number;
  errorMessage?: string;
  convertedBlob?: Blob;
  convertedUrl?: string;
  convertedSize?: number;
  convertedName?: string;
  encrypted?: boolean;
  encryptedPayload?: string;
  iv?: string;
  salt?: string;
  checksum?: string;
  synced?: boolean;
  timestamp: number;
  durationMs?: number;
  extractedPreview?: {
    type: 'html' | 'text' | 'pdf' | 'image';
    content: string;
  };
}

export interface HistoryRecord {
  id: string;
  originalName: string;
  originalSize: number;
  convertedName: string;
  convertedSize: number;
  sourceFormat: SupportedFormat;
  targetFormat: TargetFormat;
  timestamp: number;
  checksum?: string;
  encrypted: boolean;
  synced: boolean;
  dataUrl?: string; // Cache for re-download if stored
  previewSnippet?: string;
}

export interface SyncedCloudDocument {
  id: string;
  name: string;
  originalName: string;
  format: string;
  originalFormat: string;
  size: number;
  encrypted: boolean;
  encryptedPayload?: string;
  iv?: string;
  salt?: string;
  checksum?: string;
  createdAt: number;
  deviceLabel: string;
}

export interface EncryptionConfig {
  enabled: boolean;
  passphrase: string;
  autoSync: boolean;
  roomCode: string;
  deviceLabel: string;
}
