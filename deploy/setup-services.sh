#!/bin/bash
set -e

###############################################################################
# Script de configuration des services - CrossFit Audit
# À exécuter après avoir cloné le repository
###############################################################################

# Couleurs pour les logs
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

APP_DIR="/home/ubuntu/crossfit-audit"
DOMAIN="crossfit-audit.tulipe-saas.fr/"  # Changez par votre domaine

echo -e "${BLUE}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
echo -e "${BLUE}  🏋️  Configuration des services - CrossFit Audit${NC}"
echo -e "${BLUE}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
echo ""

# Vérifier qu'on est dans le bon répertoire
if [ ! -d "$APP_DIR" ]; then
    echo -e "${RED}✗ Erreur: Le répertoire $APP_DIR n'existe pas${NC}"
    echo -e "  Veuillez d'abord cloner le repository"
    exit 1
fi

cd $APP_DIR

# 1. Installation des dépendances
echo -e "${YELLOW}[1/6]${NC} Installation des dépendances..."

# Backend
cd $APP_DIR/backend
npm install --production
echo -e "${GREEN}✓${NC} Dépendances backend installées"

# Frontend
cd $APP_DIR
npm install
echo -e "${GREEN}✓${NC} Dépendances frontend installées"

# 2. Configuration des fichiers .env
echo -e "\n${YELLOW}[2/6]${NC} Configuration des fichiers .env..."

# Backend .env
if [ ! -f backend/.env ]; then
    echo -e "${YELLOW}→${NC} Création du fichier backend/.env..."
    cat > backend/.env << EOF
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
    echo -e "${GREEN}✓${NC} Fichier backend/.env créé"
else
    echo -e "${GREEN}✓${NC} Fichier backend/.env existant"
fi

# Frontend .env
if [ ! -f .env ]; then
    echo -e "${YELLOW}→${NC} Création du fichier .env..."
    cat > .env << EOF
VITE_API_URL=https://$DOMAIN/api
EOF
    echo -e "${GREEN}✓${NC} Fichier .env créé"
else
    echo -e "${GREEN}✓${NC} Fichier .env existant"
fi

# 3. Initialisation de la base de données
echo -e "\n${YELLOW}[3/6]${NC} Initialisation de la base de données..."
cd $APP_DIR/backend
npm run init-db
echo -e "${GREEN}✓${NC} Base de données initialisée"

# 4. Build du frontend
echo -e "\n${YELLOW}[4/6]${NC} Build du frontend..."
cd $APP_DIR
npm run build
echo -e "${GREEN}✓${NC} Frontend buildé"

# 5. Configuration des services systemd
echo -e "\n${YELLOW}[5/6]${NC} Configuration des services systemd..."

# Copier les fichiers de service
sudo cp $APP_DIR/deploy/crossfit-audit-backend.service /etc/systemd/system/
sudo cp $APP_DIR/deploy/crossfit-audit-frontend.service /etc/systemd/system/

# Recharger systemd
sudo systemctl daemon-reload

# Activer et démarrer les services
sudo systemctl enable crossfit-audit-backend crossfit-audit-frontend
sudo systemctl start crossfit-audit-backend
sleep 2
sudo systemctl start crossfit-audit-frontend
sleep 2

# Vérifier les services
if sudo systemctl is-active --quiet crossfit-audit-backend; then
    echo -e "${GREEN}✓${NC} Backend démarré"
else
    echo -e "${RED}✗${NC} Erreur au démarrage du backend"
    sudo journalctl -u crossfit-audit-backend -n 20 --no-pager
fi

if sudo systemctl is-active --quiet crossfit-audit-frontend; then
    echo -e "${GREEN}✓${NC} Frontend démarré"
else
    echo -e "${RED}✗${NC} Erreur au démarrage du frontend"
    sudo journalctl -u crossfit-audit-frontend -n 20 --no-pager
fi

# 6. Configuration Nginx
echo -e "\n${YELLOW}[6/6]${NC} Configuration Nginx..."

# Copier la configuration
sudo cp $APP_DIR/deploy/nginx-crossfit-audit /etc/nginx/sites-available/crossfit-audit

# Activer le site
sudo ln -sf /etc/nginx/sites-available/crossfit-audit /etc/nginx/sites-enabled/

# Tester et recharger
if sudo nginx -t; then
    sudo systemctl reload nginx
    echo -e "${GREEN}✓${NC} Nginx configuré et rechargé"
else
    echo -e "${RED}✗${NC} Erreur dans la configuration Nginx"
    exit 1
fi

# Résumé
echo ""
echo -e "${BLUE}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
echo -e "${GREEN}✅ Configuration terminée avec succès !${NC}"
echo -e "${BLUE}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
echo ""
echo -e "📋 Prochaines étapes :"
echo -e "  1. ${YELLOW}Configurez votre DNS${NC} pour pointer $DOMAIN vers ce serveur"
echo -e "  2. ${YELLOW}Installez SSL${NC} avec : sudo certbot --nginx -d $DOMAIN"
echo -e "  3. ${YELLOW}Testez l'application${NC} : http://$DOMAIN"
echo ""
echo -e "${YELLOW}Commandes utiles :${NC}"
echo -e "  • Mettre à jour : ${BLUE}cd $APP_DIR && ./deploy.sh${NC}"
echo -e "  • Logs backend  : ${BLUE}sudo journalctl -u crossfit-audit-backend -f${NC}"
echo -e "  • Logs frontend : ${BLUE}sudo journalctl -u crossfit-audit-frontend -f${NC}"
echo ""
