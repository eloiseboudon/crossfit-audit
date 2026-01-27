/**
 * Migration Manager - Système de gestion des migrations de base de données
 * Gère l'application et le suivi des migrations pour CrossFit Audit
 */

const fs = require('fs');
const path = require('path');
const sqlite3 = require('sqlite3').verbose();

class MigrationManager {
  constructor(dbPath, migrationsDir) {
    this.dbPath = dbPath;
    this.migrationsDir = migrationsDir;
    this.db = null;
  }

  /**
   * Initialise la connexion à la base de données
   */
  async connect() {
    return new Promise((resolve, reject) => {
      this.db = new sqlite3.Database(this.dbPath, (err) => {
        if (err) {
          reject(new Error(`Erreur de connexion à la DB: ${err.message}`));
        } else {
          console.log('✓ Connecté à la base de données');
          resolve();
        }
      });
    });
  }

  /**
   * Ferme la connexion à la base de données
   */
  async close() {
    return new Promise((resolve, reject) => {
      if (this.db) {
        this.db.close((err) => {
          if (err) reject(err);
          else resolve();
        });
      } else {
        resolve();
      }
    });
  }

  /**
   * Crée la table de suivi des migrations si elle n'existe pas
   */
  async ensureMigrationsTable() {
    const sql = `
      CREATE TABLE IF NOT EXISTS schema_version (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        version VARCHAR(255) NOT NULL UNIQUE,
        name VARCHAR(255) NOT NULL,
        applied_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        execution_time_ms INTEGER,
        checksum VARCHAR(64)
      )
    `;

    return new Promise((resolve, reject) => {
      this.db.run(sql, (err) => {
        if (err) {
          reject(new Error(`Erreur création table schema_version: ${err.message}`));
        } else {
          console.log('✓ Table schema_version prête');
          resolve();
        }
      });
    });
  }

  /**
   * Récupère la liste des migrations déjà appliquées
   */
  async getAppliedMigrations() {
    const sql = 'SELECT version FROM schema_version ORDER BY version ASC';
    
    return new Promise((resolve, reject) => {
      this.db.all(sql, [], (err, rows) => {
        if (err) {
          reject(new Error(`Erreur lecture migrations: ${err.message}`));
        } else {
          resolve(rows.map(row => row.version));
        }
      });
    });
  }

  /**
   * Récupère la liste de tous les fichiers de migration disponibles
   */
  async getAvailableMigrations() {
    if (!fs.existsSync(this.migrationsDir)) {
      console.warn(`⚠ Le dossier ${this.migrationsDir} n'existe pas`);
      return [];
    }

    const files = fs.readdirSync(this.migrationsDir)
      .filter(file => file.endsWith('.sql'))
      .sort();

    return files.map(file => ({
      version: file.replace('.sql', ''),
      filename: file,
      filepath: path.join(this.migrationsDir, file)
    }));
  }

  /**
   * Calcule le checksum d'un fichier de migration
   */
  calculateChecksum(content) {
    const crypto = require('crypto');
    return crypto.createHash('sha256').update(content).digest('hex');
  }

  /**
   * Applique une migration unique
   */
  async applyMigration(migration) {
    console.log(`\n→ Application de la migration: ${migration.version}`);
    
    const content = fs.readFileSync(migration.filepath, 'utf8');
    const checksum = this.calculateChecksum(content);
    const startTime = Date.now();

    // Extraire le nom de la migration (après le timestamp)
    const nameParts = migration.version.split('_');
    const name = nameParts.slice(1).join('_');

    return new Promise((resolve, reject) => {
      // Commencer une transaction
      this.db.serialize(() => {
        this.db.run('BEGIN TRANSACTION', (err) => {
          if (err) {
            return reject(new Error(`Erreur début transaction: ${err.message}`));
          }

          // Exécuter le SQL de la migration
          this.db.exec(content, (err) => {
            if (err) {
              this.db.run('ROLLBACK');
              return reject(new Error(`Erreur dans migration ${migration.version}: ${err.message}`));
            }

            const executionTime = Date.now() - startTime;

            // Enregistrer la migration dans schema_version
            const insertSql = `
              INSERT INTO schema_version (version, name, execution_time_ms, checksum)
              VALUES (?, ?, ?, ?)
            `;

            this.db.run(insertSql, [migration.version, name, executionTime, checksum], (err) => {
              if (err) {
                this.db.run('ROLLBACK');
                return reject(new Error(`Erreur enregistrement migration: ${err.message}`));
              }

              // Commit la transaction
              this.db.run('COMMIT', (err) => {
                if (err) {
                  return reject(new Error(`Erreur commit: ${err.message}`));
                }
                
                console.log(`  ✓ Migration appliquée en ${executionTime}ms`);
                resolve();
              });
            });
          });
        });
      });
    });
  }

  /**
   * Applique toutes les migrations en attente
   */
  async migrate() {
    console.log('\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    console.log('🔄 Démarrage des migrations');
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');

    try {
      await this.connect();
      await this.ensureMigrationsTable();

      const applied = await this.getAppliedMigrations();
      const available = await this.getAvailableMigrations();

      console.log(`📊 Migrations appliquées : ${applied.length}`);
      console.log(`📁 Migrations disponibles : ${available.length}`);

      // Filtrer les migrations non appliquées
      const pending = available.filter(m => !applied.includes(m.version));

      if (pending.length === 0) {
        console.log('\n✅ Aucune migration en attente - Base de données à jour');
        return { success: true, applied: 0 };
      }

      console.log(`\n📋 ${pending.length} migration(s) à appliquer :\n`);
      pending.forEach((m, i) => {
        console.log(`  ${i + 1}. ${m.version}`);
      });

      // Appliquer chaque migration en attente
      for (const migration of pending) {
        await this.applyMigration(migration);
      }

      console.log('\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
      console.log(`✅ ${pending.length} migration(s) appliquée(s) avec succès`);
      console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');

      return { success: true, applied: pending.length };

    } catch (error) {
      console.error('\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
      console.error('❌ ERREUR lors des migrations');
      console.error('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
      console.error(`\n${error.message}\n`);
      throw error;
    } finally {
      await this.close();
    }
  }

  /**
   * Affiche le statut des migrations
   */
  async status() {
    console.log('\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    console.log('📊 Statut des migrations');
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');

    try {
      await this.connect();
      await this.ensureMigrationsTable();

      const applied = await this.getAppliedMigrations();
      const available = await this.getAvailableMigrations();

      console.log(`✅ Migrations appliquées : ${applied.length}`);
      console.log(`📁 Migrations disponibles : ${available.length}`);
      
      const pending = available.filter(m => !applied.includes(m.version));
      console.log(`⏳ Migrations en attente : ${pending.length}\n`);

      if (applied.length > 0) {
        console.log('Dernières migrations appliquées :');
        const lastApplied = applied.slice(-5);
        for (const version of lastApplied) {
          console.log(`  ✓ ${version}`);
        }
      }

      if (pending.length > 0) {
        console.log('\nMigrations en attente :');
        pending.forEach(m => {
          console.log(`  ⏳ ${m.version}`);
        });
      }

      console.log('\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');

      return { applied: applied.length, available: available.length, pending: pending.length };

    } catch (error) {
      console.error(`\n❌ Erreur: ${error.message}\n`);
      throw error;
    } finally {
      await this.close();
    }
  }
}

module.exports = MigrationManager;
