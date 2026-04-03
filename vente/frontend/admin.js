const ADMIN_USERNAME = 'admin';
const ADMIN_PASSWORD = 'admin123';

const adminAuthSection = document.getElementById('adminAuthSection');
const adminDashboard = document.getElementById('adminDashboard');
const adminLoginForm = document.getElementById('adminLoginForm');
const adminLoginError = document.getElementById('adminLoginError');
const logoutAdmin = document.getElementById('logoutAdmin');

const adminCarTableBody = document.querySelector('#adminCarTable tbody');
const orderList = document.getElementById('orderList');
const adminAddCarForm = document.getElementById('adminAddCarForm');
const carImageInput = document.getElementById('car-image-admin');
const carImagePreview = document.getElementById('car-image-preview');
let editingCarId = null;
let editingCarImageUrl = '';

function checkSession() {
    return localStorage.getItem('adminLoggedIn') === 'true';
}

function showDashboard() {
    adminAuthSection.style.display = 'none';
    adminDashboard.style.display = 'block';
    loadCars();
    loadOrders();
}

function showLogin() {
    adminAuthSection.style.display = 'block';
    adminDashboard.style.display = 'none';
}

if (checkSession()) {
    showDashboard();
} else {
    showLogin();
}

carImageInput.addEventListener('change', () => {
    const file = carImageInput.files[0];
    if (!file) {
        carImagePreview.innerHTML = '';
        return;
    }
    const reader = new FileReader();
    reader.onload = (event) => {
        carImagePreview.innerHTML = `<img src="${event.target.result}" style="width:100%; height:100%; object-fit:cover;" />`;
    };
    reader.readAsDataURL(file);
});

adminLoginForm.addEventListener('submit', (e) => {
    e.preventDefault();

    const username = document.getElementById('admin-username').value.trim();
    const password = document.getElementById('admin-password').value;

    if (username === ADMIN_USERNAME && password === ADMIN_PASSWORD) {
        localStorage.setItem('adminLoggedIn', 'true');
        adminLoginError.style.display = 'none';
        showDashboard();
    } else {
        adminLoginError.style.display = 'block';
    }
});

logoutAdmin.addEventListener('click', () => {
    localStorage.removeItem('adminLoggedIn');
    showLogin();
});

async function loadCars() {
    try {
        const response = await fetch('/api/cars');
        if (!response.ok) throw new Error('Erreur chargement voitures');
        const cars = await response.json();
        renderCarTable(cars);
        if (!editingCarId) {
            resetAdminForm();
        }
    } catch (error) {
        console.error(error);
        adminCarTableBody.innerHTML = '<tr><td colspan="7">Impossible de charger les voitures.</td></tr>';
    }
}

function renderCarTable(cars) {
    adminCarTableBody.innerHTML = cars.length === 0
        ? '<tr><td colspan="7">Aucune voiture trouvée.</td></tr>'
        : cars.map(car => `
            <tr>
                <td>${car.id}</td>
                <td><img src="${car.image}" alt="${car.name}" style="width:80px;height:50px;object-fit:cover;border-radius:6px;"/></td>
                <td>${car.name}</td>
                <td>${car.category}</td>
                <td>${new Intl.NumberFormat('fr-FR', { style: 'currency', currency: 'XOF', minimumFractionDigits: 0 }).format(car.price)}</td>
                <td>${car.description}</td>
                <td>
                    <button class="btn btn-small btn-secondary" onclick="editCar(${car.id})">Modifier</button>
                    <button class="btn btn-small btn-danger" onclick="deleteCar(${car.id})">Supprimer</button>
                </td>
            </tr>
        `).join('');
}

window.deleteCar = async function(carId) {
    if (!confirm('Supprimer cette voiture ?')) return;

    try {
        const response = await fetch(`/api/cars/${carId}`, { method: 'DELETE' });
        if (!response.ok) throw new Error('Erreur suppression');
        await loadCars();
    } catch (error) {
        console.error(error);
        alert('Impossible de supprimer la voiture.');
    }
};

window.editCar = async function(carId) {
    try {
        const response = await fetch(`/api/cars`);
        if (!response.ok) throw new Error('Erreur chargement voiture');
        const cars = await response.json();
        const car = cars.find(c => c.id === carId);

        if (!car) {
            alert('Voiture introuvable.');
            return;
        }

        editingCarId = carId;
        editingCarImageUrl = car.image;
        document.getElementById('car-name-admin').value = car.name;
        document.getElementById('car-price-admin').value = car.price;
        document.getElementById('car-category-admin').value = car.category;
        document.getElementById('car-description-admin').value = car.description;
        // keep existing image if no new file is selected
        carImagePreview.innerHTML = `<img src="${car.image}" style="width:100%; height:100%; object-fit:cover;" />`;
        carImageInput.value = '';

        const submitBtn = adminAddCarForm.querySelector('button[type="submit"]');
        submitBtn.textContent = 'Mettre à jour';
        submitBtn.classList.add('btn-primary');
    } catch (error) {
        console.error(error);
        alert('Impossible de charger la voiture pour modification.');
    }
};

function resetAdminForm() {
    editingCarId = null;
    adminAddCarForm.reset();
    carImagePreview.innerHTML = '';
    const submitBtn = adminAddCarForm.querySelector('button[type="submit"]');
    submitBtn.textContent = 'Ajouter la voiture';
}

adminAddCarForm.addEventListener('submit', async (e) => {
    e.preventDefault();

    const file = carImageInput.files[0];
    let imageUrl = '';

    if (file) {
        const formData = new FormData();
        formData.append('image', file);

        const uploadResponse = await fetch('/api/upload', {
            method: 'POST',
            body: formData
        });

        if (!uploadResponse.ok) {
            alert('Impossible de téléverser l\'image.');
            return;
        }

        const data = await uploadResponse.json();
        imageUrl = data.path; // /images/xxx
    } else if (editingCarId) {
        imageUrl = editingCarImageUrl;
    }

    const carData = {
        name: document.getElementById('car-name-admin').value,
        price: parseInt(document.getElementById('car-price-admin').value, 10),
        category: document.getElementById('car-category-admin').value,
        description: document.getElementById('car-description-admin').value,
        image: imageUrl
    };

    try {
        const method = editingCarId ? 'PUT' : 'POST';
        const endpoint = editingCarId ? `/api/cars/${editingCarId}` : '/api/cars';

        const response = await fetch(endpoint, {
            method,
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(carData)
        });

        if (!response.ok) throw new Error(editingCarId ? 'Erreur mise à jour' : 'Erreur ajout');
        resetAdminForm();
        await loadCars();
    } catch (error) {
        console.error(error);
        alert(editingCarId ? 'Impossible de modifier la voiture.' : 'Impossible d\'ajouter la voiture.');
    }
});

async function loadOrders() {
    try {
        const response = await fetch('/api/orders');
        if (!response.ok) throw new Error('Erreur commandes');
        const orders = await response.json();

        if (orders.length === 0) {
            orderList.innerHTML = '<div>Aucune commande pour le moment.</div>';
            return;
        }

        orderList.innerHTML = orders.map(order => `
            <div style="border:1px solid var(--border-color); padding:0.8rem; margin-bottom:0.7rem; background:rgba(255,255,255,0.05); border-radius:8px;">
                <div><strong>Commande #${order.id}</strong> - ${new Date(order.createdAt).toLocaleString('fr-FR')}</div>
                <div><strong>Client :</strong> ${order.customerName || 'Anonyme'}</div>
                <div><strong>Total :</strong> ${new Intl.NumberFormat('fr-FR', { style: 'currency', currency: 'XOF', minimumFractionDigits: 0 }).format(order.total)}</div>
                <div><strong>Produits :</strong></div>
                <ul>${order.items.map(i => `<li>${i.name} - ${i.qty} x ${new Intl.NumberFormat('fr-FR', { style: 'currency', currency: 'XOF', minimumFractionDigits: 0 }).format(i.price)}</li>`).join('')}</ul>
            </div>
        `).join('');
    } catch (error) {
        console.error(error);
        orderList.innerHTML = '<div>Impossible de charger les commandes.</div>';
    }
}

// Actualiser commandes toutes les 10s
setInterval(() => {
    if (adminDashboard.style.display !== 'none') {
        loadOrders();
    }
}, 10000);
