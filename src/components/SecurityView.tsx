import React, { useState } from 'react';
import {
  ShieldCheck,
  Key,
  Lock,
  Unlock,
  Copy,
  Check,
  RefreshCw,
  Eye,
  EyeOff,
  CheckCircle2,
  FileCode,
  Fingerprint,
} from 'lucide-react';
import { generateDefaultPassphrase, encryptBuffer, decryptBuffer } from '../utils/crypto';

interface SecurityViewProps {
  passphrase: string;
  onPassphraseChange: (newPass: string) => void;
}

export const SecurityView: React.FC<SecurityViewProps> = ({
  passphrase,
  onPassphraseChange,
}) => {
  const [showPass, setShowPass] = useState(false);
  const [copied, setCopied] = useState(false);
  const [inputPass, setInputPass] = useState(passphrase);
  const [testText, setTestText] = useState('Secret document text for cryptographic validation');
  const [testCipher, setTestCipher] = useState<string>('');
  const [testStatus, setTestStatus] = useState<string>('');
  const [isTesting, setIsTesting] = useState(false);

  const handleCopy = () => {
    navigator.clipboard.writeText(passphrase);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleGenerateKey = () => {
    const fresh = generateDefaultPassphrase();
    setInputPass(fresh);
    onPassphraseChange(fresh);
  };

  const handleSavePass = (e: React.FormEvent) => {
    e.preventDefault();
    if (inputPass.trim()) {
      onPassphraseChange(inputPass.trim());
    }
  };

  const runCryptoSelfTest = async () => {
    try {
      setIsTesting(true);
      setTestStatus('Executing PBKDF2 key derivation (100,000 iterations)...');
      const encoder = new TextEncoder();
      const rawBuffer = encoder.encode(testText).buffer;

      const encResult = await encryptBuffer(rawBuffer, passphrase);
      setTestCipher(encResult.ciphertextBase64.slice(0, 48) + '...');
      setTestStatus('AES-256-GCM Encrypted. Now testing zero-loss decryption...');

      const decBuffer = await decryptBuffer(
        encResult.ciphertextBase64,
        encResult.ivBase64,
        encResult.saltBase64,
        passphrase
      );
      const decoder = new TextDecoder();
      const roundtripText = decoder.decode(decBuffer);

      if (roundtripText === testText) {
        setTestStatus(`Decryption successful! Cryptographic SHA-256 hash: ${encResult.checksum}`);
      } else {
        setTestStatus('Decryption mismatch error');
      }
    } catch (err: any) {
      setTestStatus(`Encryption error: ${err.message}`);
    } finally {
      setIsTesting(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Title */}
      <div>
        <h2 className="text-xl font-bold tracking-tight text-slate-900 dark:text-white flex items-center gap-2">
          <ShieldCheck className="h-5 w-5 text-emerald-500" />
          End-to-End Encryption & Privacy Vault
        </h2>
        <p className="mt-1 text-xs text-slate-500 dark:text-slate-400">
          All document processing and synchronization utilizes military-grade Web Crypto AES-256-GCM with zero-knowledge keys.
        </p>
      </div>

      {/* Security Architecture Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="rounded-xl border border-slate-200 bg-white p-4 dark:border-slate-800 dark:bg-slate-900">
          <div className="flex items-center gap-2 text-emerald-600 dark:text-emerald-400">
            <Lock className="h-4 w-4" />
            <span className="text-xs font-bold uppercase">Cipher Algorithm</span>
          </div>
          <div className="mt-2 font-mono text-base font-bold text-slate-900 dark:text-white">
            AES-256-GCM
          </div>
          <p className="mt-1 text-[11px] text-slate-500 dark:text-slate-400">
            Galois/Counter Mode with 128-bit authentication tag protecting against tampering.
          </p>
        </div>

        <div className="rounded-xl border border-slate-200 bg-white p-4 dark:border-slate-800 dark:bg-slate-900">
          <div className="flex items-center gap-2 text-blue-600 dark:text-blue-400">
            <Key className="h-4 w-4" />
            <span className="text-xs font-bold uppercase">Key Derivation</span>
          </div>
          <div className="mt-2 font-mono text-base font-bold text-slate-900 dark:text-white">
            PBKDF2 / SHA-256
          </div>
          <p className="mt-1 text-[11px] text-slate-500 dark:text-slate-400">
            100,000 hashing rounds with 128-bit cryptographic salt preventing rainbow-table attacks.
          </p>
        </div>

        <div className="rounded-xl border border-slate-200 bg-white p-4 dark:border-slate-800 dark:bg-slate-900">
          <div className="flex items-center gap-2 text-purple-600 dark:text-purple-400">
            <Fingerprint className="h-4 w-4" />
            <span className="text-xs font-bold uppercase">Integrity Verification</span>
          </div>
          <div className="mt-2 font-mono text-base font-bold text-slate-900 dark:text-white">
            SHA-256 Digest
          </div>
          <p className="mt-1 text-[11px] text-slate-500 dark:text-slate-400">
            Every converted document generates a tamper-evident cryptographic fingerprint.
          </p>
        </div>
      </div>

      {/* Master Passphrase Manager */}
      <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-xs dark:border-slate-800 dark:bg-slate-900">
        <h3 className="text-sm font-bold text-slate-900 dark:text-white flex items-center gap-2">
          <Key className="h-4 w-4 text-blue-600 dark:text-blue-400" />
          Master Client Encryption Key
        </h3>
        <p className="mt-1 text-xs text-slate-500 dark:text-slate-400">
          This key never leaves your browser. Keep this passphrase to decrypt and sync your documents on another device.
        </p>

        <form onSubmit={handleSavePass} className="mt-4 space-y-3">
          <div className="relative">
            <input
              type={showPass ? 'text' : 'password'}
              value={inputPass}
              onChange={(e) => setInputPass(e.target.value)}
              className="w-full rounded-xl border border-slate-300 bg-slate-50 p-3 pr-24 font-mono text-xs font-bold text-slate-900 focus:border-blue-500 focus:bg-white focus:outline-none dark:border-slate-700 dark:bg-slate-800 dark:text-white"
            />
            <div className="absolute right-2 top-1/2 -translate-y-1/2 flex items-center gap-1">
              <button
                type="button"
                onClick={() => setShowPass(!showPass)}
                className="rounded-lg p-1.5 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200"
                title={showPass ? 'Hide' : 'Show'}
              >
                {showPass ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
              </button>
              <button
                type="button"
                onClick={handleCopy}
                className="flex items-center gap-1 rounded-lg bg-slate-200 px-2 py-1 text-xs font-semibold text-slate-700 hover:bg-slate-300 dark:bg-slate-700 dark:text-slate-200 dark:hover:bg-slate-600 transition"
              >
                {copied ? <Check className="h-3 w-3" /> : <Copy className="h-3 w-3" />}
                <span>{copied ? 'Copied' : 'Copy'}</span>
              </button>
            </div>
          </div>

          <div className="flex flex-wrap items-center justify-between gap-2 pt-1">
            <button
              type="button"
              onClick={handleGenerateKey}
              className="flex items-center gap-1.5 text-xs font-semibold text-blue-600 hover:text-blue-700 dark:text-blue-400"
            >
              <RefreshCw className="h-3.5 w-3.5" />
              Generate High-Entropy Key
            </button>

            <button
              type="submit"
              className="rounded-lg bg-blue-600 px-4 py-2 text-xs font-bold text-white shadow-xs hover:bg-blue-700 transition"
            >
              Update Encryption Key
            </button>
          </div>
        </form>
      </div>

      {/* Live Cryptographic Verification Tool */}
      <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-xs dark:border-slate-800 dark:bg-slate-900">
        <h3 className="text-sm font-bold text-slate-900 dark:text-white flex items-center gap-2">
          <FileCode className="h-4 w-4 text-purple-600 dark:text-purple-400" />
          Live Cryptographic Integrity Validator
        </h3>
        <p className="mt-1 text-xs text-slate-500 dark:text-slate-400">
          Verify real-time AES-256-GCM encryption, decryption, and SHA-256 hashing directly in your browser.
        </p>

        <div className="mt-4 space-y-3">
          <div>
            <label className="text-xs font-semibold text-slate-700 dark:text-slate-300">
              Input Text Payload:
            </label>
            <input
              type="text"
              value={testText}
              onChange={(e) => setTestText(e.target.value)}
              className="mt-1 w-full rounded-lg border border-slate-300 bg-slate-50 px-3 py-1.5 text-xs text-slate-900 focus:border-blue-500 focus:outline-none dark:border-slate-700 dark:bg-slate-800 dark:text-white"
            />
          </div>

          <button
            type="button"
            onClick={runCryptoSelfTest}
            disabled={isTesting}
            className="flex items-center gap-1.5 rounded-lg bg-slate-900 px-3 py-1.5 text-xs font-bold text-white hover:bg-slate-800 dark:bg-slate-800 dark:hover:bg-slate-700 transition"
          >
            <ShieldCheck className="h-3.5 w-3.5 text-emerald-400" />
            {isTesting ? 'Validating...' : 'Run Cryptographic Test'}
          </button>

          {testStatus && (
            <div className="rounded-xl bg-slate-100 p-3 text-xs font-mono text-slate-800 dark:bg-slate-800/80 dark:text-slate-200">
              <p className="font-semibold text-emerald-600 dark:text-emerald-400">{testStatus}</p>
              {testCipher && <p className="mt-1 text-[11px] text-slate-500">Sample Ciphertext: {testCipher}</p>}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
