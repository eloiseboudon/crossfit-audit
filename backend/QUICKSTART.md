# 🚀 GUIDE DE DÉMARRAGE RAPIDE

## Installation locale (5 minutes)

### 1️⃣ Installation
```bash
cd backend
npm install
```

### 2️⃣ Configuration
```bash
# Copier le fichier de configuration
cp .env.example .env

# Éditer si nécessaire (optionnel pour le test)
nano .env
```

### 3️⃣ Initialiser la base de données
```bash
npm run init-db
```

✅ Vous devriez voir :
```
🚀 Initialisation de la base de données...
✅ Base de données initialisée avec succès !
📊 Tables créées: users, gyms, audits, etc.
```

### 4️⃣ Démarrer le serveur
```bash
npm run dev
```

✅ Vous devriez voir :
```
🚀 ========================================
✅ Serveur démarré en mode development
🌐 URL: http://localhost:5176
📊 Health check: http://localhost:5176/health
🏋️  CrossFit Audit API - Tulip Conseil
========================================
```

### 5️⃣ Tester l'API

**Test 1 : Health check**
```bash
curl http://localhost:5176/health
```

Réponse attendue :
```json
{
  "status": "ok",
  "message": "CrossFit Audit API is running",
  "timestamp": "2026-01-22T...",
  "environment": "development"
}
```

**Test 2 : Créer un compte**
```bash
curl -X POST http://localhost:5176/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "email": "test@test.com",
    "password": "test123",
    "name": "Test User"
  }'
```

Réponse attendue :
```json
{
  "success": true,
  "message": "Compte créé avec succès",
  "user": { ... },
  "token": "eyJhbGciOi..."
}
```

**Test 3 : Se connecter**
```bash
curl -X POST http://localhost:5176/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "test@test.com",
    "password": "test123"
  }'
```

## ⚡ PROCHAINES ÉTAPES

### Connecter votre frontend
Dans votre application React, configurez l'URL de l'API :

```javascript
// config.js ou .env
const API_URL = 'http://localhost:5176/api';

// Exemple d'appel
const response = await fetch(`${API_URL}/gyms`, {
  headers: {
    'Authorization': `Bearer ${token}`,
    'Content-Type': 'application/json'
  }
});
```

### Déployer sur VPS
Voir le fichier README.md section "Déploiement sur VPS"

## 🆘 Problèmes courants

### Erreur "port already in use"
```bash
# Trouver le processus qui utilise le port 5176
lsof -i :5176

# Tuer le processus
kill -9 <PID>

# Ou changer le port dans .env
PORT=5177
```

### Base de données corrompue
```bash
# Supprimer et recréer
rm -rf database/
npm run init-db
```

### Modules non trouvés
```bash
# Réinstaller les dépendances
rm -rf node_modules package-lock.json
npm install
```

## 📚 Documentation complète
Voir README.md pour la documentation complète

## 💡 Astuce
Utilisez un client REST comme [Postman](https://www.postman.com/) ou [Insomnia](https://insomnia.rest/) pour tester vos routes plus facilement !
