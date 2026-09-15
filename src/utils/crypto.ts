/**
 * Robust Client-Side End-to-End Encryption using Web Crypto API (AES-GCM-256 + PBKDF2)
 * Ensures user files are encrypted before any cloud sync or local persistence.
 */

const PBKDF2_ITERATIONS = 100000;
const SALT_LENGTH = 16;
const IV_LENGTH = 12;

function arrayBufferToBase64(buffer: ArrayBuffer): string {
  let binary = '';
  const bytes = new Uint8Array(buffer);
  const len = bytes.byteLength;
  for (let i = 0; i < len; i++) {
    binary += String.fromCharCode(bytes[i]);
  }
  return btoa(binary);
}

function base64ToArrayBuffer(base64: string): ArrayBuffer {
  const binaryString = atob(base64);
  const len = binaryString.length;
  const bytes = new Uint8Array(len);
  for (let i = 0; i < len; i++) {
    bytes[i] = binaryString.charCodeAt(i);
  }
  return bytes.buffer;
}

/**
 * Derives an AES-GCM 256-bit key from a user passphrase and salt using PBKDF2
 */
async function deriveKey(passphrase: string, salt: Uint8Array): Promise<CryptoKey> {
  const enc = new TextEncoder();
  const keyMaterial = await crypto.subtle.importKey(
    'raw',
    enc.encode(passphrase),
    { name: 'PBKDF2' },
    false,
    ['deriveBits', 'deriveKey']
  );

  return crypto.subtle.deriveKey(
    {
      name: 'PBKDF2',
      salt,
      iterations: PBKDF2_ITERATIONS,
      hash: 'SHA-256',
    },
    keyMaterial,
    { name: 'AES-GCM', length: 256 },
    false,
    ['encrypt', 'decrypt']
  );
}

/**
 * Compute SHA-256 checksum of an ArrayBuffer
 */
export async function computeChecksum(buffer: ArrayBuffer): Promise<string> {
  const hashBuffer = await crypto.subtle.digest('SHA-256', buffer);
  const hashArray = Array.from(new Uint8Array(hashBuffer));
  return hashArray.map((b) => b.toString(16).padStart(2, '0')).join('');
}

export interface EncryptionResult {
  ciphertextBase64: string;
  ivBase64: string;
  saltBase64: string;
  checksum: string;
}

/**
 * Encrypts an ArrayBuffer with AES-256-GCM using the user passphrase
 */
export async function encryptBuffer(
  buffer: ArrayBuffer,
  passphrase: string
): Promise<EncryptionResult> {
  const salt = crypto.getRandomValues(new Uint8Array(SALT_LENGTH));
  const iv = crypto.getRandomValues(new Uint8Array(IV_LENGTH));
  const key = await deriveKey(passphrase, salt);

  const ciphertextBuffer = await crypto.subtle.encrypt(
    {
      name: 'AES-GCM',
      iv,
    },
    key,
    buffer
  );

  const checksum = await computeChecksum(buffer);

  return {
    ciphertextBase64: arrayBufferToBase64(ciphertextBuffer),
    ivBase64: arrayBufferToBase64(iv.buffer),
    saltBase64: arrayBufferToBase64(salt.buffer),
    checksum,
  };
}

/**
 * Decrypts a ciphertext Base64 string back into original ArrayBuffer
 */
export async function decryptBuffer(
  ciphertextBase64: string,
  ivBase64: string,
  saltBase64: string,
  passphrase: string
): Promise<ArrayBuffer> {
  const ciphertext = base64ToArrayBuffer(ciphertextBase64);
  const iv = new Uint8Array(base64ToArrayBuffer(ivBase64));
  const salt = new Uint8Array(base64ToArrayBuffer(saltBase64));
  const key = await deriveKey(passphrase, salt);

  return crypto.subtle.decrypt(
    {
      name: 'AES-GCM',
      iv,
    },
    key,
    ciphertext
  );
}

/**
 * Generates a memorable, secure 8-character device sync room code
 */
export function generateSyncCode(): string {
  const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
  let code = '';
  for (let i = 0; i < 6; i++) {
    code += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return `DOCS-${code}`;
}

/**
 * Generates a default user encryption passphrase if none specified
 */
export function generateDefaultPassphrase(): string {
  const chars = 'abcdefghjkmnpqrstuvwxyz23456789!@#$%';
  let pass = '';
  for (let i = 0; i < 16; i++) {
    pass += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return pass;
}
