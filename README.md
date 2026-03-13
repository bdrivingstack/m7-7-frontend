# M7Sept — Gestion financière simple et intelligente

Plateforme SaaS de gestion financière pour auto-entrepreneurs, micro-entreprises et PME françaises.

## Stack technique

- **Frontend** : React 18 + TypeScript + Vite + TailwindCSS + shadcn/ui
- **Backend** : Node.js + Express + Prisma + PostgreSQL
- **Déploiement** : Vercel (frontend) — Railway (backend, à venir)

## Développement local

### Frontend

```bash
cd m7-7-frontend
npm install
npm run dev
# → http://127.0.0.1:8080
```

### Backend

```bash
cd m7-7-backend
npm install
npm run dev
# → http://localhost:4000
```

### Base de données

```bash
npx prisma db push
npx prisma studio  # → http://localhost:5555
```

## Variables d'environnement backend

```env
DATABASE_URL=postgresql://postgres:PASSWORD@localhost:5432/m77
JWT_SECRET=...
ENCRYPTION_KEY=...
STRIPE_SECRET_KEY=sk_test_xxx
STRIPE_WEBHOOK_SECRET=whsec_xxx
FRONTEND_URL=http://127.0.0.1:8080
NODE_ENV=development
PORT=4000
```

## Fonctionnalités

- Facturation, devis, avoirs, récurrents
- Comptabilité, TVA, cotisations sociales
- Rapprochement bancaire, paiements
- Facture électronique Factur-X conforme réforme 2026
- Assistant IA financier
- Portail client

## Licence

Propriétaire — © M7Sept. Tous droits réservés.
