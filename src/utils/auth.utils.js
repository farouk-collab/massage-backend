function normalizeEmail(value) {
  return typeof value === 'string' ? value.trim().toLowerCase() : '';
}

function normalizeString(value) {
  return typeof value === 'string' ? value.trim() : '';
}

function readFirstString(...values) {
  for (const value of values) {
    if (typeof value === 'string' && value.trim()) {
      return value.trim();
    }
  }

  return '';
}

function splitFullName(fullName) {
  const normalized = normalizeString(fullName);

  if (!normalized) {
    return { firstName: '', lastName: '' };
  }

  const [firstName, ...rest] = normalized.split(/\s+/);
  return {
    firstName: firstName || '',
    lastName: rest.join(' '),
  };
}

function sanitizePhoneCharacters(value) {
  return value.replace(/[^\d+]/g, '');
}

function detectPhoneCountry(phone) {
  const prefixes = [
    ['+351', 'Portugal'],
    ['+225', 'Cote d Ivoire'],
    ['+221', 'Senegal'],
    ['+216', 'Tunisie'],
    ['+213', 'Algerie'],
    ['+212', 'Maroc'],
    ['+41', 'Suisse'],
    ['+39', 'Italie'],
    ['+34', 'Espagne'],
    ['+33', 'France'],
    ['+32', 'Belgique'],
    ['+1', 'Etats-Unis / Canada'],
  ];

  for (const [prefix, country] of prefixes) {
    if (phone.startsWith(prefix)) {
      return { countryCode: prefix, country };
    }
  }

  return { countryCode: null, country: null };
}

function normalizeCountryCode(value, fallback = '+33') {
  const normalized = sanitizePhoneCharacters(normalizeString(value));

  if (!normalized) {
    return fallback;
  }

  if (normalized.startsWith('+')) {
    return normalized;
  }

  if (normalized.startsWith('00')) {
    return `+${normalized.slice(2)}`;
  }

  return `+${normalized}`;
}

function normalizePhone(value, options = {}) {
  const raw = normalizeString(value);

  if (!raw) {
    return {
      raw: '',
      normalized: '',
      national: '',
      countryCode: null,
      detectedCountry: null,
      isInternational: false,
    };
  }

  const fallbackCountryCode = normalizeCountryCode(
    options.countryCode ||
      options.indicatif ||
      process.env.DEFAULT_PHONE_COUNTRY_CODE ||
      '+33',
  );

  let cleaned = sanitizePhoneCharacters(raw);

  if (cleaned.startsWith('00')) {
    cleaned = `+${cleaned.slice(2)}`;
  }

  if (!cleaned.startsWith('+')) {
    if (cleaned.startsWith('0')) {
      cleaned = `${fallbackCountryCode}${cleaned.slice(1)}`;
    } else if (/^\d{6,15}$/.test(cleaned)) {
      cleaned = `${fallbackCountryCode}${cleaned}`;
    }
  }

  const compact = cleaned.startsWith('+')
    ? `+${cleaned.slice(1).replace(/\D/g, '')}`
    : cleaned.replace(/\D/g, '');
  const detected = detectPhoneCountry(compact);
  const national =
    detected.countryCode && compact.startsWith(detected.countryCode)
      ? compact.slice(detected.countryCode.length)
      : compact.replace(/^\+/, '');

  return {
    raw,
    normalized: compact,
    national,
    countryCode: detected.countryCode,
    detectedCountry: detected.country,
    isInternational: compact.startsWith('+'),
  };
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
  readFirstString,
  splitFullName,
  normalizePhone,
  sanitizeProfile,
};
