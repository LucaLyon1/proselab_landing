import {
  createDataFastWithAdapters,
  createFetchNetworkAdapter,
  type DataFastWeb,
  type StorageAdapter,
} from 'datafast';

const COOKIE_DOMAIN = '.proselab.io';
const COOKIE_MAX_AGE = 60 * 60 * 24 * 365; // 1 year

function createCookieStorageAdapter(): StorageAdapter {
  function isSecure() {
    return typeof window !== 'undefined' && window.location.protocol === 'https:';
  }

  function getCookie(name: string): string | null {
    if (typeof document === 'undefined') return null;
    const match = document.cookie.match(new RegExp('(?:^|; )' + name + '=([^;]*)'));
    return match ? decodeURIComponent(match[1]) : null;
  }

  return {
    async getItem(key) {
      return getCookie(key);
    },
    async setItem(key, value) {
      if (typeof document === 'undefined') return;
      const secure = isSecure() ? '; Secure' : '';
      document.cookie = `${key}=${encodeURIComponent(value)}; domain=${COOKIE_DOMAIN}; path=/; max-age=${COOKIE_MAX_AGE}; SameSite=Lax${secure}`;
    },
    async removeItem(key) {
      if (typeof document === 'undefined') return;
      document.cookie = `${key}=; domain=${COOKIE_DOMAIN}; path=/; max-age=0`;
    },
  };
}

let instance: DataFastWeb | null = null;
let initPromise: Promise<DataFastWeb> | null = null;

export async function initAnalytics(): Promise<DataFastWeb> {
  if (instance) return instance;
  if (initPromise) return initPromise;

  initPromise = (async () => {
    const client = await createDataFastWithAdapters({
      appId: process.env.NEXT_PUBLIC_DATAFAST_WEBSITE_ID!,
      domain: process.env.NEXT_PUBLIC_DATAFAST_DOMAIN ?? 'proselab.io',
      storage: createCookieStorageAdapter(),
      network: createFetchNetworkAdapter(),
      platform: 'web',
    });

    const webClient = client as DataFastWeb;
    webClient.trackPageview = async (path?: string) => {
      const pagePath = path ?? (typeof window !== 'undefined' ? window.location.pathname : '/');
      await client.trackScreen(pagePath);
    };

    instance = webClient;
    initPromise = null;
    return webClient;
  })();

  return initPromise;
}

export function getAnalytics(): DataFastWeb | null {
  return instance;
}

export async function optOutAnalytics(): Promise<void> {
  if (instance) {
    await instance.optOut();
    instance = null;
  }
  initPromise = null;
}
