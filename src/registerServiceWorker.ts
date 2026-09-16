/**
 * Service Worker Registration & Lifecycle Management
 * Handles registration, update detection, and graceful user-triggered reload.
 */

type UpdateCallback = (applyUpdate: () => void) => void;

export function registerSW(onUpdateAvailable?: UpdateCallback): Promise<ServiceWorkerRegistration | null> {
  if (typeof window === 'undefined' || !('serviceWorker' in navigator)) {
    return Promise.resolve(null);
  }

  // Reload page when new service worker takes control
  let refreshing = false;
  navigator.serviceWorker.addEventListener('controllerchange', () => {
    if (!refreshing) {
      refreshing = true;
      window.location.reload();
    }
  });

  return navigator.serviceWorker
    .register('/sw.js', { scope: '/' })
    .then((registration) => {
      // 1. Check if there is already a waiting worker from a previous session
      if (registration.waiting) {
        notifyUpdate(registration.waiting, onUpdateAvailable);
        return registration;
      }

      // 2. Check for newly discovered updates
      registration.addEventListener('updatefound', () => {
        const installingWorker = registration.installing;
        if (!installingWorker) return;

        installingWorker.addEventListener('statechange', () => {
          if (
            installingWorker.state === 'installed' &&
            navigator.serviceWorker.controller
          ) {
            // New version is installed and waiting
            notifyUpdate(installingWorker, onUpdateAvailable);
          }
        });
      });

      // Periodically check for updates every 60 minutes
      setInterval(() => {
        registration.update().catch(() => {});
      }, 60 * 60 * 1000);

      return registration;
    })
    .catch((err) => {
      console.warn('[PWA] Service worker registration failed:', err);
      return null;
    });
}

function notifyUpdate(worker: ServiceWorker, onUpdateAvailable?: UpdateCallback) {
  const applyUpdate = () => {
    worker.postMessage({ type: 'SKIP_WAITING' });
  };

  if (onUpdateAvailable) {
    onUpdateAvailable(applyUpdate);
  }

  // Dispatch custom window event so any UI component can respond
  window.dispatchEvent(
    new CustomEvent('pwa-update-available', {
      detail: { applyUpdate },
    })
  );
}
