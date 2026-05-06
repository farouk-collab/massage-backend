const express = require('express');
const {
  getSupabaseAdminClient,
  getSupabasePublicClient,
  getSupabaseTokenClient,
} = require('../config/supabase');
const { requireAuth } = require('../middleware/auth.middleware');
const {
  normalizeEmail,
  normalizeString,
  sanitizeProfile,
} = require('../utils/auth.utils');

const router = express.Router();

router.post('/register', async (req, res, next) => {
  try {
    const email = normalizeEmail(req.body.email);
    const password =
      typeof req.body.password === 'string' ? req.body.password : '';
    const firstName = normalizeString(req.body.firstName);
    const lastName = normalizeString(req.body.lastName);
    const phone = normalizeString(req.body.phone);

    if (!email || !password) {
      return res
        .status(400)
        .json({ message: 'email and password are required.' });
    }

    const supabaseAdmin = getSupabaseAdminClient();
    const supabasePublic = getSupabasePublicClient();

    const { data, error } = await supabaseAdmin.auth.admin.createUser({
      email,
      password,
      email_confirm: true,
      user_metadata: {
        first_name: firstName || null,
        last_name: lastName || null,
        phone: phone || null,
      },
    });

    if (error) {
      return res.status(400).json({ message: error.message });
    }

    if (data.user) {
      const { error: profileError } = await supabaseAdmin.from('profiles').upsert(
        {
          id: data.user.id,
          email,
          first_name: firstName || null,
          last_name: lastName || null,
          phone: phone || null,
        },
        { onConflict: 'id' },
      );

      if (profileError) {
        return res.status(400).json({ message: profileError.message });
      }
    }

    const { data: loginData, error: loginError } =
      await supabasePublic.auth.signInWithPassword({
        email,
        password,
      });

    if (loginError) {
      return res.status(400).json({ message: loginError.message });
    }

    return res.status(201).json({
      message: 'Client registered successfully.',
      user: sanitizeProfile(data.user),
      session: loginData.session,
    });
  } catch (error) {
    return next(error);
  }
});

router.post('/login', async (req, res, next) => {
  try {
    const email = normalizeEmail(req.body.email);
    const password =
      typeof req.body.password === 'string' ? req.body.password : '';

    if (!email || !password) {
      return res
        .status(400)
        .json({ message: 'email and password are required.' });
    }

    const supabasePublic = getSupabasePublicClient();
    const { data, error } = await supabasePublic.auth.signInWithPassword({
      email,
      password,
    });

    if (error) {
      return res.status(401).json({ message: error.message });
    }

    return res.status(200).json({
      message: 'Client logged in successfully.',
      user: sanitizeProfile(data.user),
      session: data.session,
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

    return res.status(200).json({
      message: 'Authenticated client loaded successfully.',
      user: sanitizeProfile(req.user, data),
    });
  } catch (error) {
    return next(error);
  }
});

router.post('/logout', requireAuth, async (req, res, next) => {
  try {
    const supabaseTokenClient = getSupabaseTokenClient(req.accessToken);
    const { error } = await supabaseTokenClient.auth.signOut();

    if (error) {
      return res.status(400).json({ message: error.message });
    }

    return res.status(200).json({ message: 'Client logged out successfully.' });
  } catch (error) {
    return next(error);
  }
});

router.post('/reset-password', async (req, res, next) => {
  try {
    const email = normalizeEmail(req.body.email);
    const redirectTo = normalizeString(req.body.redirectTo);

    if (!email) {
      return res.status(400).json({ message: 'email is required.' });
    }

    const supabasePublic = getSupabasePublicClient();
    const { error } = await supabasePublic.auth.resetPasswordForEmail(email, {
      redirectTo:
        redirectTo ||
        process.env.SUPABASE_RESET_PASSWORD_REDIRECT_URL ||
        'http://localhost:3000/reset-password',
    });

    if (error) {
      return res.status(400).json({ message: error.message });
    }

    return res
      .status(200)
      .json({ message: 'Password reset email requested successfully.' });
  } catch (error) {
    return next(error);
  }
});

module.exports = router;
