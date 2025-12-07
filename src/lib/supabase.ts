import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.NEXT_PUBLIC_SUPABASE_URL || 'https://mmiazfmtyrnubrqacdrm.supabase.co';
const supabaseAnonKey = import.meta.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im1taWF6Zm10eXJudWJycWFjZHJtIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTkzOTE0ODQsImV4cCI6MjA3NDk2NzQ4NH0.SW_8iovLa7XTur-HqqUnUlImunJvrZspDtAxbaYhyQg';

// Configure Supabase to NOT persist sessions in localStorage
// We only use Supabase for OAuth and email verification token exchange
// Actual session management is handled by our backend JWT tokens
export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    autoRefreshToken: false,  // Don't auto-refresh Supabase tokens
    persistSession: false,     // Don't store Supabase session in localStorage
    detectSessionInUrl: true,  // Still detect tokens in URL for extraction
    storage: undefined,        // Disable storage completely
  }
});
