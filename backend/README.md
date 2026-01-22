# 🏋️ CrossFit Audit Backend API

Backend Node.js/Express pour l'application d'audit CrossFit - Tulip Conseil

## 📋 Prérequis

- Node.js >= 16.x
- npm ou yarn
- SQLite3 (inclus avec sqlite3 package)

## 🚀 Installation

### 1. Installation des dépendances

```bash
cd backend
npm install
```

### 2. Configuration de l'environnement

Copier le fichier `.env.example` en `.env` et modifier les valeurs :

```bash
cp .env.example .env
```

Contenu du fichier `.env` :

```env
NODE_ENV=development
PORT=5176

# Base de données
DB_PATH=./database/crossfit_audit.db

# JWT Authentication
JWT_SECRET=your-super-secret-jwt-key-change-this-in-production
JWT_EXPIRE=7d

# CORS
CORS_ORIGIN=http://localhost:5173

# Rate Limiting
RATE_LIMIT_WINDOW_MS=900000
RATE_LIMIT_MAX_REQUESTS=100
```

⚠️ **IMPORTANT** : Changez `JWT_SECRET` en production !

### 3. Initialiser la base de données

```bash
npm run init-db
```

Cette commande va :
- Créer le dossier `database/` s'il n'existe pas
- Créer le fichier `crossfit_audit.db`
- Créer toutes les tables avec leurs index

### 4. Démarrer le serveur

**Mode développement (avec auto-reload) :**
```bash
npm run dev
```

**Mode production :**
```bash
npm start
```

Le serveur démarre sur `http://localhost:5176`

## 📁 Structure du projet

```
backend/
├── config/
│   └── database.js          # Configuration SQLite
├── controllers/
│   ├── authController.js    # Authentification
│   ├── gymController.js     # Gestion des salles
│   ├── auditController.js   # Gestion des audits
│   └── marketController.js  # Concurrents, zones, offres
├── middleware/
│   ├── auth.js              # Middleware JWT
│   └── errorHandler.js      # Gestion des erreurs
├── models/
│   ├── User.js              # Modèle User
│   ├── Gym.js               # Modèle Gym
│   ├── Audit.js             # Modèle Audit
│   ├── Answer.js            # Modèle Answer
│   ├── AuditData.js         # KPI, Score, Recommendation
│   └── Market.js            # Competitor, MarketZone, GymOffer
├── routes/
│   ├── auth.js              # Routes authentification
│   ├── gyms.js              # Routes salles
│   ├── audits.js            # Routes audits
│   └── market.js            # Routes marché
├── scripts/
│   └── initDatabase.js      # Script d'initialisation DB
├── database/                # Dossier de la base de données
│   └── crossfit_audit.db    # Base SQLite (créée automatiquement)
├── .env                     # Variables d'environnement
├── .env.example             # Template des variables
├── .gitignore
├── package.json
├── server.js                # Point d'entrée
└── README.md
```

## 🔐 Authentification

L'API utilise JWT (JSON Web Tokens) pour l'authentification.

### Créer un compte

```bash
POST /api/auth/register
Content-Type: application/json

{
  "email": "valentin@tulipconseil.com",
  "password": "motdepasse123",
  "name": "Valentin"
}
```

### Se connecter

```bash
POST /api/auth/login
Content-Type: application/json

{
  "email": "valentin@tulipconseil.com",
  "password": "motdepasse123"
}
```

Réponse :
```json
{
  "success": true,
  "message": "Connexion réussie",
  "user": {
    "id": "uuid",
    "email": "valentin@tulipconseil.com",
    "name": "Valentin",
    "role": "user"
  },
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
}
```

### Utiliser le token

Pour toutes les routes protégées, ajouter le header :

```
Authorization: Bearer <votre_token>
```

## 🛣️ Routes API

### Authentification (`/api/auth`)

| Méthode | Route | Description | Auth |
|---------|-------|-------------|------|
| POST | `/register` | Créer un compte | Non |
| POST | `/login` | Se connecter | Non |
| GET | `/me` | Infos utilisateur | Oui |
| PUT | `/password` | Changer mot de passe | Oui |

### Salles (`/api/gyms`)

| Méthode | Route | Description | Auth |
|---------|-------|-------------|------|
| GET | `/` | Liste des salles | Oui |
| GET | `/:id` | Détails d'une salle | Oui |
| POST | `/` | Créer une salle | Oui |
| PUT | `/:id` | Modifier une salle | Oui |
| DELETE | `/:id` | Supprimer une salle | Oui |

### Audits (`/api/audits`)

| Méthode | Route | Description | Auth |
|---------|-------|-------------|------|
| GET | `/` | Liste des audits | Oui |
| GET | `/:id` | Détails d'un audit | Oui |
| GET | `/:id/complete` | Audit complet avec données | Oui |
| POST | `/` | Créer un audit | Oui |
| PUT | `/:id` | Modifier un audit | Oui |
| DELETE | `/:id` | Supprimer un audit | Oui |
| GET | `/:id/answers` | Récupérer les réponses | Oui |
| POST | `/:id/answers` | Sauvegarder les réponses | Oui |
| POST | `/:id/kpis` | Sauvegarder les KPIs | Oui |
| POST | `/:id/scores` | Sauvegarder les scores | Oui |
| GET | `/:id/global-score` | Score global | Oui |
| GET | `/:id/recommendations` | Recommandations | Oui |
| POST | `/:id/recommendations` | Sauvegarder recommandations | Oui |

### Concurrents (`/api/competitors`)

| Méthode | Route | Description | Auth |
|---------|-------|-------------|------|
| GET | `/?gym_id=xxx` | Liste des concurrents | Oui |
| GET | `/:id` | Détails d'un concurrent | Oui |
| POST | `/` | Créer un concurrent | Oui |
| PUT | `/:id` | Modifier un concurrent | Oui |
| DELETE | `/:id` | Supprimer un concurrent | Oui |

### Zones marché (`/api/market-zones`)

| Méthode | Route | Description | Auth |
|---------|-------|-------------|------|
| GET | `/` | Liste des zones | Oui |
| GET | `/:id` | Détails d'une zone | Oui |
| POST | `/` | Créer une zone | Oui |
| PUT | `/:id` | Modifier une zone | Oui |
| DELETE | `/:id` | Supprimer une zone | Oui |

### Offres (`/api/gym-offers`)

| Méthode | Route | Description | Auth |
|---------|-------|-------------|------|
| GET | `/?gym_id=xxx` | Liste des offres | Oui |
| GET | `/:id` | Détails d'une offre | Oui |
| POST | `/` | Créer une offre | Oui |
| PUT | `/:id` | Modifier une offre | Oui |
| DELETE | `/:id` | Supprimer une offre | Oui |

## 📊 Exemples de requêtes

### Créer une salle

```bash
POST /api/gyms
Authorization: Bearer <token>
Content-Type: application/json

{
  "name": "CrossFit Varilhes",
  "address": "10 rue du Sport",
  "city": "Varilhes",
  "postal_code": "09120",
  "contact_name": "Valentin",
  "phone": "0612345678",
  "email": "contact@crossfitvarilhes.fr",
  "website": "https://crossfitvarilhes.fr"
}
```

### Créer un audit

```bash
POST /api/audits
Authorization: Bearer <token>
Content-Type: application/json

{
  "gym_id": "uuid-de-la-salle",
  "status": "draft",
  "audit_date_start": "2026-01-01",
  "baseline_period": "2025-Q4",
  "currency": "EUR"
}
```

### Sauvegarder des réponses

```bash
POST /api/audits/{audit_id}/answers
Authorization: Bearer <token>
Content-Type: application/json

{
  "answers": [
    {
      "block_code": "FINANCE",
      "question_code": "CA_MENSUEL",
      "value": "15000"
    },
    {
      "block_code": "FINANCE",
      "question_code": "MARGE_BRUTE",
      "value": "65"
    }
  ]
}
```

## 🔧 Déploiement sur VPS

### 1. Préparer le VPS

```bash
# Installer Node.js
curl -fsSL https://deb.nodesource.com/setup_18.x | sudo -E bash -
sudo apt-get install -y nodejs

# Installer PM2 pour la gestion des processus
sudo npm install -g pm2
```

### 2. Transférer les fichiers

```bash
# Depuis votre machine locale
scp -r backend/ user@votre-vps:/var/www/crossfit-audit/
```

### 3. Configuration sur le VPS

```bash
cd /var/www/crossfit-audit/backend

# Installer les dépendances
npm install --production

# Créer le fichier .env avec les bonnes valeurs
nano .env

# Initialiser la base de données
npm run init-db

# Démarrer avec PM2
pm2 start server.js --name crossfit-api
pm2 save
pm2 startup
```

### 4. Configuration Nginx (optionnel)

```nginx
server {
    listen 80;
    server_name api.votredomaine.com;

    location / {
        proxy_pass http://localhost:5176;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_cache_bypass $http_upgrade;
    }
}
```

### 5. SSL avec Let's Encrypt (recommandé)

```bash
sudo apt install certbot python3-certbot-nginx
sudo certbot --nginx -d api.votredomaine.com
```

## 🛡️ Sécurité

- ✅ Helmet.js activé
- ✅ Rate limiting configuré
- ✅ CORS configuré
- ✅ Validation des données
- ✅ Hash des mots de passe (bcrypt)
- ✅ JWT avec expiration
- ⚠️ Changez JWT_SECRET en production
- ⚠️ Utilisez HTTPS en production

## 📝 Logs

Les logs sont affichés dans la console. Pour les logs persistants en production :

```bash
# Voir les logs avec PM2
pm2 logs crossfit-api

# Logs dans un fichier
pm2 start server.js --name crossfit-api --log /var/log/crossfit-api.log
```

## 🐛 Debugging

```bash
# Mode développement avec logs détaillés
NODE_ENV=development npm run dev

# Tester une route
curl http://localhost:5176/health

# Tester l'authentification
curl -X POST http://localhost:5176/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"test@test.com","password":"test123"}'
```

## 📞 Support

Pour toute question : Valentin - Tulip Conseil

---

**Version :** 1.0.0  
**Dernière mise à jour :** Janvier 2026
