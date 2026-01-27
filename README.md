# CrossFit Audit

Application d'audit pour salles CrossFit (frontend React + backend Node/Express + SQLite).

## Vue d'ensemble

- **Frontend** : Vite + React + TypeScript (interface d'audit et dashboard).
- **Backend** : API Express + SQLite (gestion utilisateurs, audits, KPIs, recommandations).
- **Déploiement** : scripts systemd + Nginx (voir `deploy/`).
- **Migrations DB** : système versionné (voir `backend/migrations/`).

## Structure rapide du repo

```
.
├── backend/                # API Node/Express + SQLite
├── src/                    # Frontend React
├── deploy/                 # Scripts systemd + Nginx
├── docs/                   # Documentation synthétique
└── README.md
```

## Démarrage local (développeur)

### Frontend

```bash
npm install
npm run dev
```

### Backend

```bash
cd backend
npm install
cp .env.example .env
npm run init-db
npm run dev
```

## Déploiement

Consultez `deploy/README.md` pour la procédure complète (services systemd + Nginx + SSL). 

## Documentation

- **Calculs & KPIs** : `docs/kpi-calculations.md`.
- **Backend** : `backend/README.md`.
- **Migrations** : `backend/migrations/README.md`.

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
