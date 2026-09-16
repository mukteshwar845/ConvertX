/**
 * downloadHelper.ts
 * 
 * Robust, cross-browser file download utility.
 * 
 * The core problem with naive download implementations:
 *   1. Creating an objectURL, clicking the link, then immediately revoking
 *      the URL or removing the DOM element can abort the download before
 *      the browser has queued the file — especially in Chromium and Firefox.
 *   2. Using a previously-revoked objectURL will silently fail (no download).
 * 
 * This helper solves both by:
 *   - Always creating a fresh objectURL from the blob
 *   - Keeping the anchor in the DOM just long enough (100ms) before cleanup
 *   - Revoking the objectURL only AFTER a safe delay (2s)
 */

/**
 * Triggers a browser file download for the given Blob.
 * @param blob - The file data to download
 * @param fileName - The suggested file name for the download
 */
export function triggerBlobDownload(blob: Blob, fileName: string): void {
  // Always create a fresh URL — never reuse a potentially revoked one
  const url = URL.createObjectURL(blob);

  const anchor = document.createElement('a');
  anchor.href = url;
  anchor.download = fileName;
  // Must be in the DOM for Firefox compatibility
  anchor.style.display = 'none';
  document.body.appendChild(anchor);

  try {
    anchor.click();
  } finally {
    // Give the browser 100ms to enqueue the download before removing the element
    setTimeout(() => {
      if (anchor.parentNode) {
        document.body.removeChild(anchor);
      }
      // Revoke after 2s — long enough for the browser to open the file
      setTimeout(() => URL.revokeObjectURL(url), 2000);
    }, 100);
  }
}

/** Alias for triggerBlobDownload */
export const downloadBlob = triggerBlobDownload;

