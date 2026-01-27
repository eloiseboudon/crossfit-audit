# Configuration de Déploiement - CrossFit Audit

Ce répertoire contient tous les fichiers nécessaires pour déployer l'application CrossFit Audit sur un VPS Ubuntu.

## 📁 Contenu

- **`crossfit-audit-backend.service`** - Service systemd pour le backend Node.js
- **`crossfit-audit-frontend.service`** - Service systemd pour le frontend React
- **`nginx-crossfit-audit`** - Configuration Nginx pour le reverse proxy
- **`setup-services.sh`** - Script d'installation automatique des services

## 🚀 Installation

### Option 1 : Installation automatique (Recommandé)

Si vous venez de cloner le repository :

```bash
cd /home/ubuntu/crossfit-audit/deploy
chmod +x setup-services.sh
sudo ./setup-services.sh
```

Ce script va :
1. Installer toutes les dépendances npm
2. Créer les fichiers .env
3. Initialiser la base de données
4. Builder le frontend
5. Configurer et démarrer les services systemd
6. Configurer Nginx

### Option 2 : Installation manuelle

#### 1. Installation des dépendances

```bash
# Backend
cd /home/ubuntu/crossfit-audit/backend
npm install --production

# Frontend
cd /home/ubuntu/crossfit-audit
npm install
```

#### 2. Configuration des fichiers .env

**Backend** (`backend/.env`) :
```env
NODE_ENV=production
PORT=5177
DB_PATH=./database/crossfit_audit.db
JWT_SECRET=<généré_avec_openssl>
JWT_EXPIRE=7d
CORS_ORIGIN=https://audit.tulipconseil.fr
RATE_LIMIT_WINDOW_MS=900000
RATE_LIMIT_MAX_REQUESTS=100
```

**Frontend** (`.env`) :
```env
VITE_API_URL=https://audit.tulipconseil.fr/api
```

#### 3. Initialisation de la base de données

```bash
cd /home/ubuntu/crossfit-audit/backend
npm run init-db
```

#### 4. Build du frontend

```bash
cd /home/ubuntu/crossfit-audit
npm run build
```

#### 5. Configuration des services systemd

```bash
# Copier les fichiers de service
sudo cp crossfit-audit-backend.service /etc/systemd/system/
sudo cp crossfit-audit-frontend.service /etc/systemd/system/

# Recharger systemd
sudo systemctl daemon-reload

# Activer et démarrer les services
sudo systemctl enable crossfit-audit-backend crossfit-audit-frontend
sudo systemctl start crossfit-audit-backend crossfit-audit-frontend

# Vérifier le statut
sudo systemctl status crossfit-audit-backend
sudo systemctl status crossfit-audit-frontend
```

#### 6. Configuration Nginx

```bash
# Copier la configuration
sudo cp nginx-crossfit-audit /etc/nginx/sites-available/crossfit-audit

# Activer le site
sudo ln -sf /etc/nginx/sites-available/crossfit-audit /etc/nginx/sites-enabled/

# Tester la configuration
sudo nginx -t

# Recharger Nginx
sudo systemctl reload nginx
```

#### 7. Configuration SSL avec Let's Encrypt

```bash
sudo apt install certbot python3-certbot-nginx
sudo certbot --nginx -d audit.tulipconseil.fr
```

## 🔄 Mise à jour

Pour mettre à jour l'application après un push sur GitHub :

```bash
cd /home/ubuntu/crossfit-audit
./deploy.sh
```

Le script `deploy.sh` va :
1. Sauvegarder la base de données
2. Récupérer le code depuis GitHub
3. Mettre à jour les dépendances
4. Rebuilder le frontend
5. Redémarrer les services

## 📊 Commandes utiles

### Gestion des services

```bash
# Voir les logs en temps réel
sudo journalctl -u crossfit-audit-backend -f
sudo journalctl -u crossfit-audit-frontend -f

# Redémarrer les services
sudo systemctl restart crossfit-audit-backend
sudo systemctl restart crossfit-audit-frontend

# Arrêter/Démarrer les services
sudo systemctl stop crossfit-audit-backend
sudo systemctl start crossfit-audit-backend

# Statut des services
sudo systemctl status crossfit-audit-*
```

### Nginx

```bash
# Tester la configuration
sudo nginx -t

# Recharger Nginx
sudo systemctl reload nginx

# Redémarrer Nginx
sudo systemctl restart nginx

# Voir les logs
sudo tail -f /var/log/nginx/access.log
sudo tail -f /var/log/nginx/error.log
```

### Base de données

```bash
# Accéder à la base de données
cd /home/ubuntu/crossfit-audit/backend/database
sqlite3 crossfit_audit.db

# Sauvegarder manuellement
cp crossfit_audit.db crossfit_audit_backup_$(date +%Y%m%d_%H%M%S).db

# Restaurer une sauvegarde
cp /home/ubuntu/crossfit-audit/backups/crossfit_audit_backup_XXXXXX.db crossfit_audit.db
sudo systemctl restart crossfit-audit-backend
```

## 🔧 Dépannage

### Le backend ne démarre pas

```bash
# Voir les logs
sudo journalctl -u crossfit-audit-backend -n 50

# Vérifier le fichier .env
cat /home/ubuntu/crossfit-audit/backend/.env

# Tester manuellement
cd /home/ubuntu/crossfit-audit/backend
node server.js
```

### Le frontend ne démarre pas

```bash
# Voir les logs
sudo journalctl -u crossfit-audit-frontend -n 50

# Vérifier que le build existe
ls -la /home/ubuntu/crossfit-audit/dist

# Rebuilder
cd /home/ubuntu/crossfit-audit
npm run build
```

### Problème de permissions

```bash
# S'assurer que ubuntu est propriétaire
sudo chown -R ubuntu:ubuntu /home/ubuntu/crossfit-audit
```

### Nginx retourne 502 Bad Gateway

```bash
# Vérifier que les services tournent
sudo systemctl status crossfit-audit-backend
sudo systemctl status crossfit-audit-frontend

# Tester les ports localement
curl http://localhost:5177/health
curl http://localhost:5176
```

## 📝 Notes importantes

- Les services tournent avec l'utilisateur `ubuntu`
- Le backend écoute sur le port `5177`
- Le frontend écoute sur le port `5176`
- Nginx fait le reverse proxy et gère le SSL
- Les sauvegardes automatiques sont créées à chaque déploiement
- Les 10 dernières sauvegardes sont conservées

## 🔒 Sécurité

- Changez toujours le `JWT_SECRET` en production
- Configurez SSL avec Let's Encrypt
- Limitez l'accès SSH au VPS
- Mettez à jour régulièrement les dépendances npm
- Surveillez les logs pour détecter les comportements suspects
