const express = require('express');
const {
  getSupabaseAdminClient,
  getSupabasePublicClient,
  getSupabaseTokenClient,
} = require('../config/supabase');
const { requireAuth } = require('../middleware/auth.middleware');

const router = express.Router();

router.post('/register', async (req, res, next) => {
  try {
    const { email, password, firstName, lastName, phone } = req.body;

    if (!email || !password) {
      return res
        .status(400)
        .json({ message: 'email and password are required.' });
    }

    const supabasePublic = getSupabasePublicClient();
    const supabaseAdmin = getSupabaseAdminClient();

    const { data, error } = await supabasePublic.auth.signUp({
      email,
      password,
      options: {
        data: {
          first_name: firstName || null,
          last_name: lastName || null,
          phone: phone || null,
        },
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

    return res.status(201).json({
      message: 'Client registered successfully.',
      user: data.user,
      session: data.session,
    });
  } catch (error) {
    return next(error);
  }
});

router.post('/login', async (req, res, next) => {
  try {
    const { email, password } = req.body;

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
      user: data.user,
      session: data.session,
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
    const { email, redirectTo } = req.body;

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
