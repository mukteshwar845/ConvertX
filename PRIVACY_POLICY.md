# Privacy Policy & Legal Terms — ConvertX

**Effective Date:** September 16, 2026  
**Last Updated:** September 16, 2026  
**Repository:** [https://github.com/mukteshwar845/ConvertX](https://github.com/mukteshwar845/ConvertX)  
**Maintainer:** [mukteshwar845](https://github.com/mukteshwar845)  

---

## 1. Overview & Commitment to Privacy

At **ConvertX**, privacy is not an afterthought or an optional toggle — it is the fundamental architectural principle of the application. ConvertX was designed from the ground up to eliminate the security and privacy risks inherent in traditional online file conversion services that require users to upload confidential documents to remote cloud servers.

**Summary of Core Guarantees:**
- **Zero Server Uploads**: File transformations (DOCX, PDF, XLSX, PPTX, Images, ZIP) execute directly on your local device using client-side WebAssembly, HTML5 Canvas, and modern browser JavaScript engines.
- **Zero Document Retention**: We never see, log, store, analyze, copy, or retain your files, text, images, or metadata.
- **No Tracking or Analytics**: ConvertX does not employ third-party tracking cookies, advertising identifiers, session replay scripts, or invasive telemetry.
- **100% User Ownership**: You maintain complete and unencumbered ownership of all uploaded source files and converted outputs.

---

## 2. Information Processing & Data Handling

### 2.1 In-Browser File Conversions
All file format parsing, typography extraction, table reconstruction, image compression, format transcoding, and ZIP archiving are conducted within your browser's isolated memory sandbox:
- Files loaded via drag-and-drop or file pickers are read as in-memory `Blob` and `ArrayBuffer` objects.
- Converted files are generated as temporary `blob:` URLs accessible only within your active browser tab.
- Once you refresh the page or clear your conversion queue, all in-memory file buffers are permanently discarded by your browser's garbage collector.

### 2.2 Local Storage (`localStorage`)
ConvertX uses your browser's built-in `localStorage` strictly for your convenience:
- **Theme Preference (`docuconvert_theme`)**: Remembers whether you selected Light Mode or Dark Mode (`"light"` or `"dark"`).
- **Conversion History (`docuconvert_history`)**: Stores metadata (file name, format, date, file size, quality score) of files you converted so you can review your history and download files during your session.
- **User Control**: You can clear all local history at any time by clicking the **"Clear All"** button in the History tab, or by clearing your browser site data.

### 2.3 Optical Character Recognition (OCR) Service
For scanned paper documents or image-only PDFs where local text extraction is impossible, ConvertX provides an optional Optical Character Recognition (OCR) toggle:
- When OCR is explicitly enabled by the user, image frames are processed via an API endpoint for optical text transcription.
- OCR data is processed in-flight solely for real-time text extraction and is **never saved, archived, logged to persistent databases, or used for model training**.
- If OCR is toggled off, 100% of processing remains strictly local to your machine.

---

## 3. Intellectual Property Rights

- **Your Content**: ConvertX makes no claim to intellectual property, copyright, or ownership over any documents, images, text, spreadsheets, or code processed through the service.
- **Converted Artifacts**: All converted output files are solely your property.
- **Software License**: The ConvertX codebase is open-source software distributed under the permissive [MIT License](LICENSE).

---

## 4. Security Architecture

ConvertX implements modern web security best practices:
- **Content Security**: Protective HTTP security headers (`X-Content-Type-Options: nosniff`, `X-Frame-Options: SAMEORIGIN`, `X-XSS-Protection: 1; mode=block`, strict referrer policy).
- **Sanitization**: Extracted HTML is strictly sanitized using `DOMPurify` to defend against Cross-Site Scripting (XSS) in malicious document payloads.
- **Zero Network Transmission**: File blobs are never sent to external servers during standard conversions.

---

## 5. Disclaimer of Warranties & Limitation of Liability

ConvertX is provided on an **"AS IS"** and **"AS AVAILABLE"** basis without warranties of any kind, whether express, implied, statutory, or otherwise, including but not limited to the implied warranties of merchantability, fitness for a particular purpose, and non-infringement.

While ConvertX strives to maintain maximum fidelity across all file formats, formatting nuances across disparate document software may occasionally result in visual differences. Users are advised to review converted outputs before using them in mission-critical, legal, or financial scenarios. In no event shall the authors, maintainers, or copyright holders be liable for any direct, indirect, incidental, special, consequential, or exemplary damages.

---

## 6. Children's Privacy

ConvertX does not knowingly collect, store, or solicit personal information from children under the age of 13. Since no personal information or account registration is required to use ConvertX, the service is safe for general audiences.

---

## 7. Changes to This Privacy Policy

We may update this Privacy Policy from time to time to reflect new features or regulatory requirements. Any modifications will be posted directly to this repository with an updated effective date.

---

## 8. Contact & Inquiries

If you have questions, feedback, or security inquiries regarding this Privacy Policy or ConvertX, please open an issue on the official GitHub repository:
- **GitHub Issues**: [https://github.com/mukteshwar845/ConvertX/issues](https://github.com/mukteshwar845/ConvertX/issues)
- **Maintainer Profile**: [https://github.com/mukteshwar845](https://github.com/mukteshwar845)
