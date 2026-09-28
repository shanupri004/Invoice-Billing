import 'react-native-url-polyfill/auto';

import { createClient } from '@supabase/supabase-js';
import Config from 'react-native-config';
import { fetchWithNetworkReporting } from './networkEvents';

const { SUPABASE_URL, SUPABASE_ANON_KEY } = Config;

if (!SUPABASE_URL || !SUPABASE_ANON_KEY) {
  throw new Error('SUPABASE_URL and SUPABASE_ANON_KEY must be set for this build.');
}

export const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY, {
  global: {
    // Opens the "No internet" popup when a request fails because the network dropped
    fetch: fetchWithNetworkReporting,
  },
  auth: {
    persistSession: true,
    autoRefreshToken: true,
    detectSessionInUrl: false,
  },
});
