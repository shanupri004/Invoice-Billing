import 'react-native-url-polyfill/auto';

import { createClient } from '@supabase/supabase-js';

// const SUPABASE_URL = 'https://cvfjxgnszphvrrjjrurh.supabase.co';

// const SUPABASE_ANON_KEY =
//   'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImN2Zmp4Z25zenBodnJyampydXJoIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzQ5NzExNDYsImV4cCI6MjA5MDU0NzE0Nn0.iMbbmT90h9pAvVh7kXPXeu7WgAqG8-pZEOPScKFhrEU';

const SUPABASE_URL = 'https://eowpmevkqipckhgplhey.supabase.co';
const SUPABASE_ANON_KEY =
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImVvd3BtZXZrcWlwY2toZ3BsaGV5Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODAzMDE1MzAsImV4cCI6MjA5NTg3NzUzMH0.Ffm7JYMRdq3eh9ZPA_CaFIG0MFlyf2f0GuYOm5LTf8E';

export const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY, {
  auth: {
    persistSession: true,
    autoRefreshToken: true,
    detectSessionInUrl: false,
  },
});
