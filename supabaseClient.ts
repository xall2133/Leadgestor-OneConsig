import { createClient } from '@supabase/supabase-js';

const SUPABASE_URL = 'https://fusqeuwftldckxffcorp.supabase.co';
const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImZ1c3FldXdmdGxkY2t4ZmZjb3JwIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjQ2NzMwNTMsImV4cCI6MjA4MDI0OTA1M30.xXNj10AXSVaTabRYuoR3cWsxV9XjuZ4abaBC1TsO09M';

export const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);
