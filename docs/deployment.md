# Infra et deploiement

## Render backend

Service:

```text
massage-backend
```

URL:

```text
https://massage-backend-qvf7.onrender.com
```

Swagger:

```text
https://massage-backend-qvf7.onrender.com/api/docs/
```

Dashboard:

```text
https://dashboard.render.com/web/srv-d7ksrnugvqtc7385mhq0
```

Configuration:

- Runtime: Node
- Build command: `npm install`
- Start command: `node src/server.js`
- Health check path: `/api/health`
- Branch: `main`
- Auto-deploy: actif

## GitHub vers Render

Repo source Render:

```text
https://github.com/farouk-collab/massage-backend
```

Chaque push sur `main` peut redeployer le backend.

## GitLab

Repo GitLab:

```text
https://gitlab.com/salon-massage-app/salondemassage01-project
```

La branche `main` est protegee. Les pushes backend passent par:

```text
feature/backend-api
```

Merge Request:

```text
https://gitlab.com/salon-massage-app/salondemassage01-project/-/merge_requests/new?merge_request%5Bsource_branch%5D=feature%2Fbackend-api
```

## Vercel frontend

Le frontend n'est pas dans ce repo backend. Procedure prevue:

1. Importer le repo frontend dans Vercel.
2. Ajouter l'URL API:

```env
NEXT_PUBLIC_API_URL=https://massage-backend-qvf7.onrender.com/api
```

3. Activer l'auto-deploy sur la branche principale.
4. Configurer le domaine custom dans Vercel.

## Domaine et SSL

Procedure cible:

1. Ajouter le domaine dans Vercel pour le frontend.
2. Ajouter un sous-domaine API si besoin dans Render.
3. Creer les records DNS chez OVH.
4. Attendre la validation SSL automatique.

Exemple:

```text
app.domaine.tld    -> Vercel
api.domaine.tld    -> Render
```

## Verification production

```bash
curl https://massage-backend-qvf7.onrender.com/api/health
curl -I https://massage-backend-qvf7.onrender.com/api/docs/
```

Reponse attendue health:

```json
{"status":"ok","supabaseConfigured":true}
```
