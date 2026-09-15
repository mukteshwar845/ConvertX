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

/**
 * Creates a sample scanned document image (simulating a paper document or invoice)
 */
export function createSampleScannedDocumentImage(): Promise<File> {
  return new Promise((resolve) => {
    const canvas = document.createElement('canvas');
    canvas.width = 900;
    canvas.height = 1200;
    const ctx = canvas.getContext('2d');
    if (ctx) {
      // Paper background with warm subtle scanned tint
      ctx.fillStyle = '#fbfcf8';
      ctx.fillRect(0, 0, 900, 1200);

      // Border frame
      ctx.strokeStyle = '#e2e8f0';
      ctx.lineWidth = 2;
      ctx.strokeRect(40, 40, 820, 1120);

      // Header Stamp / Badge
      ctx.fillStyle = '#1e293b';
      ctx.font = 'bold 28px Georgia, serif';
      ctx.fillText('INTERNAL AUDIT & DISCOVERY MEMORANDUM', 70, 110);

      ctx.fillStyle = '#475569';
      ctx.font = '16px monospace';
      ctx.fillText('DOC-REF: #SCAN-2026-X99   |   DATE: SEPTEMBER 15, 2026', 70, 145);
      ctx.fillText('CLASSIFICATION: CONFIDENTIAL   |   DEPT: SECURITY OPERATIONS', 70, 170);

      // Divider
      ctx.strokeStyle = '#0f172a';
      ctx.lineWidth = 1.5;
      ctx.beginPath();
      ctx.moveTo(70, 195);
      ctx.lineTo(830, 195);
      ctx.stroke();

      // Executive Summary section
      ctx.fillStyle = '#0f172a';
      ctx.font = 'bold 20px Georgia, serif';
      ctx.fillText('1. Executive Summary', 70, 240);

      ctx.fillStyle = '#334155';
      ctx.font = '16px "Times New Roman", serif';
      ctx.fillText('This document contains scanned legal and technical findings regarding the migration', 70, 275);
      ctx.fillText('to client-side encryption architectures. OCR extraction preserves document fidelity.', 70, 305);

      // Key Findings section
      ctx.fillStyle = '#0f172a';
      ctx.font = 'bold 20px Georgia, serif';
      ctx.fillText('2. Core Discoveries & Compliance Requirements', 70, 370);

      const bullets = [
        '• Zero data leakage confirmed through client-side AES-256-GCM encryption.',
        '• Optical Character Recognition (OCR) enables legacy scanned paper ingestion.',
        '• Cross-platform compatibility verified across desktop and mobile browsers.',
        '• Cryptographic SHA-256 verification ensures non-repudiation and byte integrity.',
      ];

      ctx.fillStyle = '#334155';
      ctx.font = '16px "Times New Roman", serif';
      bullets.forEach((b, i) => {
        ctx.fillText(b, 85, 410 + i * 36);
      });

      // Table representation
      ctx.fillStyle = '#0f172a';
      ctx.font = 'bold 20px Georgia, serif';
      ctx.fillText('3. Verification Status Matrix', 70, 580);

      // Table Header
      ctx.fillStyle = '#f1f5f9';
      ctx.fillRect(70, 605, 760, 35);
      ctx.strokeStyle = '#cbd5e1';
      ctx.strokeRect(70, 605, 760, 35);

      ctx.fillStyle = '#0f172a';
      ctx.font = 'bold 15px sans-serif';
      ctx.fillText('Module Name', 90, 628);
      ctx.fillText('Verification Status', 360, 628);
      ctx.fillText('Audit Result', 620, 628);

      const tableRows = [
        ['OCR Text Pipeline', 'OPERATIONAL', 'PASSED 100%'],
        ['Format Preservation', 'CERTIFIED', 'PASSED 100%'],
        ['Zero-Knowledge Sync', 'COMPLIANT', 'PASSED 100%'],
      ];

      tableRows.forEach((row, idx) => {
        const y = 640 + idx * 35;
        ctx.strokeStyle = '#e2e8f0';
        ctx.strokeRect(70, y, 760, 35);
        ctx.fillStyle = '#334155';
        ctx.font = '15px sans-serif';
        ctx.fillText(row[0], 90, y + 23);
        ctx.fillText(row[1], 360, y + 23);
        ctx.fillStyle = '#047857';
        ctx.fillText(row[2], 620, y + 23);
      });

      // Stamp
      ctx.save();
      ctx.translate(680, 840);
      ctx.rotate(-0.15);
      ctx.strokeStyle = '#dc2626';
      ctx.lineWidth = 3;
      ctx.strokeRect(-100, -35, 200, 70);
      ctx.fillStyle = '#dc2626';
      ctx.font = 'bold 18px sans-serif';
      ctx.textAlign = 'center';
      ctx.fillText('SCANNED & AUDITED', 0, -5);
      ctx.font = '12px monospace';
      ctx.fillText('OFFICIAL COPY', 0, 18);
      ctx.restore();
    }

    canvas.toBlob((blob) => {
      resolve(new File([blob!], 'Scanned_Memorandum_2026.png', { type: 'image/png' }));
    }, 'image/png');
  });
}

/**
 * Creates an image-based scanned PDF (contains ONLY an image layer, no text streams)
 * Ideal for testing the OCR extraction toggle!
 */
export async function createSampleScannedPdfFile(): Promise<File> {
  const imageFile = await createSampleScannedDocumentImage();
  const { jsPDF } = await import('jspdf');

  return new Promise((resolve) => {
    const reader = new FileReader();
    reader.onload = () => {
      const dataUrl = reader.result as string;
      const pdf = new jsPDF({
        orientation: 'portrait',
        unit: 'pt',
        format: 'a4',
      });

      const pageWidth = pdf.internal.pageSize.getWidth();
      const pageHeight = pdf.internal.pageSize.getHeight();

      // Insert purely as an image (simulating a physical scanned page with NO embedded font text)
      pdf.addImage(dataUrl, 'PNG', 0, 0, pageWidth, pageHeight, undefined, 'FAST');
      const pdfBlob = pdf.output('blob');

      resolve(
        new File([pdfBlob], 'Scanned_Audit_Report.pdf', {
          type: 'application/pdf',
        })
      );
    };
    reader.readAsDataURL(imageFile);
  });
}

export function createSampleCsvFile(): File {
  const csvContent = `Department,Q1 Revenue,Q2 Revenue,Growth,Status
Engineering,1250000,1420000,13.6%,Active
Product Management,850000,980000,15.3%,Active
Marketing & Growth,620000,710000,14.5%,Active
Design Systems,340000,390000,14.7%,Active
Customer Operations,450000,480000,6.7%,Active
Total / Aggregate,3510000,3980000,13.4%,Target Exceeded`;
  return new File([csvContent], 'Financial_Q2_Performance.csv', {
    type: 'text/csv;charset=utf-8',
  });
}

export function createSampleJsonFile(): File {
  const jsonContent = JSON.stringify(
    [
      { id: 'DOC-101', name: 'Global Compliance Spec', pages: 14, category: 'Legal', status: 'Approved' },
      { id: 'DOC-102', name: 'System Architecture v2', pages: 28, category: 'Engineering', status: 'In Review' },
      { id: 'DOC-103', name: 'Quarterly Financial Audit', pages: 42, category: 'Finance', status: 'Verified' },
    ],
    null,
    2
  );
  return new File([jsonContent], 'Inventory_Records.json', {
    type: 'application/json',
  });
}

