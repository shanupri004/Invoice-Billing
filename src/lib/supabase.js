import 'react-native-url-polyfill/auto';

import { createClient } from '@supabase/supabase-js';
import Config from 'react-native-config';

const { SUPABASE_URL, SUPABASE_ANON_KEY } = Config;

console.log('SUPABASE_URL:', SUPABASE_URL);

if (!SUPABASE_URL || !SUPABASE_ANON_KEY) {
  throw new Error('SUPABASE_URL and SUPABASE_ANON_KEY must be set for this build.');
}

export const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY, {
  auth: {
    persistSession: true,
    autoRefreshToken: true,
    detectSessionInUrl: false,
  },
});
