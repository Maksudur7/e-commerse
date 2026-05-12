const cache = new Map<string, { data: any; expiry: number }>();

export const getCache = (key: string) => {
  const item = cache.get(key);
  if (!item) return null;
  if (Date.now() > item.expiry) {
    cache.delete(key);
    return null;
  }
  return item.data;
};

export const setCache = (key: string, data: any, ttlMs: number) => {
  cache.set(key, { data, expiry: Date.now() + ttlMs });
};

export const clearCache = (key: string) => {
  cache.delete(key);
};
