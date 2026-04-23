const express = require('express');
const { getSupabaseAdminClient } = require('../config/supabase');
const { requireAuth } = require('../middleware/auth.middleware');

const router = express.Router();

const LIMITED_OFFER_CAPACITY = 10;
const PACK_5_PRICE_CENTS = 22500;

async function getActiveSubscription(supabaseAdmin, clientId) {
  const { data, error } = await supabaseAdmin
    .from('subscriptions')
    .select('*')
    .eq('client_id', clientId)
    .eq('status', 'active')
    .order('created_at', { ascending: false })
    .limit(1)
    .maybeSingle();

  if (error) {
    throw error;
  }

  return data;
}

router.get('/availability', async (_req, res, next) => {
  try {
    const supabaseAdmin = getSupabaseAdminClient();
    const { count, error } = await supabaseAdmin
      .from('subscriptions')
      .select('id', { count: 'exact', head: true })
      .eq('limited_offer', true)
      .in('status', ['pending', 'active']);

    if (error) {
      return res.status(400).json({ message: error.message });
    }

    const usedPlaces = count || 0;
    const remainingPlaces = Math.max(LIMITED_OFFER_CAPACITY - usedPlaces, 0);

    return res.status(200).json({
      capacity: LIMITED_OFFER_CAPACITY,
      usedPlaces,
      remainingPlaces,
      available: remainingPlaces > 0,
    });
  } catch (error) {
    return next(error);
  }
});

router.post('/', requireAuth, async (req, res, next) => {
  try {
    const limitedOffer = req.body.limitedOffer !== false;
    const supabaseAdmin = getSupabaseAdminClient();

    if (limitedOffer) {
      const { count, error } = await supabaseAdmin
        .from('subscriptions')
        .select('id', { count: 'exact', head: true })
        .eq('limited_offer', true)
        .in('status', ['pending', 'active']);

      if (error) {
        return res.status(400).json({ message: error.message });
      }

      if ((count || 0) >= LIMITED_OFFER_CAPACITY) {
        return res.status(409).json({
          message: 'Limited offer is no longer available.',
        });
      }
    }

    const existingSubscription = await getActiveSubscription(
      supabaseAdmin,
      req.user.id,
    );

    if (existingSubscription) {
      return res.status(409).json({
        message: 'Client already has an active subscription.',
        subscription: existingSubscription,
      });
    }

    const { data, error } = await supabaseAdmin
      .from('subscriptions')
      .insert({
        client_id: req.user.id,
        plan_type: 'pack_5',
        total_sessions: 5,
        remaining_sessions: 5,
        price_cents: PACK_5_PRICE_CENTS,
        currency: 'EUR',
        status: 'active',
        limited_offer: limitedOffer,
      })
      .select('*')
      .single();

    if (error) {
      return res.status(400).json({ message: error.message });
    }

    return res.status(201).json({
      message: 'Subscription created successfully.',
      subscription: data,
    });
  } catch (error) {
    return next(error);
  }
});

router.get('/me', requireAuth, async (req, res, next) => {
  try {
    const supabaseAdmin = getSupabaseAdminClient();
    const subscription = await getActiveSubscription(supabaseAdmin, req.user.id);

    if (!subscription) {
      return res.status(404).json({
        message: 'No active subscription found.',
      });
    }

    return res.status(200).json({ subscription });
  } catch (error) {
    return next(error);
  }
});

router.patch('/me/deduct', requireAuth, async (req, res, next) => {
  try {
    const supabaseAdmin = getSupabaseAdminClient();
    const subscription = await getActiveSubscription(supabaseAdmin, req.user.id);

    if (!subscription) {
      return res.status(404).json({
        message: 'No active subscription found.',
      });
    }

    if (subscription.remaining_sessions <= 0) {
      return res.status(409).json({
        message: 'No remaining sessions on this subscription.',
      });
    }

    const nextRemainingSessions = subscription.remaining_sessions - 1;
    const nextStatus = nextRemainingSessions === 0 ? 'completed' : 'active';

    const { data, error } = await supabaseAdmin
      .from('subscriptions')
      .update({
        remaining_sessions: nextRemainingSessions,
        status: nextStatus,
        updated_at: new Date().toISOString(),
      })
      .eq('id', subscription.id)
      .select('*')
      .single();

    if (error) {
      return res.status(400).json({ message: error.message });
    }

    return res.status(200).json({
      message: 'Session deducted successfully.',
      subscription: data,
    });
  } catch (error) {
    return next(error);
  }
});

module.exports = router;
