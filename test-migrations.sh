#!/bin/bash
set -e

###############################################################################
# Script de test du système de migrations
# Vérifie que tous les composants fonctionnent correctement
###############################################################################

# Couleurs
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m'

SCRIPT_DIR="$(cd "$(dirname "$0")" && pwd)"
TEST_DIR="/tmp/crossfit-audit-test-$$"
TESTS_PASSED=0
TESTS_FAILED=0

echo -e "${BLUE}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
echo -e "${BLUE}  🧪 Tests du système de migrations - CrossFit Audit${NC}"
echo -e "${BLUE}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}\n"

# Fonction pour afficher le résultat d'un test
test_result() {
    if [ $1 -eq 0 ]; then
        echo -e "${GREEN}✓${NC} $2"
        TESTS_PASSED=$((TESTS_PASSED + 1))
    else
        echo -e "${RED}✗${NC} $2"
        TESTS_FAILED=$((TESTS_FAILED + 1))
    fi
}

# Créer un environnement de test
echo -e "${YELLOW}→${NC} Création de l'environnement de test dans $TEST_DIR"
mkdir -p "$TEST_DIR/backend"
mkdir -p "$TEST_DIR/backend/database"
mkdir -p "$TEST_DIR/backend/migrations"
mkdir -p "$TEST_DIR/backups"
echo ""

# Test 1: Vérifier la présence des fichiers
echo -e "${BLUE}Test 1: Fichiers requis${NC}"
[ -f "$SCRIPT_DIR/migration-manager.js" ] && test_result 0 "migration-manager.js existe" || test_result 1 "migration-manager.js manquant"
[ -f "$SCRIPT_DIR/migrations.js" ] && test_result 0 "migrations.js existe" || test_result 1 "migrations.js manquant"
[ -f "$SCRIPT_DIR/deploy.sh" ] && test_result 0 "deploy.sh existe" || test_result 1 "deploy.sh manquant"
[ -f "$SCRIPT_DIR/db-manage.sh" ] && test_result 0 "db-manage.sh existe" || test_result 1 "db-manage.sh manquant"
[ -f "$SCRIPT_DIR/backend/migrations/README.md" ] && test_result 0 "Documentation migrations présente" || test_result 1 "Documentation migrations manquante"
echo ""

# Test 2: Copier les fichiers dans l'environnement de test
echo -e "${BLUE}Test 2: Copie des fichiers${NC}"
cp "$SCRIPT_DIR/migration-manager.js" "$TEST_DIR/backend/" 2>/dev/null && test_result 0 "migration-manager.js copié" || test_result 1 "Erreur copie migration-manager.js"
cp "$SCRIPT_DIR/migrations.js" "$TEST_DIR/backend/" 2>/dev/null && test_result 0 "migrations.js copié" || test_result 1 "Erreur copie migrations.js"
if [ -d "$SCRIPT_DIR/migrations" ]; then
    cp "$SCRIPT_DIR/migrations/"*.sql "$TEST_DIR/backend/migrations/" 2>/dev/null && test_result 0 "Exemples de migrations copiés" || test_result 1 "Erreur copie migrations"
fi
echo ""

# Test 3: Créer une base de données de test
echo -e "${BLUE}Test 3: Création d'une DB de test${NC}"
cd "$TEST_DIR/backend"
cat > init-test-db.js << 'EOF'
const sqlite3 = require('sqlite3').verbose();
const db = new sqlite3.Database('database/crossfit_audit.db');

db.serialize(() => {
  db.run(`
    CREATE TABLE IF NOT EXISTS audits (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      name TEXT NOT NULL,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP
    )
  `);
  
  db.run(`INSERT INTO audits (name) VALUES ('Test Audit 1')`);
  db.run(`INSERT INTO audits (name) VALUES ('Test Audit 2')`);
});

db.close(() => {
  console.log('DB de test créée');
  process.exit(0);
});
EOF

# Vérifier que sqlite3 est disponible
if command -v node &> /dev/null; then
    if node -e "require('sqlite3')" 2>/dev/null; then
        node init-test-db.js 2>&1 | grep -q "DB de test créée" && test_result 0 "Base de données de test créée" || test_result 1 "Erreur création DB"
    else
        echo -e "${YELLOW}⚠${NC} sqlite3 npm non installé - Test de DB ignoré"
    fi
else
    echo -e "${YELLOW}⚠${NC} Node.js non disponible - Test de DB ignoré"
fi
echo ""

# Test 4: Vérifier la syntaxe des scripts
echo -e "${BLUE}Test 4: Syntaxe des scripts${NC}"
bash -n "$SCRIPT_DIR/deploy.sh" 2>/dev/null && test_result 0 "deploy.sh syntaxe OK" || test_result 1 "deploy.sh syntaxe incorrecte"
bash -n "$SCRIPT_DIR/db-manage.sh" 2>/dev/null && test_result 0 "db-manage.sh syntaxe OK" || test_result 1 "db-manage.sh syntaxe incorrecte"

if command -v node &> /dev/null; then
    node -c migrations.js 2>/dev/null && test_result 0 "migrations.js syntaxe OK" || test_result 1 "migrations.js syntaxe incorrecte"
    node -c migration-manager.js 2>/dev/null && test_result 0 "migration-manager.js syntaxe OK" || test_result 1 "migration-manager.js syntaxe incorrecte"
else
    echo -e "${YELLOW}⚠${NC} Node.js non disponible - Tests de syntaxe JS ignorés"
fi
echo ""

# Test 5: Vérifier les exemples de migrations
echo -e "${BLUE}Test 5: Exemples de migrations${NC}"
if [ -d "../migrations" ]; then
    MIGRATION_COUNT=$(ls -1 ../migrations/*.sql 2>/dev/null | wc -l)
    [ $MIGRATION_COUNT -gt 0 ] && test_result 0 "Exemples de migrations trouvés ($MIGRATION_COUNT)" || test_result 1 "Aucun exemple de migration"
    
    # Vérifier la syntaxe SQL basique
    for migration in ../migrations/*.sql; do
        if [ -f "$migration" ]; then
            # Vérifier qu'il n'y a pas de caractères bizarres
            if grep -q "^-- Migration:" "$migration"; then
                test_result 0 "$(basename $migration) bien formaté"
            else
                test_result 1 "$(basename $migration) mal formaté"
            fi
        fi
    done
else
    echo -e "${YELLOW}⚠${NC} Dossier migrations/ non trouvé - Tests ignorés"
fi
echo ""

# Test 6: Vérifier la documentation
echo -e "${BLUE}Test 6: Documentation${NC}"
[ -f "$SCRIPT_DIR/backend/migrations/README.md" ] && test_result 0 "README migrations présent" || test_result 1 "README migrations manquant"
echo ""

# Test 7: Test fonctionnel (si Node.js et sqlite3 disponibles)
if command -v node &> /dev/null && node -e "require('sqlite3')" 2>/dev/null; then
    echo -e "${BLUE}Test 7: Tests fonctionnels${NC}"
    
    # Créer un package.json minimal
    cat > package.json << 'EOF'
{
  "name": "test",
  "scripts": {
    "migrate": "node migrations.js migrate",
    "migrate:status": "node migrations.js status"
  }
}
EOF
    
    # Test du statut
    if node migrations.js status > /tmp/migration-test-output.log 2>&1; then
        test_result 0 "Commande 'status' fonctionne"
    else
        test_result 1 "Commande 'status' échoue"
    fi
    
    # Test de création de migration
    if node migrations.js create test_migration > /tmp/migration-create-output.log 2>&1; then
        test_result 0 "Commande 'create' fonctionne"
        [ -f "migrations/"*"_test_migration.sql" ] && test_result 0 "Fichier de migration créé" || test_result 1 "Fichier non créé"
    else
        test_result 1 "Commande 'create' échoue"
    fi
    
    echo ""
else
    echo -e "${YELLOW}⚠${NC} Tests fonctionnels ignorés (Node.js ou sqlite3 manquant)\n"
fi

# Nettoyage
cd /
rm -rf "$TEST_DIR"

# Résumé
echo -e "${BLUE}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
echo -e "${BLUE}  📊 Résumé des tests${NC}"
echo -e "${BLUE}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}\n"

TOTAL=$((TESTS_PASSED + TESTS_FAILED))
echo -e "  Tests réussis : ${GREEN}$TESTS_PASSED${NC} / $TOTAL"
echo -e "  Tests échoués : ${RED}$TESTS_FAILED${NC} / $TOTAL"
echo ""

if [ $TESTS_FAILED -eq 0 ]; then
    echo -e "${GREEN}✅ Tous les tests sont passés !${NC}"
    echo -e "   Le système de migrations est prêt à être utilisé.\n"
    exit 0
else
    echo -e "${YELLOW}⚠  Certains tests ont échoué${NC}"
    echo -e "   Vérifiez les erreurs ci-dessus avant de déployer.\n"
    exit 1
fi
