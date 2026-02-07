#!/bin/bash

###############################################################################
# Guide d'installation du système de migrations
# À exécuter UNE SEULE FOIS sur le serveur pour installer le système
###############################################################################

echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "  🚀 Installation du système de migrations - CrossFit Audit"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo ""

# Variables
APP_DIR="/home/ubuntu/crossfit-audit"
BACKEND_DIR="$APP_DIR/backend"

echo "📋 Ce script va installer le système de migrations dans:"
echo "   $BACKEND_DIR"
echo ""
read -p "Continuer ? (o/n) " -n 1 -r
echo ""

if [[ ! $REPLY =~ ^[Oo]$ ]]; then
    echo "Installation annulée."
    exit 0
fi

echo ""
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "  📂 Étape 1/5 : Copie des fichiers"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo ""

# Créer les dossiers nécessaires
mkdir -p "$BACKEND_DIR/migrations"
mkdir -p "$APP_DIR/backups"

# Copier les fichiers du système de migrations
# Note: Ces fichiers doivent être présents dans le répertoire courant
FILES_TO_COPY=(
    "migration-manager.js"
    "migrations.js"
    "db-manage.sh"
    "deploy.sh"
)

for file in "${FILES_TO_COPY[@]}"; do
    if [ -f "$file" ]; then
        if [[ "$file" == "db-manage.sh" ]] || [[ "$file" == "deploy.sh" ]]; then
            # Scripts à la racine
            cp "$file" "$APP_DIR/"
            chmod +x "$APP_DIR/$file"
            echo "✓ $file → $APP_DIR/"
        else
            # Fichiers JS dans backend
            cp "$file" "$BACKEND_DIR/"
            echo "✓ $file → $BACKEND_DIR/"
        fi
    else
        echo "⚠ $file non trouvé (ignoré)"
    fi
done

# Copier les exemples de migrations si présents
if [ -d "migrations" ]; then
    cp migrations/*.sql "$BACKEND_DIR/migrations/" 2>/dev/null || true
    echo "✓ Migrations d'exemple copiées"
fi

echo ""
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "  📦 Étape 2/5 : Mise à jour du package.json"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo ""

cd "$BACKEND_DIR"

# Vérifier si les scripts sont déjà présents
if grep -q "\"migrate\":" package.json 2>/dev/null; then
    echo "✓ Scripts de migration déjà présents dans package.json"
else
    echo "⚠ Vous devez ajouter manuellement les scripts suivants à votre package.json:"
    echo ""
    echo '  "scripts": {'
    echo '    ...'
    echo '    "migrate": "node migrations.js migrate",'
    echo '    "migrate:status": "node migrations.js status",'
    echo '    "migrate:create": "node migrations.js create"'
    echo '  }'
    echo ""
    echo "Exemple complet fourni dans: $BACKEND_DIR/package.json.example"
    echo ""
fi

echo ""
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "  🔍 Étape 3/5 : Vérification des dépendances"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo ""

# Vérifier better-sqlite3
if npm list better-sqlite3 &>/dev/null; then
    echo "✓ better-sqlite3 déjà installé"
else
    echo "→ Installation de better-sqlite3..."
    npm install better-sqlite3 --save
fi

echo ""
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "  ✅ Étape 4/5 : Test du système"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo ""

echo "→ Test de la commande migrate:status..."
npm run migrate:status

echo ""
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "  🎓 Étape 5/5 : Prochaines étapes"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo ""
echo "✅ Installation terminée !"
echo ""
echo "📚 Documentation disponible dans:"
echo "   $BACKEND_DIR/migrations/README.md"
echo ""
echo "🚀 Commandes principales:"
echo ""
echo "   Créer une migration:"
echo "   cd $BACKEND_DIR"
echo "   npm run migrate:create nom_de_la_migration"
echo ""
echo "   Appliquer les migrations:"
echo "   npm run migrate"
echo ""
echo "   Vérifier le statut:"
echo "   npm run migrate:status"
echo ""
echo "   Gérer les sauvegardes:"
echo "   cd $APP_DIR"
echo "   ./db-manage.sh backup     # Créer une sauvegarde"
echo "   ./db-manage.sh list       # Lister les sauvegardes"
echo "   ./db-manage.sh restore    # Restaurer la dernière sauvegarde"
echo ""
echo "💡 Le script deploy.sh applique maintenant automatiquement les migrations"
echo "   lors de chaque déploiement."
echo ""
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
