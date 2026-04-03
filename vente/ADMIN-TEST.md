# 🔧 Test de Connexion Admin

## 🚀 Test Immédiat

### **1. Vérification du Serveur**
```bash
# Le serveur doit être en cours d'exécution
npm start
# Devrait afficher:
# Serveur démarré sur http://localhost:3000
# Admin: http://localhost:3000/admin
# Login: admin / admin123
```

### **2. Test de Connexion Admin**
1. **Ouvrez** http://localhost:3000/admin
2. **Login** : admin
3. **Mot de passe** : admin123
4. **Cliquez** sur "Se connecter"

### **3. Vérification Console**
- **Ouvrez la console** (F12)
- **Regardez les messages** d'erreur
- **Devrait voir** les voitures et paniers charger

## 🔍 Dépannage

### **Si Erreur de Connexion:**
1. **Vérifiez que le serveur tourne** sur port 3000
2. **Ouvrez** http://localhost:3000 (doit marcher)
3. **Ouvrez** http://localhost:3000/admin
4. **Regardez la console** F12 pour erreurs

### **Si Login Ne Marche Pas:**
- **Console doit afficher** "Erreur de connexion au backend"
- **Vérifiez que** `/api/login` existe dans le serveur
- **Network tab** doit montrer la requête POST

### **Si Données Ne Chargent Pas:**
- **Console doit afficher** "Erreur de chargement des voitures/paniers"
- **Vérifiez que** `/api/cars` et `/api/carts` répondent
- **Authorization header** doit contenir "Bearer admin-token-secure"

## 🎯 Routes API à Tester

### **Dans le Navigateur:**
- http://localhost:3000/api/cars (doit retourner JSON)
- http://localhost:3000/api/login (POST avec admin/admin123)

### **Avec curl:**
```bash
curl http://localhost:3000/api/cars
curl -X POST http://localhost:3000/api/login -H "Content-Type: application/json" -d '{"username":"admin","password":"admin123"}'
```

## ✅ Validation

### **Admin Fonctionnel Si:**
- ✅ Login réussi avec admin/admin123
- ✅ Liste des voitures s'affiche
- ✅ Liste des paniers s'affiche
- ✅ Peut ajouter/modifier/supprimer des voitures
- ✅ Peut marquer les paniers comme traités

### **Si Problème Persiste:**
- 📋 **Copiez-collez** les erreurs console
- 🔄 **Redémarrez** le serveur
- 🧹 **Nettoyez** le cache navigateur
