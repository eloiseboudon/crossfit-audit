# Instructions projet — CrossFit Audit

## Description

Application d'audit opérationnel et financier pour salles de CrossFit. Questionnaire de 250+ questions, calcul de KPIs, scoring, recommandations, et analyse de marché. SPA React + API Express + SQLite.

## Stack technique

- **Frontend** : React 18 + TypeScript 5.5 + Vite 5 + Tailwind CSS
- **Backend** : Node.js + Express 4 + better-sqlite3
- **Base de données** : SQLite (fichier local)
- **Tests** : Vitest + Testing Library (frontend), Jest + Supertest (backend)
- **Linting** : ESLint 9 (flat config) + lint-staged + Husky (pre-commit)
- **CI/CD** : GitHub Actions (lint + tests + deploy SSH)

## Commandes

```bash
# Frontend
npm run dev                    # Dev server Vite (port 5176)
npm run build                  # Build TypeScript + Vite
npm run lint                   # ESLint
npm run typecheck              # Vérification TypeScript
npm run test:frontend          # Tests Vitest
npm run test:coverage          # Coverage

# Backend (depuis /backend)
npm run dev                    # Express + nodemon (port 5177)
npm start                      # Prod
npm test                       # Tests Jest
npm run test:business          # Tests logique métier uniquement
npm run test:calculations      # Tests calculs uniquement
npm run init-db                # Initialiser la BDD SQLite
npm run migrate                # Appliquer les migrations
npm run migrate:status         # Statut des migrations

# Root
npm test                       # Tous les tests (front + back)
```

## Structure du projet

```
crossfit-audit/
├── src/                       # Frontend React + TypeScript
│   ├── pages/                 # Pages (Home, GymForm, AuditForm, Dashboard...)
│   ├── components/ui/         # Composants réutilisables (Button, Card, Input...)
│   ├── hooks/                 # Custom hooks CRUD (useGyms, useAudits...)
│   └── lib/                   # Logique métier
│       ├── types.ts           # Types TypeScript (~900 lignes)
│       ├── calculations.ts    # Calculs KPIs et scores
│       ├── questionnaire.ts   # 250+ questions (5 blocs)
│       └── api.ts             # Client API avec auth JWT
├── backend/                   # API Express + SQLite
│   ├── controllers/           # Handlers (auth, gym, audit, market, benchmark)
│   ├── models/                # Modèles SQLAlchemy (User, Gym, Audit, Answer...)
│   ├── routes/                # Définitions routes REST
│   ├── utils/                 # Calculs, extraction, erreurs
│   ├── constants/             # Seuils de scoring
│   ├── migrations/            # Migrations SQL versionnées
│   ├── schema.sql             # Schéma complet SQLite
│   └── __tests__/             # Tests Jest
├── .github/workflows/         # CI (lint + tests) + CD (deploy)
├── docs/                      # Documentation technique
└── deploy/                    # Scripts et configs déploiement
```

## Conventions de code

- **Frontend** : PascalCase composants, camelCase fonctions, hooks `useXxx`
- **Backend** : camelCase controllers/utils, PascalCase modèles
- **Base de données** : snake_case tables et colonnes, UUIDs en TEXT
- **API** : REST `/api/resource/:id`, réponses `{ success, message, data }`
- **Auth** : JWT (expiration 7j)
- **Design** : palette Tulip Conseil (primaire `#48737F`, secondaire `#CCBB90`, accent `#E89F5C`)
- **Navigation** : SPA sans React Router, gestion par state dans App.tsx
- **Hook pattern** : factory générique `useEntityCRUD` + hooks spécialisés

## Blocs questionnaire

1. Identité & Contexte (35 questions)
2. Analyse Financière (80 questions)
3. Adhésions & Clientèle (50 questions)
4. Planning & Opérations (45 questions)
5. RH & Coaching (40 questions)

## Documentation existante

- `README.md` : vue d'ensemble, installation, features
- `backend/README.md` : API complète, endpoints, déploiement VPS
- `backend/migrations/README.md` : système de migrations
- `docs/kpi-calculations.md` : formules de calcul KPIs
