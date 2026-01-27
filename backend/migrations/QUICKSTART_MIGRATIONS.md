# 🚀 Guide de démarrage rapide - Migrations

## Installation (une seule fois)

```bash
# Sur votre serveur
cd /home/ubuntu/crossfit-audit
chmod +x INSTALL_MIGRATIONS.sh
./INSTALL_MIGRATIONS.sh
```

## Workflow quotidien

### 1️⃣ J'ai besoin d'ajouter une colonne à ma table

```bash
# Dans backend/
npm run migrate:create add_description_to_audits

# Éditer le fichier créé: migrations/YYYYMMDD_HHMMSS_add_description_to_audits.sql
# Ajouter:
ALTER TABLE audits ADD COLUMN description TEXT;

# Tester sur une copie
cp database/crossfit_audit.db database/test.db
# Modifier DB_PATH temporairement pour tester

# Appliquer la migration
npm run migrate

# Commit et push
git add migrations/
git commit -m "feat: add description column to audits"
git push
```

### 2️⃣ Je déploie sur le serveur

```bash
# Sur le serveur
cd /home/ubuntu/crossfit-audit
./deploy.sh

# Le script:
# ✅ Sauvegarde automatiquement la DB
# ✅ Pull le code
# ✅ Applique les migrations automatiquement
# ✅ Redémarre les services
```

### 3️⃣ Problème après déploiement ? Rollback

```bash
# Option 1: Restaurer la sauvegarde automatique
./db-manage.sh restore

# Option 2: Créer une migration corrective
cd backend
npm run migrate:create fix_description_column
# Éditer la migration pour corriger le problème
npm run migrate
```

## Commandes essentielles

```bash
# Voir le statut
npm run migrate:status

# Créer une nouvelle migration
npm run migrate:create <nom>

# Appliquer les migrations
npm run migrate

# Sauvegarder manuellement la DB
cd .. && ./db-manage.sh backup

# Lister les sauvegardes
./db-manage.sh list

# Restaurer la dernière sauvegarde
./db-manage.sh restore
```

## Exemples de migrations courantes

### Ajouter une colonne
```sql
ALTER TABLE audits ADD COLUMN priority TEXT DEFAULT 'normal';
CREATE INDEX IF NOT EXISTS idx_audits_priority ON audits(priority);
```

### Créer une table
```sql
CREATE TABLE IF NOT EXISTS notes (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  audit_id INTEGER NOT NULL,
  content TEXT NOT NULL,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (audit_id) REFERENCES audits(id) ON DELETE CASCADE
);
```

### Modifier des données
```sql
UPDATE audits SET status = 'draft' WHERE status IS NULL;
```

## ⚠️ Règles d'or

1. **TOUJOURS** tester sur une copie avant d'appliquer en prod
2. **JAMAIS** modifier une migration déjà appliquée (créer une nouvelle)
3. **TOUJOURS** vérifier le statut avant de déployer
4. **JAMAIS** supprimer des données sans sauvegarde
5. Le script `deploy.sh` fait tout automatiquement ✨

## 🆘 Problèmes courants

**Migration bloquée en erreur**
```bash
# Vérifier l'erreur
npm run migrate

# Corriger le SQL dans le fichier
# vim migrations/YYYYMMDD_HHMMSS_xxx.sql

# Supprimer l'entrée de schema_version si partiellement appliquée
sqlite3 database/crossfit_audit.db "DELETE FROM schema_version WHERE version = 'YYYYMMDD_HHMMSS_xxx';"

# Réessayer
npm run migrate
```

**Base de données verrouillée**
```bash
# Arrêter le backend
sudo systemctl stop crossfit-audit-backend

# Appliquer les migrations
npm run migrate

# Redémarrer
sudo systemctl start crossfit-audit-backend
```

---

📚 Documentation complète: `MIGRATIONS_README.md`
