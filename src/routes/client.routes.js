const express = require('express');
const { getSupabaseAdminClient } = require('../config/supabase');
const { requireAuth } = require('../middleware/auth.middleware');

const router = express.Router();

router.post('/me', requireAuth, async (req, res, next) => {
  try {
    const { firstName, lastName, phone, address } = req.body;
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
    const { firstName, lastName, phone, address } = req.body;
    const supabaseAdmin = getSupabaseAdminClient();

    const updates = {
      first_name: firstName ?? null,
      last_name: lastName ?? null,
      phone: phone ?? null,
      address: address ?? null,
      updated_at: new Date().toISOString(),
    };

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
