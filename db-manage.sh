#!/bin/bash
set -e

###############################################################################
# Script de gestion de la base de données - CrossFit Audit
# Permet de faire des backups et des restores de la DB
###############################################################################

# Couleurs pour les logs
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Variables
APP_DIR="/home/ubuntu/crossfit-audit"
DB_PATH="$APP_DIR/backend/database/crossfit_audit.db"
BACKUP_DIR="$APP_DIR/backups"
TIMESTAMP=$(date +%Y%m%d_%H%M%S)

# Afficher l'aide
show_help() {
    echo -e "\n${BLUE}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
    echo -e "${BLUE}  💾 Gestion de la base de données - CrossFit Audit${NC}"
    echo -e "${BLUE}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}\n"
    echo "Usage: ./db-manage.sh [command]"
    echo ""
    echo "Commandes disponibles:"
    echo "  backup              Crée une sauvegarde manuelle de la DB"
    echo "  restore [file]      Restaure la DB depuis une sauvegarde"
    echo "  list                Liste toutes les sauvegardes disponibles"
    echo "  status              Affiche l'état de la DB et des migrations"
    echo "  clean               Nettoie les anciennes sauvegardes (garde les 20 dernières)"
    echo ""
    echo "Exemples:"
    echo "  ./db-manage.sh backup"
    echo "  ./db-manage.sh restore"
    echo "  ./db-manage.sh restore backups/crossfit_audit_backup_20250127_143022.db"
    echo "  ./db-manage.sh list"
    echo ""
}

# Créer une sauvegarde manuelle
backup_db() {
    echo -e "${BLUE}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
    echo -e "${BLUE}  💾 Sauvegarde de la base de données${NC}"
    echo -e "${BLUE}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}\n"
    
    if [ ! -f "$DB_PATH" ]; then
        echo -e "${RED}✗ Erreur: La base de données n'existe pas${NC}"
        echo -e "  Chemin: $DB_PATH"
        exit 1
    fi
    
    mkdir -p "$BACKUP_DIR"
    BACKUP_FILE="$BACKUP_DIR/crossfit_audit_manual_backup_$TIMESTAMP.db"
    
    cp "$DB_PATH" "$BACKUP_FILE"
    
    # Vérifier la taille
    SIZE=$(du -h "$BACKUP_FILE" | cut -f1)
    
    echo -e "${GREEN}✓${NC} Sauvegarde créée avec succès"
    echo -e "  Fichier : ${YELLOW}$BACKUP_FILE${NC}"
    echo -e "  Taille  : ${YELLOW}$SIZE${NC}\n"
}

# Lister les sauvegardes disponibles
list_backups() {
    echo -e "${BLUE}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
    echo -e "${BLUE}  📋 Sauvegardes disponibles${NC}"
    echo -e "${BLUE}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}\n"
    
    if [ ! -d "$BACKUP_DIR" ] || [ -z "$(ls -A $BACKUP_DIR 2>/dev/null)" ]; then
        echo -e "${YELLOW}⚠${NC}  Aucune sauvegarde trouvée"
        echo -e "  Créez-en une avec: ./db-manage.sh backup\n"
        return
    fi
    
    # Lister les sauvegardes par date (plus récentes en premier)
    COUNT=0
    ls -lt "$BACKUP_DIR"/crossfit_audit_*.db 2>/dev/null | while read -r line; do
        COUNT=$((COUNT + 1))
        FILE=$(echo "$line" | awk '{print $9}')
        BASENAME=$(basename "$FILE")
        SIZE=$(echo "$line" | awk '{print $5}')
        DATE=$(echo "$line" | awk '{print $6, $7, $8}')
        
        # Extraire le type (backup ou manual_backup)
        if [[ "$BASENAME" == *"manual"* ]]; then
            TYPE="📝 Manuelle"
        else
            TYPE="🤖 Auto    "
        fi
        
        echo -e "  ${GREEN}$COUNT.${NC} $TYPE  ${YELLOW}$BASENAME${NC}"
        echo -e "     └─ Taille: $SIZE | Date: $DATE"
        echo ""
    done
    
    TOTAL=$(ls -1 "$BACKUP_DIR"/crossfit_audit_*.db 2>/dev/null | wc -l)
    echo -e "  Total: ${YELLOW}$TOTAL sauvegarde(s)${NC}\n"
}

# Restaurer une sauvegarde
restore_db() {
    echo -e "${BLUE}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
    echo -e "${BLUE}  🔄 Restauration de la base de données${NC}"
    echo -e "${BLUE}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}\n"
    
    BACKUP_FILE=$1
    
    # Si aucun fichier spécifié, prendre le plus récent
    if [ -z "$BACKUP_FILE" ]; then
        echo -e "${YELLOW}→${NC} Aucun fichier spécifié, recherche de la dernière sauvegarde..."
        BACKUP_FILE=$(ls -t "$BACKUP_DIR"/crossfit_audit_*.db 2>/dev/null | head -n 1)
        
        if [ -z "$BACKUP_FILE" ]; then
            echo -e "${RED}✗ Aucune sauvegarde disponible${NC}\n"
            exit 1
        fi
        
        echo -e "${GREEN}✓${NC} Sauvegarde trouvée: $(basename $BACKUP_FILE)"
    fi
    
    # Vérifier que le fichier existe
    if [ ! -f "$BACKUP_FILE" ]; then
        echo -e "${RED}✗ Erreur: Le fichier de sauvegarde n'existe pas${NC}"
        echo -e "  Fichier: $BACKUP_FILE\n"
        echo -e "  Listez les sauvegardes disponibles avec: ./db-manage.sh list\n"
        exit 1
    fi
    
    # Confirmation
    echo ""
    echo -e "${YELLOW}⚠  ATTENTION ⚠${NC}"
    echo -e "  Vous êtes sur le point de restaurer la base de données."
    echo -e "  Cela remplacera TOUTES les données actuelles !"
    echo ""
    echo -e "  Fichier source : ${YELLOW}$(basename $BACKUP_FILE)${NC}"
    echo -e "  Destination    : ${YELLOW}$DB_PATH${NC}"
    echo ""
    read -p "  Êtes-vous sûr ? (tapez 'oui' pour confirmer) : " CONFIRM
    
    if [ "$CONFIRM" != "oui" ]; then
        echo -e "\n${YELLOW}✗${NC} Restauration annulée\n"
        exit 0
    fi
    
    # Arrêter le service backend
    echo -e "\n${YELLOW}→${NC} Arrêt du service backend..."
    sudo systemctl stop crossfit-audit-backend
    sleep 2
    
    # Créer une sauvegarde de sécurité avant restauration
    echo -e "${YELLOW}→${NC} Création d'une sauvegarde de sécurité..."
    SAFETY_BACKUP="$BACKUP_DIR/crossfit_audit_pre_restore_$TIMESTAMP.db"
    if [ -f "$DB_PATH" ]; then
        cp "$DB_PATH" "$SAFETY_BACKUP"
        echo -e "${GREEN}✓${NC} Sauvegarde de sécurité: $(basename $SAFETY_BACKUP)"
    fi
    
    # Restaurer la DB
    echo -e "${YELLOW}→${NC} Restauration en cours..."
    cp "$BACKUP_FILE" "$DB_PATH"
    
    # Redémarrer le service
    echo -e "${YELLOW}→${NC} Redémarrage du service backend..."
    sudo systemctl start crossfit-audit-backend
    sleep 2
    
    if sudo systemctl is-active --quiet crossfit-audit-backend; then
        echo -e "\n${GREEN}✅ Restauration terminée avec succès${NC}"
        echo -e "  Base de données restaurée depuis: ${YELLOW}$(basename $BACKUP_FILE)${NC}\n"
    else
        echo -e "\n${RED}✗ Erreur: Le service backend n'a pas redémarré${NC}"
        echo -e "  Consultez les logs: sudo journalctl -u crossfit-audit-backend -n 50\n"
        exit 1
    fi
}

# Nettoyer les anciennes sauvegardes
clean_backups() {
    echo -e "${BLUE}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
    echo -e "${BLUE}  🧹 Nettoyage des sauvegardes${NC}"
    echo -e "${BLUE}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}\n"
    
    KEEP_COUNT=20
    TOTAL=$(ls -1 "$BACKUP_DIR"/crossfit_audit_*.db 2>/dev/null | wc -l)
    
    if [ $TOTAL -le $KEEP_COUNT ]; then
        echo -e "${GREEN}✓${NC} Aucun nettoyage nécessaire"
        echo -e "  Sauvegardes actuelles: $TOTAL (limite: $KEEP_COUNT)\n"
        return
    fi
    
    TO_DELETE=$((TOTAL - KEEP_COUNT))
    echo -e "${YELLOW}→${NC} $TOTAL sauvegardes trouvées, suppression des $TO_DELETE plus anciennes..."
    
    # Garder seulement les N dernières sauvegardes
    ls -t "$BACKUP_DIR"/crossfit_audit_*.db | tail -n +$((KEEP_COUNT + 1)) | xargs -r rm
    
    echo -e "${GREEN}✓${NC} Nettoyage terminé"
    echo -e "  $TO_DELETE sauvegarde(s) supprimée(s)"
    echo -e "  $KEEP_COUNT sauvegarde(s) conservée(s)\n"
}

# Afficher le statut
show_status() {
    echo -e "${BLUE}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
    echo -e "${BLUE}  📊 Statut de la base de données${NC}"
    echo -e "${BLUE}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}\n"
    
    # Vérifier la DB
    if [ -f "$DB_PATH" ]; then
        SIZE=$(du -h "$DB_PATH" | cut -f1)
        MODIFIED=$(date -r "$DB_PATH" "+%Y-%m-%d %H:%M:%S")
        echo -e "  Base de données  : ${GREEN}✓ Existe${NC}"
        echo -e "  Taille           : ${YELLOW}$SIZE${NC}"
        echo -e "  Dernière modif.  : ${YELLOW}$MODIFIED${NC}"
    else
        echo -e "  Base de données  : ${RED}✗ N'existe pas${NC}"
    fi
    
    echo ""
    
    # Vérifier les sauvegardes
    if [ -d "$BACKUP_DIR" ]; then
        BACKUP_COUNT=$(ls -1 "$BACKUP_DIR"/crossfit_audit_*.db 2>/dev/null | wc -l)
        echo -e "  Sauvegardes      : ${YELLOW}$BACKUP_COUNT${NC}"
        
        if [ $BACKUP_COUNT -gt 0 ]; then
            LATEST=$(ls -t "$BACKUP_DIR"/crossfit_audit_*.db | head -n 1)
            LATEST_DATE=$(date -r "$LATEST" "+%Y-%m-%d %H:%M:%S")
            echo -e "  Dernière backup  : ${YELLOW}$LATEST_DATE${NC}"
        fi
    else
        echo -e "  Sauvegardes      : ${YELLOW}0${NC}"
    fi
    
    echo ""
    
    # Vérifier les migrations (si le système existe)
    if [ -f "$APP_DIR/backend/migrations.js" ]; then
        echo -e "  ${YELLOW}→${NC} Statut des migrations:"
        cd "$APP_DIR/backend"
        npm run migrate:status 2>/dev/null || echo -e "    ${RED}✗ Erreur lors de la vérification${NC}"
    fi
    
    echo ""
}

# Point d'entrée
COMMAND=$1

case "$COMMAND" in
    backup)
        backup_db
        ;;
    restore)
        restore_db "$2"
        ;;
    list)
        list_backups
        ;;
    clean)
        clean_backups
        ;;
    status)
        show_status
        ;;
    help|--help|-h|"")
        show_help
        ;;
    *)
        echo -e "\n${RED}✗ Commande inconnue: $COMMAND${NC}\n"
        show_help
        exit 1
        ;;
esac
