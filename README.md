# CrossFit Audit

Plateforme d'audit opérationnel et financier pour salles CrossFit (frontend React + API Node/Express + SQLite). Ce dépôt regroupe l'application web, l'API, et les scripts de déploiement/migrations.

## Fonctionnalités principales

- Gestion des salles (création, édition, suivi).
- Audits complets avec questionnaire structuré et calculs de KPIs.
- Dashboards de résultats, scores et recommandations.
- Gestion de zones de marché, concurrents et offres commerciales.
- Export/consultation des données via tables dédiées.

## Stack technique

- **Frontend** : Vite + React + TypeScript + Tailwind.
- **Backend** : Node.js + Express + SQLite.
- **Authentification** : JWT (désactivable côté UI).
- **Déploiement** : scripts Nginx + systemd (voir `deploy/`).
- **Migrations DB** : moteur de migrations versionnées (voir `backend/migrations/`).

## Architecture (vue rapide)

```
.
├── backend/                # API Node/Express + SQLite
├── src/                    # Frontend React
├── deploy/                 # Scripts systemd + Nginx
├── docs/                   # Documentation technique et KPI
└── README.md
```

## Prérequis

- Node.js >= 16
- npm
- SQLite (géré par le package `sqlite3`)

## Démarrage local

### 1) Installation

```bash
npm install
```

### 2) Frontend

```bash
npm run dev
```

L'application est disponible sur `http://localhost:5173`.

### 3) Backend

```bash
cd backend
npm install
cp .env.example .env
npm run init-db
npm run dev
```

L'API écoute sur `http://localhost:5176` (voir `/health`).

## Configuration (.env backend)

Un exemple est fourni dans `backend/.env.example`. Les variables clés :

- `PORT` : port de l'API.
- `DB_PATH` : chemin vers la base SQLite.
- `JWT_SECRET` / `JWT_EXPIRE` : sécurité JWT.
- `CORS_ORIGIN` : origine autorisée côté frontend.

## Migrations

Le système de migrations est documenté dans `backend/migrations/README.md`.

Commandes rapides :

```bash
cd backend
npm run migrate:create nom_de_migration
npm run migrate
```

## Déploiement

La procédure complète (systemd + Nginx + SSL) est documentée dans `deploy/README.md`.

## Documentation technique

- Calculs & KPIs : `docs/kpi-calculations.md`.
- Détails API : `backend/README.md`.

## Scripts utiles

```bash
# Frontend
npm run build
npm run lint
npm run typecheck

# Backend (dans backend/)
npm run init-db
npm run dev
```

## Notes fonctionnelles

- Les audits suivent une logique par blocs de questions (finance, RH, commercial, etc.).
- Les scores et recommandations sont calculés à partir des réponses sauvegardées.
- Les zones de marché et concurrents enrichissent l'analyse stratégique.
