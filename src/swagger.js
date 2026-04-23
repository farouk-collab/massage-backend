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
  },
};

module.exports = swaggerDocument;
