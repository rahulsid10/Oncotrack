import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://bskmdsgluehecoxiowmr.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImJza21kc2dsdWVoZWNveGlvd21yIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjU3MTE5MTQsImV4cCI6MjA4MTI4NzkxNH0.pSxehCH6ErJlpMbLtkf5r2yj1bz__TrHsoQmxnjljUA';

// Create client with error handling for initialization
export const supabase = createClient(supabaseUrl, supabaseKey, {
  auth: {
    persistSession: true,
    autoRefreshToken: true,
  },
  global: {
    headers: { 'x-application-name': 'oncotrack-ai' },
  },
});
