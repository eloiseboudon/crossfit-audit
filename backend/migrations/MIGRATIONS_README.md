# Système de Migrations - CrossFit Audit

Ce système permet de gérer les modifications du schéma de base de données de manière versionnée et sécurisée.

## 🎯 Pourquoi utiliser les migrations ?

- **Versionnage** : Chaque modification du schéma est trackée
- **Déploiement automatisé** : Les modifications s'appliquent automatiquement lors du déploiement
- **Rollback possible** : Grâce aux sauvegardes automatiques avant chaque déploiement
- **Travail en équipe** : Tout le monde applique les mêmes modifications dans le même ordre
- **Sécurité** : Les migrations sont appliquées dans une transaction (rollback automatique en cas d'erreur)

## 📁 Structure

```
backend/
├── migrations/                          # Dossier des migrations
│   ├── 20250127_000001_add_status.sql
│   ├── 20250127_000002_create_table.sql
│   └── ...
├── migration-manager.js                 # Gestionnaire de migrations
├── migrations.js                        # Script CLI
└── database/
    └── crossfit_audit.db               # Base de données
```

## 🚀 Utilisation

### 1. Créer une nouvelle migration

```bash
cd backend
npm run migrate:create add_new_column
```

Cela crée un fichier : `migrations/20250127143022_add_new_column.sql`

### 2. Éditer la migration

Ouvrez le fichier créé et ajoutez vos modifications SQL :

```sql
-- Migration: add_new_column
-- Description: Ajoute une colonne pour...

ALTER TABLE audits ADD COLUMN new_field TEXT;
CREATE INDEX IF NOT EXISTS idx_audits_new_field ON audits(new_field);
```

### 3. Vérifier le statut

```bash
npm run migrate:status
```

Affiche :
- ✅ Migrations appliquées
- ⏳ Migrations en attente
- 📊 Statistiques

### 4. Appliquer les migrations

```bash
npm run migrate
```

Les migrations s'appliquent dans l'ordre chronologique (timestamp).

## 📋 Commandes disponibles

| Commande | Description |
|----------|-------------|
| `npm run migrate` | Applique toutes les migrations en attente |
| `npm run migrate:status` | Vérifie le statut des migrations |
| `npm run migrate:create <nom>` | Crée un nouveau fichier de migration |

Ou directement avec Node.js :

```bash
node migrations.js migrate
node migrations.js status
node migrations.js create add_field
```

## 🔒 Sécurité & Bonnes pratiques

### ✅ Avant d'appliquer une migration

1. **Testez sur une copie de la DB** :
   ```bash
   cp database/crossfit_audit.db database/crossfit_audit_test.db
   # Modifiez temporairement DB_PATH dans migrations.js
   npm run migrate
   # Vérifiez que tout fonctionne
   ```

2. **Faites une sauvegarde manuelle** :
   ```bash
   cp database/crossfit_audit.db database/backup_$(date +%Y%m%d_%H%M%S).db
   ```

3. **Vérifiez le statut** :
   ```bash
   npm run migrate:status
   ```

### ✅ Types de migrations sûres

Ces migrations **ne perdent jamais de données** :

```sql
-- ✅ Ajouter une colonne (avec valeur par défaut)
ALTER TABLE table_name ADD COLUMN new_column TEXT DEFAULT 'value';

-- ✅ Créer une nouvelle table
CREATE TABLE IF NOT EXISTS new_table (...);

-- ✅ Créer un index
CREATE INDEX IF NOT EXISTS idx_name ON table_name(column);

-- ✅ Ajouter une contrainte CHECK
ALTER TABLE table_name ADD CONSTRAINT check_name CHECK (condition);

-- ✅ Mettre à jour des données (avec WHERE clause prudente)
UPDATE table_name SET column = 'value' WHERE condition;
```

### ⚠️ Migrations à risque

Ces migrations peuvent **perdre des données** - utilisez avec précaution :

```sql
-- ⚠️ Supprimer une colonne (SQLite ne le supporte pas directement)
-- Nécessite de recréer la table

-- ⚠️ Modifier le type d'une colonne
-- Nécessite de recréer la table

-- ⚠️ Supprimer une table
DROP TABLE table_name;

-- ⚠️ Supprimer des données
DELETE FROM table_name WHERE condition;
```

**Pour les migrations à risque** :
1. Faites une sauvegarde complète
2. Testez sur une copie
3. Documentez bien la migration
4. Préparez un plan de rollback

## 🔄 Déploiement automatique

Le script `deploy.sh` applique automatiquement les migrations :

```bash
./deploy.sh
```

Le processus :
1. ✅ Sauvegarde automatique de la DB
2. ✅ Pull du code depuis GitHub
3. ✅ Installation des dépendances
4. ✅ **Application des migrations** ← Nouveau !
5. ✅ Redémarrage des services

## 🛠️ Rollback en cas de problème

Si une migration pose problème après déploiement :

### Option 1 : Rollback de la DB (rapide mais perd les données récentes)

```bash
cd /home/ubuntu/crossfit-audit
./db-manage.sh restore
```

### Option 2 : Créer une migration corrective

```bash
npm run migrate:create fix_previous_migration

# Éditez le fichier pour corriger le problème
# Exemple: supprimer la colonne ajoutée
# ALTER TABLE audits DROP COLUMN problematic_column;

npm run migrate
```

## 📊 Table schema_version

Le système track automatiquement les migrations dans cette table :

```sql
CREATE TABLE schema_version (
  id INTEGER PRIMARY KEY,
  version VARCHAR(255) UNIQUE,           -- Ex: 20250127_143022_add_field
  name VARCHAR(255),                     -- Ex: add_field
  applied_at DATETIME,                   -- Quand la migration a été appliquée
  execution_time_ms INTEGER,             -- Temps d'exécution
  checksum VARCHAR(64)                   -- Hash SHA-256 du fichier SQL
);
```

**Ne modifiez jamais cette table manuellement !**

## 🎓 Exemples de migrations courantes

### Ajouter une colonne

```sql
-- Avec valeur par défaut
ALTER TABLE audits ADD COLUMN priority TEXT DEFAULT 'normal';

-- Avec contrainte
ALTER TABLE audits ADD COLUMN score INTEGER CHECK(score >= 0 AND score <= 100);
```

### Créer une nouvelle table

```sql
CREATE TABLE IF NOT EXISTS audit_attachments (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  audit_id INTEGER NOT NULL,
  filename TEXT NOT NULL,
  file_path TEXT NOT NULL,
  file_size INTEGER,
  mime_type TEXT,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (audit_id) REFERENCES audits(id) ON DELETE CASCADE
);

CREATE INDEX IF NOT EXISTS idx_attachments_audit_id ON audit_attachments(audit_id);
```

### Modifier des données existantes

```sql
-- Normaliser les données
UPDATE gyms SET name = TRIM(name);

-- Calculer une valeur dérivée
UPDATE audits 
SET score_category = CASE
  WHEN final_score >= 80 THEN 'excellent'
  WHEN final_score >= 60 THEN 'good'
  WHEN final_score >= 40 THEN 'average'
  ELSE 'needs_improvement'
END
WHERE final_score IS NOT NULL;
```

### Renommer/Modifier une colonne (complexe avec SQLite)

SQLite ne supporte pas `ALTER COLUMN`, il faut recréer la table :

```sql
-- 1. Créer nouvelle table avec la structure corrigée
CREATE TABLE audits_new (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  gym_name TEXT NOT NULL,  -- Ancien nom: name
  -- ... autres colonnes
);

-- 2. Copier les données
INSERT INTO audits_new SELECT id, name, ... FROM audits;

-- 3. Supprimer l'ancienne table
DROP TABLE audits;

-- 4. Renommer la nouvelle
ALTER TABLE audits_new RENAME TO audits;

-- 5. Recréer les index
CREATE INDEX IF NOT EXISTS idx_audits_gym_name ON audits(gym_name);
```

## ❓ FAQ

**Q: Que se passe-t-il si une migration échoue ?**  
R: La migration est rollback automatiquement (transaction). Aucune modification n'est appliquée. Consultez les logs pour comprendre l'erreur.

**Q: Puis-je modifier une migration déjà appliquée ?**  
R: **NON !** Une fois appliquée, ne modifiez jamais une migration. Créez une nouvelle migration corrective.

**Q: Comment savoir si mes migrations sont à jour ?**  
R: `npm run migrate:status` vous donne le statut complet.

**Q: Les migrations s'appliquent dans quel ordre ?**  
R: Par ordre chronologique du timestamp dans le nom du fichier.

**Q: Puis-je supprimer d'anciennes migrations ?**  
R: Seulement si elles ne sont **jamais** appliquées sur aucun environnement (dev, prod). Sinon, conservez-les.

**Q: Comment gérer les conflits de migrations en équipe ?**  
R: Communiquez avant de créer une migration. Si conflit, renommez le fichier pour ajuster le timestamp.

## 🐛 Dépannage

### Erreur "table schema_version not found"

```bash
# La table sera créée automatiquement au premier lancement
npm run migrate
```

### Erreur "database is locked"

```bash
# Arrêtez les services qui utilisent la DB
sudo systemctl stop crossfit-audit-backend
npm run migrate
sudo systemctl start crossfit-audit-backend
```

### Migration bloquée en erreur

```bash
# 1. Vérifiez les logs
npm run migrate

# 2. Corrigez le SQL dans le fichier de migration

# 3. Supprimez l'entrée de la table schema_version si partiellement appliquée
sqlite3 database/crossfit_audit.db "DELETE FROM schema_version WHERE version = '20250127_XXXXXX_xxx';"

# 4. Réessayez
npm run migrate
```

## 📝 Checklist avant production

- [ ] Migrations testées sur une copie de la DB
- [ ] Sauvegarde manuelle de la DB de production
- [ ] `npm run migrate:status` vérifié
- [ ] Code déployé sur GitHub
- [ ] `./deploy.sh` exécuté
- [ ] Services redémarrés correctement
- [ ] Tests de santé passés
- [ ] Sauvegarde automatique confirmée dans `/backups`

---

**En cas de doute, consultez cette doc ou faites une sauvegarde !** 🛟
