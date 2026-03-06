# CRM Propriétaire

Ce projet est une réimplémentation complète et originale d'un CRM, utilisant une architecture moderne (Hexagonale) et une isolation multi-tenant stricte.

## Structure du Projet

- `backend/` : API NestJS (Node.js/TypeScript). Architecture Hexagonale.
- `frontend/` : Application Next.js (React).
- `docker-compose.yml` : Base de données PostgreSQL locale.

## Démarrage Rapide

### 1. Pré-requis
- Node.js 20+
- Docker Desktop (Doit être lancé !)

### 2. Lancer la Base de Données
```bash
docker compose up -d
```

### 3. Backend
```bash
cd backend
npm install
npx prisma migrate dev --name init # Crée les tables
npm run start:dev
```
L'API sera accessible sur http://localhost:3000

### 4. Frontend
```bash
cd frontend
npm install
npm run dev
```
L'application sera accessible sur http://localhost:3000 (Le port Next.js par défaut)
> **Note** : Si le port 3000 est pris par le backend, Next.js utilisera le 3001.

## Architecture
Voir le document `brain/concept_crm_proprietaire.md` et `brain/implementation_strategy_crm.md` pour les détails de conception.
Terminal 1 — Base de données
bashcd ~/Downloads/crm-proprietaire
docker-compose up -d
Terminal 2 — Backend
bashcd ~/Downloads/crm-proprietaire/backend
npm run start:dev
Terminal 3 — Frontend
bashcd ~/Downloads/crm-proprietaire/frontend
npm run dev
Puis ouvre http://localhost:3000 dans ton navigateur.

Email : admin@agence.com
Mot de passe : password123