#!/usr/bin/env node

/**
 * Script CLI pour gérer les migrations de base de données
 * Usage: node migrations.js [command]
 * 
 * Commandes:
 *   migrate    - Applique toutes les migrations en attente
 *   status     - Affiche le statut des migrations
 *   create     - Crée un nouveau fichier de migration
 */

const fs = require('fs');
const path = require('path');
const MigrationManager = require('./migration-manager');

// Configuration
const DB_PATH = path.join(__dirname, 'database', 'crossfit_audit.db');
const MIGRATIONS_DIR = path.join(__dirname, 'migrations');

// Créer le dossier migrations s'il n'existe pas
if (!fs.existsSync(MIGRATIONS_DIR)) {
  fs.mkdirSync(MIGRATIONS_DIR, { recursive: true });
  console.log(`✓ Dossier migrations créé: ${MIGRATIONS_DIR}`);
}

/**
 * Crée un nouveau fichier de migration
 */
function createMigration(name) {
  if (!name) {
    console.error('❌ Erreur: Vous devez spécifier un nom pour la migration');
    console.log('\nUsage: node migrations.js create <nom_de_la_migration>');
    console.log('Exemple: node migrations.js create add_user_role_column\n');
    process.exit(1);
  }

  // Générer un timestamp au format YYYYMMDDHHMMSS
  const now = new Date();
  const timestamp = [
    now.getFullYear(),
    String(now.getMonth() + 1).padStart(2, '0'),
    String(now.getDate()).padStart(2, '0'),
    String(now.getHours()).padStart(2, '0'),
    String(now.getMinutes()).padStart(2, '0'),
    String(now.getSeconds()).padStart(2, '0')
  ].join('');

  // Nettoyer le nom (enlever les espaces, caractères spéciaux)
  const cleanName = name
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '_')
    .replace(/^_+|_+$/g, '');

  const filename = `${timestamp}_${cleanName}.sql`;
  const filepath = path.join(MIGRATIONS_DIR, filename);

  // Template de migration
  const template = `-- Migration: ${cleanName}
-- Created: ${now.toISOString()}
-- Description: [Décrivez les modifications apportées au schéma]

-- ============================================================================
-- Modifications du schéma
-- ============================================================================

-- Exemple 1: Ajouter une colonne
-- ALTER TABLE table_name ADD COLUMN column_name TEXT;

-- Exemple 2: Créer une nouvelle table
-- CREATE TABLE IF NOT EXISTS new_table (
--   id INTEGER PRIMARY KEY AUTOINCREMENT,
--   name TEXT NOT NULL,
--   created_at DATETIME DEFAULT CURRENT_TIMESTAMP
-- );

-- Exemple 3: Créer un index
-- CREATE INDEX IF NOT EXISTS idx_table_column ON table_name(column_name);

-- Exemple 4: Modifier des données existantes
-- UPDATE table_name SET column_name = 'new_value' WHERE condition;


-- ============================================================================
-- IMPORTANT: 
-- - Testez cette migration sur une copie de la base de données avant !
-- - Les migrations ne peuvent PAS être annulées automatiquement
-- - Faites une sauvegarde avant d'appliquer les migrations
-- ============================================================================
`;

  fs.writeFileSync(filepath, template, 'utf8');

  console.log('\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
  console.log('✅ Nouvelle migration créée');
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');
  console.log(`📁 Fichier: ${filename}`);
  console.log(`📍 Chemin: ${filepath}\n`);
  console.log('Prochaines étapes:');
  console.log('  1. Éditez le fichier de migration et ajoutez vos modifications SQL');
  console.log('  2. Testez sur une copie de votre base de données');
  console.log('  3. Appliquez avec: npm run migrate\n');
}

/**
 * Point d'entrée principal
 */
async function main() {
  const command = process.argv[2];
  const arg = process.argv[3];

  const manager = new MigrationManager(DB_PATH, MIGRATIONS_DIR);

  try {
    switch (command) {
      case 'migrate':
      case 'up':
        await manager.migrate();
        process.exit(0);
        break;

      case 'status':
        await manager.status();
        process.exit(0);
        break;

      case 'create':
      case 'new':
        createMigration(arg);
        process.exit(0);
        break;

      case 'help':
      case '--help':
      case '-h':
      case undefined:
        console.log('\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
        console.log('📚 Système de gestion des migrations');
        console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');
        console.log('Usage: node migrations.js [command] [options]\n');
        console.log('Commandes disponibles:\n');
        console.log('  migrate, up          Applique toutes les migrations en attente');
        console.log('  status               Affiche le statut des migrations');
        console.log('  create <name>        Crée un nouveau fichier de migration');
        console.log('  help                 Affiche cette aide\n');
        console.log('Exemples:\n');
        console.log('  node migrations.js migrate');
        console.log('  node migrations.js status');
        console.log('  node migrations.js create add_user_preferences\n');
        console.log('Scripts npm disponibles:\n');
        console.log('  npm run migrate      Lance les migrations');
        console.log('  npm run migrate:status   Vérifie le statut');
        console.log('  npm run migrate:create <name>   Crée une migration\n');
        process.exit(0);
        break;

      default:
        console.error(`\n❌ Commande inconnue: ${command}\n`);
        console.log('Utilisez "node migrations.js help" pour voir les commandes disponibles\n');
        process.exit(1);
    }
  } catch (error) {
    console.error(`\n❌ Erreur fatale: ${error.message}\n`);
    process.exit(1);
  }
}

// Exécuter le script
if (require.main === module) {
  main();
}

module.exports = { createMigration };
