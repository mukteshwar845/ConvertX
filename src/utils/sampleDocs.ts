import { createDocxFromContent } from './docxGenerator';

/**
 * Creates pre-packaged sample files to let users test batch conversion right away
 */
export async function createSampleDocxFile(): Promise<File> {
  const sections = [
    {
      type: 'heading1' as const,
      text: 'Executive Project Summary',
    },
    {
      type: 'paragraph' as const,
      text: 'DocuConvert provides enterprise-grade document conversion maintaining full formatting integrity across DOCX, PDF, and PowerPoint formats with end-to-end client encryption.',
      bold: false,
    },
    {
      type: 'heading2' as const,
      text: 'Key Capabilities & Technical Highlights',
    },
    {
      type: 'bullet' as const,
      text: 'Batch processing engine capable of concurrent multi-format conversions.',
      bold: true,
    },
    {
      type: 'bullet' as const,
      text: 'Preservation of font styling, headings, tables, and nested bullet structures.',
    },
    {
      type: 'bullet' as const,
      text: 'Web Crypto API AES-256-GCM zero-knowledge client encryption before cloud sync.',
    },
    {
      type: 'bullet' as const,
      text: 'Cross-device cloud synchronization supporting iOS, Android, and Desktop.',
    },
    {
      type: 'heading2' as const,
      text: 'Deployment & Compliance',
    },
    {
      type: 'paragraph' as const,
      text: 'All conversion happens directly in high-performance WebAssembly and client pipelines, ensuring total document confidentiality and zero data leakage.',
      italic: true,
    },
  ];

  const blob = await createDocxFromContent('Annual Report & Technical Roadmap', sections);
  return new File([blob], 'Annual_Report_2026.docx', {
    type: 'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
  });
}

export function createSampleTxtFile(): File {
  const content = `# Project Architecture Overview

## 1. System Goals
DocuConvert enables zero-latency document transformations across multiple platforms.

## 2. Security Guarantees
- End-to-End Encryption with AES-256-GCM
- SHA-256 cryptographic verification checksums
- Cloud synchronization with zero-knowledge rooms

## 3. Supported Workflows
1. DOCX to PDF (Preserving typography and structure)
2. DOCX to PPTX (Automated slide creation)
3. Batch ZIP downloads for bulk conversions`;

  const blob = new Blob([content], { type: 'text/markdown;charset=utf-8' });
  return new File([blob], 'System_Architecture.md', { type: 'text/markdown' });
}

export function createSampleImageFile(): Promise<File> {
  return new Promise((resolve) => {
    const canvas = document.createElement('canvas');
    canvas.width = 800;
    canvas.height = 600;
    const ctx = canvas.getContext('2d');
    if (ctx) {
      // Draw modern gradient banner
      const grad = ctx.createLinearGradient(0, 0, 800, 600);
      grad.addColorStop(0, '#1e293b');
      grad.addColorStop(1, '#0f172a');
      ctx.fillStyle = grad;
      ctx.fillRect(0, 0, 800, 600);

      // Card
      ctx.fillStyle = '#ffffff';
      ctx.roundRect ? ctx.roundRect(80, 80, 640, 440, 24) : ctx.fillRect(80, 80, 640, 440);
      ctx.fill();

      // Title text
      ctx.fillStyle = '#1e3a8a';
      ctx.font = 'bold 36px Arial';
      ctx.fillText('DocuConvert Visual Asset', 120, 180);

      // Subtitle
      ctx.fillStyle = '#64748b';
      ctx.font = '20px Arial';
      ctx.fillText('Sample image ready for instant high-res PDF generation', 120, 230);

      // Accent pill
      ctx.fillStyle = '#2563eb';
      ctx.roundRect ? ctx.roundRect(120, 280, 260, 50, 25) : ctx.fillRect(120, 280, 260, 50);
      ctx.fill();

      ctx.fillStyle = '#ffffff';
      ctx.font = 'bold 18px Arial';
      ctx.fillText('Direct Conversion Ready', 140, 312);
    }

    canvas.toBlob((blob) => {
      resolve(new File([blob!], 'Presentation_Slide.png', { type: 'image/png' }));
    }, 'image/png');
  });
}
