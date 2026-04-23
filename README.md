# David Massage Backend

Backend Express + Supabase pour l'application Salon de Massage.

## Liens

- API production Render: `https://massage-backend-qvf7.onrender.com`
- Swagger production: `https://massage-backend-qvf7.onrender.com/api/docs/`
- Supabase project: `https://supabase.com/dashboard/project/ejqshvcdiicluyasfoxh`
- GitHub Render source: `https://github.com/farouk-collab/massage-backend`
- GitLab: `https://gitlab.com/salon-massage-app/salondemassage01-project`

## Fonctionnalites backend

- Authentification client via Supabase Auth.
- Gestion profil client.
- Abonnement pack 5 seances.
- Disponibilite de l'offre limitee aux 10 premiers clients.
- Creneaux disponibles.
- Reservation et annulation de seances.
- Swagger UI.
- Collection Postman.

## Installation locale

```bash
npm install
cp .env.example .env
npm start
```

API locale:

```text
http://localhost:10000
```

Swagger local:

```text
http://localhost:10000/api/docs/
```

## Variables d'environnement

Voir [docs/env.md](docs/env.md).

## Deploiement

Voir [docs/deployment.md](docs/deployment.md).

## Postman

Importer la collection:

```text
postman/David-Massage-Backend.postman_collection.json
```

Variables Postman a definir:

- `baseUrl`: `https://massage-backend-qvf7.onrender.com/api`
- `accessToken`: token retourne par `POST /auth/login`
- `slotId`: identifiant de creneau
- `subscriptionId`: identifiant d'abonnement
- `bookingId`: identifiant de reservation
