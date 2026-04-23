function normalizeEmail(value) {
  return typeof value === 'string' ? value.trim().toLowerCase() : '';
}

function normalizeString(value) {
  return typeof value === 'string' ? value.trim() : '';
}

function sanitizeProfile(user, profile = null) {
  return {
    id: user?.id || null,
    email: user?.email || profile?.email || null,
    firstName:
      profile?.first_name || user?.user_metadata?.first_name || null,
    lastName:
      profile?.last_name || user?.user_metadata?.last_name || null,
    phone: profile?.phone || user?.user_metadata?.phone || null,
    address: profile?.address || null,
    emailConfirmedAt: user?.email_confirmed_at || null,
    createdAt: profile?.created_at || user?.created_at || null,
    updatedAt: profile?.updated_at || null,
  };
}

module.exports = {
  normalizeEmail,
  normalizeString,
  sanitizeProfile,
};
