export type SupportedFormat =
  | 'docx'
  | 'doc'
  | 'pdf'
  | 'pptx'
  | 'ppt'
  | 'odp'
  | 'xlsx'
  | 'xls'
  | 'csv'
  | 'ods'
  | 'png'
  | 'jpg'
  | 'webp'
  | 'svg'
  | 'bmp'
  | 'gif'
  | 'tiff'
  | 'txt'
  | 'rtf'
  | 'odt'
  | 'html'
  | 'md'
  | 'json'
  | 'xml';

export type TargetFormat =
  | 'pdf'
  | 'docx'
  | 'pptx'
  | 'xlsx'
  | 'csv'
  | 'ods'
  | 'png'
  | 'jpg'
  | 'webp'
  | 'svg'
  | 'txt'
  | 'rtf'
  | 'odt'
  | 'html'
  | 'md'
  | 'json'
  | 'xml';

export type FormatCategory = 'documents' | 'presentations' | 'spreadsheets' | 'images' | 'data';

export interface FormatMeta {
  format: SupportedFormat;
  label: string;
  category: FormatCategory;
  extension: string;
  mime: string;
  badgeColor: string;
  iconName: string;
  description: string;
}

export interface DocumentElement {
  id: string;
  type: 'heading' | 'paragraph' | 'bullet' | 'numbered' | 'table' | 'image' | 'code' | 'divider' | 'sheet';
  level?: 1 | 2 | 3;
  text?: string;
  bold?: boolean;
  italic?: boolean;
  underline?: boolean;
  fontSize?: number;
  fontColor?: string;
  alignment?: 'left' | 'center' | 'right' | 'justify';
  rows?: string[][]; // For tables
  headers?: string[]; // For tables
  sheetName?: string; // For spreadsheets
  imageData?: string; // Data URL
  imageWidth?: number;
  imageHeight?: number;
  caption?: string;
  pageIndex?: number;
}

export interface InternalDocumentModel {
  title: string;
  elements: DocumentElement[];
  pageCount: number;
  wordCount: number;
  characterCount: number;
  tablesCount: number;
  imagesCount: number;
  headingsCount: number;
  rawText: string;
  sourceFormat: SupportedFormat;
  detectedSignature?: string;
  sheets?: Array<{
    name: string;
    data: (string | number)[][];
    headers?: string[];
    rowCount: number;
    colCount: number;
  }>;
}

export interface FidelityCheck {
  id: string;
  name: string;
  status: 'passed' | 'warning' | 'info';
  detail: string;
}

export interface FidelityReport {
  overallScore: number; // 0 - 100
  textScore: number;
  layoutScore: number;
  imagesScore: number;
  fontsScore: number;
  tablesScore: number;
  sourcePages: number;
  targetPages: number;
  strategyUsed: string;
  alternativeAttempted?: boolean;
  retried?: boolean;
  improvementDelta?: number;
  checks: FidelityCheck[];
  diffSummary: {
    matchedWords: number;
    totalWords: number;
    missingWords: number;
    extraWords: number;
    similarityRatio: number;
  };
}

export interface ConversionOptions {
  presentationMode?: 'exact' | 'smart' | 'page-to-slide';
  imageQuality?: number; // 0.1 to 1.0
  imageResolution?: 'original' | '1080p' | '4k' | '720p';
  imageDpi?: number;
  preserveMetadata?: boolean;
  ocrEnabled?: boolean;
  ocrLanguage?: string;
  spreadsheetPreserveFormulas?: boolean;
  autoRetryLowFidelity?: boolean;
  fidelityThreshold?: number; // default 85
  onProgress?: (progress: number, statusText?: string) => void;
}

export interface ConversionResult {
  blob: Blob;
  name: string;
  size: number;
  format?: TargetFormat;
  ocrUsed?: boolean;
  fidelity?: FidelityReport;
  sourceModel?: InternalDocumentModel;
  preview: {
    type: 'html' | 'text' | 'pdf' | 'image' | 'table';
    content: string;
    sheets?: Array<{ name: string; data: (string | number)[][] }>;
  };
  strategyUsed?: string;
  cached?: boolean;
}

export interface ConversionItem {
  id: string;
  file: File;
  originalName: string;
  originalSize: number;
  sourceFormat: SupportedFormat;
  detectedSignature?: string;
  targetFormat: TargetFormat;
  status: 'queued' | 'converting' | 'completed' | 'error';
  progress: number;
  progressStep?: string;
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
  cached?: boolean;
  options?: ConversionOptions;
  sourceModel?: InternalDocumentModel;
  extractedPreview?: {
    type: 'html' | 'text' | 'pdf' | 'image' | 'table';
    content: string;
    sheets?: Array<{ name: string; data: (string | number)[][] }>;
  };
  originalPreview?: {
    type: 'html' | 'text' | 'pdf' | 'image' | 'table';
    content: string;
  };
  fidelity?: FidelityReport;
  ocrEnabled?: boolean;
  ocrExtracted?: boolean;
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
  durationMs?: number;
  checksum?: string;
  encrypted: boolean;
  synced: boolean;
  ocrExtracted?: boolean;
  cached?: boolean;
  fidelityScore?: number;
  dataUrl?: string;
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

export interface TelemetryStats {
  totalConversions: number;
  successfulConversions: number;
  failedConversions: number;
  cacheHits: number;
  retriedConversions: number;
  averageDurationMs: number;
  averageFidelityScore: number;
  formatUsage: Record<string, number>;
  totalBytesProcessed: number;
}

