const { getSupabaseAdminClient } = require('../config/supabase');

async function requireAuth(req, res, next) {
  try {
    const authHeader = req.headers.authorization || '';
    const [scheme, token] = authHeader.split(' ');

    if (scheme !== 'Bearer' || !token) {
      return res.status(401).json({ message: 'Missing bearer token.' });
    }

    const supabaseAdmin = getSupabaseAdminClient();
    const { data, error } = await supabaseAdmin.auth.getUser(token);

    if (error || !data.user) {
      return res.status(401).json({ message: 'Invalid or expired token.' });
    }

    req.accessToken = token;
    req.user = data.user;
    return next();
  } catch (error) {
    return next(error);
  }
}

module.exports = {
  requireAuth,
};
