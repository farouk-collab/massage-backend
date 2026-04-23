const express = require('express');
const { getSupabaseAdminClient } = require('../config/supabase');
const { requireAuth } = require('../middleware/auth.middleware');

const router = express.Router();

router.post('/', requireAuth, async (req, res, next) => {
  try {
    const { slotId, subscriptionId, paymentType, massageType } = req.body;

    if (!slotId) {
      return res.status(400).json({ message: 'slotId is required.' });
    }

    const supabaseAdmin = getSupabaseAdminClient();
    const { data: slot, error: slotError } = await supabaseAdmin
      .from('slots')
      .select('*')
      .eq('id', slotId)
      .maybeSingle();

    if (slotError) {
      return res.status(400).json({ message: slotError.message });
    }

    if (!slot) {
      return res.status(404).json({ message: 'Slot not found.' });
    }

    if (!slot.is_available) {
      return res.status(409).json({ message: 'Slot is not available.' });
    }

    if (subscriptionId) {
      const { data: subscription, error: subscriptionError } =
        await supabaseAdmin
          .from('subscriptions')
          .select('*')
          .eq('id', subscriptionId)
          .eq('client_id', req.user.id)
          .maybeSingle();

      if (subscriptionError) {
        return res.status(400).json({ message: subscriptionError.message });
      }

      if (!subscription || subscription.status !== 'active') {
        return res.status(400).json({
          message: 'Active subscription not found for this client.',
        });
      }

      if (subscription.remaining_sessions <= 0) {
        return res.status(409).json({
          message: 'No remaining sessions on this subscription.',
        });
      }
    }

    const { data: booking, error: bookingError } = await supabaseAdmin
      .from('bookings')
      .insert({
        client_id: req.user.id,
        slot_id: slotId,
        subscription_id: subscriptionId || null,
        massage_type: massageType || 'massage',
        payment_type: subscriptionId ? 'subscription' : paymentType || 'single',
        amount_cents: subscriptionId ? 0 : 8000,
        currency: 'EUR',
        status: 'confirmed',
      })
      .select('*, slots(*)')
      .single();

    if (bookingError) {
      return res.status(400).json({ message: bookingError.message });
    }

    const { error: updateSlotError } = await supabaseAdmin
      .from('slots')
      .update({ is_available: false, updated_at: new Date().toISOString() })
      .eq('id', slotId);

    if (updateSlotError) {
      return res.status(400).json({ message: updateSlotError.message });
    }

    return res.status(201).json({
      message: 'Booking created successfully.',
      booking,
    });
  } catch (error) {
    return next(error);
  }
});

router.get('/me', requireAuth, async (req, res, next) => {
  try {
    const supabaseAdmin = getSupabaseAdminClient();
    const { data, error } = await supabaseAdmin
      .from('bookings')
      .select('*, slots(*)')
      .eq('client_id', req.user.id)
      .order('created_at', { ascending: false });

    if (error) {
      return res.status(400).json({ message: error.message });
    }

    return res.status(200).json({ bookings: data });
  } catch (error) {
    return next(error);
  }
});

router.delete('/:id', requireAuth, async (req, res, next) => {
  try {
    const supabaseAdmin = getSupabaseAdminClient();
    const { data: booking, error: findError } = await supabaseAdmin
      .from('bookings')
      .select('*')
      .eq('id', req.params.id)
      .eq('client_id', req.user.id)
      .maybeSingle();

    if (findError) {
      return res.status(400).json({ message: findError.message });
    }

    if (!booking) {
      return res.status(404).json({ message: 'Booking not found.' });
    }

    if (booking.status === 'validated') {
      return res.status(409).json({
        message: 'Validated booking cannot be cancelled.',
      });
    }

    const { data, error } = await supabaseAdmin
      .from('bookings')
      .update({ status: 'cancelled', updated_at: new Date().toISOString() })
      .eq('id', booking.id)
      .select('*')
      .single();

    if (error) {
      return res.status(400).json({ message: error.message });
    }

    await supabaseAdmin
      .from('slots')
      .update({ is_available: true, updated_at: new Date().toISOString() })
      .eq('id', booking.slot_id);

    return res.status(200).json({
      message: 'Booking cancelled successfully.',
      booking: data,
    });
  } catch (error) {
    return next(error);
  }
});

module.exports = router;
