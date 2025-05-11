
/**
 * Browser compatibility utilities
 * 
 * This file provides utilities for detecting browser capabilities
 * and handling cross-browser compatibility issues.
 */

interface BrowserInfo {
  name: string;
  version: string;
  isMobile: boolean;
  isIOS: boolean;
  isAndroid: boolean;
  supportsIndexedDB: boolean;
  supportsLocalStorage: boolean;
  supportsServiceWorker: boolean;
  supportsWebRTC: boolean;
  isCompatible: boolean;
}

/**
 * Detect browser information and capabilities
 */
export const detectBrowser = (): BrowserInfo => {
  const ua = navigator.userAgent;
  let browserName = "Unknown";
  let browserVersion = "Unknown";
  
  // Detect browser name and version
  if (ua.indexOf("Firefox") > -1) {
    browserName = "Firefox";
    browserVersion = ua.match(/Firefox\/([0-9.]+)/)?.[1] || "";
  } else if (ua.indexOf("SamsungBrowser") > -1) {
    browserName = "Samsung Browser";
    browserVersion = ua.match(/SamsungBrowser\/([0-9.]+)/)?.[1] || "";
  } else if (ua.indexOf("Opera") > -1 || ua.indexOf("OPR") > -1) {
    browserName = "Opera";
    browserVersion = ua.match(/(?:Opera|OPR)\/([0-9.]+)/)?.[1] || "";
  } else if (ua.indexOf("Edge") > -1) {
    browserName = "Edge";
    browserVersion = ua.match(/Edge\/([0-9.]+)/)?.[1] || "";
  } else if (ua.indexOf("Edg") > -1) {
    browserName = "Edge Chromium";
    browserVersion = ua.match(/Edg\/([0-9.]+)/)?.[1] || "";
  } else if (ua.indexOf("Chrome") > -1) {
    browserName = "Chrome";
    browserVersion = ua.match(/Chrome\/([0-9.]+)/)?.[1] || "";
  } else if (ua.indexOf("Safari") > -1) {
    browserName = "Safari";
    browserVersion = ua.match(/Version\/([0-9.]+)/)?.[1] || "";
  } else if (ua.indexOf("MSIE") > -1 || ua.indexOf("Trident") > -1) {
    browserName = "Internet Explorer";
    browserVersion = ua.match(/(?:MSIE |rv:)([0-9.]+)/)?.[1] || "";
  }
  
  // Detect mobile devices
  const isMobile = /Mobi|Android/i.test(ua);
  const isIOS = /iPad|iPhone|iPod/.test(ua);
  const isAndroid = /Android/.test(ua);
  
  // Feature detection
  const supportsIndexedDB = typeof window.indexedDB !== 'undefined';
  const supportsLocalStorage = typeof window.localStorage !== 'undefined';
  const supportsServiceWorker = 'serviceWorker' in navigator;
  const supportsWebRTC = 'RTCPeerConnection' in window;
  
  // Determine if the browser is compatible with our app
  // Add specific requirements here
  const isCompatible = (() => {
    // IE is not compatible
    if (browserName === "Internet Explorer") return false;
    
    // Require IndexedDB and localStorage for offline functionality
    if (!supportsIndexedDB || !supportsLocalStorage) return false;
    
    // All other modern browsers should be compatible
    return true;
  })();
  
  return {
    name: browserName,
    version: browserVersion,
    isMobile,
    isIOS,
    isAndroid,
    supportsIndexedDB,
    supportsLocalStorage,
    supportsServiceWorker,
    supportsWebRTC,
    isCompatible
  };
};

/**
 * Check if a browser feature is supported
 */
export const supportsFeature = (feature: string): boolean => {
  switch (feature) {
    case 'indexeddb':
      return typeof window.indexedDB !== 'undefined';
    case 'websockets':
      return 'WebSocket' in window;
    case 'webrtc':
      return 'RTCPeerConnection' in window;
    case 'serviceworker':
      return 'serviceWorker' in navigator;
    case 'webp':
      const canvas = document.createElement('canvas');
      if (canvas.getContext && canvas.getContext('2d')) {
        return canvas.toDataURL('image/webp').indexOf('data:image/webp') === 0;
      }
      return false;
    default:
      console.warn(`Unknown feature check: ${feature}`);
      return false;
  }
};

/**
 * Display a browser compatibility warning if needed
 */
export const checkBrowserCompatibility = (): void => {
  const browserInfo = detectBrowser();
  
  if (!browserInfo.isCompatible) {
    console.warn(`Browser compatibility issue detected: ${browserInfo.name} ${browserInfo.version}`);
    // Here you could show a user-friendly warning
  }
};
