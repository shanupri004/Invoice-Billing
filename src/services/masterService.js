// src/services/masterService.js
import { supabase } from '../lib/supabase';

const ASSET_BUCKET = 'master-assets';

// 🔹 DB → App Model
const mapMaster = row => ({
  userId: row.user_id,
  name: row.name || '',
  engineName: (row.engine_name || '').trim(),
  address: row.address || '',
  city: row.city || '',
  pincode: row.pincode || '',
  mobile: row.mobile || '',
  email: row.email || '',
  language: row.language,
  logoPath: row.logo_path,
  signaturePath: row.signature_path,
  businessLogoPath: row.business_logo_path,
  createdAt: row.created_at,
  updatedAt: row.updated_at,
});

// Bucket is private, so download the file and inline it as a data URI.
// Works for both <Image source={{ uri }} /> and the PDF HTML.
const downloadAsDataUri = async path => {
  if (!path) return null;

  const { data, error } = await supabase.storage
    .from(ASSET_BUCKET)
    .download(path);

  if (error) {
    console.warn(`Master asset download failed (${path}):`, error);
    return null;
  }

  return new Promise(resolve => {
    const reader = new FileReader();
    reader.onloadend = () => resolve(reader.result);
    reader.onerror = () => resolve(null);
    reader.readAsDataURL(data);
  });
};

let cachedMaster = null;

export const masterService = {
  async get({ force = false } = {}) {
    if (cachedMaster && !force) return cachedMaster;

    const { data, error } = await supabase
      .from('master')
      .select('*')
      .limit(1)
      .maybeSingle();

    if (error) throw error;
    if (!data) return null;

    const master = mapMaster(data);

    const [logo, signature, businessLogo] = await Promise.all([
      downloadAsDataUri(master.logoPath),
      downloadAsDataUri(master.signaturePath),
      downloadAsDataUri(master.businessLogoPath),
    ]);

    cachedMaster = { ...master, logo, signature, businessLogo };
    return cachedMaster;
  },
};
