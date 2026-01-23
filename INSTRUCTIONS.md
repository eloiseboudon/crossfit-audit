# 🎯 Instructions Rapides - Pour Votre Situation Actuelle

Vous avez déjà cloné le repository sur votre VPS mais les services ne sont pas encore configurés.

## ✅ Ce qui est fait
- ✅ Code cloné dans `/home/ubuntu/crossfit-audit`
- ✅ Base de données initialisée
- ✅ Frontend buildé

## ❌ Ce qui manque
- ❌ Services systemd (backend/frontend)
- ❌ Configuration Nginx
- ❌ Fichiers .env configurés

## 🚀 Solution Rapide

### Étape 1 : Copier les fichiers de configuration

```bash
# Sur votre machine locale, uploadez le dossier deploy vers le VPS
scp -r deploy ubuntu@votre-serveur:/home/ubuntu/crossfit-audit/

# OU sur le VPS, créez le dossier deploy et copiez les fichiers manuellement
```

### Étape 2 : Configurer le domaine

```bash
cd /home/ubuntu/crossfit-audit/deploy
nano setup-services.sh
```

Modifiez la ligne :
```bash
DOMAIN="audit.tulipconseil.fr"  # Changez par votre domaine
```

Faites de même pour `nginx-crossfit-audit` :
```bash
nano nginx-crossfit-audit
```

Changez :
```nginx
server_name audit.tulipconseil.fr;  # Votre domaine
```

### Étape 3 : Exécuter le script de configuration

```bash
cd /home/ubuntu/crossfit-audit/deploy
chmod +x setup-services.sh
sudo ./setup-services.sh
```

Ce script va :
1. ✅ Installer les dépendances manquantes
2. ✅ Créer les fichiers .env
3. ✅ Vérifier/initialiser la base de données
4. ✅ Rebuilder le frontend
5. ✅ Configurer les services systemd
6. ✅ Configurer Nginx

### Étape 4 : Vérifier que tout fonctionne

```bash
# Vérifier les services
sudo systemctl status crossfit-audit-backend
sudo systemctl status crossfit-audit-frontend

# Tester l'API
curl http://localhost:5177/health

# Tester le frontend
curl http://localhost:5176
```

### Étape 5 : Configurer SSL (optionnel mais recommandé)

```bash
sudo apt install certbot python3-certbot-nginx
sudo certbot --nginx -d audit.tulipconseil.fr
```

## 🔄 Pour les Futures Mises à Jour

Une fois tout configuré, copiez le script `deploy.sh` :

```bash
cp deploy.sh /home/ubuntu/crossfit-audit/
cd /home/ubuntu/crossfit-audit
chmod +x deploy.sh
```

Ensuite, à chaque mise à jour depuis GitHub :

```bash
cd /home/ubuntu/crossfit-audit
./deploy.sh
```

## 🐛 Si Quelque Chose Ne Fonctionne Pas

### Le backend ne démarre pas

```bash
# Voir les logs
sudo journalctl -u crossfit-audit-backend -n 50

# Vérifier le fichier .env
cat /home/ubuntu/crossfit-audit/backend/.env

# Vérifier la base de données
ls -l /home/ubuntu/crossfit-audit/backend/database/
```

### Le frontend ne démarre pas

```bash
# Voir les logs
sudo journalctl -u crossfit-audit-frontend -n 50

# Vérifier que le build existe
ls -la /home/ubuntu/crossfit-audit/dist/

# Rebuilder si nécessaire
cd /home/ubuntu/crossfit-audit
npm run build
```

### Nginx retourne une erreur

```bash
# Tester la config
sudo nginx -t

# Voir les logs Nginx
sudo tail -f /var/log/nginx/error.log

# Vérifier que les services backend/frontend tournent
sudo systemctl status crossfit-audit-*
```

## 📞 Besoin d'Aide ?

Consultez le `deploy/README.md` pour une documentation complète ou les logs :

```bash
# Backend
sudo journalctl -u crossfit-audit-backend -f

# Frontend
sudo journalctl -u crossfit-audit-frontend -f
```

---

**Durée estimée : 5-10 minutes** ⏱️
