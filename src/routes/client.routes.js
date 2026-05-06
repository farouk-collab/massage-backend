const express = require('express');
const { getSupabaseAdminClient } = require('../config/supabase');
const { requireAuth } = require('../middleware/auth.middleware');
const {
  readFirstString,
  splitFullName,
  normalizePhone,
} = require('../utils/auth.utils');

const router = express.Router();

function hasOwn(obj, key) {
  return Object.prototype.hasOwnProperty.call(obj, key);
}

function pickProfileInput(body = {}) {
  const fullName = readFirstString(body.nom, body.name);
  const splitName = splitFullName(fullName);
  const firstName = readFirstString(
    body.firstName,
    body.first_name,
    body.prenom,
    splitName.firstName,
  );
  const lastName = readFirstString(
    body.lastName,
    body.last_name,
    splitName.lastName,
  );
  const phoneInput = readFirstString(body.phone, body.numero_tel, body.telephone);
  const phone = normalizePhone(phoneInput, {
    countryCode: body.countryCode || body.indicatif,
  }).normalized;
  const address = readFirstString(body.address, body.adresse);

  return {
    firstName,
    lastName,
    phone,
    address,
  };
}

router.post('/me', requireAuth, async (req, res, next) => {
  try {
    const { firstName, lastName, phone, address } = pickProfileInput(req.body);
    const supabaseAdmin = getSupabaseAdminClient();

    const payload = {
      id: req.user.id,
      email: req.user.email,
      first_name: firstName || req.user.user_metadata?.first_name || null,
      last_name: lastName || req.user.user_metadata?.last_name || null,
      phone: phone || req.user.user_metadata?.phone || null,
      address: address || null,
    };

    const { data, error } = await supabaseAdmin
      .from('profiles')
      .upsert(payload, { onConflict: 'id' })
      .select()
      .single();

    if (error) {
      return res.status(400).json({ message: error.message });
    }

    return res.status(201).json({
      message: 'Client profile created successfully.',
      profile: data,
    });
  } catch (error) {
    return next(error);
  }
});

router.post('/phone/normalize', (req, res) => {
  const phoneInput = readFirstString(
    req.body?.phone,
    req.body?.numero_tel,
    req.body?.telephone,
  );
  const normalized = normalizePhone(phoneInput, {
    countryCode: req.body?.countryCode || req.body?.indicatif,
  });

  return res.status(200).json({
    message: 'Telephone analyse avec succes.',
    phone: normalized,
  });
});

router.get('/me', requireAuth, async (req, res, next) => {
  try {
    const supabaseAdmin = getSupabaseAdminClient();
    const { data, error } = await supabaseAdmin
      .from('profiles')
      .select('*')
      .eq('id', req.user.id)
      .maybeSingle();

    if (error) {
      return res.status(400).json({ message: error.message });
    }

    if (!data) {
      return res.status(404).json({ message: 'Client profile not found.' });
    }

    return res.status(200).json({ profile: data });
  } catch (error) {
    return next(error);
  }
});

router.put('/me', requireAuth, async (req, res, next) => {
  try {
    const profileInput = pickProfileInput(req.body);
    const supabaseAdmin = getSupabaseAdminClient();
    const updates = { updated_at: new Date().toISOString() };

    if (
      hasOwn(req.body, 'firstName') ||
      hasOwn(req.body, 'first_name') ||
      hasOwn(req.body, 'prenom') ||
      hasOwn(req.body, 'nom') ||
      hasOwn(req.body, 'name')
    ) {
      updates.first_name = profileInput.firstName || null;
    }

    if (
      hasOwn(req.body, 'lastName') ||
      hasOwn(req.body, 'last_name') ||
      hasOwn(req.body, 'nom') ||
      hasOwn(req.body, 'name')
    ) {
      updates.last_name = profileInput.lastName || null;
    }

    if (
      hasOwn(req.body, 'phone') ||
      hasOwn(req.body, 'numero_tel') ||
      hasOwn(req.body, 'telephone')
    ) {
      updates.phone = profileInput.phone || null;
    }

    if (hasOwn(req.body, 'address') || hasOwn(req.body, 'adresse')) {
      updates.address = profileInput.address || null;
    }

    const { data, error } = await supabaseAdmin
      .from('profiles')
      .update(updates)
      .eq('id', req.user.id)
      .select('*')
      .single();

    if (error) {
      return res.status(400).json({ message: error.message });
    }

    return res.status(200).json({
      message: 'Client profile updated successfully.',
      profile: data,
    });
  } catch (error) {
    return next(error);
  }
});

module.exports = router;
