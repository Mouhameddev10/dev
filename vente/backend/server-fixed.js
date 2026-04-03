const express = require('express');
const cors = require('cors');
const path = require('path');
const fs = require('fs');
const multer = require('multer');

const app = express();
const PORT = process.env.PORT ? parseInt(process.env.PORT, 10) : 3000;

// Configuration de multer pour l'upload d'images
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, '../images/');
  },
  filename: (req, file, cb) => {
    cb(null, Date.now() + '-' + file.originalname);
  }
});

const upload = multer({ storage: storage });

// Middleware
app.use(cors());
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));
app.use(express.static(path.join(__dirname, '../frontend')));
app.use('/images', express.static(path.join(__dirname, '../images')));

// Fichier de données JSON pour les paniers
const dataFile = path.join(__dirname, '../data/cars.json');
const cartsFile = path.join(__dirname, '../data/carts.json');

// Initialiser les données si le fichier n'existe pas
if (!fs.existsSync(dataFile)) {
  console.log('Initialisation du fichier cars.json dans data/');
  const initialCars = [
    {
      id: 1,
      name: "Mercedes-Benz G63 AMG",
      price: 85000000,
      description: "SUV de luxe allemand avec moteur V8 biturbo de 5.5L, 577 chevaux, intérieur en cuir Nappa, système audio Burmester.",
      image: "https://images.unsplash.com/photo-1617654112369-920fb567b0b6?w=800&q=80",
      category: "SUV"
    },
    {
      id: 2,
      name: "BMW M8 Competition",
      price: 92000000,
      description: "Berline sportive haute performance avec moteur V8 biturbo de 4.4L, 625 chevaux, transmission automatique 8 vitesses.",
      image: "https://images.unsplash.com/photo-1549924231-f129b911e442?w=800&q=80",
      category: "Sport"
    },
    {
      id: 3,
      name: "Audi RS7 Sportback",
      price: 78000000,
      description: "Gran Turismo luxueux avec moteur V8 biturbo de 4.0L, 590 chevaux, design sportif et élégant.",
      image: "https://images.unsplash.com/photo-1503376780353-7e6692767b70?w=800&q=80",
      category: "GT"
    },
    {
      id: 4,
      name: "Porsche 911 Turbo S",
      price: 110000000,
      description: "Sportive iconique avec moteur flat-6 biturbo de 3.8L, 650 chevaux, accélération 0-100 km/h en 2.8 secondes.",
      image: "https://images.unsplash.com/photo-1583121274602-3e2820c69888?w=800&q=80",
      category: "Sport"
    }
  ];
  
  // Créer le répertoire data s'il n'existe pas
  const dataDir = path.join(__dirname, '../data');
  if (!fs.existsSync(dataDir)) {
    fs.mkdirSync(dataDir, { recursive: true });
  }
  
  fs.writeFileSync(dataFile, JSON.stringify(initialCars, null, 2));
  console.log('Fichier cars.json initialisé avec', initialCars.length, 'voitures');
}

// Initialiser le fichier des paniers s'il n'existe pas
if (!fs.existsSync(cartsFile)) {
  console.log('Initialisation du fichier carts.json dans data/');
  fs.writeFileSync(cartsFile, JSON.stringify([], null, 2));
  console.log('Fichier carts.json initialisé');
}

// Middleware d'authentification
const checkAuth = (req, res, next) => {
  const token = req.headers.authorization;
  if (token && token === 'Bearer admin-token-secure') {
    next();
  } else {
    res.status(401).json({ error: 'Non autorisé' });
  }
};

// Routes API
app.post('/api/login', (req, res) => {
  try {
    console.log('POST /api/login - Tentative de connexion');
    console.log('Body reçu:', req.body);
    
    const { username, password } = req.body;
    
    if (username === 'admin' && password === 'admin123') {
      console.log('Connexion réussie pour admin');
      res.json({
        success: true,
        token: 'admin-token-secure',
        message: 'Connexion réussie'
      });
    } else {
      console.log('Échec connexion - identifiants incorrects');
      res.status(401).json({
        success: false,
        error: 'Identifiants incorrects'
      });
    }
  } catch (error) {
    console.error('Erreur login:', error);
    res.status(500).json({
      success: false,
      error: 'Erreur serveur'
    });
  }
});

app.get('/api/cars', (req, res) => {
  try {
    const cars = JSON.parse(fs.readFileSync(dataFile, 'utf8'));
    res.json(cars);
  } catch (error) {
    console.error('Erreur lecture voitures:', error);
    res.status(500).json({ error: 'Erreur lors de la lecture des données' });
  }
});

app.post('/api/cars', checkAuth, (req, res) => {
  try {
    console.log('POST /api/cars - Ajout voiture');
    console.log('Headers:', req.headers);
    console.log('Body reçu:', req.body);
    
    if (!req.body || Object.keys(req.body).length === 0) {
      console.log('Erreur: Body vide ou invalide');
      return res.status(400).json({ error: 'Données invalides - body vide' });
    }
    
    const { name, price, category, description, image } = req.body;
    
    if (!name || !price || !category || !description) {
      console.log('Erreur: Champs manquants', { name, price, category, description, image });
      return res.status(400).json({ error: 'Champs obligatoires manquants' });
    }
    
    const cars = JSON.parse(fs.readFileSync(dataFile, 'utf8'));
    const newCar = {
      id: cars.length > 0 ? Math.max(...cars.map(c => c.id)) + 1 : 1,
      name: String(name),
      price: Number(price),
      category: String(category),
      description: String(description),
      image: String(image || 'https://via.placeholder.com/300x150/333/fff?text=Image')
    };
    
    console.log('Nouvelle voiture:', newCar);
    
    cars.push(newCar);
    fs.writeFileSync(dataFile, JSON.stringify(cars, null, 2));
    
    console.log('Voiture ajoutée avec succès');
    res.status(201).json(newCar);
  } catch (error) {
    console.error('Erreur ajout voiture:', error);
    res.status(500).json({ error: 'Erreur lors de l\'ajout de la voiture: ' + error.message });
  }
});

app.put('/api/cars/:id', checkAuth, (req, res) => {
  try {
    console.log('PUT /api/cars/' + req.params.id + ' - Modification voiture');
    console.log('Headers:', req.headers);
    console.log('Données reçues:', req.body);
    
    if (!req.body || Object.keys(req.body).length === 0) {
      console.log('Erreur: Body vide ou invalide');
      return res.status(400).json({ error: 'Données invalides - body vide' });
    }
    
    const { name, price, category, description, image } = req.body;
    
    if (!name || !price || !category || !description) {
      console.log('Erreur: Champs manquants', { name, price, category, description, image });
      return res.status(400).json({ error: 'Champs obligatoires manquants' });
    }
    
    const cars = JSON.parse(fs.readFileSync(dataFile, 'utf8'));
    const index = cars.findIndex(car => car.id === parseInt(req.params.id));
    
    if (index !== -1) {
      cars[index] = {
        id: parseInt(req.params.id),
        name: String(name),
        price: Number(price),
        category: String(category),
        description: String(description),
        image: String(image || cars[index].image)
      };
      
      fs.writeFileSync(dataFile, JSON.stringify(cars, null, 2));
      console.log('Voiture modifiée avec succès:', cars[index]);
      res.json(cars[index]);
    } else {
      console.log('Voiture non trouvée, ID:', req.params.id);
      res.status(404).json({ error: 'Voiture non trouvée' });
    }
  } catch (error) {
    console.error('Erreur modification voiture:', error);
    res.status(500).json({ error: 'Erreur lors de la modification de la voiture: ' + error.message });
  }
});

app.delete('/api/cars/:id', checkAuth, (req, res) => {
  try {
    const cars = JSON.parse(fs.readFileSync(dataFile, 'utf8'));
    const index = cars.findIndex(car => car.id === parseInt(req.params.id));
    if (index !== -1) {
      const deletedCar = cars.splice(index, 1)[0];
      fs.writeFileSync(dataFile, JSON.stringify(cars, null, 2));
      res.json(deletedCar);
    } else {
      res.status(404).json({ error: 'Voiture non trouvée' });
    }
  } catch (error) {
    res.status(500).json({ error: 'Erreur lors de la suppression de la voiture' });
  }
});

// Routes API pour les paniers
app.get('/api/carts', checkAuth, (req, res) => {
  try {
    const carts = JSON.parse(fs.readFileSync(cartsFile, 'utf8'));
    res.json(carts);
  } catch (error) {
    console.error('Erreur lecture paniers:', error);
    res.status(500).json({ error: 'Erreur lors de la lecture des paniers' });
  }
});

app.post('/api/carts', (req, res) => {
  try {
    console.log('POST /api/carts - Création panier');
    console.log('Body reçu:', req.body);
    
    const { items, total, customerName, customerPhone, customerEmail } = req.body;
    
    if (!items || !Array.isArray(items) || items.length === 0) {
      console.log('Erreur: Items invalides');
      return res.status(400).json({ error: 'Items du panier invalides' });
    }
    
    const carts = JSON.parse(fs.readFileSync(cartsFile, 'utf8'));
    
    const newCart = {
      id: carts.length > 0 ? Math.max(...carts.map(c => c.id)) + 1 : 1,
      items: items,
      total: Number(total) || 0,
      customerName: String(customerName || 'Client'),
      customerPhone: String(customerPhone || ''),
      customerEmail: String(customerEmail || ''),
      createdAt: new Date().toISOString(),
      status: 'pending'
    };
    
    console.log('Nouveau panier:', newCart);
    
    carts.push(newCart);
    fs.writeFileSync(cartsFile, JSON.stringify(carts, null, 2));
    
    console.log('Panier créé avec succès');
    res.status(201).json(newCart);
  } catch (error) {
    console.error('Erreur création panier:', error);
    res.status(500).json({ error: 'Erreur lors de la création du panier: ' + error.message });
  }
});

app.put('/api/carts/:id', checkAuth, (req, res) => {
  try {
    const { status } = req.body;
    const carts = JSON.parse(fs.readFileSync(cartsFile, 'utf8'));
    const index = carts.findIndex(cart => cart.id === parseInt(req.params.id));
    
    if (index !== -1) {
      if (status) carts[index].status = status;
      carts[index].updatedAt = new Date().toISOString();
      
      fs.writeFileSync(cartsFile, JSON.stringify(carts, null, 2));
      res.json(carts[index]);
    } else {
      res.status(404).json({ error: 'Panier non trouvé' });
    }
  } catch (error) {
    res.status(500).json({ error: 'Erreur lors de la mise à jour du panier' });
  }
});

app.delete('/api/carts/:id', checkAuth, (req, res) => {
  try {
    const carts = JSON.parse(fs.readFileSync(cartsFile, 'utf8'));
    const index = carts.findIndex(cart => cart.id === parseInt(req.params.id));
    if (index !== -1) {
      const deletedCart = carts.splice(index, 1)[0];
      fs.writeFileSync(cartsFile, JSON.stringify(carts, null, 2));
      res.json(deletedCart);
    } else {
      res.status(404).json({ error: 'Panier non trouvé' });
    }
  } catch (error) {
    res.status(500).json({ error: 'Erreur lors de la suppression du panier' });
  }
});

// Route pour l'admin
app.get('/admin', (req, res) => {
  res.sendFile(path.join(__dirname, '../admin/simple.html'));
});

// Démarrer le serveur
app.listen(PORT, () => {
  console.log(`Serveur démarré sur http://localhost:${PORT}`);
  console.log(`Admin: http://localhost:${PORT}/admin`);
  console.log(`Fichier de données: ${dataFile}`);
  console.log(`Fichier des paniers: ${cartsFile}`);
});
