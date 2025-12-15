import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://gowubxhdjreqxjbkbaic.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imdvd3VieGhkanJlcXhqYmtiYWljIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjU4MjExNTUsImV4cCI6MjA4MTM5NzE1NX0.pHlKjJmpMZitI9b-vI0AwjpNsfbp0UbjRtK1kbihBI8';

export const supabase = createClient(supabaseUrl, supabaseKey);