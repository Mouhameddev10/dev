// ===== VARIABLES =====
let cars = [];
let cart = [];
let currentFilter = 'all';

// ===== DOM ELEMENTS =====
const loader = document.getElementById('loader');
const carsGrid = document.getElementById('cars-grid');
const galleryGrid = document.getElementById('gallery-grid');
const cartItems = document.getElementById('cart-items');
const cartCount = document.getElementById('cart-count');
const totalPrice = document.getElementById('total-price');
const filterBtns = document.querySelectorAll('.filter-btn');
const hamburger = document.querySelector('.hamburger');
const navMenu = document.querySelector('.nav-menu');

// ===== INIT =====
document.addEventListener('DOMContentLoaded', () => {
    // Optimized loader - shorter delay
    setTimeout(() => {
        loader.style.opacity = '0';
        setTimeout(() => {
            loader.style.display = 'none';
        }, 300);
    }, 800);
    
    // Load cars and setup in parallel
    loadCars();
    setupEventListeners();
    setupScrollAnimations();
});

// ===== EVENT LISTENERS =====
function setupEventListeners() {
    // Mobile menu toggle
    hamburger.addEventListener('click', () => {
        navMenu.classList.toggle('active');
        hamburger.classList.toggle('active');
    });

    // Filter buttons
    filterBtns.forEach(btn => {
        btn.addEventListener('click', () => {
            filterBtns.forEach(b => b.classList.remove('active'));
            btn.classList.add('active');
            currentFilter = btn.dataset.filter;
            displayCars();
        });
    });

    // Smooth scrolling for navigation links
    document.querySelectorAll('a[href^="#"]').forEach(anchor => {
        anchor.addEventListener('click', function (e) {
            e.preventDefault();
            const target = document.querySelector(this.getAttribute('href'));
            if (target) {
                target.scrollIntoView({
                    behavior: 'smooth',
                    block: 'start'
                });
                // Close mobile menu if open
                navMenu.classList.remove('active');
            }
        });
    });
}

// ===== LOAD CARS =====
async function loadCars() {
    try {
        const response = await fetch('/api/cars');
        cars = await response.json();
        console.log('Voitures chargées:', cars.length);
        displayCars();
        updateCartCount();
        updateCart();
        displayGallery();
    } catch (error) {
        console.error('Erreur lors du chargement:', error);
        showNotification('Erreur de chargement des voitures', 'error');
    }
}

// ===== DISPLAY CARS =====
function displayCars() {
    const filteredCars = currentFilter === 'all' 
        ? cars 
        : cars.filter(car => car.category === currentFilter);

    if (filteredCars.length === 0) {
        carsGrid.innerHTML = '<p class="no-cars">Aucune voiture trouvée dans cette catégorie.</p>';
        return;
    }

    carsGrid.innerHTML = filteredCars.map(car => `
        <div class="car-card fade-in">
            <img src="${car.image}" alt="${car.name}" class="car-image" onerror="this.src='https://images.unsplash.com/photo-1552519507-da3b142c6e3d?w=800&q=80'">
            <div class="car-info">
                <h3 class="car-name">${car.name}</h3>
                <p class="car-price">${formatPrice(car.price)}</p>
                <p class="car-description">${car.description}</p>
                <div class="car-actions">
                    <button class="btn btn-small btn-primary" onclick="addToCart(${car.id})">
                        <i class="fas fa-shopping-cart"></i>
                        <span>Ajouter</span>
                    </button>
                    <a href="https://wa.me/221771234567?text=Bonjour, je suis intéressé par la voiture ${encodeURIComponent(car.name)}" 
                       class="btn btn-small btn-whatsapp" target="_blank">
                        <i class="fab fa-whatsapp"></i>
                        <span>WhatsApp</span>
                    </a>
                </div>
            </div>
        </div>
    `).join('');

    // Trigger fade-in animation with performance optimization
    requestAnimationFrame(() => {
        document.querySelectorAll('.fade-in').forEach(el => {
            el.classList.add('visible');
        });
    });
}

// ===== DISPLAY GALLERY =====
function displayGallery() {
    galleryGrid.innerHTML = cars.map(car => `
        <div class="gallery-item fade-in" onclick="viewCar(${car.id})">
            <img src="${car.image}" alt="${car.name}" onerror="this.src='https://images.unsplash.com/photo-1552519507-da3b142c6e3d?w=800&q=80'">
            <div class="gallery-overlay">
                <h3>${car.name}</h3>
                <p>${formatPrice(car.price)}</p>
            </div>
        </div>
    `).join('');

    // Trigger fade-in animation with performance optimization
    requestAnimationFrame(() => {
        document.querySelectorAll('.fade-in').forEach(el => {
            el.classList.add('visible');
        });
    });
}

// ===== CART FUNCTIONS =====
function addToCart(carId) {
    console.log('Ajout au panier voiture ID:', carId);
    
    const car = cars.find(c => c.id === carId);
    if (!car) {
        console.error('Voiture non trouvée:', carId);
        return;
    }

    console.log('Voiture trouvée:', car);

    let cart = JSON.parse(localStorage.getItem('cart') || '[]');
    console.log('Panier actuel:', cart);
    
    // Check if car already in cart
    const existingItem = cart.find(item => item.id === carId);
    if (existingItem) {
        console.log('Voiture déjà dans le panier:', existingItem);
        showNotification('Cette voiture est déjà dans votre panier', 'warning');
        return;
    }

    // Add car to cart
    const cartItem = {
        id: car.id,
        name: car.name,
        price: car.price,
        image: car.image,
        quantity: 1
    };
    
    cart.push(cartItem);
    console.log('Panier après ajout:', cart);

    localStorage.setItem('cart', JSON.stringify(cart));
    updateCartCount();
    
    // Save cart to server immediately
    saveCartToServer(cart);
    
    showNotification(`${car.name} ajoutée au panier`, 'success');
}

function saveCartToServer(cart) {
    const total = cart.reduce((sum, item) => sum + (item.price * item.quantity), 0);
    
    console.log('Envoi panier au serveur:', { items: cart, total });
    
    fetch('/api/carts', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify({
            items: cart,
            total: total,
            customerName: 'Client site web',
            customerPhone: '22100000000',
            customerEmail: 'client@example.com'
        })
    })
    .then(response => {
        console.log('Réponse serveur panier:', response.status);
        if (!response.ok) {
            throw new Error('Erreur lors de la sauvegarde du panier');
        }
        return response.json();
    })
    .then(data => {
        console.log('Panier sauvegardé:', data);
        showNotification('Panier sauvegardé avec succès', 'success');
    })
    .catch(error => {
        console.error('Error saving cart:', error);
        showNotification('Erreur lors de la sauvegarde du panier', 'error');
    });
}

function removeFromCart(carId) {
    console.log('Suppression du panier voiture ID:', carId);
    
    let cart = JSON.parse(localStorage.getItem('cart') || '[]');
    console.log('Panier avant suppression:', cart);
    
    cart = cart.filter(item => item.id !== carId);
    console.log('Panier après suppression:', cart);
    
    localStorage.setItem('cart', JSON.stringify(cart));
    updateCart();
    updateCartCount();
    
    // Save updated cart to server
    saveCartToServer(cart);
    
    showNotification('Voiture retirée du panier', 'info');
}

function clearCart() {
    console.log('Vidage du panier');
    
    if (cart.length === 0) {
        showNotification('Votre panier est déjà vide', 'info');
        return;
    }
    
    cart = [];
    localStorage.setItem('cart', JSON.stringify(cart));
    updateCart();
    updateCartCount();
    
    // Save empty cart to server
    saveCartToServer([]);
    
    showNotification('Panier vidé avec succès', 'success');
}

function updateCartCount() {
    const cart = JSON.parse(localStorage.getItem('cart') || '[]');
    const count = cart.reduce((total, item) => total + item.quantity, 0);
    cartCount.textContent = count;
    console.log('Compteur panier mis à jour:', count);
}

function updateCart() {
    // Get cart from localStorage
    const cart = JSON.parse(localStorage.getItem('cart') || '[]');
    console.log('Mise à jour affichage panier:', cart);
    
    // Update cart count
    const count = cart.reduce((total, item) => total + item.quantity, 0);
    cartCount.textContent = count;
    cartCount.style.display = count > 0 ? 'flex' : 'none';

    // Update cart items
    if (cart.length === 0) {
        cartItems.innerHTML = '<p class="empty-cart">Votre panier est vide</p>';
        cartTotal.textContent = '0 FCFA';
    } else {
        cartItems.innerHTML = cart.map(item => `
            <div class="cart-item">
                <img src="${item.image}" alt="${item.name}">
                <div class="cart-item-info">
                    <h4>${item.name}</h4>
                    <p>${formatPrice(item.price)}</p>
                </div>
                <div class="cart-item-quantity">
                    <button onclick="updateQuantity(${item.id}, ${item.quantity - 1})">-</button>
                    <span>${item.quantity}</span>
                    <button onclick="updateQuantity(${item.id}, ${item.quantity + 1})">+</button>
                </div>
                <button class="remove-btn" onclick="removeFromCart(${item.id})">
                    <i class="fas fa-trash"></i>
                </button>
            </div>
        `).join('');

        const total = cart.reduce((sum, item) => sum + (item.price * item.quantity), 0);
        cartTotal.textContent = formatPrice(total);
    }
}

// ===== WHATSAPP INTEGRATION =====
async function contactWhatsApp() {
    const cart = JSON.parse(localStorage.getItem('cart') || '[]');
    console.log('Contact WhatsApp avec panier:', cart);
    
    if (cart.length === 0) {
        showNotification('Votre panier est vide', 'warning');
        return;
    }

    const total = cart.reduce((sum, car) => sum + car.price, 0);
    const order = {
        items: cart.map(car => ({ id: car.id, name: car.name, price: car.price, qty: 1 })),
        total,
        createdAt: new Date().toISOString(),
        customerName: 'Client Web'
    };

    try {
        await fetch('/api/orders', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(order)
        });
    } catch (error) {
        console.error('Erreur en envoyant la commande:', error);
    }

    const carList = cart.map(car => `- ${car.name}: ${formatPrice(car.price)}`).join('\n');
    const message = `Bonjour, je suis intéressé par les voitures suivantes:\n\n${carList}\n\nTotal: ${formatPrice(total)}\n\nPouvez-vous me donner plus d'informations ?`;
    const whatsappUrl = `https://wa.me/221771234567?text=${encodeURIComponent(message)}`;
    window.open(whatsappUrl, '_blank');
}

// ===== VIEW CAR DETAILS =====
function viewCar(carId) {
    const car = cars.find(c => c.id === carId);
    if (!car) return;

    // Scroll to cars section and highlight the car
    document.getElementById('cars').scrollIntoView({ behavior: 'smooth' });
    
    setTimeout(() => {
        const carCard = document.querySelector(`.car-card:nth-child(${cars.findIndex(c => c.id === carId) + 1})`);
        if (carCard) {
            carCard.style.border = '2px solid var(--primary-color)';
            carCard.style.boxShadow = '0 0 30px var(--primary-color)';
            
            setTimeout(() => {
                carCard.style.border = '';
                carCard.style.boxShadow = '';
            }, 3000);
        }
    }, 500);
}

// ===== NOTIFICATIONS =====
function showNotification(message, type = 'info') {
    const notification = document.createElement('div');
    notification.className = `notification notification-${type}`;
    notification.innerHTML = `
        <i class="fas fa-${type === 'success' ? 'check-circle' : type === 'warning' ? 'exclamation-triangle' : 'info-circle'}"></i>
        <span>${message}</span>
    `;
    
    // Add styles if not already in the document
    if (!document.querySelector('#notification-styles')) {
        const styles = document.createElement('style');
        styles.id = 'notification-styles';
        styles.textContent = `
            .notification {
                position: fixed;
                top: 100px;
                right: 20px;
                background: var(--card-bg);
                border: 1px solid var(--border-color);
                border-radius: 10px;
                padding: 1rem 1.5rem;
                display: flex;
                align-items: center;
                gap: 10px;
                z-index: 10000;
                animation: slideInRight 0.3s ease;
                max-width: 300px;
            }
            .notification-success { border-color: #4CAF50; color: #4CAF50; }
            .notification-warning { border-color: #FF9800; color: #FF9800; }
            .notification-info { border-color: var(--accent-color); color: var(--accent-color); }
            @keyframes slideInRight {
                from { transform: translateX(100%); opacity: 0; }
                to { transform: translateX(0); opacity: 1; }
            }
        `;
        document.head.appendChild(styles);
    }
    
    document.body.appendChild(notification);
    
    setTimeout(() => {
        notification.style.animation = 'slideInRight 0.3s ease reverse';
        setTimeout(() => {
            document.body.removeChild(notification);
        }, 300);
    }, 3000);
}

// ===== SCROLL ANIMATIONS =====
function setupScrollAnimations() {
    const observerOptions = {
        threshold: 0.1,
        rootMargin: '0px 0px -50px 0px'
    };

    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.classList.add('visible');
            }
        });
    }, observerOptions);

    // Observe all fade-in elements
    document.querySelectorAll('.fade-in').forEach(el => {
        observer.observe(el);
    });
}

// ===== UTILITY FUNCTIONS =====
function formatPrice(price) {
    return new Intl.NumberFormat('fr-FR', {
        style: 'currency',
        currency: 'XOF',
        minimumFractionDigits: 0
    }).format(price);
}

function displayError(message) {
    carsGrid.innerHTML = `
        <div class="error-message">
            <i class="fas fa-exclamation-triangle"></i>
            <p>${message}</p>
        </div>
    `;
}

// ===== IMAGE PREVIEW =====
let uploadedImageData = null;

function previewImage(event) {
    const file = event.target.files[0];
    const preview = document.getElementById('image-preview');
    
    if (file) {
        const reader = new FileReader();
        reader.onload = function(e) {
            uploadedImageData = e.target.result;
            preview.innerHTML = `<img src="${uploadedImageData}" alt="Preview">`;
            preview.classList.add('show');
        };
        reader.readAsDataURL(file);
    } else {
        preview.classList.remove('show');
        uploadedImageData = null;
    }
}

// ===== KEYBOARD SHORTCUTS =====
document.addEventListener('keydown', (e) => {
    // Ctrl/Cmd + K to focus search (if search is implemented)
    if ((e.ctrlKey || e.metaKey) && e.key === 'k') {
        e.preventDefault();
        // Focus search input if exists
    }
    
    // Escape to close mobile menu
    if (e.key === 'Escape') {
        navMenu.classList.remove('active');
    }
});

// ===== LAZY LOADING =====
if ('IntersectionObserver' in window) {
    const imageObserver = new IntersectionObserver((entries, observer) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                const img = entry.target;
                img.src = img.dataset.src || img.src;
                img.classList.remove('lazy');
                imageObserver.unobserve(img);
            }
        });
    });

    document.querySelectorAll('img[data-src]').forEach(img => {
        imageObserver.observe(img);
    });
}

// ===== PERFORMANCE OPTIMIZATION =====
let resizeTimer;
window.addEventListener('resize', () => {
    clearTimeout(resizeTimer);
    resizeTimer = setTimeout(() => {
        // Recalculate layout if needed
        displayCars();
        displayGallery();
    }, 250);
});

// ===== ERROR HANDLING =====
window.addEventListener('error', (e) => {
    console.error('JavaScript error:', e.error);
    showNotification('Une erreur est survenue', 'error');
});

// ===== ANALYTICS (placeholder) =====
function trackEvent(eventName, properties = {}) {
    // Placeholder for analytics tracking
    console.log('Track event:', eventName, properties);
}

// Track page view
trackEvent('page_view', {
    page: window.location.pathname,
    title: document.title
});
