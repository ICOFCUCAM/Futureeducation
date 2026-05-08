import { createClient } from '@supabase/supabase-js';

const supabaseUrl =
  import.meta.env.VITE_SUPABASE_URL ?? 'https://lkinpyvffgtwymqifwiz.supabase.co';
const supabaseKey =
  import.meta.env.VITE_SUPABASE_ANON_KEY ??
  'sb_publishable_vl_RHLLR81IMivvH9Vptdw_mFp8px8c';

const supabase = createClient(supabaseUrl, supabaseKey);

export { supabase };
