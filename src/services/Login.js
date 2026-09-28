import { supabase } from '../lib/supabase';

// The PIN is checked in the database (see supabase/migrations/*_mpin_and_bill_no.sql);
// the app never holds the PIN or its hash.
export const LoginService = {
  async loginWithPin(enteredPin) {
    const { data, error } = await supabase.rpc('verify_mpin', { p_pin: enteredPin });

    if (error) throw error;

    return {
      success: data?.success === true,
      locked: data?.locked === true,
      retryAfterSeconds: data?.retry_after_seconds ?? 0,
      attemptsLeft: data?.attempts_left ?? null,
    };
  },
};
