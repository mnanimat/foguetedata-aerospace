import { useState, useEffect, useCallback } from 'react';
import { User3DModel, CadResource, RocketParams, User } from '../types';

export const STORAGE_KEYS = {
  MODELS: 'foguetedata_3d_models_v1',
  CAD_RESOURCES: 'foguetedata_cad_resources_v1',
  FLIGHT_PARAMS: 'foguetedata_flight_params_v1',
  USER_SESSION: 'foguetedata_user_session_v1',
  OFFLINE_META: 'foguetedata_offline_meta_v1'
} as const;

export interface CacheMetadata {
  lastSync: string;
  modelCount: number;
  cadCount: number;
  totalSizeKb: number;
  isOffline: boolean;
}

// Helper to calculate approximate size of localStorage
export const getLocalStorageSizeKb = (): number => {
  try {
    let totalBytes = 0;
    for (let i = 0; i < localStorage.length; i++) {
      const key = localStorage.key(i);
      if (key && key.startsWith('foguetedata_')) {
        const val = localStorage.getItem(key);
        totalBytes += (key.length + (val ? val.length : 0)) * 2;
      }
    }
    return Math.round((totalBytes / 1024) * 10) / 10;
  } catch (e) {
    return 0;
  }
};

// 1. Models Cache Management
export const getStoredModels = (fallback: User3DModel[]): User3DModel[] => {
  try {
    const raw = localStorage.getItem(STORAGE_KEYS.MODELS);
    if (!raw) return fallback;
    const parsed = JSON.parse(raw);
    if (Array.isArray(parsed) && parsed.length > 0) {
      return parsed;
    }
    return fallback;
  } catch (err) {
    console.warn('[Offline Cache] Erro ao carregar modelos do localStorage:', err);
    return fallback;
  }
};

export const saveStoredModels = (models: User3DModel[]): void => {
  try {
    localStorage.setItem(STORAGE_KEYS.MODELS, JSON.stringify(models));
    updateCacheMeta({ modelCount: models.length });
  } catch (err) {
    console.error('[Offline Cache] Falha ao salvar modelos em localStorage:', err);
  }
};

// 2. CAD Resources Cache Management
export const getStoredCadResources = (fallback: CadResource[]): CadResource[] => {
  try {
    const raw = localStorage.getItem(STORAGE_KEYS.CAD_RESOURCES);
    if (!raw) return fallback;
    const parsed = JSON.parse(raw);
    if (Array.isArray(parsed) && parsed.length > 0) {
      return parsed;
    }
    return fallback;
  } catch (err) {
    console.warn('[Offline Cache] Erro ao carregar recursos CAD do localStorage:', err);
    return fallback;
  }
};

export const saveStoredCadResources = (resources: CadResource[]): void => {
  try {
    localStorage.setItem(STORAGE_KEYS.CAD_RESOURCES, JSON.stringify(resources));
    updateCacheMeta({ cadCount: resources.length });
  } catch (err) {
    console.error('[Offline Cache] Falha ao salvar recursos CAD em localStorage:', err);
  }
};

// 3. Flight Simulator Parameters Cache
export const getStoredFlightParams = (fallback: RocketParams): RocketParams => {
  try {
    const raw = localStorage.getItem(STORAGE_KEYS.FLIGHT_PARAMS);
    if (!raw) return fallback;
    const parsed = JSON.parse(raw);
    return { ...fallback, ...parsed };
  } catch (err) {
    console.warn('[Offline Cache] Erro ao carregar parâmetros de voo do localStorage:', err);
    return fallback;
  }
};

export const saveStoredFlightParams = (params: RocketParams): void => {
  try {
    localStorage.setItem(STORAGE_KEYS.FLIGHT_PARAMS, JSON.stringify(params));
    updateCacheMeta();
  } catch (err) {
    console.error('[Offline Cache] Falha ao salvar parâmetros de voo:', err);
  }
};

// 4. User Session Cache
export const getStoredUserSession = (): User | null => {
  try {
    const raw = localStorage.getItem(STORAGE_KEYS.USER_SESSION);
    if (!raw) return null;
    return JSON.parse(raw);
  } catch (err) {
    return null;
  }
};

export const saveStoredUserSession = (user: User | null): void => {
  try {
    if (user) {
      localStorage.setItem(STORAGE_KEYS.USER_SESSION, JSON.stringify(user));
    } else {
      localStorage.removeItem(STORAGE_KEYS.USER_SESSION);
    }
    updateCacheMeta();
  } catch (err) {
    console.error('[Offline Cache] Falha ao salvar sessão do usuário:', err);
  }
};

// 5. Metadata Sync Management
export const updateCacheMeta = (extra?: { modelCount?: number; cadCount?: number }): void => {
  try {
    const now = new Date().toISOString();
    const existing = getCacheMeta();
    const meta: CacheMetadata = {
      lastSync: now,
      modelCount: extra?.modelCount ?? existing.modelCount,
      cadCount: extra?.cadCount ?? existing.cadCount,
      totalSizeKb: getLocalStorageSizeKb(),
      isOffline: !navigator.onLine
    };
    localStorage.setItem(STORAGE_KEYS.OFFLINE_META, JSON.stringify(meta));
  } catch (err) {
    // Ignore storage quota errors gracefully
  }
};

export const getCacheMeta = (): CacheMetadata => {
  try {
    const raw = localStorage.getItem(STORAGE_KEYS.OFFLINE_META);
    if (!raw) {
      return {
        lastSync: new Date().toISOString(),
        modelCount: 0,
        cadCount: 0,
        totalSizeKb: getLocalStorageSizeKb(),
        isOffline: !navigator.onLine
      };
    }
    const meta = JSON.parse(raw);
    return {
      ...meta,
      totalSizeKb: getLocalStorageSizeKb(),
      isOffline: !navigator.onLine
    };
  } catch (err) {
    return {
      lastSync: new Date().toISOString(),
      modelCount: 0,
      cadCount: 0,
      totalSizeKb: 0,
      isOffline: !navigator.onLine
    };
  }
};

// Clear all offline cache
export const clearOfflineCacheData = (): void => {
  try {
    localStorage.removeItem(STORAGE_KEYS.MODELS);
    localStorage.removeItem(STORAGE_KEYS.CAD_RESOURCES);
    localStorage.removeItem(STORAGE_KEYS.FLIGHT_PARAMS);
    localStorage.removeItem(STORAGE_KEYS.USER_SESSION);
    localStorage.removeItem(STORAGE_KEYS.OFFLINE_META);
  } catch (e) {
    console.error('Erro ao limpar cache:', e);
  }
};

// React Hook for Offline & Cache Monitoring
export const useOfflineCache = () => {
  const [isOnline, setIsOnline] = useState<boolean>(() => typeof navigator !== 'undefined' ? navigator.onLine : true);
  const [cacheMeta, setCacheMeta] = useState<CacheMetadata>(getCacheMeta);
  const [toastNotif, setToastNotif] = useState<string | null>(null);

  const refreshMeta = useCallback(() => {
    setCacheMeta(getCacheMeta());
  }, []);

  useEffect(() => {
    const handleOnline = () => {
      setIsOnline(true);
      updateCacheMeta();
      refreshMeta();
      setToastNotif('🟢 Conexão restabelecida! Sincronizando dados locais.');
      setTimeout(() => setToastNotif(null), 3500);
    };

    const handleOffline = () => {
      setIsOnline(false);
      updateCacheMeta();
      refreshMeta();
      setToastNotif('⚡ Você está Offline. O sistema continuará funcionando com os dados e modelos salvos em Cache (localStorage).');
      setTimeout(() => setToastNotif(null), 5000);
    };

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    // Initial check
    updateCacheMeta();
    refreshMeta();

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, [refreshMeta]);

  return {
    isOnline,
    isOffline: !isOnline,
    cacheMeta,
    refreshMeta,
    toastNotif,
    setToastNotif,
    clearCache: () => {
      clearOfflineCacheData();
      refreshMeta();
    }
  };
};
