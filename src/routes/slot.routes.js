const express = require('express');
const { getSupabaseAdminClient } = require('../config/supabase');

const router = express.Router();

router.get('/', async (req, res, next) => {
  try {
    const { date, available } = req.query;
    const supabaseAdmin = getSupabaseAdminClient();

    let query = supabaseAdmin.from('slots').select('*').order('starts_at');

    if (date) {
      const start = new Date(`${date}T00:00:00.000Z`);
      const end = new Date(start);
      end.setUTCDate(end.getUTCDate() + 1);
      query = query.gte('starts_at', start.toISOString()).lt('starts_at', end.toISOString());
    }

    if (available !== undefined) {
      query = query.eq('is_available', String(available).toLowerCase() === 'true');
    }

    const { data, error } = await query;

    if (error) {
      return res.status(400).json({ message: error.message });
    }

    return res.status(200).json({ slots: data });
  } catch (error) {
    return next(error);
  }
});

module.exports = router;
