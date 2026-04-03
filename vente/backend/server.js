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
app.use(express.json());
app.use(express.static(path.join(__dirname, '../frontend')));
app.use('/images', express.static(path.join(__dirname, '../images')));

// Fichier de données JSON
const dataFile = path.join(__dirname, '../data/cars.json');

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

// Routes API
      image: "https://images.unsplash.com/photo-1617654112369-920fb567b0b6?w=800&q=80",
      category: "GT"
    },
    {
      id: 11,
      name: "McLaren 720S",
      price: 105000000,
      description: "Supercar britannique avec moteur V8 4.0L twin-turbo, 720 chevaux, châssis en fibre de carbone.",
      image: "https://images.unsplash.com/photo-1617654112369-920fb567b0b6?w=800&q=80",
      category: "Sport"
    },
    {
      id: 12,
      name: "Maserati Levante Trofeo",
      price: 88000000,
      description: "SUV sportif italien avec moteur V8 3.8L twin-turbo de Ferrari, 580 chevaux, design italien distinctif.",
      image: "https://images.unsplash.com/photo-1617654112369-920fb567b0b6?w=800&q=80",
      category: "SUV"
    },
    {
      id: 13,
      name: "Jaguar F-Type R",
      price: 75000000,
      description: "Sportive britannique avec moteur V8 supercharged 5.0L, 575 chevaux, exhaust sportif sonore.",
      image: "https://images.unsplash.com/photo-1617654112369-920fb567b0b6?w=800&q=80",
      category: "Sport"
    },
    {
      id: 14,
      name: "Tesla Model S Plaid",
      price: 68000000,
      description: "Berline électrique ultra-performante, 1020 chevaux, autonomie 637 km, accélération 0-100 km/h en 2.1 secondes.",
      image: "https://images.unsplash.com/photo-1617654112369-920fb567b0b6?w=800&q=80",
      category: "Électrique"
    },
    {
      id: 15,
      name: "Porsche Taycan Turbo S",
      price: 92000000,
      description: "Sportive électrique avec 761 chevaux, transmission intégrale, technologie Porsche E-Performance.",
      image: "https://images.unsplash.com/photo-1617654112369-920fb567b0b6?w=800&q=80",
      category: "Électrique"
    }
  ];
  fs.writeFileSync(dataFile, JSON.stringify(initialCars, null, 2));
}

// Middleware pour vérifier l'authentification admin
function checkAuth(req, res, next) {
  const token = req.headers.authorization?.replace('Bearer ', '');
  
  if (!token || token !== 'admin-token-secure') {
    return res.status(401).json({ error: 'Non autorisé' });
  }
  
  next();
}

// Route de connexion
app.post('/api/login', (req, res) => {
  const { username, password } = req.body;
  
  // Vérification des identifiants
  if (username === 'admin' && password === 'admin123') {
    res.json({ 
      success: true, 
      token: 'admin-token-secure',
      message: 'Connexion réussie'
    });
  } else {
    res.status(401).json({ 
      success: false, 
      message: 'Nom d\'utilisateur ou mot de passe incorrect' 
    });
  }
});

// Route de déconnexion
app.post('/api/logout', (req, res) => {
  res.json({ success: true, message: 'Déconnexion réussie' });
});

// Routes API protégées
app.get('/api/cars', (req, res) => {
  try {
    const cars = JSON.parse(fs.readFileSync(dataFile, 'utf8'));
    res.json(cars);
  } catch (error) {
    res.status(500).json({ error: 'Erreur lors de la lecture des données' });
  }
});

app.post('/api/cars', checkAuth, (req, res) => {
  try {
    console.log('POST /api/cars - Ajout voiture');
    console.log('Body reçu:', req.body);
    
    if (!req.body || Object.keys(req.body).length === 0) {
      console.log('Erreur: Body vide ou invalide');
      return res.status(400).json({ error: 'Données invalides' });
    }
    
    const cars = JSON.parse(fs.readFileSync(dataFile, 'utf8'));
    const newCar = {
      id: cars.length > 0 ? Math.max(...cars.map(c => c.id)) + 1 : 1,
      ...req.body
    };
    
    console.log('Nouvelle voiture:', newCar);
    
    cars.push(newCar);
    fs.writeFileSync(dataFile, JSON.stringify(cars, null, 2));
    
    console.log('Voiture ajoutée avec succès');
    res.json(newCar);
  } catch (error) {
    console.error('Erreur ajout voiture:', error);
    res.status(500).json({ error: 'Erreur lors de l\'ajout de la voiture' });
  }
});

app.put('/api/cars/:id', checkAuth, (req, res) => {
  try {
    console.log('PUT /api/cars/' + req.params.id + ' - Modification voiture');
    console.log('Données reçues:', req.body);
    
    if (!req.body || Object.keys(req.body).length === 0) {
      console.log('Erreur: Body vide ou invalide');
      return res.status(400).json({ error: 'Données invalides' });
    }
    
    const cars = JSON.parse(fs.readFileSync(dataFile, 'utf8'));
    const index = cars.findIndex(car => car.id === parseInt(req.params.id));
    
    if (index !== -1) {
      cars[index] = { ...cars[index], ...req.body };
      fs.writeFileSync(dataFile, JSON.stringify(cars, null, 2));
      console.log('Voiture modifiée avec succès:', cars[index]);
      res.json(cars[index]);
    } else {
      console.log('Voiture non trouvée, ID:', req.params.id);
      res.status(404).json({ error: 'Voiture non trouvée' });
    }
  } catch (error) {
    console.error('Erreur modification voiture:', error);
    res.status(500).json({ error: 'Erreur lors de la modification de la voiture' });
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

// Routes pour les paniers des clients
app.get('/api/carts', checkAuth, (req, res) => {
  try {
    console.log('GET /api/carts - Lecture des paniers');
    const cartsFile = path.join(__dirname, '../data/carts.json');
    
    if (!fs.existsSync(cartsFile)) {
      console.log('Fichier paniers inexistant, création');
      fs.writeFileSync(cartsFile, JSON.stringify([], null, 2));
      return res.json([]);
    }
    
    const carts = JSON.parse(fs.readFileSync(cartsFile, 'utf8'));
    console.log('Paniers trouvés:', carts.length);
    res.json(carts);
  } catch (error) {
    console.error('Erreur lecture paniers:', error);
    res.status(500).json({ error: 'Erreur lors de la lecture des paniers' });
  }
});

app.post('/api/carts', (req, res) => {
  try {
    console.log('POST /api/carts - Création panier');
    console.log('Données reçues:', req.body);
    
    const cartsFile = path.join(__dirname, '../data/carts.json');
    let carts = [];
    
    if (fs.existsSync(cartsFile)) {
      carts = JSON.parse(fs.readFileSync(cartsFile, 'utf8'));
    }
    
    const newCart = {
      id: Date.now(),
      customerName: req.body.customerName || 'Client anonyme',
      customerPhone: req.body.customerPhone || '',
      customerEmail: req.body.customerEmail || '',
      items: req.body.items || [],
      total: req.body.total || 0,
      status: 'pending',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };
    
    console.log('Nouveau panier:', newCart);
    
    carts.push(newCart);
    fs.writeFileSync(cartsFile, JSON.stringify(carts, null, 2));
    
    console.log('Panier sauvegardé avec succès');
    res.json(newCart);
  } catch (error) {
    console.error('Erreur sauvegarde panier:', error);
    res.status(500).json({ error: 'Erreur lors de la sauvegarde du panier' });
  }
});

app.put('/api/carts/:id', checkAuth, (req, res) => {
  try {
    const cartsFile = path.join(__dirname, '../data/carts.json');
    let carts = [];
    
    if (fs.existsSync(cartsFile)) {
      carts = JSON.parse(fs.readFileSync(cartsFile, 'utf8'));
    }
    
    const index = carts.findIndex(cart => cart.id === parseInt(req.params.id));
    if (index !== -1) {
      carts[index] = { ...carts[index], ...req.body, updatedAt: new Date().toISOString() };
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
    const cartsFile = path.join(__dirname, '../data/carts.json');
    let carts = [];
    
    if (fs.existsSync(cartsFile)) {
      carts = JSON.parse(fs.readFileSync(cartsFile, 'utf8'));
    }
    
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

const ordersFile = path.join(__dirname, 'orders.json');

if (!fs.existsSync(ordersFile)) {
  fs.writeFileSync(ordersFile, JSON.stringify([], null, 2));
}

app.get('/api/orders', (req, res) => {
  try {
    const orders = JSON.parse(fs.readFileSync(ordersFile, 'utf8'));
    res.json(orders);
  } catch (error) {
    res.status(500).json({ error: 'Erreur lors de la lecture des commandes' });
  }
});

app.post('/api/orders', (req, res) => {
  try {
    const orders = JSON.parse(fs.readFileSync(ordersFile, 'utf8'));
    const newOrder = {
      id: orders.length > 0 ? Math.max(...orders.map(o => o.id)) + 1 : 1,
      ...req.body
    };
    orders.push(newOrder);
    fs.writeFileSync(ordersFile, JSON.stringify(orders, null, 2));
    res.json(newOrder);
  } catch (error) {
    res.status(500).json({ error: 'Erreur lors de l\'enregistrement de la commande' });
  }
});

app.post('/api/upload', upload.single('image'), (req, res) => {
  if (!req.file) {
    return res.status(400).json({ error: 'Aucun fichier uploadé' });
  }
  res.json({ 
    filename: req.file.filename,
    path: `/images/${req.file.filename}`
  });
});

// Route de santé pour vérifier que le backend est en ligne
app.get('/test-panier', (req, res) => {
  res.sendFile(path.join(__dirname, '../test-panier.html'));
});

// Servir le frontend
app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, '../frontend/index.html'));
});

app.get('/admin', (req, res) => {
  const adminFile = path.join(__dirname, '../admin/simple.html');
  console.log('Tentative de servir:', adminFile);
  console.log('Fichier existe:', fs.existsSync(adminFile));
  
  if (fs.existsSync(adminFile)) {
    res.sendFile(adminFile);
  } else {
    res.status(404).send('Page admin non trouvée');
  }
});

app.listen(PORT, () => {
  console.log(`Serveur démarré sur http://localhost:${PORT}`);
  console.log(`Admin simple: http://localhost:${PORT}/admin`);
});
