import { createClient } from '@supabase/supabase-js';

const SUPABASE_URL = 'https://gqeqjrcpxeovsxyovjdr.supabase.co';
const SUPABASE_ANON_KEY = 'sb_publishable_AOEbD5g2qOmzo2qYfmqutg_9u1USfRV';

export const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);