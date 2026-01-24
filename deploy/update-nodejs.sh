#!/bin/bash
set -e

###############################################################################
# Script de mise à jour Node.js - CrossFit Audit
# Met à jour Node.js vers la version 20.x LTS
###############################################################################

# Couleurs pour les logs
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

echo -e "${BLUE}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
echo -e "${BLUE}  📦 Mise à jour de Node.js vers v20.x LTS${NC}"
echo -e "${BLUE}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
echo ""

# Vérifier la version actuelle
CURRENT_VERSION=$(node -v 2>/dev/null || echo "non installé")
echo -e "Version actuelle de Node.js : ${YELLOW}$CURRENT_VERSION${NC}"

if [[ $CURRENT_VERSION == v20* ]]; then
    echo -e "${GREEN}✓${NC} Node.js 20.x est déjà installé"
    exit 0
fi

echo ""
echo -e "${YELLOW}Installation de Node.js 20.x LTS...${NC}"
echo ""

# Supprimer l'ancien repository NodeSource si présent
echo -e "${YELLOW}[1/4]${NC} Nettoyage des anciennes sources..."
sudo rm -f /etc/apt/sources.list.d/nodesource.list
sudo rm -f /etc/apt/sources.list.d/nodesource.list.save

# Ajouter le repository NodeSource pour Node.js 20.x
echo -e "\n${YELLOW}[2/4]${NC} Ajout du repository NodeSource pour Node.js 20.x..."
curl -fsSL https://deb.nodesource.com/setup_20.x | sudo -E bash -

# Installer Node.js
echo -e "\n${YELLOW}[3/4]${NC} Installation de Node.js 20.x..."
sudo apt-get install -y nodejs

# Vérifier l'installation
echo -e "\n${YELLOW}[4/4]${NC} Vérification de l'installation..."
NEW_VERSION=$(node -v)
NPM_VERSION=$(npm -v)

echo ""
echo -e "${BLUE}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
echo -e "${GREEN}✅ Mise à jour terminée avec succès !${NC}"
echo -e "${BLUE}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
echo ""
echo -e "📊 Versions installées :"
echo -e "  • Node.js : ${GREEN}$NEW_VERSION${NC}"
echo -e "  • npm     : ${GREEN}$NPM_VERSION${NC}"
echo ""
echo -e "${YELLOW}Prochaine étape :${NC}"
echo -e "  Relancez le script de configuration : ${BLUE}sudo ./setup-services.sh${NC}"
echo ""
