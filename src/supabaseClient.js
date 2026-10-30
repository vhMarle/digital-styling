// src/supabaseClient.js
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://jzyagdnkhctawxhoimrx.supabase.co';
const supabaseAnonKey = 'sb_publishable_AOEbD5g2qOmzo2qYfmqutg_9u1USfRV';

export const supabase = createClient(supabaseUrl, supabaseAnonKey);