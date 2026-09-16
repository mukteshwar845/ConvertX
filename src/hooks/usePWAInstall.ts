import { useState, useEffect, useCallback } from 'react';

export interface PWAInstallState {
  isStandalone: boolean;
  canPromptNativeInstall: boolean;
  isIOS: boolean;
  isDismissed: boolean;
  showModal: boolean;
  setShowModal: (show: boolean) => void;
  promptInstall: () => Promise<boolean>;
  dismissBanner: () => void;
  resetDismissed: () => void;
}

const DISMISS_KEY = 'convertx_pwa_install_dismissed';

export function usePWAInstall(): PWAInstallState {
  const [deferredPrompt, setDeferredPrompt] = useState<any>(null);
  const [isStandalone, setIsStandalone] = useState(false);
  const [isIOS, setIsIOS] = useState(false);
  const [isDismissed, setIsDismissed] = useState(false);
  const [showModal, setShowModal] = useState(false);

  // 1. Detect Standalone Mode and iOS device
  useEffect(() => {
    if (typeof window === 'undefined') return;

    // Standalone detection
    const checkStandalone = () => {
      const isStandaloneMedia = window.matchMedia('(display-mode: standalone)').matches;
      const isStandaloneNavigator = (navigator as any).standalone === true;
      const isAndroidApp = document.referrer.includes('android-app://');
      return isStandaloneMedia || isStandaloneNavigator || isAndroidApp;
    };

    setIsStandalone(checkStandalone());

    const mediaQuery = window.matchMedia('(display-mode: standalone)');
    const handleMediaChange = (e: MediaQueryListEvent) => {
      setIsStandalone(e.matches);
    };

    mediaQuery.addEventListener('change', handleMediaChange);

    // iOS detection
    const ua = navigator.userAgent.toLowerCase();
    const isIOSDevice = /iphone|ipad|ipod/.test(ua) && !(window as any).MSStream;
    setIsIOS(isIOSDevice);

    // Dismissed state
    try {
      const dismissed = localStorage.getItem(DISMISS_KEY) === 'true';
      setIsDismissed(dismissed);
    } catch {
      // Ignore localStorage errors
    }

    // 2. Capture native beforeinstallprompt event (Chromium / Android)
    const handleBeforeInstallPrompt = (e: Event) => {
      e.preventDefault();
      setDeferredPrompt(e);
    };

    const handleAppInstalled = () => {
      setIsStandalone(true);
      setDeferredPrompt(null);
      setShowModal(false);
      console.log('[PWA] ConvertX installed successfully');
    };

    window.addEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
    window.addEventListener('appinstalled', handleAppInstalled);

    return () => {
      mediaQuery.removeEventListener('change', handleMediaChange);
      window.removeEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
      window.removeEventListener('appinstalled', handleAppInstalled);
    };
  }, []);

  // 3. Trigger native install prompt
  const promptInstall = useCallback(async (): Promise<boolean> => {
    if (!deferredPrompt) {
      // Fallback: open instruction modal
      setShowModal(true);
      return false;
    }

    try {
      deferredPrompt.prompt();
      const choiceResult = await deferredPrompt.userChoice;
      if (choiceResult.outcome === 'accepted') {
        setDeferredPrompt(null);
        setShowModal(false);
        return true;
      }
    } catch (err) {
      console.warn('[PWA] Prompt error:', err);
    }
    return false;
  }, [deferredPrompt]);

  // 4. Dismiss banner
  const dismissBanner = useCallback(() => {
    setIsDismissed(true);
    try {
      localStorage.setItem(DISMISS_KEY, 'true');
    } catch {
      // Ignore localStorage errors
    }
  }, []);

  // 5. Reset dismissed (used e.g. from Settings or when user explicitly taps Install)
  const resetDismissed = useCallback(() => {
    setIsDismissed(false);
    try {
      localStorage.removeItem(DISMISS_KEY);
    } catch {
      // Ignore localStorage errors
    }
  }, []);

  return {
    isStandalone,
    canPromptNativeInstall: !!deferredPrompt,
    isIOS,
    isDismissed,
    showModal,
    setShowModal,
    promptInstall,
    dismissBanner,
    resetDismissed,
  };
}
