#!/bin/bash
set -e

###############################################################################
# Script de déploiement - CrossFit Audit
# Met à jour le code depuis GitHub et redéploie l'application
###############################################################################

# Couleurs pour les logs
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Variables
APP_DIR="/home/ubuntu/crossfit-audit"
BRANCH="main"
BACKUP_DIR="$APP_DIR/backups"
TIMESTAMP=$(date +%Y%m%d_%H%M%S)

echo -e "${BLUE}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
echo -e "${BLUE}  🏋️  Déploiement CrossFit Audit - $(date '+%Y-%m-%d %H:%M:%S')${NC}"
echo -e "${BLUE}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
echo ""

# Vérifier qu'on est dans le bon répertoire
if [ ! -d "$APP_DIR" ]; then
    echo -e "${RED}✗ Erreur: Le répertoire $APP_DIR n'existe pas${NC}"
    echo -e "  Veuillez d'abord exécuter le script d'installation: ./install.sh"
    exit 1
fi

cd $APP_DIR

# 1. Sauvegarde de la base de données
echo -e "${YELLOW}[1/7]${NC} Sauvegarde de la base de données..."
mkdir -p $BACKUP_DIR
if [ -f "backend/database/crossfit_audit.db" ]; then
    cp backend/database/crossfit_audit.db "$BACKUP_DIR/crossfit_audit_backup_$TIMESTAMP.db"
    echo -e "${GREEN}✓${NC} Base de données sauvegardée : crossfit_audit_backup_$TIMESTAMP.db"
    
    # Garder seulement les 10 dernières sauvegardes
    ls -t $BACKUP_DIR/crossfit_audit_backup_*.db 2>/dev/null | tail -n +11 | xargs -r rm
else
    echo -e "${YELLOW}⚠${NC}  Aucune base de données à sauvegarder"
fi

# 2. Récupération du code depuis GitHub
echo -e "\n${YELLOW}[2/7]${NC} Récupération du code depuis GitHub..."

# Sauvegarder les fichiers .env
cp backend/.env backend/.env.backup 2>/dev/null || true
cp .env .env.backup 2>/dev/null || true

# Récupérer les dernières modifications
git fetch origin
CURRENT_COMMIT=$(git rev-parse HEAD)
NEW_COMMIT=$(git rev-parse origin/$BRANCH)

if [ "$CURRENT_COMMIT" = "$NEW_COMMIT" ]; then
    echo -e "${YELLOW}ℹ${NC}  Aucune mise à jour disponible sur GitHub"
else
    echo -e "${GREEN}✓${NC} Nouvelles modifications détectées"
    git log --oneline $CURRENT_COMMIT..$NEW_COMMIT
fi

# Mettre à jour le code
git reset --hard origin/$BRANCH
echo -e "${GREEN}✓${NC} Code mis à jour depuis GitHub (branche: $BRANCH)"

# Restaurer les fichiers .env
mv backend/.env.backup backend/.env 2>/dev/null || true
mv .env.backup .env 2>/dev/null || true

# 3. Mise à jour du Backend
echo -e "\n${YELLOW}[3/7]${NC} Mise à jour du backend Node.js..."
cd $APP_DIR/backend

# Installer les dépendances
npm install --production

echo -e "${GREEN}✓${NC} Dépendances backend mises à jour"

# 4. Mise à jour du Frontend
echo -e "\n${YELLOW}[4/7]${NC} Mise à jour du frontend React..."
cd $APP_DIR

# Installer les nouvelles dépendances
npm install

# Rebuild du frontend
npm run build

echo -e "${GREEN}✓${NC} Frontend rebuilé"

# 5. Mise à jour de la base de données (migrations automatiques)
echo -e "\n${YELLOW}[5/7]${NC} Mise à jour de la base de données..."
cd $APP_DIR/backend

# Vérifier que la base de données existe, sinon l'initialiser
if [ ! -f "database/crossfit_audit.db" ]; then
    echo -e "${YELLOW}→${NC} Initialisation de la base de données..."
    npm run init-db
    if [ $? -eq 0 ]; then
        echo -e "${GREEN}✓${NC} Base de données initialisée avec succès"
    else
        echo -e "${RED}✗${NC} Échec de l'initialisation de la base de données"
        exit 1
    fi
else
    echo -e "${GREEN}✓${NC} Base de données existante trouvée"
fi

# Appliquer les migrations sur la base existante
echo -e "${YELLOW}→${NC} Application des migrations..."
npm run migrate
if [ $? -eq 0 ]; then
    echo -e "${GREEN}✓${NC} Migrations appliquées avec succès"
else
    echo -e "${RED}✗${NC} Erreur lors des migrations"
    echo -e "${YELLOW}ℹ${NC}  Consultez les logs ci-dessus pour plus de détails"
    echo -e "${YELLOW}ℹ${NC}  La sauvegarde est disponible dans: $BACKUP_DIR"
    echo -e "${YELLOW}ℹ${NC}  Rollback possible avec: ./db-manage.sh restore"
    exit 1
fi

# Executer les tests unitaires 
echo -e "${YELLOW}→${NC} Tests unitaires..."
npm test

# 6. Redémarrage des services
echo -e "\n${YELLOW}[6/7]${NC} Redémarrage des services..."

# Vérifier que les services systemd existent
if ! systemctl list-unit-files | grep -q crossfit-audit-backend.service; then
    echo -e "${RED}✗${NC} Les services systemd n'existent pas encore"
    echo -e "  ${YELLOW}Vous devez d'abord terminer l'installation initiale :${NC}"
    echo -e ""
    echo -e "  ${BLUE}1. Copiez les fichiers de configuration systemd :${NC}"
    echo -e "     cd $APP_DIR"
    echo -e "     sudo cp deploy/crossfit-audit-backend.service /etc/systemd/system/"
    echo -e "     sudo cp deploy/crossfit-audit-frontend.service /etc/systemd/system/"
    echo -e ""
    echo -e "  ${BLUE}2. Activez et démarrez les services :${NC}"
    echo -e "     sudo systemctl daemon-reload"
    echo -e "     sudo systemctl enable crossfit-audit-backend crossfit-audit-frontend"
    echo -e "     sudo systemctl start crossfit-audit-backend crossfit-audit-frontend"
    echo -e ""
    echo -e "  ${BLUE}3. Configurez Nginx :${NC}"
    echo -e "     sudo cp deploy/nginx-crossfit-audit /etc/nginx/sites-available/crossfit-audit"
    echo -e "     sudo ln -sf /etc/nginx/sites-available/crossfit-audit /etc/nginx/sites-enabled/"
    echo -e "     sudo nginx -t && sudo systemctl reload nginx"
    echo -e ""
    exit 1
fi

# Redémarrer le backend
sudo systemctl restart crossfit-audit-backend
sleep 2
if sudo systemctl is-active --quiet crossfit-audit-backend; then
    echo -e "${GREEN}✓${NC} Backend redémarré"
else
    echo -e "${RED}✗${NC} Erreur au démarrage du backend"
    sudo journalctl -u crossfit-audit-backend -n 20 --no-pager
    exit 1
fi

# Redémarrer le frontend
sudo systemctl restart crossfit-audit-frontend
sleep 2
if sudo systemctl is-active --quiet crossfit-audit-frontend; then
    echo -e "${GREEN}✓${NC} Frontend redémarré"
else
    echo -e "${RED}✗${NC} Erreur au démarrage du frontend"
    sudo journalctl -u crossfit-audit-frontend -n 20 --no-pager
    exit 1
fi

# 7. Tests de santé
echo -e "\n${YELLOW}[7/7]${NC} Vérification des services..."
sleep 3

# Test backend
if curl -f http://localhost:5177/health >/dev/null 2>&1; then
    echo -e "${GREEN}✓${NC} Backend accessible (http://localhost:5177)"
else
    echo -e "${RED}✗${NC} Backend inaccessible"
    echo -e "  Consultez les logs avec: sudo journalctl -u crossfit-audit-backend -f"
fi

# Test frontend
if curl -f http://localhost:5176 >/dev/null 2>&1; then
    echo -e "${GREEN}✓${NC} Frontend accessible (http://localhost:5176)"
else
    echo -e "${RED}✗${NC} Frontend inaccessible"
    echo -e "  Consultez les logs avec: sudo journalctl -u crossfit-audit-frontend -f"
fi

# Résumé
echo ""
echo -e "${BLUE}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
echo -e "${GREEN}✅ Déploiement terminé avec succès !${NC}"
echo -e "${BLUE}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
echo ""
echo -e "📊 Statistiques:"
echo -e "  • Commit actuel : ${YELLOW}$(git rev-parse --short HEAD)${NC}"
echo -e "  • Dernière mise à jour : ${YELLOW}$(git log -1 --format=%cd --date=format:'%Y-%m-%d %H:%M:%S')${NC}"
echo -e "  • Auteur : ${YELLOW}$(git log -1 --format=%an)${NC}"
echo -e "  • Message : ${YELLOW}$(git log -1 --format=%s)${NC}"
echo ""
echo -e "💾 Sauvegarde de la base de données:"
if [ -f "$BACKUP_DIR/crossfit_audit_backup_$TIMESTAMP.db" ]; then
    echo -e "  • ${YELLOW}$BACKUP_DIR/crossfit_audit_backup_$TIMESTAMP.db${NC}"
else
    echo -e "  • ${YELLOW}Aucune sauvegarde créée${NC}"
fi
echo ""
echo -e "${YELLOW}Commandes utiles après déploiement :${NC}"
echo -e "  • Voir les logs backend  : ${BLUE}sudo journalctl -u crossfit-audit-backend -f${NC}"
echo -e "  • Voir les logs frontend : ${BLUE}sudo journalctl -u crossfit-audit-frontend -f${NC}"
echo -e "  • Status des services    : ${BLUE}sudo systemctl status crossfit-audit-*${NC}"
echo -e "  • Rollback si problème   : ${BLUE}cd $APP_DIR && ./db-manage.sh restore${NC}"
echo ""
