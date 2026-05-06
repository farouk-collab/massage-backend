const express = require('express');
const {
  getSupabaseAdminClient,
  getSupabasePublicClient,
  getSupabaseTokenClient,
} = require('../config/supabase');
const { requireAuth } = require('../middleware/auth.middleware');
const {
  normalizeEmail,
  readFirstString,
  splitFullName,
  normalizePhone,
  sanitizeProfile,
} = require('../utils/auth.utils');

const router = express.Router();

router.post('/register', async (req, res, next) => {
  try {
    const email = normalizeEmail(req.body.email);
    const password = readFirstString(
      req.body.password,
      req.body.mot_passe,
      req.body.mot_de_passe,
    );
    const fullName = readFirstString(req.body.nom, req.body.name);
    const splitName = splitFullName(fullName);
    const firstName = readFirstString(req.body.firstName, splitName.firstName);
    const lastName = readFirstString(req.body.lastName, splitName.lastName);
    const phoneInput = readFirstString(
      req.body.phone,
      req.body.numero_tel,
      req.body.telephone,
    );
    const phone = normalizePhone(phoneInput, {
      countryCode: req.body.countryCode || req.body.indicatif,
    }).normalized;

    if (!email || !password) {
      return res.status(400).json({
        message:
          'email and password are required. Supported aliases: mot_passe, mot_de_passe.',
      });
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
      user: {
        sub: data.user?.id || null,
        ...sanitizeProfile(data.user),
      },
      access_token: loginData.session?.access_token || null,
      refresh_token: loginData.session?.refresh_token || null,
      session: loginData.session,
    });
  } catch (error) {
    return next(error);
  }
});

router.post('/login', async (req, res, next) => {
  try {
    const email = normalizeEmail(req.body.email);
    const password = readFirstString(
      req.body.password,
      req.body.mot_passe,
      req.body.mot_de_passe,
    );

    if (!email || !password) {
      return res.status(400).json({
        message:
          'email and password are required. Supported aliases: mot_passe, mot_de_passe.',
      });
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
      user: {
        sub: data.user?.id || null,
        ...sanitizeProfile(data.user),
      },
      access_token: data.session?.access_token || null,
      refresh_token: data.session?.refresh_token || null,
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
    const redirectTo = readFirstString(req.body.redirectTo);

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

router.post('/change-password', requireAuth, async (req, res, next) => {
  try {
    const currentPassword = readFirstString(
      req.body.currentPassword,
      req.body.current_password,
      req.body.ancien_mot_passe,
    );
    const newPassword = readFirstString(
      req.body.newPassword,
      req.body.new_password,
      req.body.password,
      req.body.mot_passe,
      req.body.nouveau_mot_passe,
    );

    if (!currentPassword || !newPassword) {
      return res.status(400).json({
        message:
          'currentPassword and newPassword are required. Supported aliases: current_password, ancien_mot_passe, new_password, mot_passe, nouveau_mot_passe.',
      });
    }

    if (newPassword.length < 6) {
      return res.status(400).json({
        message: 'New password must be at least 6 characters long.',
      });
    }

    if (!req.user?.email) {
      return res.status(400).json({
        message: 'Authenticated user email is missing.',
      });
    }

    const supabasePublic = getSupabasePublicClient();
    const { error: loginError } = await supabasePublic.auth.signInWithPassword({
      email: req.user.email,
      password: currentPassword,
    });

    if (loginError) {
      return res.status(401).json({
        message: 'Current password is incorrect.',
      });
    }

    const supabaseTokenClient = getSupabaseTokenClient(req.accessToken);
    const { data, error } = await supabaseTokenClient.auth.updateUser({
      password: newPassword,
    });

    if (error) {
      return res.status(400).json({ message: error.message });
    }

    return res.status(200).json({
      message: 'Password changed successfully.',
      user: {
        sub: data.user?.id || null,
        ...sanitizeProfile(data.user, null),
      },
    });
  } catch (error) {
    return next(error);
  }
});

module.exports = router;
