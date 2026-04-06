import 'react-native-url-polyfill/auto';

import { createClient } from '@supabase/supabase-js';

const SUPABASE_URL = 'https://cvfjxgnszphvrrjjrurh.supabase.co';
const SUPABASE_ANON_KEY =
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImN2Zmp4Z25zenBodnJyampydXJoIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzQ5NzExNDYsImV4cCI6MjA5MDU0NzE0Nn0.iMbbmT90h9pAvVh7kXPXeu7WgAqG8-pZEOPScKFhrEU';

export const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY, {
  auth: {
    persistSession: true,
    autoRefreshToken: true,
    detectSessionInUrl: false,
  },
});
