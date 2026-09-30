// src/services/masterService.js

import AsyncStorage from '@react-native-async-storage/async-storage';
import RNFS from 'react-native-fs';
import { supabase } from '../lib/supabase';

const MASTER_CACHE_KEY = 'masterCache';
const ASSETS_BUCKET = 'master-assets';
const IMAGE_CACHE_DIR = `${RNFS.CachesDirectoryPath}/master-assets`;
const SIGNED_URL_EXPIRY_SECONDS = 3600;

const MIME_BY_EXTENSION = {
  png: 'image/png',
  jpg: 'image/jpeg',
  jpeg: 'image/jpeg',
  webp: 'image/webp',
};

// ─────────────────────────────────────────────
// 🔹 DB → App Model
// ─────────────────────────────────────────────

const mapMaster = row => ({
  name: row?.name ?? '',
  engineName: row?.engine_name ?? '',
  address: row?.address ?? '',
  city: row?.city ?? '',
  pincode: row?.pincode ?? '',
  mobile: row?.mobile ?? '',
  email: row?.email ?? '',
  language: row?.language ?? '',
  logoPath: row?.logo_path ?? null,
  signaturePath: row?.signature_path ?? null,
});

const writeCache = async master => {
  try {
    await AsyncStorage.setItem(MASTER_CACHE_KEY, JSON.stringify(master));
  } catch (error) {
    console.warn('Unable to cache master details:', error);
  }
};

const readCache = async () => {
  try {
    const cached = await AsyncStorage.getItem(MASTER_CACHE_KEY);
    return cached ? JSON.parse(cached) : null;
  } catch (error) {
    console.warn('Unable to read cached master details:', error);
    return null;
  }
};

// Storage paths contain an upload timestamp, so a new logo/signature gets a
// new path and therefore a new cache file — old entries are never reused.
const cacheFileFor = path =>
  `${IMAGE_CACHE_DIR}/${path.replace(/[^a-zA-Z0-9._-]/g, '_')}`;

const mimeFor = path => {
  const ext = path.split('.').pop()?.toLowerCase();
  return MIME_BY_EXTENSION[ext] || 'image/png';
};

const downloadImage = async (path, filePath) => {
  const { data, error } = await supabase.storage
    .from(ASSETS_BUCKET)
    .createSignedUrl(path, SIGNED_URL_EXPIRY_SECONDS);

  if (error || !data?.signedUrl) throw error || new Error('No signed URL');

  if (!(await RNFS.exists(IMAGE_CACHE_DIR))) {
    await RNFS.mkdir(IMAGE_CACHE_DIR);
  }

  const { promise } = RNFS.downloadFile({
    fromUrl: data.signedUrl,
    toFile: filePath,
  });
  const { statusCode } = await promise;
  if (statusCode < 200 || statusCode >= 300) {
    throw new Error(`Image download failed: ${statusCode}`);
  }
};

// ─────────────────────────────────────────────
// 🚀 Service
// ─────────────────────────────────────────────

export const masterService = {
  // Business details of the logged-in user (RLS returns only their row).
  // Falls back to the cached copy when offline; throws only if neither exists.
  async getMaster() {
    try {
      const { data, error } = await supabase
        .from('master')
        .select('*')
        .maybeSingle();

      if (error) throw error;

      const master = mapMaster(data);
      await writeCache(master);
      return master;
    } catch (error) {
      const cached = await readCache();
      if (cached) return cached;
      throw error;
    }
  },

  // Returns a `data:<mime>;base64,...` URL for a private master-assets image,
  // or null if it can't be loaded — the PDF should still render without it.
  async getImageDataUrl(path) {
    if (!path) return null;

    const filePath = cacheFileFor(path);

    try {
      if (!(await RNFS.exists(filePath))) {
        await downloadImage(path, filePath);
      }

      const base64 = await RNFS.readFile(filePath, 'base64');
      return base64 ? `data:${mimeFor(path)};base64,${base64}` : null;
    } catch (error) {
      console.warn('Unable to load master image:', path, error);
      RNFS.unlink(filePath).catch(() => {});
      return null;
    }
  },

  // Calls onChange with the updated master whenever it's edited elsewhere
  // (e.g. the admin panel). Returns an unsubscribe function.
  subscribe(onChange) {
    const channel = supabase
      .channel('master-changes')
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'master' },
        async payload => {
          const master = mapMaster(
            payload.eventType === 'DELETE' ? null : payload.new,
          );
          await writeCache(master);
          onChange(master);
        },
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  },
};
