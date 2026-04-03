# 🚗 Vente Voitures de Luxe Sénégal

Site e-commerce complet de vente de voitures de luxe adapté au marché sénégalais, avec design moderne noir et effets lumineux.

## 🎯 Caractéristiques Principales

### ✨ Design & UX
- **Thème sombre luxueux** avec effets néon et glow
- **Animations fluides** CSS3 et JavaScript
- **Design responsive** parfait pour mobile et desktop
- **Interface moderne** inspirée des sites automobiles premium
- **Loader animé** et transitions élégantes

### 🛠️ Fonctionnalités
- **15 voitures de luxe** pré-intégrées avec images HD
- **Système de panier** fonctionnel
- **Intégration WhatsApp** automatique pour chaque voiture
- **Panneau d'administration** complet pour gérer les voitures
- **Upload d'images** avec gestion des fichiers
- **Filtre par catégorie** (SUV, Sport, GT, Électrique)
- **Galerie photo** avec animations au survol
- **Recherche** dans le panneau admin

### 📱 Technologies
- **Frontend**: HTML5, CSS3, JavaScript Vanilla
- **Backend**: Node.js + Express
- **Stockage**: JSON local (facilement migrable vers MongoDB)
- **Upload**: Multer pour la gestion des images
- **Design**: CSS Grid, Flexbox, Animations avancées

## 🚀 Installation & Lancement

### Prérequis
- Node.js (version 14 ou supérieure)
- npm ou yarn

### Étapes d'installation

1. **Cloner ou télécharger le projet**
   ```bash
   # Si vous avez le projet dans un dossier local, naviguez vers:
   cd "c:\Users\bmd tech\OneDrive\Documents\vente"
   ```

2. **Installer les dépendances**
   ```bash
   npm install
   ```

3. **Démarrer le serveur**
   ```bash
   # Pour le développement (avec nodemon)
   npm run dev
   
   # Pour la production
   npm start
   ```

4. **Accéder au site**
   - **Site principal**: http://localhost:3000
   - **Panneau d'administration**: http://localhost:3000/admin

## 📁 Structure du Projet

```
vente/
├── package.json              # Dépendances et scripts
├── backend/
│   ├── server.js            # Serveur Express principal
│   └── cars.json            # Base de données des voitures
├── frontend/
│   ├── index.html           # Page d'accueil principale
│   ├── style.css            # Styles avec effets lumineux
│   └── script.js            # Fonctionnalités frontend
├── admin/
│   ├── admin.html           # Panneau d'administration
│   ├── admin-style.css      # Styles admin
│   └── admin-script.js      # Fonctionnalités admin
└── images/                  # Dossier pour les images uploadées
```

## 🎨 Personnalisation

### Changer le numéro WhatsApp
Modifiez ces lignes dans les fichiers :
- **frontend/index.html**: Ligne 224 (bouton flottant)
- **frontend/script.js**: Ligne 95 (contact depuis le panier)
- **admin/admin.html**: Ligne 224 (informations de contact)

### Modifier les couleurs principales
Dans `frontend/style.css` et `admin/admin-style.css` :
```css
:root {
    --primary-color: #FFD700;    /* Or - couleur principale */
    --secondary-color: #FF6B6B;  /* Rouge corail */
    --accent-color: #00D4FF;     /* Bleu cyan */
}
```

### Ajouter/Modifier des voitures
1. **Via l'admin**: Accédez à http://localhost:3000/admin
2. **Manuellement**: Éditez `backend/cars.json`

## 🔧 Configuration Avancée

### Port du serveur
Modifiez la ligne 7 dans `backend/server.js` :
```javascript
const PORT = 3000; // Changez le port si nécessaire
```

### Base de données
Le site utilise actuellement un fichier JSON. Pour migrer vers MongoDB :
1. Installez MongoDB : `npm install mongodb`
2. Modifiez les routes dans `server.js` pour utiliser MongoDB
3. Créez les schémas Mongoose appropriés

### Upload d'images
Les images sont stockées dans le dossier `/images`. Pour modifier :
- **Taille maximale**: Modifiez la configuration Multer
- **Formats acceptés**: Ajoutez des validations dans le middleware

## 📱 Fonctionnalités WhatsApp

### Message automatique
Chaque voiture génère un message pré-rempli :
```
Bonjour, je suis intéressé par la voiture [Nom de la voiture]
```

### Depuis le panier
Le panier génère un message complet avec toutes les voitures sélectionnées et le total.

## 🎯 Utilisation du Panneau Admin

### Ajouter une voiture
1. Rendez-vous sur http://localhost:3000/admin
2. Remplissez le formulaire "Ajouter une Voiture"
3. Optionnel: Uploadez une image personnalisée
4. Cliquez sur "Ajouter la voiture"

### Modifier une voiture
1. Cliquez sur l'icône ✏️ dans le tableau
2. Modifiez les informations
3. Cliquez sur "Enregistrer"

### Supprimer une voiture
1. Cliquez sur l'icône 🗑️ dans le tableau
2. Confirmez la suppression

## 🔍 Optimisations & Performance

### Frontend
- **Lazy loading** des images
- **Animations optimisées** avec CSS transforms
- **Code minifié** prêt pour la production

### Backend
- **Gestion des erreurs** complète
- **Validation des données** côté serveur
- **Headers CORS** configurés

## 🚀 Déploiement

### Pour un déploiement en production :
1. **Build de production** (minifier CSS/JS)
2. **Variables d'environnement** pour les configurations sensibles
3. **HTTPS** obligatoire pour les fonctionnalités modernes
4. **Process manager** comme PM2 pour Node.js

### Exemple avec PM2 :
```bash
npm install -g pm2
pm2 start backend/server.js --name "luxe-auto"
pm2 startup
pm2 save
```

## 🐛 Dépannage

### Problèmes courants
- **Port déjà utilisé**: Changez le PORT dans server.js
- **Images ne s'affichent pas**: Vérifiez les chemins dans `/images`
- **Erreur 404**: Vérifiez que le serveur est bien démarré

### Logs et debug
- **Console navigateur**: F12 pour voir les erreurs frontend
- **Console serveur**: Les erreurs backend s'affichent dans le terminal

## 📞 Support

Pour toute question ou problème technique :
- **Email**: support@luxeauto.sn
- **WhatsApp**: +221 77 123 45 67

## 📄 Licence

Ce projet est sous licence MIT. Vous pouvez l'utiliser et le modifier librement.

---

**🎉 Votre site e-commerce de voitures de luxe est prêt !**

Accédez à http://localhost:3000 pour commencer à vendre vos voitures de luxe au Sénégal.
