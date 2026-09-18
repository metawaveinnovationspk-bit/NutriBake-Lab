// Client-side Cache Manager: Pre-warms Browser Cache Storage & Memory Cache
// Ensures complete website assets, images, fonts, and data are saved on first visit
// and displayed instantly even with slow or no internet connection.

import cupcakesImg from '../assets/images/nutribake_cupcakes_1789159074122.jpg';
import cookiesImg from '../assets/images/nutribake_cookies_1789159094420.jpg';
import nutriballsImg from '../assets/images/nutribake_nutriballs_1789159111855.jpg';
import heroBakeryImage from '../assets/images/hero_bakery_still_life_1788459814680.jpg';
import officialLogoImg from '../assets/images/nutribake_official_logo_1789230811697.jpg';
import officialLogoSvg from '../assets/images/nutribake_official_logo.svg';
import nbLogoPng from '../assets/images/NB-logo.png';

export const CRITICAL_ASSET_URLS = [
  '/',
  '/index.html',
  '/NB-logo.png',
  '/nutribake_official_logo.svg',
  '/pwa-192x192.png',
  '/pwa-512x512.png',
  '/apple-touch-icon.png',
  '/images/nutribake_cupcakes_1789159074122.jpg',
  '/images/nutribake_cookies_1789159094420.jpg',
  '/images/nutribake_nutriballs_1789159111855.jpg',
  '/images/hero_bakery_still_life_1788459814680.jpg',
  '/images/theme_logo_emblem_1789156736566.jpg',
  '/images/nutribake_official_logo_1789230811697.jpg',
  '/images/NB-logo.png',
  '/images/nutribake_official_logo.svg',
  // Bundled module URLs
  cupcakesImg,
  cookiesImg,
  nutriballsImg,
  heroBakeryImage,
  officialLogoImg,
  officialLogoSvg,
  nbLogoPng,
  // Section background imagery
  'https://images.unsplash.com/photo-1586985289688-ca3cf47d3e6e?q=80&w=1400&auto=format&fit=crop',
  'https://images.unsplash.com/photo-1555507036-ab1f4038808a?q=80&w=1200&auto=format&fit=crop'
];

const CACHE_NAME = 'nutribake-runtime-cache-v1';

/**
 * Pre-warms the browser Cache Storage API with all critical images, routes and media
 */
export async function warmBrowserCache(): Promise<void> {
  if (typeof window === 'undefined' || !('caches' in window)) return;

  try {
    const cache = await caches.open(CACHE_NAME);

    // Filter to unique URLs
    const uniqueUrls = Array.from(new Set(CRITICAL_ASSET_URLS)).filter(Boolean);

    // Fetch and store in parallel with resilience (ignore single failures)
    await Promise.allSettled(
      uniqueUrls.map(async (url) => {
        try {
          const match = await cache.match(url);
          if (!match) {
            const response = await fetch(url, { mode: 'no-cors' });
            if (response && (response.status === 200 || response.type === 'opaque')) {
              await cache.put(url, response);
            }
          }
        } catch {
          // Ignore individual fetch errors silently in offline / sandbox
        }
      })
    );

    // Pre-decode essential images in memory so lazy transitions are instant
    preloadImagesInMemory([
      cupcakesImg,
      cookiesImg,
      nutriballsImg,
      heroBakeryImage,
      officialLogoImg,
      nbLogoPng
    ]);
  } catch (err) {
    console.warn('Cache pre-warming note:', err);
  }
}

/**
 * Pre-decodes images directly in memory for zero-latency presentation
 */
export function preloadImagesInMemory(urls: string[]) {
  if (typeof window === 'undefined') return;

  urls.forEach((url) => {
    if (!url) return;
    const img = new Image();
    img.src = url;
    if ('decode' in img) {
      img.decode().catch(() => {});
    }
  });
}

/**
 * Save an offline snapshot to localStorage
 */
export function saveOfflineSnapshot<T>(key: string, data: T): void {
  try {
    localStorage.setItem(`nb_cache_${key}`, JSON.stringify(data));
  } catch {
    // localStorage full or unavailable
  }
}

/**
 * Retrieve an offline snapshot from localStorage
 */
export function getOfflineSnapshot<T>(key: string, defaultValue: T): T {
  try {
    const stored = localStorage.getItem(`nb_cache_${key}`);
    if (stored) {
      return JSON.parse(stored) as T;
    }
  } catch {
    // Return default on parse failure
  }
  return defaultValue;
}
