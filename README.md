# ConvertX 🚀

<div align="center">

![ConvertX Logo](public/icon.svg)

### Universal High-Fidelity Document Converter, File Compressor & ZIP Archiver

[![React](https://img.shields.io/badge/React-19.0-blue?style=for-the-badge&logo=react)](https://react.dev/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.8-3178c6?style=for-the-badge&logo=typescript)](https://www.typescriptlang.org/)
[![Vite](https://img.shields.io/badge/Vite-6.2-646CFF?style=for-the-badge&logo=vite)](https://vitejs.dev/)
[![TailwindCSS](https://img.shields.io/badge/TailwindCSS-v4.1-38B2AC?style=for-the-badge&logo=tailwind-css)](https://tailwindcss.com/)
[![License: MIT](https://img.shields.io/badge/License-MIT-green.svg?style=for-the-badge)](LICENSE)
[![PRs Welcome](https://img.shields.io/badge/PRs-welcome-brightgreen.svg?style=for-the-badge)](CONTRIBUTING.md)

</div>

---

**ConvertX** is a modern, privacy-first web application designed for non-technical users and professionals alike. Convert, compress, and archive files effortlessly without uploading your documents to third-party servers. Everything runs with high fidelity directly inside your browser.

---

## 🌟 Key Features

### 1. 📄 Dedicated Document & File Converter
- **Verbatim High-Fidelity Output**: Converts documents without altering fonts, paragraph alignments, headings, bullet lists, or tables.
- **Supported Document Formats**:
  - **Text & Word**: DOCX, PDF, RTF, TXT, HTML, Markdown (`.md`), ODT.
  - **Spreadsheets**: XLSX, XLS, CSV, ODS, JSON, PDF tables.
  - **Presentations**: PPTX, PPT, ODP, PDF slides.
- **Batch Processing**: Convert dozens of documents concurrently with 1-click execution and instant ZIP downloads.
- **Visual Previews**: Review source and converted documents before saving.

### 2. 🖼️ Dedicated Image Converter & Compressor
- **Universal Picture Conversion**: Convert photos and graphics between **PNG, JPG, WEBP, PDF, SVG, BMP, and GIF**.
- **Visual Thumbnail Previews**: Real-time image previews directly in conversion cards with dimensions (e.g. `1920 × 1080 px`).
- **Adjustable Quality & Resolution**:
  - Quality slider from 20% to 100% with real-time compression indicators.
  - Resolution presets: **Original Dimensions**, **4K Ultra HD**, **1080p Full HD**, or **720p HD**.
  - File size reduction tracking (e.g. `-98% smaller` with WebP encoding).
- **Batch Image Compression**: Convert entire photo collections and save all in a single compressed ZIP file.

### 3. 🗜️ Dedicated File & Document Compressor
- **Multi-Format In-Browser Compression**: Drastically reduce the file size of images, PDFs, Word docs (`.docx`), Excel sheets (`.xlsx`), PowerPoint decks (`.pptx`), and text files directly in the browser.
- **Three Clear Presets for Non-Tech Users**:
  - **Light (-25%)**: Retains maximum quality; great for minor storage optimization.
  - **Balanced (Optimal ~50–70%)**: The sweet spot for sharing over Slack, Teams, or WhatsApp with crisp visual fidelity.
  - **Extreme (-85%)**: Maximizes compression for strict portal uploads and email attachment limits (e.g. under 2MB).
- **Savings Tracker**: Visual badges show exact bytes saved and reduction percentage (e.g., `-76% smaller`).
- **Batch Download**: Compress multiple files at once and download them individually or bundled into a single ZIP.

### 4. 📦 Instant ZIP Archiver & Directory Compressor
- Compress multiple files or **entire directory folders** (`webkitdirectory`) with hierarchical folder preservation.
- Configurable compression levels: **Store (0% - Instant)**, **Fast (30%)**, **Balanced (60%)**, or **Maximum (90%)**.
- Client-side compression powered by `JSZip` — fast, memory-safe, and private.

### 5. 👁️ Optical Character Recognition (OCR)
- Read and extract legible text from scanned paper documents, screenshots, and image-only PDFs.
- Preserves titles, numbered lists, bullet points, and data tables cleanly formatted into Markdown or Word documents.

### 6. 🌗 Day & Night Theme Toggle
- Curated, eye-friendly light mode and deep slate dark mode.
- Synchronized automatically with system OS color scheme preferences or toggled manually in the navigation bar.

### 7. 🔒 100% Client-Side Privacy
- Your private documents, financial sheets, and sensitive photos never leave your device.
- All file transformations are computed locally using WebAssembly and modern browser APIs.

---

## 📊 Supported Format Matrix

| Category | Supported Input Formats | Primary Output Targets |
| :--- | :--- | :--- |
| **Documents** | `.docx`, `.doc`, `.pdf`, `.odt`, `.rtf`, `.txt`, `.html`, `.md` | PDF, DOCX, PPTX, TXT, HTML, MD |
| **Spreadsheets** | `.xlsx`, `.xls`, `.csv`, `.ods` | CSV, XLSX, PDF Grid, JSON, HTML Table |
| **Presentations** | `.pptx`, `.ppt`, `.odp` | PDF Slides, PPTX, Images |
| **Images** | `.png`, `.jpg`, `.jpeg`, `.webp`, `.svg`, `.bmp`, `.gif`, `.tiff` | PNG, JPG, WEBP, SVG, PDF |
| **Data & Code** | `.json`, `.xml`, `.csv`, `.md` | PDF, TXT, CSV, JSON, HTML |
| **Archives** | Any file or folder hierarchy | `.zip` (with folder structure preserved) |

---

## 🛠️ Tech Stack

- **Frontend Framework**: [React 19](https://react.dev/) + [TypeScript](https://www.typescriptlang.org/)
- **Build Tool**: [Vite 6](https://vitejs.dev/) with Fast Refresh & ESM chunking
- **Styling**: [TailwindCSS v4](https://tailwindcss.com/) with native `@custom-variant dark` support
- **Icons**: [Lucide React](https://lucide.dev/)
- **Document Engines**:
  - [jsPDF](https://github.com/parallax/jsPDF) (Vector PDF generation)
  - [Mammoth.js](https://github.com/mwilliamson/mammoth.js) (DOCX parsing & semantic HTML conversion)
  - [SheetJS (XLSX)](https://sheetjs.com/) (Spreadsheet parsing & conversion)
  - [JSZip](https://stuk.github.io/jszip/) (OpenXML packaging & ZIP archive generation)
  - [PptxGenJS](https://gitbrent.github.io/PptxGenJS/) (PowerPoint presentation generation)
- **Backend / Dev Server**: [Express](https://expressjs.com/) + [TypeScript Execute (tsx)](https://github.com/privatenumber/tsx)

---

## 🚀 Getting Started

### Prerequisites

Ensure you have [Node.js](https://nodejs.org/) (version 18 or higher) and [npm](https://www.npmjs.com/) installed on your machine.

### Installation

1. **Clone the repository**:
   ```bash
   git clone https://github.com/mukteshwar845/ConvertX.git
   cd ConvertX
   ```

2. **Install dependencies**:
   ```bash
   npm install
   ```

3. **Start the local development server**:
   ```bash
   npm run dev
   ```

4. **Open in browser**:
   Navigate to [http://localhost:3000](http://localhost:3000) to use ConvertX.

---

## 🧪 Testing & Production Build

- **Typecheck & Linting**:
  ```bash
  npm run lint
  ```

- **Run Automated Test Suite**:
  ```bash
  npx tsx tests/full_system_test.ts
  ```

- **Compile Production Bundle**:
  ```bash
  npm run build
  ```

- **Run Production Server**:
  ```bash
  npm start
  ```

---

## 📁 Project Structure

```text
ConvertX/
├── public/
│   ├── icon.svg                 # Application logo
│   └── manifest.webmanifest     # PWA manifest
├── src/
│   ├── components/
│   │   ├── BatchUploader.tsx    # Drag-and-drop zone & sample buttons
│   │   ├── ConversionCard.tsx   # Individual file card & format selectors
│   │   ├── FileCompareView.tsx  # Side-by-side document comparator
│   │   ├── HistoryView.tsx      # Conversion history and download manager
│   │   ├── Navbar.tsx           # Brand header, tabs, and Day/Night toggle
│   │   ├── PreviewModal.tsx     # Fullscreen document preview & comparison modal
│   │   ├── PWAInstallModal.tsx  # PWA installation instructions
│   │   ├── Toast.tsx            # Non-intrusive in-app notifications
│   │   └── ZipCreatorView.tsx   # ZIP folder & file compression workbench
│   ├── utils/
│   │   ├── conversionEngine.ts  # Universal conversion orchestrator & PDF renderer
│   │   ├── documentParser.ts    # DOM parser for HTML, DOCX, and text
│   │   ├── docxGenerator.ts     # OpenXML ZIP / DOCX structure generator
│   │   ├── fidelityEngine.ts    # Similarity scoring & quality validation
│   │   ├── fileDetector.ts      # Magic-byte MIME & format detector
│   │   ├── formatVisuals.tsx    # Format color themes and badge assets
│   │   ├── imageConverter.ts    # Canvas-based raster/vector converter
│   │   ├── sampleDocs.ts        # Built-in sample test files
│   │   ├── spreadsheetEngine.ts # XLSX, CSV, and Table conversion engine
│   │   └── universalConverter.ts# File processing and format dispatch
│   ├── App.tsx                  # Main layout and tab state orchestration
│   ├── index.css                # Tailwind v4 theme styles and dark mode variants
│   ├── main.tsx                 # React DOM root entry
│   └── types.ts                 # Unified TypeScript interfaces
├── tests/
│   └── full_system_test.ts      # E2E format, OpenXML, XLSX & ZIP unit tests
├── index.html                   # HTML entry point
├── package.json                 # Project dependencies and npm scripts
├── server.ts                    # Express + Vite server with health & OCR endpoints
└── vite.config.ts               # Vite configuration with Tailwind v4 plugin
```

---

## 🛡️ Privacy & Security Commitments

ConvertX is committed to zero data retention:
- **No File Uploads**: Conversions happen client-side in your browser's V8 / JavaScript engine.
- **No Tracking or Third-Party Analytics**: Your converted files and search queries are stored solely in your local browser `localStorage` and never transmitted across the network.
- **Immediate Memory Cleanup**: File blobs and object URLs are revoked as soon as queues or history are cleared.
- **Full Legal Policy**: Read our comprehensive [Privacy Policy & Terms](PRIVACY_POLICY.md) for legal guarantees, intellectual property rights, and liability terms.

---

## 🤝 Contributing

Contributions, issues, and feature requests are welcome! Feel free to check out the [Issues](https://github.com/mukteshwar845/ConvertX/issues) page.

1. Fork the Project
2. Create your Feature Branch (`git checkout -b feature/AmazingFeature`)
3. Commit your Changes (`git commit -m 'feat: add some AmazingFeature'`)
4. Push to the Branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

---

## 📄 License

Distributed under the MIT License. See `LICENSE` for more information.

---

<div align="center">

Built with ❤️ by [mukteshwar845](https://github.com/mukteshwar845)

</div>
