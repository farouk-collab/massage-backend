const swaggerDocument = {
  openapi: '3.0.3',
  info: {
    title: 'API Backend David Massage',
    version: '1.0.0',
    description:
      'Backend Express + Supabase pour l authentification, les clients, les abonnements et les reservations.',
  },
  servers: [
    {
      url: '/api',
      description: 'Serveur courant',
    },
  ],
  tags: [
    { name: 'Sante', description: 'Points de controle et etat du service' },
    {
      name: 'Authentification',
      description: 'Authentification client avec Supabase Auth',
    },
    { name: 'Clients', description: 'Gestion du profil client' },
    {
      name: 'Abonnements',
      description: 'Packs d abonnement massage du client',
    },
    { name: 'Creneaux', description: 'Creneaux de massage disponibles' },
    { name: 'Reservations', description: 'Reservations de seances client' },
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
          email: {
            type: 'string',
            format: 'email',
            example: 'votre-email@gmail.com',
          },
          password: { type: 'string', example: 'VotreMotDePasse123!' },
          firstName: { type: 'string', example: 'VotrePrenom' },
          lastName: { type: 'string', example: 'VotreNom' },
          phone: { type: 'string', example: '+33 6 00 00 00 00' },
        },
      },
      LoginRequest: {
        type: 'object',
        required: ['email', 'password'],
        properties: {
          email: {
            type: 'string',
            format: 'email',
            example: 'votre-email@gmail.com',
          },
          password: { type: 'string', example: 'VotreMotDePasse123!' },
        },
      },
      ResetPasswordRequest: {
        type: 'object',
        required: ['email'],
        properties: {
          email: {
            type: 'string',
            format: 'email',
            example: 'votre-email@gmail.com',
          },
          redirectTo: {
            type: 'string',
            example:
              'https://massage-backend-qvf7.onrender.com/reset-password',
          },
        },
      },
      AuthenticatedUser: {
        type: 'object',
        properties: {
          id: {
            type: 'string',
            example: '860a7d89-c29f-4672-9dc7-8afa991defda',
          },
          email: { type: 'string', example: 'votre-email@gmail.com' },
          firstName: { type: 'string', example: 'VotrePrenom' },
          lastName: { type: 'string', example: 'VotreNom' },
          phone: { type: 'string', example: '+33 6 00 00 00 00' },
          address: { type: 'string', example: 'Votre adresse' },
          emailConfirmedAt: { type: 'string', nullable: true },
          createdAt: { type: 'string', nullable: true },
          updatedAt: { type: 'string', nullable: true },
        },
      },
      RegisterSuccessResponse: {
        type: 'object',
        properties: {
          message: {
            type: 'string',
            example: 'Client inscrit avec succes.',
          },
          user: { $ref: '#/components/schemas/AuthenticatedUser' },
          session: {
            type: 'object',
            nullable: true,
            additionalProperties: true,
          },
        },
      },
      AuthSuccessResponse: {
        type: 'object',
        properties: {
          message: { type: 'string', example: 'Client connecte avec succes.' },
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
            example: 'Client authentifie charge avec succes.',
          },
          user: { $ref: '#/components/schemas/AuthenticatedUser' },
        },
      },
      CreateProfileRequest: {
        type: 'object',
        properties: {
          firstName: { type: 'string', example: 'VotrePrenom' },
          lastName: { type: 'string', example: 'VotreNom' },
          phone: { type: 'string', example: '+33 6 00 00 00 00' },
          address: { type: 'string', example: 'Votre adresse' },
        },
      },
      UpdateProfileRequest: {
        type: 'object',
        properties: {
          firstName: { type: 'string', example: 'VotrePrenom' },
          lastName: { type: 'string', example: 'VotreNom' },
          phone: { type: 'string', example: '+33 6 00 00 00 00' },
          address: { type: 'string', example: 'Votre adresse' },
        },
      },
      CreateSubscriptionRequest: {
        type: 'object',
        properties: {
          limitedOffer: {
            type: 'boolean',
            example: true,
            description: 'Utiliser une des 10 places de l offre limitee.',
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
        tags: ['Sante'],
        summary: 'Verifier l etat du service',
        responses: {
          200: {
            description: 'Etat de l API',
          },
        },
      },
    },
    '/auth/register': {
      post: {
        tags: ['Authentification'],
        summary: 'Inscrire un nouveau client',
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
            description: 'Client inscrit avec succes',
            content: {
              'application/json': {
                schema: {
                  $ref: '#/components/schemas/RegisterSuccessResponse',
                },
              },
            },
          },
          400: { description: 'Erreur de validation ou erreur Supabase' },
        },
      },
    },
    '/auth/login': {
      post: {
        tags: ['Authentification'],
        summary: 'Connecter un client',
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
            description: 'Client connecte avec succes',
            content: {
              'application/json': {
                schema: { $ref: '#/components/schemas/AuthSuccessResponse' },
              },
            },
          },
          401: { description: 'Identifiants invalides' },
        },
      },
    },
    '/auth/me': {
      get: {
        tags: ['Authentification'],
        summary: 'Recuperer le client authentifie via le token JWT',
        security: [{ bearerAuth: [] }],
        responses: {
          200: {
            description: 'Client authentifie retourne avec succes',
            content: {
              'application/json': {
                schema: { $ref: '#/components/schemas/AuthMeResponse' },
              },
            },
          },
          401: { description: 'Non autorise' },
        },
      },
    },
    '/auth/logout': {
      post: {
        tags: ['Authentification'],
        summary: 'Deconnecter le client courant',
        security: [{ bearerAuth: [] }],
        responses: {
          200: { description: 'Client deconnecte avec succes' },
          401: { description: 'Non autorise' },
        },
      },
    },
    '/auth/reset-password': {
      post: {
        tags: ['Authentification'],
        summary: 'Envoyer un email de reinitialisation du mot de passe',
        requestBody: {
          required: true,
          content: {
            'application/json': {
              schema: { $ref: '#/components/schemas/ResetPasswordRequest' },
            },
          },
        },
        responses: {
          200: { description: 'Email de reinitialisation demande' },
          400: { description: 'Erreur Supabase' },
        },
      },
    },
    '/clients/me': {
      post: {
        tags: ['Clients'],
        summary: 'Creer le profil du client courant',
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
          201: { description: 'Profil cree avec succes' },
          401: { description: 'Non autorise' },
        },
      },
      get: {
        tags: ['Clients'],
        summary: 'Recuperer le profil du client courant',
        security: [{ bearerAuth: [] }],
        responses: {
          200: { description: 'Profil retourne avec succes' },
          404: { description: 'Profil introuvable' },
        },
      },
      put: {
        tags: ['Clients'],
        summary: 'Mettre a jour le profil du client courant',
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
          200: { description: 'Profil mis a jour avec succes' },
          401: { description: 'Non autorise' },
        },
      },
    },
    '/subscriptions': {
      post: {
        tags: ['Abonnements'],
        summary: 'Acheter ou creer un abonnement de 5 seances',
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
          201: { description: 'Abonnement cree avec succes' },
          401: { description: 'Non autorise' },
          409: {
            description:
              'Offre limitee indisponible ou abonnement actif deja existant',
          },
        },
      },
    },
    '/subscriptions/me': {
      get: {
        tags: ['Abonnements'],
        summary: 'Recuperer l abonnement actif du client',
        security: [{ bearerAuth: [] }],
        responses: {
          200: {
            description: 'Abonnement actif',
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
          404: { description: 'Aucun abonnement actif trouve' },
        },
      },
    },
    '/subscriptions/me/deduct': {
      patch: {
        tags: ['Abonnements'],
        summary: 'Deduire une seance de l abonnement actif',
        security: [{ bearerAuth: [] }],
        responses: {
          200: { description: 'Seance deduite avec succes' },
          404: { description: 'Aucun abonnement actif trouve' },
          409: { description: 'Aucune seance restante' },
        },
      },
    },
    '/subscriptions/availability': {
      get: {
        tags: ['Abonnements'],
        summary:
          'Recuperer les places restantes de l offre des 10 premiers clients',
        responses: {
          200: { description: 'Disponibilite de l offre limitee' },
        },
      },
    },
    '/slots': {
      get: {
        tags: ['Creneaux'],
        summary: 'Lister les creneaux de massage disponibles',
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
            description: 'Liste des creneaux',
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
        tags: ['Reservations'],
        summary: 'Reserver un creneau de massage',
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
          201: { description: 'Reservation creee avec succes' },
          400: { description: 'Requete invalide' },
          409: { description: 'Creneau indisponible ou abonnement epuise' },
        },
      },
    },
    '/bookings/me': {
      get: {
        tags: ['Reservations'],
        summary: 'Lister les reservations du client courant',
        security: [{ bearerAuth: [] }],
        responses: {
          200: { description: 'Reservations du client' },
        },
      },
    },
    '/bookings/{id}': {
      delete: {
        tags: ['Reservations'],
        summary: 'Annuler une reservation et liberer le creneau',
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
          200: { description: 'Reservation annulee avec succes' },
          404: { description: 'Reservation introuvable' },
          409: {
            description:
              'Une reservation validee ne peut pas etre annulee',
          },
        },
      },
    },
  },
};

module.exports = swaggerDocument;
