# CRM Propriétaire — Instructions Claude Code

## Stack
- Backend : NestJS, Architecture Hexagonale, TypeScript
- Frontend : React + Vite + Tailwind v4
- Base de données : PostgreSQL + Prisma
- Auth : JWT multi-tenant

## Règles frontend CRITIQUES
- Ne JAMAIS utiliser les classes Tailwind — elles ne compilent pas
- Toujours utiliser les styles inline style={{ }} uniquement
- Couleurs : indigo #4f46e5, gris #6b7280, fond #f8fafc

## Règles sécurité CRITIQUES
- Toujours utiliser TenantContext.getTenantIdOrThrow() dans les repositories
- Toujours filtrer par tenantId dans chaque requête Prisma
- Ne jamais exposer le tenantId depuis le body — uniquement depuis le JWT

## Commandes
- docker-compose up -d
- cd backend && npm run start:dev
- cd frontend && npm run dev
- Compte test : admin@agence.com / password123
