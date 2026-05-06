const express = require('express');
const cors = require('cors');
const swaggerUi = require('swagger-ui-express');
const authRoutes = require('./routes/auth.routes');
const clientRoutes = require('./routes/client.routes');
const subscriptionRoutes = require('./routes/subscription.routes');
const slotRoutes = require('./routes/slot.routes');
const bookingRoutes = require('./routes/booking.routes');
const swaggerDocument = require('./swagger');
const { hasSupabaseConfig } = require('./config/supabase');

const app = express();

function readAllowedOrigins() {
  const rawOrigins = process.env.CORS_ORIGINS || process.env.FRONTEND_URL || '';

  return rawOrigins
    .split(',')
    .map((origin) => origin.trim())
    .filter(Boolean);
}

const allowedOrigins = readAllowedOrigins();

app.use(
  cors({
    origin(origin, callback) {
      // Allow server-to-server requests and local tools without Origin header.
      if (!origin) {
        return callback(null, true);
      }

      if (allowedOrigins.length === 0) {
        return callback(null, true);
      }

      if (allowedOrigins.includes(origin)) {
        return callback(null, true);
      }

      return callback(new Error(`CORS blocked for origin: ${origin}`));
    },
    credentials: true,
  }),
);
app.use(express.json());

app.get('/', (_req, res) => {
  res.status(200).json({
    service: 'david-massage-backend',
    status: 'ok',
    docs: '/api/docs',
  });
});

app.get('/api/health', (_req, res) => {
  res.status(200).json({
    status: 'ok',
    supabaseConfigured: hasSupabaseConfig(),
  });
});

app.use('/api/docs', swaggerUi.serve, swaggerUi.setup(swaggerDocument));
app.use('/api/auth', authRoutes);
app.use('/api/clients', clientRoutes);
app.use('/api/subscriptions', subscriptionRoutes);
app.use('/api/slots', slotRoutes);
app.use('/api/bookings', bookingRoutes);

app.use((error, _req, res, _next) => {
  const statusCode = error.statusCode || 500;
  res.status(statusCode).json({
    message: error.message || 'Internal server error.',
  });
});

module.exports = app;
