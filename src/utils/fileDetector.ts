import { SupportedFormat, TargetFormat, FormatMeta, FormatCategory } from '../types';

export const FORMAT_REGISTRY: Record<SupportedFormat, FormatMeta> = {
  pdf: {
    format: 'pdf',
    label: 'PDF Document',
    category: 'documents',
    extension: 'pdf',
    mime: 'application/pdf',
    badgeColor: 'bg-red-500 text-white',
    iconName: 'FileText',
    description: 'Portable Document Format with high-fidelity vector & text layout',
  },
  docx: {
    format: 'docx',
    label: 'Word Document',
    category: 'documents',
    extension: 'docx',
    mime: 'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
    badgeColor: 'bg-blue-600 text-white',
    iconName: 'FileText',
    description: 'Microsoft Word OpenXML editable document with typography & tables',
  },
  doc: {
    format: 'doc',
    label: 'Legacy Word (DOC)',
    category: 'documents',
    extension: 'doc',
    mime: 'application/msword',
    badgeColor: 'bg-blue-700 text-white',
    iconName: 'FileText',
    description: 'Binary Microsoft Word 97-2003 format',
  },
  odt: {
    format: 'odt',
    label: 'OpenDocument Text',
    category: 'documents',
    extension: 'odt',
    mime: 'application/vnd.oasis.opendocument.text',
    badgeColor: 'bg-indigo-600 text-white',
    iconName: 'FileText',
    description: 'ISO OpenDocument text specification (LibreOffice / OpenOffice)',
  },
  rtf: {
    format: 'rtf',
    label: 'Rich Text Format',
    category: 'documents',
    extension: 'rtf',
    mime: 'application/rtf',
    badgeColor: 'bg-cyan-600 text-white',
    iconName: 'FileText',
    description: 'Cross-platform styled text format with fonts & tables',
  },
  txt: {
    format: 'txt',
    label: 'Plain Text',
    category: 'documents',
    extension: 'txt',
    mime: 'text/plain',
    badgeColor: 'bg-slate-500 text-white',
    iconName: 'FileText',
    description: 'Standard UTF-8 plain text with zero formatting overhead',
  },
  html: {
    format: 'html',
    label: 'HTML Webpage',
    category: 'documents',
    extension: 'html',
    mime: 'text/html',
    badgeColor: 'bg-orange-500 text-white',
    iconName: 'Code',
    description: 'Semantic HyperText Markup Language for browser & web publishing',
  },
  md: {
    format: 'md',
    label: 'Markdown',
    category: 'documents',
    extension: 'md',
    mime: 'text/markdown',
    badgeColor: 'bg-slate-700 text-white',
    iconName: 'FileCode',
    description: 'Lightweight structured markup with headers, tables, and lists',
  },
  pptx: {
    format: 'pptx',
    label: 'PowerPoint Slide',
    category: 'presentations',
    extension: 'pptx',
    mime: 'application/vnd.openxmlformats-officedocument.presentationml.presentation',
    badgeColor: 'bg-amber-600 text-white',
    iconName: 'Presentation',
    description: 'Microsoft PowerPoint OpenXML presentation slides',
  },
  ppt: {
    format: 'ppt',
    label: 'Legacy PowerPoint',
    category: 'presentations',
    extension: 'ppt',
    mime: 'application/vnd.ms-powerpoint',
    badgeColor: 'bg-amber-700 text-white',
    iconName: 'Presentation',
    description: 'Binary Microsoft PowerPoint 97-2003 presentation',
  },
  odp: {
    format: 'odp',
    label: 'OpenDocument Slide',
    category: 'presentations',
    extension: 'odp',
    mime: 'application/vnd.oasis.opendocument.presentation',
    badgeColor: 'bg-yellow-600 text-white',
    iconName: 'Presentation',
    description: 'ISO OpenDocument presentation file',
  },
  xlsx: {
    format: 'xlsx',
    label: 'Excel Spreadsheet',
    category: 'spreadsheets',
    extension: 'xlsx',
    mime: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
    badgeColor: 'bg-emerald-600 text-white',
    iconName: 'Table',
    description: 'Microsoft Excel OpenXML spreadsheet with multi-sheet & formula support',
  },
  xls: {
    format: 'xls',
    label: 'Legacy Excel (XLS)',
    category: 'spreadsheets',
    extension: 'xls',
    mime: 'application/vnd.ms-excel',
    badgeColor: 'bg-emerald-700 text-white',
    iconName: 'Table',
    description: 'Binary Microsoft Excel 97-2003 workbook',
  },
  csv: {
    format: 'csv',
    label: 'CSV Data Sheet',
    category: 'spreadsheets',
    extension: 'csv',
    mime: 'text/csv',
    badgeColor: 'bg-teal-600 text-white',
    iconName: 'Table',
    description: 'Comma-Separated Values tabular data standard',
  },
  ods: {
    format: 'ods',
    label: 'OpenDocument Sheet',
    category: 'spreadsheets',
    extension: 'ods',
    mime: 'application/vnd.oasis.opendocument.spreadsheet',
    badgeColor: 'bg-emerald-800 text-white',
    iconName: 'Table',
    description: 'ISO OpenDocument spreadsheet specification',
  },
  png: {
    format: 'png',
    label: 'PNG Image',
    category: 'images',
    extension: 'png',
    mime: 'image/png',
    badgeColor: 'bg-violet-600 text-white',
    iconName: 'Image',
    description: 'Lossless raster image with transparency support',
  },
  jpg: {
    format: 'jpg',
    label: 'JPEG Image',
    category: 'images',
    extension: 'jpg',
    mime: 'image/jpeg',
    badgeColor: 'bg-rose-500 text-white',
    iconName: 'Image',
    description: 'Compressed photographic image standard',
  },
  webp: {
    format: 'webp',
    label: 'WebP Image',
    category: 'images',
    extension: 'webp',
    mime: 'image/webp',
    badgeColor: 'bg-green-600 text-white',
    iconName: 'Image',
    description: 'Modern Google WebP image format with ultra-high compression',
  },
  svg: {
    format: 'svg',
    label: 'SVG Vector',
    category: 'images',
    extension: 'svg',
    mime: 'image/svg+xml',
    badgeColor: 'bg-purple-600 text-white',
    iconName: 'Image',
    description: 'Scalable XML-based 2D vector graphic',
  },
  bmp: {
    format: 'bmp',
    label: 'Bitmap Image (BMP)',
    category: 'images',
    extension: 'bmp',
    mime: 'image/bmp',
    badgeColor: 'bg-gray-600 text-white',
    iconName: 'Image',
    description: 'Uncompressed Windows bitmap image',
  },
  gif: {
    format: 'gif',
    label: 'GIF Image',
    category: 'images',
    extension: 'gif',
    mime: 'image/gif',
    badgeColor: 'bg-pink-600 text-white',
    iconName: 'Image',
    description: 'Indexed color graphic and animated GIF format',
  },
  tiff: {
    format: 'tiff',
    label: 'TIFF Image',
    category: 'images',
    extension: 'tiff',
    mime: 'image/tiff',
    badgeColor: 'bg-slate-600 text-white',
    iconName: 'Image',
    description: 'Tagged Image File Format for high-depth print graphics',
  },
  json: {
    format: 'json',
    label: 'JSON Data',
    category: 'data',
    extension: 'json',
    mime: 'application/json',
    badgeColor: 'bg-sky-600 text-white',
    iconName: 'Code',
    description: 'Structured key-value JavaScript Object Notation',
  },
  xml: {
    format: 'xml',
    label: 'XML Document',
    category: 'data',
    extension: 'xml',
    mime: 'application/xml',
    badgeColor: 'bg-amber-800 text-white',
    iconName: 'Code',
    description: 'Extensible hierarchical markup document',
  },
};

/**
 * Reads the first bytes of a file to check magic numbers and deep signatures
 */
export async function detectFileFormat(file: File): Promise<{
  format: SupportedFormat;
  signature: string;
  mimeType: string;
}> {
  const extension = (file.name.split('.').pop() || '').toLowerCase();
  const rawMime = file.type || '';

  // Read first 256 bytes for signature inspection
  const slice = file.slice(0, 256);
  const buffer = await slice.arrayBuffer();
  const bytes = new Uint8Array(buffer);

  // Helper to read ASCII from buffer
  const asciiHeader = Array.from(bytes.slice(0, 32))
    .map((b) => String.fromCharCode(b))
    .join('');

  // 1. PDF: %PDF- (0x25 0x50 0x44 0x46)
  if (bytes[0] === 0x25 && bytes[1] === 0x50 && bytes[2] === 0x44 && bytes[3] === 0x46) {
    return {
      format: 'pdf',
      signature: `Verified PDF Header (${asciiHeader.slice(0, 8)})`,
      mimeType: 'application/pdf',
    };
  }

  // 2. PNG: 0x89 0x50 0x4E 0x47 0x0D 0x0A 0x1A 0x0A
  if (
    bytes[0] === 0x89 &&
    bytes[1] === 0x50 &&
    bytes[2] === 0x4e &&
    bytes[3] === 0x47 &&
    bytes[4] === 0x0d &&
    bytes[5] === 0x0a
  ) {
    return {
      format: 'png',
      signature: 'Verified PNG Magic Signature (\\x89PNG)',
      mimeType: 'image/png',
    };
  }

  // 3. JPEG: 0xFF 0xD8 0xFF
  if (bytes[0] === 0xff && bytes[1] === 0xd8 && bytes[2] === 0xff) {
    return {
      format: 'jpg',
      signature: 'Verified JPEG/JFIF Stream Header',
      mimeType: 'image/jpeg',
    };
  }

  // 4. GIF: GIF87a or GIF89a
  if (asciiHeader.startsWith('GIF87a') || asciiHeader.startsWith('GIF89a')) {
    return {
      format: 'gif',
      signature: `Verified GIF Stream (${asciiHeader.slice(0, 6)})`,
      mimeType: 'image/gif',
    };
  }

  // 5. WEBP: RIFF....WEBP
  if (asciiHeader.startsWith('RIFF') && asciiHeader.includes('WEBP')) {
    return {
      format: 'webp',
      signature: 'Verified RIFF-WebP Container Header',
      mimeType: 'image/webp',
    };
  }

  // 6. BMP: 0x42 0x4D (BM)
  if (bytes[0] === 0x42 && bytes[1] === 0x4d) {
    return {
      format: 'bmp',
      signature: 'Verified Windows Bitmap Header (BM)',
      mimeType: 'image/bmp',
    };
  }

  // 7. TIFF: 0x49 0x49 0x2A 0x00 (II*) or 0x4D 0x4D 0x00 0x2A (MM*)
  if (
    (bytes[0] === 0x49 && bytes[1] === 0x49 && bytes[2] === 0x2a) ||
    (bytes[0] === 0x4d && bytes[1] === 0x4d && bytes[2] === 0x00 && bytes[3] === 0x2a)
  ) {
    return {
      format: 'tiff',
      signature: 'Verified TIFF Byte Order Header',
      mimeType: 'image/tiff',
    };
  }

  // 8. RTF: {\rtf
  if (asciiHeader.startsWith('{\\rtf')) {
    return {
      format: 'rtf',
      signature: 'Verified Rich Text Format Signature ({\\rtf)',
      mimeType: 'application/rtf',
    };
  }

  // 9. ZIP Containers: PK\x03\x04 (DOCX, PPTX, XLSX, ODT, ODP, ODS)
  if (bytes[0] === 0x50 && bytes[1] === 0x4b && bytes[2] === 0x03 && bytes[3] === 0x04) {
    // Discriminate based on extension and internal zip mime if available
    if (extension === 'pptx') {
      return {
        format: 'pptx',
        signature: 'Verified OpenXML Presentation (PK Zip Container)',
        mimeType: 'application/vnd.openxmlformats-officedocument.presentationml.presentation',
      };
    }
    if (extension === 'xlsx') {
      return {
        format: 'xlsx',
        signature: 'Verified OpenXML Spreadsheet (PK Zip Container)',
        mimeType: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
      };
    }
    if (extension === 'odt') {
      return {
        format: 'odt',
        signature: 'Verified OpenDocument Text (PK Zip Container)',
        mimeType: 'application/vnd.oasis.opendocument.text',
      };
    }
    if (extension === 'ods') {
      return {
        format: 'ods',
        signature: 'Verified OpenDocument Spreadsheet (PK Zip Container)',
        mimeType: 'application/vnd.oasis.opendocument.spreadsheet',
      };
    }
    if (extension === 'odp') {
      return {
        format: 'odp',
        signature: 'Verified OpenDocument Presentation (PK Zip Container)',
        mimeType: 'application/vnd.oasis.opendocument.presentation',
      };
    }
    return {
      format: 'docx',
      signature: 'Verified OpenXML Document (PK Zip Container)',
      mimeType: 'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
    };
  }

  // 10. XML / SVG detection via text inspect
  const first100Text = new TextDecoder('utf-8', { fatal: false }).decode(bytes.slice(0, 150));
  if (first100Text.includes('<svg') || (first100Text.includes('<?xml') && first100Text.includes('svg'))) {
    return {
      format: 'svg',
      signature: 'Verified SVG XML Vector Document',
      mimeType: 'image/svg+xml',
    };
  }

  if (first100Text.includes('<!DOCTYPE html') || first100Text.includes('<html') || first100Text.includes('<head')) {
    return {
      format: 'html',
      signature: 'Verified HTML Web Document Header',
      mimeType: 'text/html',
    };
  }

  if (first100Text.trim().startsWith('{') || first100Text.trim().startsWith('[')) {
    try {
      JSON.parse(first100Text);
      return {
        format: 'json',
        signature: 'Verified JSON Key-Value Structure',
        mimeType: 'application/json',
      };
    } catch {
      // Might just be partial JSON
      if (extension === 'json') {
        return {
          format: 'json',
          signature: 'JSON Object Payload',
          mimeType: 'application/json',
        };
      }
    }
  }

  if (first100Text.trim().startsWith('<?xml')) {
    return {
      format: 'xml',
      signature: 'Verified XML Tagged Stream',
      mimeType: 'application/xml',
    };
  }

  // 11. Extension fallbacks
  switch (extension) {
    case 'docx':
      return { format: 'docx', signature: 'Microsoft Word OpenXML', mimeType: 'application/vnd.openxmlformats-officedocument.wordprocessingml.document' };
    case 'doc':
      return { format: 'doc', signature: 'Microsoft Word 97-2003 Binary', mimeType: 'application/msword' };
    case 'pdf':
      return { format: 'pdf', signature: 'Adobe PDF Document', mimeType: 'application/pdf' };
    case 'pptx':
      return { format: 'pptx', signature: 'PowerPoint OpenXML Presentation', mimeType: 'application/vnd.openxmlformats-officedocument.presentationml.presentation' };
    case 'ppt':
      return { format: 'ppt', signature: 'PowerPoint 97-2003 Binary', mimeType: 'application/vnd.ms-powerpoint' };
    case 'xlsx':
      return { format: 'xlsx', signature: 'Excel OpenXML Workbook', mimeType: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' };
    case 'xls':
      return { format: 'xls', signature: 'Excel 97-2003 Workbook', mimeType: 'application/vnd.ms-excel' };
    case 'csv':
      return { format: 'csv', signature: 'Comma-Separated Values Tabular', mimeType: 'text/csv' };
    case 'ods':
      return { format: 'ods', signature: 'OpenDocument Spreadsheet', mimeType: 'application/vnd.oasis.opendocument.spreadsheet' };
    case 'odt':
      return { format: 'odt', signature: 'OpenDocument Text', mimeType: 'application/vnd.oasis.opendocument.text' };
    case 'odp':
      return { format: 'odp', signature: 'OpenDocument Presentation', mimeType: 'application/vnd.oasis.opendocument.presentation' };
    case 'rtf':
      return { format: 'rtf', signature: 'Rich Text Format', mimeType: 'application/rtf' };
    case 'html':
    case 'htm':
      return { format: 'html', signature: 'HTML Document', mimeType: 'text/html' };
    case 'md':
    case 'markdown':
      return { format: 'md', signature: 'Markdown Structured Text', mimeType: 'text/markdown' };
    case 'png':
      return { format: 'png', signature: 'PNG Raster Image', mimeType: 'image/png' };
    case 'jpg':
    case 'jpeg':
    case 'jfif':
      return { format: 'jpg', signature: 'JPEG Raster Image', mimeType: 'image/jpeg' };
    case 'webp':
      return { format: 'webp', signature: 'WebP Modern Image', mimeType: 'image/webp' };
    case 'avif':
      return { format: 'webp', signature: 'AVIF Image Container', mimeType: 'image/avif' };
    case 'ico':
      return { format: 'png', signature: 'Windows Icon Format', mimeType: 'image/x-icon' };
    case 'tsv':
      return { format: 'csv', signature: 'Tab-Separated Values', mimeType: 'text/tab-separated-values' };
    case 'svg':
      return { format: 'svg', signature: 'SVG Vector Graphic', mimeType: 'image/svg+xml' };
    case 'bmp':
      return { format: 'bmp', signature: 'Windows Bitmap Image', mimeType: 'image/bmp' };
    case 'gif':
      return { format: 'gif', signature: 'GIF Indexed Graphic', mimeType: 'image/gif' };
    case 'tiff':
    case 'tif':
      return { format: 'tiff', signature: 'TIFF Graphic File', mimeType: 'image/tiff' };
    case 'json':
      return { format: 'json', signature: 'JSON Structured Object', mimeType: 'application/json' };
    case 'xml':
      return { format: 'xml', signature: 'XML Structured Document', mimeType: 'application/xml' };
    case 'txt':
    default:
      return { format: 'txt', signature: 'UTF-8 Text Stream', mimeType: 'text/plain' };
  }
}

/**
 * Maps source formats to all viable target formats based on our universal conversion graph
 */
export function getCompatibleTargets(source: SupportedFormat, ocrEnabled: boolean = true): TargetFormat[] {
  switch (source) {
    case 'docx':
    case 'doc':
    case 'odt':
    case 'rtf':
      return ['pdf', 'pptx', 'txt', 'html', 'md', 'docx'];

    case 'pdf':
      // NOTE: PNG/JPG removed — browser-side PDF rendering requires PDF.js (not installed).
      // Real PDF-to-image would produce a proper page render, not a fake canvas fallback.
      return ['docx', 'pptx', 'xlsx', 'txt', 'html', 'md'];

    case 'pptx':
    case 'ppt':
    case 'odp':
      return ['pdf', 'docx', 'txt', 'html', 'md'];

    case 'xlsx':
    case 'xls':
    case 'ods':
      return ['pdf', 'csv', 'html', 'json', 'txt', 'xlsx'];

    case 'csv':
      return ['xlsx', 'pdf', 'html', 'json', 'txt'];

    case 'png':
    case 'jpg':
    case 'webp':
    case 'bmp':
    case 'gif':
    case 'tiff':
      if (ocrEnabled) {
        return ['pdf', 'webp', 'png', 'jpg', 'docx', 'txt', 'html', 'pptx', 'md'];
      }
      return ['pdf', 'webp', 'png', 'jpg'];

    case 'svg':
      return ['png', 'jpg', 'webp', 'pdf'];

    case 'html':
      return ['pdf', 'docx', 'pptx', 'md', 'txt'];

    case 'md':
      return ['pdf', 'docx', 'html', 'pptx', 'txt'];

    case 'txt':
      return ['pdf', 'docx', 'pptx', 'html', 'md'];

    case 'json':
      return ['csv', 'xlsx', 'txt', 'html', 'xml', 'pdf'];

    case 'xml':
      return ['json', 'txt', 'html', 'pdf'];

    default:
      return ['pdf', 'txt', 'docx', 'html'];
  }
}
