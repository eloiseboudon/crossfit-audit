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

# Fonction d'erreur avec message contextuel
fail() {
    echo -e "${RED}✗ $1${NC}"
    [ -n "$2" ] && echo -e "  ${YELLOW}$2${NC}"
    exit 1
}

echo -e "${BLUE}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
echo -e "${BLUE}  🏋️  Déploiement CrossFit Audit - $(date '+%Y-%m-%d %H:%M:%S')${NC}"
echo -e "${BLUE}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
echo ""

# Vérifier qu'on est dans le bon répertoire
if [ ! -d "$APP_DIR" ]; then
    fail "Le répertoire $APP_DIR n'existe pas" "Veuillez d'abord exécuter le script d'installation: ./install.sh"
fi

cd "$APP_DIR"

# 1. Sauvegarde de la base de données
echo -e "${YELLOW}[1/6]${NC} Sauvegarde de la base de données..."
mkdir -p "$BACKUP_DIR"
if [ -f "backend/database/crossfit_audit.db" ]; then
    cp backend/database/crossfit_audit.db "$BACKUP_DIR/crossfit_audit_backup_$TIMESTAMP.db"
    echo -e "${GREEN}✓${NC} Base de données sauvegardée : crossfit_audit_backup_$TIMESTAMP.db"

    # Garder seulement les 10 dernières sauvegardes
    ls -t "$BACKUP_DIR"/crossfit_audit_backup_*.db 2>/dev/null | tail -n +11 | xargs -r rm
else
    echo -e "${YELLOW}⚠${NC}  Aucune base de données à sauvegarder"
fi

# 2. Récupération du code depuis GitHub
echo -e "\n${YELLOW}[2/6]${NC} Récupération du code depuis GitHub..."

# Sauvegarder les fichiers .env
cp backend/.env backend/.env.backup 2>/dev/null || true
cp .env .env.backup 2>/dev/null || true

# Récupérer les dernières modifications
git fetch origin
CURRENT_COMMIT=$(git rev-parse HEAD)
NEW_COMMIT=$(git rev-parse "origin/$BRANCH")

if [ "$CURRENT_COMMIT" = "$NEW_COMMIT" ]; then
    echo -e "${YELLOW}ℹ${NC}  Aucune mise à jour disponible sur GitHub"
else
    echo -e "${GREEN}✓${NC} Nouvelles modifications détectées"
    git log --oneline "$CURRENT_COMMIT..$NEW_COMMIT"
fi

# Mettre à jour le code
git reset --hard "origin/$BRANCH"
echo -e "${GREEN}✓${NC} Code mis à jour depuis GitHub (branche: $BRANCH)"

# Restaurer les fichiers .env
mv backend/.env.backup backend/.env 2>/dev/null || true
mv .env.backup .env 2>/dev/null || true

# 3. Installation des dépendances
echo -e "\n${YELLOW}[3/6]${NC} Installation des dépendances..."

# Backend : installer TOUTES les dépendances (devDeps nécessaires pour les tests)
cd "$APP_DIR/backend"
npm install
echo -e "${GREEN}✓${NC} Dépendances backend installées"

# Frontend : installer toutes les dépendances (devDeps nécessaires pour build + tests)
cd "$APP_DIR"
npm install
echo -e "${GREEN}✓${NC} Dépendances frontend installées"

# 4. Build du frontend
echo -e "\n${YELLOW}[4/6]${NC} Build du frontend..."

# Build du frontend
echo -e "${YELLOW}→${NC} Build du frontend..."
if npm run build; then
    echo -e "${GREEN}✓${NC} Frontend buildé avec succès"
else
    fail "Échec du build frontend" "Vérifiez les erreurs TypeScript / Vite ci-dessus"
fi

# Nettoyage des devDependencies du backend pour la production
cd "$APP_DIR/backend"
npm prune --production
echo -e "${GREEN}✓${NC} Backend nettoyé pour la production"

# 5. Mise à jour de la base de données (migrations automatiques)
echo -e "\n${YELLOW}[5/6]${NC} Mise à jour de la base de données..."
cd "$APP_DIR/backend"

# Vérifier que la base de données existe, sinon l'initialiser
if [ ! -f "database/crossfit_audit.db" ]; then
    echo -e "${YELLOW}→${NC} Initialisation de la base de données..."
    if npm run init-db; then
        echo -e "${GREEN}✓${NC} Base de données initialisée avec succès"
    else
        fail "Échec de l'initialisation de la base de données"
    fi
else
    echo -e "${GREEN}✓${NC} Base de données existante trouvée"
fi

# Appliquer les migrations sur la base existante
echo -e "${YELLOW}→${NC} Application des migrations..."
if npm run migrate; then
    echo -e "${GREEN}✓${NC} Migrations appliquées avec succès"
else
    fail "Erreur lors des migrations" \
         "Consultez les logs ci-dessus. Sauvegarde disponible dans: $BACKUP_DIR. Rollback possible avec: ./db-manage.sh restore"
fi


# 6. Redémarrage des services
echo -e "\n${YELLOW}[6/6]${NC} Redémarrage des services..."

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

# Vérification des services
echo -e "\nVérification des services..."
sleep 3

# Test backend
if curl -sf http://localhost:5177/health >/dev/null 2>&1; then
    echo -e "${GREEN}✓${NC} Backend accessible (http://localhost:5177)"
else
    echo -e "${RED}✗${NC} Backend inaccessible"
    echo -e "  Consultez les logs avec: sudo journalctl -u crossfit-audit-backend -f"
fi

# Test frontend
if curl -sf http://localhost:5176 >/dev/null 2>&1; then
    echo -e "${GREEN}✓${NC} Frontend accessible (http://localhost:5176)"
else
    echo -e "${RED}✗${NC} Frontend inaccessible"
    echo -e "  Consultez les logs avec: sudo journalctl -u crossfit-audit-frontend -f"
fi

# Résumé
echo ""
echo -e "${BLUE}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
echo -e "${GREEN}  Déploiement terminé avec succès !${NC}"
echo -e "${BLUE}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
echo ""
echo -e "Statistiques:"
echo -e "  Commit actuel : ${YELLOW}$(git rev-parse --short HEAD)${NC}"
echo -e "  Derniere MAJ  : ${YELLOW}$(git log -1 --format=%cd --date=format:'%Y-%m-%d %H:%M:%S')${NC}"
echo -e "  Auteur        : ${YELLOW}$(git log -1 --format=%an)${NC}"
echo -e "  Message       : ${YELLOW}$(git log -1 --format=%s)${NC}"
echo ""
echo -e "Sauvegarde de la base de donnees:"
if [ -f "$BACKUP_DIR/crossfit_audit_backup_$TIMESTAMP.db" ]; then
    echo -e "  ${YELLOW}$BACKUP_DIR/crossfit_audit_backup_$TIMESTAMP.db${NC}"
else
    echo -e "  ${YELLOW}Aucune sauvegarde creee${NC}"
fi
echo ""
echo -e "${YELLOW}Commandes utiles apres deploiement :${NC}"
echo -e "  Voir les logs backend  : ${BLUE}sudo journalctl -u crossfit-audit-backend -f${NC}"
echo -e "  Voir les logs frontend : ${BLUE}sudo journalctl -u crossfit-audit-frontend -f${NC}"
echo -e "  Status des services    : ${BLUE}sudo systemctl status crossfit-audit-*${NC}"
echo -e "  Rollback si probleme   : ${BLUE}cd $APP_DIR && ./db-manage.sh restore${NC}"
echo ""
