# 🏋️ Système de Migrations - CrossFit Audit

**Version 1.0.0** • **Date**: 27 janvier 2025

## 📦 Contenu du package

Ce package contient un **système complet de gestion des migrations de base de données** pour l'application CrossFit Audit.

### ✨ Fonctionnalités

- ✅ **Migrations versionnées** : Chaque modification du schéma est trackée et ordonnée
- ✅ **Application automatique** : Les migrations s'appliquent lors du déploiement
- ✅ **Sauvegardes automatiques** : La DB est sauvegardée avant chaque modification
- ✅ **Rollback simple** : Restauration en 1 commande en cas de problème
- ✅ **Transactions** : Rollback automatique si une migration échoue
- ✅ **Documentation complète** : Guides, exemples et FAQ inclus

## 🚀 Installation rapide

### Prérequis
- Node.js installé
- npm package `sqlite3` installé
- Accès à votre serveur CrossFit Audit

### Installation en 3 étapes

```bash
# 1. Télécharger et extraire le package sur votre serveur
cd /home/ubuntu/crossfit-audit

# 2. Lancer le script d'installation
chmod +x INSTALL_MIGRATIONS.sh
./INSTALL_MIGRATIONS.sh

# 3. C'est tout ! Le système est installé ✨
```

## 📚 Documentation

Ce package contient plusieurs guides selon votre besoin :

| Document | Quand l'utiliser |
|----------|------------------|
| **INDEX.md** | Vue d'ensemble du système (commencez ici) |
| **QUICKSTART_MIGRATIONS.md** | Guide rapide pour démarrer immédiatement |
| **MIGRATIONS_README.md** | Documentation complète avec tous les détails |

## 🎯 Usage quotidien

### Créer une nouvelle migration

```bash
cd /home/ubuntu/crossfit-audit/backend
npm run migrate:create add_my_column
```

Cela crée : `migrations/20250127_143022_add_my_column.sql`

### Éditer la migration

Ouvrez le fichier créé et ajoutez vos modifications SQL :

```sql
-- Migration: add_my_column
-- Description: Ajoute une colonne pour...

ALTER TABLE audits ADD COLUMN my_column TEXT DEFAULT 'default_value';
CREATE INDEX IF NOT EXISTS idx_audits_my_column ON audits(my_column);
```

### Appliquer les migrations

```bash
npm run migrate
```

### Déployer (applique automatiquement les migrations)

```bash
cd /home/ubuntu/crossfit-audit
./deploy.sh
```

## 📂 Structure après installation

```
crossfit-audit/
├── backend/
│   ├── migration-manager.js          # Moteur de migrations
│   ├── migrations.js                 # CLI
│   ├── MIGRATIONS_README.md          # Doc complète
│   └── migrations/                   # Vos fichiers de migration
│       ├── 20250127_000001_xxx.sql
│       └── ...
├── deploy.sh                         # Script de déploiement (MODIFIÉ)
├── db-manage.sh                      # Utilitaire backup/restore (NOUVEAU)
└── backups/                          # Sauvegardes auto
```

## 🧪 Tester l'installation

```bash
cd /home/ubuntu/crossfit-audit
chmod +x test-migrations.sh
./test-migrations.sh
```

Ce script vérifie que tous les composants sont correctement installés.

## 🎓 Exemples inclus

Le package inclut 3 exemples de migrations courantes :

1. **Ajout d'une colonne** : `add_audit_status_field.sql`
2. **Création d'une table** : `create_audit_comments_table.sql`
3. **Ajout de plusieurs colonnes** : `add_gym_contact_info.sql`

Plus un exemple avancé de restructuration complète de table.

## 🛟 Support et dépannage

### Problème avec l'installation ?

Consultez `QUICKSTART_MIGRATIONS.md` → Section "Problèmes courants"

### Besoin d'aide avec une migration ?

Consultez `MIGRATIONS_README.md` → Section "Exemples de migrations courantes"

### Erreur lors du déploiement ?

```bash
# Restaurer la dernière sauvegarde
./db-manage.sh restore
```

## 📋 Checklist post-installation

- [ ] Le système est installé : `./INSTALL_MIGRATIONS.sh`
- [ ] Les tests passent : `./test-migrations.sh`
- [ ] Les scripts npm fonctionnent : `npm run migrate:status`
- [ ] Un premier déploiement est réussi : `./deploy.sh`
- [ ] La documentation est lue : `INDEX.md` + `QUICKSTART_MIGRATIONS.md`

## 🔄 Workflow de développement

```
1. Modification nécessaire
   ↓
2. npm run migrate:create <nom>
   ↓
3. Éditer le fichier .sql
   ↓
4. Tester sur une copie de DB
   ↓
5. git commit + push
   ↓
6. ./deploy.sh sur serveur
   ↓
7. Migrations appliquées automatiquement ✨
```

## ⚠️ Important

- **TOUJOURS** tester les migrations sur une copie avant production
- **JAMAIS** modifier une migration déjà appliquée (créer une nouvelle)
- **TOUJOURS** faire une sauvegarde manuelle avant modification risquée
- Le système fait des sauvegardes automatiques avant chaque déploiement

## 🆘 Commandes de secours

```bash
# Voir toutes les sauvegardes
./db-manage.sh list

# Restaurer la dernière sauvegarde
./db-manage.sh restore

# Créer une sauvegarde manuelle
./db-manage.sh backup

# Voir le statut complet
./db-manage.sh status
```

## 📞 Contact

**Projet** : CrossFit Audit - Tulip Conseil  
**Version** : 1.0.0  
**Date** : 27 janvier 2025

---

## 🎁 Fichiers inclus dans ce package

### Scripts principaux
- `migration-manager.js` - Moteur de gestion
- `migrations.js` - Script CLI
- `deploy.sh` - Script de déploiement modifié
- `db-manage.sh` - Utilitaire backup/restore
- `INSTALL_MIGRATIONS.sh` - Script d'installation
- `test-migrations.sh` - Script de test

### Documentation
- `README.md` - Ce fichier
- `INDEX.md` - Vue d'ensemble complète
- `QUICKSTART_MIGRATIONS.md` - Guide de démarrage rapide
- `MIGRATIONS_README.md` - Documentation détaillée

### Exemples
- `migrations/20250127_000001_add_audit_status_field.sql`
- `migrations/20250127_000002_create_audit_comments_table.sql`
- `migrations/20250127_000003_add_gym_contact_info.sql`
- `migrations/EXAMPLE_restructure_table.sql`

### Configuration
- `package.json.example` - Exemple de configuration npm
- `migrations/.gitignore` - Ignore les exemples

---

**Prêt à démarrer ? Consultez `INDEX.md` ou `QUICKSTART_MIGRATIONS.md` !** 🚀
