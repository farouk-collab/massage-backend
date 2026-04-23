# Variables d'environnement

Ne jamais commiter le fichier `.env`.

## Backend obligatoire

```env
PORT=10000
SUPABASE_URL=https://ejqshvcdiicluyasfoxh.supabase.co
SUPABASE_ANON_KEY=...
SUPABASE_SERVICE_ROLE_KEY=...
SUPABASE_RESET_PASSWORD_REDIRECT_URL=https://massage-backend-qvf7.onrender.com/reset-password
```

## Paiement et emails, a brancher ensuite

```env
STRIPE_SECRET_KEY=...
STRIPE_WEBHOOK_SECRET=...
RESEND_API_KEY=...
BREVO_API_KEY=...
```

## Render

Dans Render:

1. Ouvrir `massage-backend`.
2. Aller dans `Environment`.
3. Ajouter les variables ci-dessus.
4. Sauvegarder.
5. Redeployer le service.

## Supabase

Projet Supabase:

```text
ejqshvcdiicluyasfoxh
```

Dashboard:

```text
https://supabase.com/dashboard/project/ejqshvcdiicluyasfoxh
```

Les migrations sont dans:

```text
supabase/migrations
```

Commande:

```bash
npx supabase@latest db push --linked --include-all
```
