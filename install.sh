#!/bin/bash
set -e

###############################################################################
# Script d'installation - CrossFit Audit
# Installation initiale sur VPS Ubuntu
###############################################################################

# Couleurs pour les logs
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Variables à modifier selon votre configuration
DOMAIN="audit.tulipconseil.fr"  # Changez par votre domaine
GITHUB_REPO="https://github.com/VOTRE_USERNAME/crossfit-audit.git"  # Changez par votre repo
APP_DIR="/home/ubuntu/crossfit-audit"
BRANCH="main"

echo -e "${BLUE}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
echo -e "${BLUE}  🏋️  Installation CrossFit Audit - $(date '+%Y-%m-%d %H:%M:%S')${NC}"
echo -e "${BLUE}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
echo ""

# 1. Vérification des prérequis
echo -e "${YELLOW}[1/8]${NC} Vérification des prérequis..."

# Vérifier Node.js
if ! command -v node &> /dev/null; then
    echo -e "${YELLOW}→${NC} Installation de Node.js 18.x..."
    curl -fsSL https://deb.nodesource.com/setup_18.x | sudo -E bash -
    sudo apt-get install -y nodejs
fi

NODE_VERSION=$(node -v)
NPM_VERSION=$(npm -v)
echo -e "${GREEN}✓${NC} Node.js ${NODE_VERSION} installé"
echo -e "${GREEN}✓${NC} npm ${NPM_VERSION} installé"

# 2. Cloner le repository
echo -e "\n${YELLOW}[2/8]${NC} Clonage du repository GitHub..."

if [ -d "$APP_DIR" ]; then
    echo -e "${RED}✗${NC} Le répertoire $APP_DIR existe déjà"
    echo -e "  L'application semble déjà installée."
    echo -e "  ${YELLOW}Pour mettre à jour l'application existante, utilisez :${NC}"
    echo -e "  ${BLUE}cd $APP_DIR && ./deploy.sh${NC}"
    exit 1
fi

git clone -b $BRANCH $GITHUB_REPO $APP_DIR
cd $APP_DIR
echo -e "${GREEN}✓${NC} Repository cloné dans $APP_DIR"

# 3. Configuration du Backend
echo -e "\n${YELLOW}[3/8]${NC} Configuration du backend..."

cd $APP_DIR/backend

# Installer les dépendances
npm install --production

# Créer le fichier .env si inexistant
if [ ! -f .env ]; then
    echo -e "${YELLOW}→${NC} Création du fichier .env..."
    cat > .env << EOF
NODE_ENV=production
PORT=5177

# Base de données
DB_PATH=./database/crossfit_audit.db

# JWT Authentication (CHANGEZ CETTE CLÉ EN PRODUCTION!)
JWT_SECRET=$(openssl rand -base64 32)
JWT_EXPIRE=7d

# CORS
CORS_ORIGIN=https://$DOMAIN

# Rate Limiting
RATE_LIMIT_WINDOW_MS=900000
RATE_LIMIT_MAX_REQUESTS=100
EOF
    echo -e "${GREEN}✓${NC} Fichier .env créé avec JWT_SECRET généré"
else
    echo -e "${GREEN}✓${NC} Fichier .env existant conservé"
fi

# Initialiser la base de données
echo -e "${YELLOW}→${NC} Initialisation de la base de données..."
npm run init-db
echo -e "${GREEN}✓${NC} Base de données initialisée"

# 4. Configuration du Frontend
echo -e "\n${YELLOW}[4/8]${NC} Configuration du frontend..."

cd $APP_DIR

# Créer le fichier .env pour le frontend
cat > .env << EOF
VITE_API_URL=https://$DOMAIN/api
EOF

# Installer les dépendances
npm install

# Build du frontend
npm run build
echo -e "${GREEN}✓${NC} Frontend buildé avec succès"

# 5. Création du service systemd pour le backend
echo -e "\n${YELLOW}[5/8]${NC} Création du service systemd pour le backend..."

sudo tee /etc/systemd/system/crossfit-audit-backend.service > /dev/null << EOF
[Unit]
Description=CrossFit Audit Backend API
After=network.target

[Service]
Type=simple
User=ubuntu
WorkingDirectory=$APP_DIR/backend
ExecStart=/usr/bin/node server.js
Restart=always
RestartSec=10
StandardOutput=journal
StandardError=journal
SyslogIdentifier=crossfit-audit-backend

Environment=NODE_ENV=production
Environment=PORT=5177

[Install]
WantedBy=multi-user.target
EOF

echo -e "${GREEN}✓${NC} Service backend créé"

# 6. Création du service systemd pour le frontend
echo -e "\n${YELLOW}[6/8]${NC} Création du service systemd pour le frontend..."

sudo tee /etc/systemd/system/crossfit-audit-frontend.service > /dev/null << EOF
[Unit]
Description=CrossFit Audit Frontend (Vite Preview)
After=network.target

[Service]
Type=simple
User=ubuntu
WorkingDirectory=$APP_DIR
ExecStart=/usr/bin/npm run preview -- --port 5176 --host
Restart=always
RestartSec=10
StandardOutput=journal
StandardError=journal
SyslogIdentifier=crossfit-audit-frontend

[Install]
WantedBy=multi-user.target
EOF

echo -e "${GREEN}✓${NC} Service frontend créé"

# 7. Configuration Nginx
echo -e "\n${YELLOW}[7/8]${NC} Configuration Nginx..."

sudo tee /etc/nginx/sites-available/crossfit-audit > /dev/null << EOF
server {
    listen 80;
    server_name $DOMAIN;
    
    client_max_body_size 10M;

    # Frontend - Servir les fichiers statiques
    location / {
        proxy_pass http://localhost:5176;
        proxy_http_version 1.1;
        proxy_set_header Upgrade \$http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host \$host;
        proxy_cache_bypass \$http_upgrade;
        proxy_set_header X-Real-IP \$remote_addr;
        proxy_set_header X-Forwarded-For \$proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto \$scheme;
    }

    # Backend API
    location /api {
        proxy_pass http://localhost:5177;
        proxy_http_version 1.1;
        proxy_set_header Upgrade \$http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host \$host;
        proxy_cache_bypass \$http_upgrade;
        proxy_set_header X-Real-IP \$remote_addr;
        proxy_set_header X-Forwarded-For \$proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto \$scheme;
    }

    # Health check endpoint
    location /health {
        proxy_pass http://localhost:5177/health;
        access_log off;
    }

    # Security headers
    add_header X-Frame-Options "SAMEORIGIN" always;
    add_header X-Content-Type-Options "nosniff" always;
    add_header X-XSS-Protection "1; mode=block" always;
}
EOF

# Activer le site
sudo ln -sf /etc/nginx/sites-available/crossfit-audit /etc/nginx/sites-enabled/

# Tester la configuration Nginx
sudo nginx -t

# Recharger Nginx
sudo systemctl reload nginx

echo -e "${GREEN}✓${NC} Nginx configuré et rechargé"

# 8. Démarrage des services
echo -e "\n${YELLOW}[8/8]${NC} Démarrage des services..."

# Recharger systemd
sudo systemctl daemon-reload

# Activer et démarrer le backend
sudo systemctl enable crossfit-audit-backend
sudo systemctl start crossfit-audit-backend
sleep 2

if sudo systemctl is-active --quiet crossfit-audit-backend; then
    echo -e "${GREEN}✓${NC} Backend démarré"
else
    echo -e "${RED}✗${NC} Erreur au démarrage du backend"
    sudo journalctl -u crossfit-audit-backend -n 20 --no-pager
fi

# Activer et démarrer le frontend
sudo systemctl enable crossfit-audit-frontend
sudo systemctl start crossfit-audit-frontend
sleep 2

if sudo systemctl is-active --quiet crossfit-audit-frontend; then
    echo -e "${GREEN}✓${NC} Frontend démarré"
else
    echo -e "${RED}✗${NC} Erreur au démarrage du frontend"
    sudo journalctl -u crossfit-audit-frontend -n 20 --no-pager
fi

# Tests de santé
echo -e "\n${YELLOW}Tests de santé...${NC}"
sleep 3

if curl -f http://localhost:5177/health >/dev/null 2>&1; then
    echo -e "${GREEN}✓${NC} Backend accessible (http://localhost:5177)"
else
    echo -e "${RED}✗${NC} Backend inaccessible"
fi

if curl -f http://localhost:5176 >/dev/null 2>&1; then
    echo -e "${GREEN}✓${NC} Frontend accessible (http://localhost:5176)"
else
    echo -e "${RED}✗${NC} Frontend inaccessible"
fi

# Résumé
echo ""
echo -e "${BLUE}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
echo -e "${GREEN}✅ Installation terminée avec succès !${NC}"
echo -e "${BLUE}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
echo ""
echo -e "📋 Prochaines étapes :"
echo -e "  1. ${YELLOW}Configurez votre DNS${NC} pour pointer $DOMAIN vers ce serveur"
echo -e "  2. ${YELLOW}Installez SSL${NC} avec : sudo certbot --nginx -d $DOMAIN"
echo -e "  3. ${YELLOW}Testez l'application${NC} : http://$DOMAIN"
echo ""
echo -e "📁 Fichiers importants :"
echo -e "  • Application : ${YELLOW}$APP_DIR${NC}"
echo -e "  • Base de données : ${YELLOW}$APP_DIR/backend/database/crossfit_audit.db${NC}"
echo -e "  • Config backend : ${YELLOW}$APP_DIR/backend/.env${NC}"
echo -e "  • Config frontend : ${YELLOW}$APP_DIR/.env${NC}"
echo ""
echo -e "${YELLOW}Commandes utiles :${NC}"
echo -e "  • Déployer les mises à jour : ${BLUE}cd $APP_DIR && ./deploy.sh${NC}"
echo -e "  • Voir les logs backend : ${BLUE}sudo journalctl -u crossfit-audit-backend -f${NC}"
echo -e "  • Voir les logs frontend : ${BLUE}sudo journalctl -u crossfit-audit-frontend -f${NC}"
echo -e "  • Status des services : ${BLUE}sudo systemctl status crossfit-audit-*${NC}"
echo -e "  • Redémarrer les services : ${BLUE}sudo systemctl restart crossfit-audit-*${NC}"
echo ""
