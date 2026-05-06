const swaggerDocument = {
  openapi: '3.0.3',
  info: {
    title: 'API Backend David Massage',
    version: '1.0.0',
    description:
      'Backend Express + Supabase pour l authentification, les clients, les abonnements et les réservations.',
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
        description:
          'Le backend accepte aussi les alias FR : password | mot_passe | mot_de_passe, firstName | nom, phone | numero_tel | telephone.',
        properties: {
          email: {
            type: 'string',
            format: 'email',
            example: 'votre-email@gmail.com',
          },
          password: { type: 'string', example: 'VotreMotDePasse123!' },
          mot_passe: { type: 'string', example: 'VotreMotDePasse123!' },
          mot_de_passe: { type: 'string', example: 'VotreMotDePasse123!' },
          firstName: { type: 'string', example: 'VotrePrenom' },
          nom: { type: 'string', example: 'Votre Prenom VotreNom' },
          lastName: { type: 'string', example: 'VotreNom' },
          phone: { type: 'string', example: '+33 6 00 00 00 00' },
          numero_tel: { type: 'string', example: '+33 6 00 00 00 00' },
          telephone: { type: 'string', example: '+33 6 00 00 00 00' },
        },
      },
      LoginRequest: {
        type: 'object',
        required: ['email', 'password'],
        description:
          'Le backend accepte aussi les alias FR : password | mot_passe | mot_de_passe.',
        properties: {
          email: {
            type: 'string',
            format: 'email',
            example: 'votre-email@gmail.com',
          },
          password: { type: 'string', example: 'VotreMotDePasse123!' },
          mot_passe: { type: 'string', example: 'VotreMotDePasse123!' },
          mot_de_passe: { type: 'string', example: 'VotreMotDePasse123!' },
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
      ChangePasswordRequest: {
        type: 'object',
        required: ['currentPassword', 'newPassword'],
        properties: {
          currentPassword: {
            type: 'string',
            example: 'AncienMotDePasse123!',
          },
          newPassword: {
            type: 'string',
            example: 'NouveauMotDePasse123!',
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
            example: 'Client inscrit avec succès.',
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
          message: { type: 'string', example: 'Client connecté avec succès.' },
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
            example: 'Client authentifié chargé avec succès.',
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
            description: 'État de l API',
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
            description: 'Client inscrit avec succès',
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
            description: 'Client connecté avec succès',
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
        summary: 'Récupérer le client authentifié via le token JWT',
        security: [{ bearerAuth: [] }],
        responses: {
          200: {
            description: 'Client authentifié retourné avec succès',
            content: {
              'application/json': {
                schema: { $ref: '#/components/schemas/AuthMeResponse' },
              },
            },
          },
          401: { description: 'Non autorisé' },
        },
      },
    },
    '/auth/logout': {
      post: {
        tags: ['Authentification'],
        summary: 'Déconnecter le client courant',
        security: [{ bearerAuth: [] }],
        responses: {
          200: { description: 'Client déconnecté avec succès' },
          401: { description: 'Non autorisé' },
        },
      },
    },
    '/auth/reset-password': {
      post: {
        tags: ['Authentification'],
        summary: 'Envoyer un email de réinitialisation du mot de passe',
        requestBody: {
          required: true,
          content: {
            'application/json': {
              schema: { $ref: '#/components/schemas/ResetPasswordRequest' },
            },
          },
        },
        responses: {
          200: { description: 'Email de réinitialisation demandé' },
          400: { description: 'Erreur Supabase' },
        },
      },
    },
    '/auth/change-password': {
      post: {
        tags: ['Authentification'],
        summary: 'Changer le mot de passe du client authentifié',
        security: [{ bearerAuth: [] }],
        requestBody: {
          required: true,
          content: {
            'application/json': {
              schema: { $ref: '#/components/schemas/ChangePasswordRequest' },
            },
          },
        },
        responses: {
          200: { description: 'Mot de passe changé avec succès' },
          400: { description: 'Requête invalide ou erreur Supabase' },
          401: { description: 'Mot de passe actuel invalide ou non autorisé' },
        },
      },
    },
    '/clients/me': {
      post: {
        tags: ['Clients'],
        summary: 'Créer le profil du client courant',
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
          201: { description: 'Profil créé avec succès' },
          401: { description: 'Non autorisé' },
        },
      },
      get: {
        tags: ['Clients'],
        summary: 'Récupérer le profil du client courant',
        security: [{ bearerAuth: [] }],
        responses: {
          200: { description: 'Profil retourné avec succès' },
          404: { description: 'Profil introuvable' },
        },
      },
      put: {
        tags: ['Clients'],
        summary: 'Mettre à jour le profil du client courant',
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
          200: { description: 'Profil mis à jour avec succès' },
          401: { description: 'Non autorisé' },
        },
      },
    },
    '/subscriptions': {
      post: {
        tags: ['Abonnements'],
        summary: 'Acheter ou créer un abonnement de 5 séances',
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
          201: { description: 'Abonnement créé avec succès' },
          401: { description: 'Non autorisé' },
          409: {
            description:
              'Offre limitée indisponible ou abonnement actif déjà existant',
          },
        },
      },
    },
    '/subscriptions/me': {
      get: {
        tags: ['Abonnements'],
        summary: 'Récupérer l abonnement actif du client',
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
          404: { description: 'Aucun abonnement actif trouvé' },
        },
      },
    },
    '/subscriptions/me/deduct': {
      patch: {
        tags: ['Abonnements'],
        summary: 'Déduire une séance de l abonnement actif',
        security: [{ bearerAuth: [] }],
        responses: {
          200: { description: 'Séance déduite avec succès' },
          404: { description: 'Aucun abonnement actif trouvé' },
          409: { description: 'Aucune séance restante' },
        },
      },
    },
    '/subscriptions/availability': {
      get: {
        tags: ['Abonnements'],
        summary:
          'Récupérer les places restantes de l offre des 10 premiers clients',
        responses: {
          200: { description: 'Disponibilité de l offre limitée' },
        },
      },
    },
    '/slots': {
      get: {
        tags: ['Creneaux'],
        summary: 'Lister les créneaux de massage disponibles',
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
            description: 'Liste des créneaux',
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
        summary: 'Réserver un créneau de massage',
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
          201: { description: 'Réservation créée avec succès' },
          400: { description: 'Requête invalide' },
          409: { description: 'Créneau indisponible ou abonnement épuisé' },
        },
      },
    },
    '/bookings/me': {
      get: {
        tags: ['Reservations'],
        summary: 'Lister les réservations du client courant',
        security: [{ bearerAuth: [] }],
        responses: {
          200: { description: 'Réservations du client' },
        },
      },
    },
    '/bookings/{id}': {
      delete: {
        tags: ['Reservations'],
        summary: 'Annuler une réservation et libérer le créneau',
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
          200: { description: 'Réservation annulée avec succès' },
          404: { description: 'Réservation introuvable' },
          409: {
            description:
              'Une réservation validée ne peut pas être annulée',
          },
        },
      },
    },
  },
};

module.exports = swaggerDocument;
