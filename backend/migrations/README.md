# 🏋️ Système de migrations (SQLite)

Ce dossier contient le système de gestion des migrations de base de données pour CrossFit Audit.

## ✅ Fonctionnalités clés

- Migrations **versionnées** et ordonnées.
- Application automatique lors des déploiements.
- Sauvegardes automatiques avant modification.
- Transactions & rollback si erreur.

## 🚀 Démarrage rapide

```bash
# Depuis la racine du repo
chmod +x INSTALL_MIGRATIONS.sh
./INSTALL_MIGRATIONS.sh

# Créer une migration
cd backend
npm run migrate:create add_my_column

# Éditer le fichier .sql créé puis appliquer
npm run migrate
```

## 📁 Structure

```
backend/
├── migration-manager.js      # Moteur de migrations
├── migrations.js             # CLI
├── migrations/               # Fichiers .sql versionnés
└── database/                 # Base SQLite
```

## 🧭 Commandes essentielles

```bash
# Créer une migration
npm run migrate:create <nom>

# Voir le statut
npm run migrate:status

# Appliquer les migrations
npm run migrate
```

## ✅ Bonnes pratiques

- Tester sur une copie de DB avant production.
- Ne jamais modifier une migration déjà appliquée.
- Faire une sauvegarde manuelle avant une migration risquée.

## 🔄 Déploiement

Le script `deploy.sh` applique automatiquement les migrations :

```bash
./deploy.sh
```

## 🛠️ Rollback (si besoin)

```bash
./db-manage.sh restore
```

## 🆘 Dépannage rapide

- **DB verrouillée** : arrêter le backend, migrer, relancer.
- **Erreur de migration** : corriger le SQL puis relancer `npm run migrate`.

---

Pour les détails avancés (exemples, restructuration de tables, FAQ), référez-vous au code des migrations existantes et aux scripts fournis.
