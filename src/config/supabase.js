const { createClient } = require('@supabase/supabase-js');

const supabaseUrl = process.env.SUPABASE_URL;
const supabaseAnonKey = process.env.SUPABASE_ANON_KEY;
const supabaseServiceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

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
