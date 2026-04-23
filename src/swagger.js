const swaggerDocument = {
  openapi: '3.0.3',
  info: {
    title: 'David Massage Backend API',
    version: '1.0.0',
    description:
      'New Express + Supabase backend for authentication and client management.',
  },
  servers: [
    {
      url: 'http://localhost:10000/api',
      description: 'Local development server',
    },
    {
      url: 'https://massage-backend-qvf7.onrender.com/api',
      description: 'Render production server',
    },
  ],
  tags: [
    { name: 'Health', description: 'Health and configuration endpoints' },
    { name: 'Auth', description: 'Client authentication with Supabase Auth' },
    { name: 'Clients', description: 'Client profile management' },
    { name: 'Subscriptions', description: 'Client massage subscription packs' },
    { name: 'Slots', description: 'Available massage slots' },
    { name: 'Bookings', description: 'Client session bookings' },
  ],
  components: {
    securitySchemes: {
      bearerAuth: {
        type: 'http',
        scheme: 'bearer',
        bearerFormat: 'JWT',
      },
    },
    schemas: {
      RegisterRequest: {
        type: 'object',
        required: ['email', 'password'],
        properties: {
          email: { type: 'string', example: 'client@example.com' },
          password: { type: 'string', example: 'StrongPassword123!' },
          firstName: { type: 'string', example: 'David' },
          lastName: { type: 'string', example: 'Massage' },
          phone: { type: 'string', example: '+33 6 00 00 00 00' },
        },
      },
      LoginRequest: {
        type: 'object',
        required: ['email', 'password'],
        properties: {
          email: { type: 'string', example: 'client@example.com' },
          password: { type: 'string', example: 'StrongPassword123!' },
        },
      },
      ResetPasswordRequest: {
        type: 'object',
        required: ['email'],
        properties: {
          email: { type: 'string', example: 'client@example.com' },
          redirectTo: {
            type: 'string',
            example: 'http://localhost:3000/reset-password',
          },
        },
      },
      AuthenticatedUser: {
        type: 'object',
        properties: {
          id: { type: 'string', example: '33f3f7c8-3b17-4a71-a95d-d8ec4e4dd123' },
          email: { type: 'string', example: 'client@example.com' },
          firstName: { type: 'string', example: 'David' },
          lastName: { type: 'string', example: 'Massage' },
          phone: { type: 'string', example: '+33 6 00 00 00 00' },
          address: { type: 'string', example: '12 rue de Paris, 75000 Paris' },
          emailConfirmedAt: { type: 'string', nullable: true },
          createdAt: { type: 'string', nullable: true },
          updatedAt: { type: 'string', nullable: true },
        },
      },
      AuthSuccessResponse: {
        type: 'object',
        properties: {
          message: { type: 'string', example: 'Client logged in successfully.' },
          user: { $ref: '#/components/schemas/AuthenticatedUser' },
          session: {
            type: 'object',
            nullable: true,
            additionalProperties: true,
          },
        },
      },
      AuthMeResponse: {
        type: 'object',
        properties: {
          message: {
            type: 'string',
            example: 'Authenticated client loaded successfully.',
          },
          user: { $ref: '#/components/schemas/AuthenticatedUser' },
        },
      },
      CreateProfileRequest: {
        type: 'object',
        properties: {
          firstName: { type: 'string', example: 'David' },
          lastName: { type: 'string', example: 'Massage' },
          phone: { type: 'string', example: '+33 6 00 00 00 00' },
          address: { type: 'string', example: '12 rue de Paris, 75000 Paris' },
        },
      },
      UpdateProfileRequest: {
        type: 'object',
        properties: {
          firstName: { type: 'string', example: 'David' },
          lastName: { type: 'string', example: 'Massage' },
          phone: { type: 'string', example: '+33 6 00 00 00 00' },
          address: { type: 'string', example: '12 rue de Paris, 75000 Paris' },
        },
      },
      CreateSubscriptionRequest: {
        type: 'object',
        properties: {
          limitedOffer: {
            type: 'boolean',
            example: true,
            description: 'Use one of the first 10 limited offer places.',
          },
        },
      },
      Subscription: {
        type: 'object',
        properties: {
          id: { type: 'string' },
          client_id: { type: 'string' },
          plan_type: { type: 'string', example: 'pack_5' },
          total_sessions: { type: 'integer', example: 5 },
          remaining_sessions: { type: 'integer', example: 5 },
          price_cents: { type: 'integer', example: 22500 },
          currency: { type: 'string', example: 'EUR' },
          status: { type: 'string', example: 'active' },
          limited_offer: { type: 'boolean', example: true },
        },
      },
      Slot: {
        type: 'object',
        properties: {
          id: { type: 'string' },
          starts_at: { type: 'string', example: '2026-04-24T10:00:00.000Z' },
          duration_minutes: { type: 'integer', example: 60 },
          is_available: { type: 'boolean', example: true },
        },
      },
      CreateBookingRequest: {
        type: 'object',
        required: ['slotId'],
        properties: {
          slotId: { type: 'string' },
          subscriptionId: { type: 'string', nullable: true },
          paymentType: { type: 'string', example: 'single' },
          massageType: { type: 'string', example: 'massage relaxant' },
        },
      },
      Booking: {
        type: 'object',
        properties: {
          id: { type: 'string' },
          client_id: { type: 'string' },
          slot_id: { type: 'string' },
          subscription_id: { type: 'string', nullable: true },
          massage_type: { type: 'string' },
          payment_type: { type: 'string', example: 'subscription' },
          amount_cents: { type: 'integer', example: 0 },
          currency: { type: 'string', example: 'EUR' },
          status: { type: 'string', example: 'confirmed' },
        },
      },
    },
  },
  paths: {
    '/health': {
      get: {
        tags: ['Health'],
        summary: 'Health check',
        responses: {
          200: {
            description: 'API status',
          },
        },
      },
    },
    '/auth/register': {
      post: {
        tags: ['Auth'],
        summary: 'Register a new client',
        requestBody: {
          required: true,
          content: {
            'application/json': {
              schema: { $ref: '#/components/schemas/RegisterRequest' },
            },
          },
        },
        responses: {
          201: {
            description: 'Client registered successfully',
            content: {
              'application/json': {
                schema: { $ref: '#/components/schemas/AuthSuccessResponse' },
              },
            },
          },
          400: { description: 'Validation or Supabase error' },
        },
      },
    },
    '/auth/login': {
      post: {
        tags: ['Auth'],
        summary: 'Log in a client',
        requestBody: {
          required: true,
          content: {
            'application/json': {
              schema: { $ref: '#/components/schemas/LoginRequest' },
            },
          },
        },
        responses: {
          200: {
            description: 'Client logged in successfully',
            content: {
              'application/json': {
                schema: { $ref: '#/components/schemas/AuthSuccessResponse' },
              },
            },
          },
          401: { description: 'Invalid credentials' },
        },
      },
    },
    '/auth/me': {
      get: {
        tags: ['Auth'],
        summary: 'Get the authenticated client from the JWT token',
        security: [{ bearerAuth: [] }],
        responses: {
          200: {
            description: 'Authenticated client returned successfully',
            content: {
              'application/json': {
                schema: { $ref: '#/components/schemas/AuthMeResponse' },
              },
            },
          },
          401: { description: 'Unauthorized' },
        },
      },
    },
    '/auth/logout': {
      post: {
        tags: ['Auth'],
        summary: 'Log out the current client',
        security: [{ bearerAuth: [] }],
        responses: {
          200: { description: 'Client logged out successfully' },
          401: { description: 'Unauthorized' },
        },
      },
    },
    '/auth/reset-password': {
      post: {
        tags: ['Auth'],
        summary: 'Send a password reset email',
        requestBody: {
          required: true,
          content: {
            'application/json': {
              schema: { $ref: '#/components/schemas/ResetPasswordRequest' },
            },
          },
        },
        responses: {
          200: { description: 'Reset email requested' },
          400: { description: 'Supabase error' },
        },
      },
    },
    '/clients/me': {
      post: {
        tags: ['Clients'],
        summary: 'Create the current client profile',
        security: [{ bearerAuth: [] }],
        requestBody: {
          required: false,
          content: {
            'application/json': {
              schema: { $ref: '#/components/schemas/CreateProfileRequest' },
            },
          },
        },
        responses: {
          201: { description: 'Profile created successfully' },
          401: { description: 'Unauthorized' },
        },
      },
      get: {
        tags: ['Clients'],
        summary: 'Get the current client profile',
        security: [{ bearerAuth: [] }],
        responses: {
          200: { description: 'Profile returned successfully' },
          404: { description: 'Profile not found' },
        },
      },
      put: {
        tags: ['Clients'],
        summary: 'Update the current client profile',
        security: [{ bearerAuth: [] }],
        requestBody: {
          required: true,
          content: {
            'application/json': {
              schema: { $ref: '#/components/schemas/UpdateProfileRequest' },
            },
          },
        },
        responses: {
          200: { description: 'Profile updated successfully' },
          401: { description: 'Unauthorized' },
        },
      },
    },
    '/subscriptions': {
      post: {
        tags: ['Subscriptions'],
        summary: 'Buy/create a 5-session subscription pack',
        security: [{ bearerAuth: [] }],
        requestBody: {
          required: false,
          content: {
            'application/json': {
              schema: { $ref: '#/components/schemas/CreateSubscriptionRequest' },
            },
          },
        },
        responses: {
          201: { description: 'Subscription created successfully' },
          401: { description: 'Unauthorized' },
          409: { description: 'Limited offer unavailable or active pack exists' },
        },
      },
    },
    '/subscriptions/me': {
      get: {
        tags: ['Subscriptions'],
        summary: 'Get current active client subscription',
        security: [{ bearerAuth: [] }],
        responses: {
          200: {
            description: 'Active subscription',
            content: {
              'application/json': {
                schema: {
                  type: 'object',
                  properties: {
                    subscription: { $ref: '#/components/schemas/Subscription' },
                  },
                },
              },
            },
          },
          404: { description: 'No active subscription found' },
        },
      },
    },
    '/subscriptions/me/deduct': {
      patch: {
        tags: ['Subscriptions'],
        summary: 'Deduct one session from current active subscription',
        security: [{ bearerAuth: [] }],
        responses: {
          200: { description: 'Session deducted successfully' },
          404: { description: 'No active subscription found' },
          409: { description: 'No remaining sessions' },
        },
      },
    },
    '/subscriptions/availability': {
      get: {
        tags: ['Subscriptions'],
        summary: 'Get remaining places for the first 10 clients offer',
        responses: {
          200: { description: 'Limited offer availability' },
        },
      },
    },
    '/slots': {
      get: {
        tags: ['Slots'],
        summary: 'List available massage slots',
        parameters: [
          {
            name: 'date',
            in: 'query',
            schema: { type: 'string', example: '2026-04-24' },
          },
          {
            name: 'available',
            in: 'query',
            schema: { type: 'boolean', example: true },
          },
        ],
        responses: {
          200: {
            description: 'Slot list',
            content: {
              'application/json': {
                schema: {
                  type: 'object',
                  properties: {
                    slots: {
                      type: 'array',
                      items: { $ref: '#/components/schemas/Slot' },
                    },
                  },
                },
              },
            },
          },
        },
      },
    },
    '/bookings': {
      post: {
        tags: ['Bookings'],
        summary: 'Book a massage slot',
        security: [{ bearerAuth: [] }],
        requestBody: {
          required: true,
          content: {
            'application/json': {
              schema: { $ref: '#/components/schemas/CreateBookingRequest' },
            },
          },
        },
        responses: {
          201: { description: 'Booking created successfully' },
          400: { description: 'Invalid request' },
          409: { description: 'Slot unavailable or subscription exhausted' },
        },
      },
    },
    '/bookings/me': {
      get: {
        tags: ['Bookings'],
        summary: 'List current client bookings',
        security: [{ bearerAuth: [] }],
        responses: {
          200: { description: 'Client bookings' },
        },
      },
    },
    '/bookings/{id}': {
      delete: {
        tags: ['Bookings'],
        summary: 'Cancel a booking and release the slot',
        security: [{ bearerAuth: [] }],
        parameters: [
          {
            name: 'id',
            in: 'path',
            required: true,
            schema: { type: 'string' },
          },
        ],
        responses: {
          200: { description: 'Booking cancelled successfully' },
          404: { description: 'Booking not found' },
          409: { description: 'Validated booking cannot be cancelled' },
        },
      },
    },
  },
};

module.exports = swaggerDocument;
