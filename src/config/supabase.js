const { createClient } = require('@supabase/supabase-js');

function readEnv(name) {
  const value = process.env[name];
  if (typeof value !== 'string') return '';

  return value.trim().replace(/^['"]|['"]$/g, '');
}

const supabaseUrl = readEnv('SUPABASE_URL');
const supabaseAnonKey = readEnv('SUPABASE_ANON_KEY');
const supabaseServiceRoleKey = readEnv('SUPABASE_SERVICE_ROLE_KEY');

function hasSupabaseConfig() {
  return Boolean(supabaseUrl && supabaseAnonKey && supabaseServiceRoleKey);
}

function assertSupabaseConfig() {
  if (!hasSupabaseConfig()) {
    const error = new Error(
      'Supabase is not configured. Please fill SUPABASE_URL, SUPABASE_ANON_KEY and SUPABASE_SERVICE_ROLE_KEY.',
    );
    error.statusCode = 500;
    throw error;
  }
}

function getSupabaseAdminClient() {
  assertSupabaseConfig();

  return createClient(supabaseUrl, supabaseServiceRoleKey, {
    auth: {
      autoRefreshToken: false,
      persistSession: false,
    },
  });
}

function getSupabasePublicClient() {
  assertSupabaseConfig();

  return createClient(supabaseUrl, supabaseAnonKey, {
    auth: {
      autoRefreshToken: false,
      persistSession: false,
    },
  });
}

function getSupabaseTokenClient(accessToken) {
  assertSupabaseConfig();

  return createClient(supabaseUrl, supabaseAnonKey, {
    auth: {
      autoRefreshToken: false,
      persistSession: false,
    },
    global: {
      headers: {
        Authorization: `Bearer ${accessToken}`,
      },
    },
  });
}

module.exports = {
  hasSupabaseConfig,
  getSupabaseAdminClient,
  getSupabasePublicClient,
  getSupabaseTokenClient,
};
