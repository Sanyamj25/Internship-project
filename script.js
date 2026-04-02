// FoodieHub JavaScript

// Sample menu data
const menuData = {
    indian: [
        { id: 1, name: 'Jain Thali', price: 99, desc: 'Traditional Jain meal with vegetables', img: 'C:/PBEL Internship/Images/jain thali home page.jfif' },
        { id: 2, name: 'Momos', price: 59, desc: 'Steamed dumplings with veggies', img: 'C:/PBEL Internship/Images/momos.jfif' },
        { id: 3, name: 'Samosa', price: 49, desc: 'Crispy fried pastry with filling', img: 'C:/PBEL Internship/Images/samosa.jfif' }
    ],
    snacks: [
        { id: 4, name: 'French Fries', price: 59, desc: 'Golden crispy fries', img: 'C:/PBEL Internship/Images/french fries.jfif' },
        { id: 5, name: 'Jalebi', price: 89, desc: 'Sweet syrupy dessert', img: 'C:/PBEL Internship/Images/jalebi.jfif' }
    ],
    fastfood: [
        { id: 6, name: 'Pizza', price: 79, desc: 'Cheesy pizza with toppings', img: 'C:/PBEL Internship/Images/pizza 1.jfif' },
        { id: 7, name: 'Veg Burger', price: 69, desc: 'Plant-based burger', img: 'C:/PBEL Internship/Images/Veg burger.webp' }
    ]
};

let cart = JSON.parse(localStorage.getItem('cart')) || [];
let discount = 0;
let wishlist = JSON.parse(localStorage.getItem('wishlist')) || [];
let recentlyViewed = JSON.parse(localStorage.getItem('recentlyViewed')) || [];
let currentUser = JSON.parse(localStorage.getItem('currentUser')) || null;

// Update cart count
function updateCartCount() {
    const count = cart.reduce((sum, item) => sum + item.quantity, 0);
    document.getElementById('cart-count').textContent = count;
}

// Display menu items
function displayMenu(category) {
    currentMenu = category;
    const menuItems = document.getElementById('menu-items');
    menuItems.innerHTML = '';
    menuData[category].forEach(item => {
        const col = document.createElement('div');
        col.className = 'col-md-4';
        col.innerHTML = `
            <div class="card">
                <img src="${item.img}" class="card-img-top" alt="${item.name}" style="height: 200px; object-fit: cover;">
                <div class="card-body">
                    <h5 class="card-title">${item.name}</h5>
                    <p class="card-text">${item.desc}</p>
                    <p class="card-text"><strong>₹${item.price}</strong></p>
                    <button id="add-cart-${item.id}" class="btn btn-success" onclick="addToCart(${item.id})">Add to Cart</button>
                    <button id="wishlist-btn-${item.id}" class="btn btn-warning ml-2" onclick="addToWishlist(${item.id})">Add to Wishlist</button>
                </div>
            </div>
        `;
        menuItems.appendChild(col);
    });
}

// View menu for a restaurant
function viewMenu(category) {
    displayMenu(category);
    document.getElementById('menu').scrollIntoView();
}

// Add item to cart
function addToCart(id) {
    const item = Object.values(menuData).flat().find(i => i.id === id);
    const existing = cart.find(c => c.item.id === id);
    if (existing) {
        existing.quantity += 1;
    } else {
        cart.push({ item: item, quantity: 1 });
    }
    localStorage.setItem('cart', JSON.stringify(cart));
    addToRecentlyViewed(item);
    updateCartCount();
    // Change button color to white
    const button = document.getElementById(`add-cart-${id}`);
    if (button) {
        button.style.backgroundColor = 'white';
        button.style.color = 'black';
        button.textContent = 'Added to Cart';
        button.disabled = true;
    }
    // Update displays
    displayTempCart();
    calculateTotals();
}

// Add item to wishlist
function addToWishlist(id) {
    const item = Object.values(menuData).flat().find(i => i.id === id);
    if (!wishlist.find(i => i.id === id)) {
        wishlist.push(item);
        localStorage.setItem('wishlist', JSON.stringify(wishlist));
        addToRecentlyViewed(item);
        alert(`${item.name} added to wishlist!`);
        displayWishlist();
        // Change button color
        const button = document.getElementById(`wishlist-btn-${id}`);
        if (button) {
            button.style.backgroundColor = 'white';
            button.style.color = 'black';
            button.textContent = 'Added to Wishlist';
            button.disabled = true;
        }
    } else {
        alert(`${item.name} is already in wishlist!`);
    }
}

// Add to recently viewed
function addToRecentlyViewed(item) {
    if (!recentlyViewed.find(i => i.id === item.id)) {
        recentlyViewed.unshift(item);
        if (recentlyViewed.length > 10) recentlyViewed.pop(); // Keep only 10
        localStorage.setItem('recentlyViewed', JSON.stringify(recentlyViewed));
    }
}

// Display cart
function displayCart() {
    const cartItems = document.getElementById('cart-items');
    if (cartItems) {
        cartItems.innerHTML = '';
        if (cart.length === 0) {
            cartItems.innerHTML = '<p>Your cart is empty.</p>';
            return;
        }
        const table = document.createElement('table');
        table.className = 'table';
        table.innerHTML = `
            <thead>
                <tr>
                    <th>Product</th>
                    <th>Details</th>
                    <th>Quantity</th>
                    <th>Price</th>
                    <th>Action</th>
                </tr>
            </thead>
            <tbody id="cart-table-body">
            </tbody>
        `;
        cartItems.appendChild(table);
        const tbody = document.getElementById('cart-table-body');
        cart.forEach((cartItem, index) => {
            const row = document.createElement('tr');
            row.innerHTML = `
                <td><img src="${cartItem.item.img}" alt="${cartItem.item.name}" style="width: 50px; height: 50px; object-fit: cover;"></td>
                <td>
                    <strong>${cartItem.item.name}</strong><br>
                    <small>${cartItem.item.desc}</small>
                </td>
                <td>
                    <div class="input-group" style="width: 120px;">
                        <div class="input-group-prepend">
                            <button class="btn btn-outline-secondary btn-sm" onclick="decreaseQuantity(${index})">-</button>
                        </div>
                        <input type="number" class="form-control text-center" value="${cartItem.quantity}" readonly>
                        <div class="input-group-append">
                            <button class="btn btn-outline-secondary btn-sm" onclick="increaseQuantity(${index})">+</button>
                        </div>
                    </div>
                </td>
                <td>₹${cartItem.item.price * cartItem.quantity}</td>
                <td><button class="btn btn-danger btn-sm" onclick="removeFromCart(${index})">Remove</button></td>
            `;
            tbody.appendChild(row);
        });
    }
    calculateTotals();
}

// Display temporary cart on index page
// Display temporary cart on index page
function displayTempCart() {
    const tempCart = document.getElementById('temp-cart');
    const tempCartItems = document.getElementById('temp-cart-items');
    if (tempCart && tempCartItems) {
        if (cart.length === 0) {
            tempCart.style.display = 'none';
            return;
        }
        tempCart.style.display = 'block';
        tempCartItems.innerHTML = '';
        cart.forEach((cartItem, index) => {
            const col = document.createElement('div');
            col.className = 'col-md-3 mb-3';
            const div = document.createElement('div');
            div.className = 'card';
            div.innerHTML = `
                <img src="${cartItem.item.img}" class="card-img-top" alt="${cartItem.item.name}" style="height: 150px; object-fit: cover;">
                <div class="card-body">
                    <h6 class="card-title">${cartItem.item.name}</h6>
                    <p class="card-text">₹${cartItem.item.price} x ${cartItem.quantity} = ₹${cartItem.item.price * cartItem.quantity}</p>
                    <button class="btn btn-danger btn-sm" onclick="removeFromCart(${index}); displayTempCart();">Remove</button>
                </div>
            `;
            col.appendChild(div);
            tempCartItems.appendChild(col);
        });
    }
}

// Display wishlist
function displayWishlist() {
    const wishlistDiv = document.getElementById('wishlist');
    wishlistDiv.innerHTML = '';
    if (wishlist.length === 0) {
        wishlistDiv.innerHTML = '<p>Your wishlist is empty.</p>';
        return;
    }
    wishlist.forEach((item, index) => {
        const col = document.createElement('div');
        col.className = 'col-md-3 mb-3';
        const div = document.createElement('div');
        div.className = 'card';
        div.innerHTML = `
            <img src="${item.img}" class="card-img-top" alt="${item.name}" style="height: 150px; object-fit: cover;">
            <div class="card-body">
                <h6 class="card-title">${item.name}</h6>
                <p class="card-text">₹${item.price}</p>
                <button class="btn btn-success btn-sm" onclick="moveToCart(${item.id})">Move to Cart</button>
                <button class="btn btn-danger btn-sm ml-1" onclick="removeFromWishlist(${index})">Remove</button>
            </div>
        `;
        col.appendChild(div);
        wishlistDiv.appendChild(col);
    });
}

// Display recently viewed
function displayRecentlyViewed() {
    const rvDiv = document.getElementById('recently-viewed');
    rvDiv.innerHTML = '';
    if (recentlyViewed.length === 0) {
        rvDiv.innerHTML = '<p>No recently viewed items.</p>';
        return;
    }
    recentlyViewed.slice(0, 6).forEach(item => { // Show first 6
        const col = document.createElement('div');
        col.className = 'col-md-4 mb-3';
        const div = document.createElement('div');
        div.className = 'card';
        div.innerHTML = `
            <img src="${item.img}" class="card-img-top" alt="${item.name}" style="height: 150px; object-fit: cover;">
            <div class="card-body">
                <h6 class="card-title">${item.name}</h6>
                <p class="card-text">₹${item.price}</p>
            </div>
        `;
        col.appendChild(div);
        rvDiv.appendChild(col);
    });
}

// Move to cart from wishlist
function moveToCart(id) {
    const item = wishlist.find(i => i.id === id);
    if (item) {
        cart.push(item);
        localStorage.setItem('cart', JSON.stringify(cart));
        removeFromWishlist(wishlist.indexOf(item));
        updateCartCount();
        alert(`${item.name} moved to cart!`);
    }
}

// Remove from wishlist
function removeFromWishlist(index) {
    wishlist.splice(index, 1);
    localStorage.setItem('wishlist', JSON.stringify(wishlist));
    displayWishlist();
}

// Increase quantity
function increaseQuantity(index) {
    cart[index].quantity += 1;
    localStorage.setItem('cart', JSON.stringify(cart));
    updateCartCount();
    displayCart();
    displayTempCart();
}

// Calculate totals
function calculateTotals() {
    let subtotal = 0;
    let itemCount = 0;
    cart.forEach(cartItem => {
        subtotal += cartItem.item.price * cartItem.quantity;
        itemCount += cartItem.quantity;
    });
    const shipping = subtotal > 500 ? 0 : 50; // Free shipping over 500
    const tax = subtotal * 0.18;
    const total = subtotal + shipping + tax - discount;

    // Update elements if they exist
    const subtotalEl = document.getElementById('subtotal');
    if (subtotalEl) subtotalEl.textContent = subtotal.toFixed(2);

    const shippingEl = document.getElementById('shipping');
    if (shippingEl) shippingEl.textContent = shipping.toFixed(2);

    const taxEl = document.getElementById('tax');
    if (taxEl) taxEl.textContent = tax.toFixed(2);

    const totalEl = document.getElementById('total');
    if (totalEl) totalEl.textContent = total.toFixed(2);

    const itemCountEl = document.getElementById('item-count');
    if (itemCountEl) itemCountEl.textContent = itemCount;

    const summaryTotalEl = document.getElementById('summary-total');
    if (summaryTotalEl) summaryTotalEl.textContent = total.toFixed(2);
}

// Update user info display
function updateUserInfo() {
    const userInfo = document.getElementById('user-info');
    if (userInfo && currentUser) {
        userInfo.innerHTML = `<strong>Name:</strong> ${currentUser.name}<br><strong>Email:</strong> ${currentUser.email}<br><strong>Date of Birth:</strong> ${currentUser.dob || 'Not provided'}`;
    } else if (userInfo) {
        userInfo.innerHTML = 'Please log in to view your information.';
    }
}

// Display profile
function displayProfile() {
    updateUserInfo();
}

// Login form
document.getElementById('login-form').addEventListener('submit', function(e) {
    e.preventDefault();
    const email = document.getElementById('email') ? document.getElementById('email').value : document.getElementById('login-email').value;
    const password = document.getElementById('password') ? document.getElementById('password').value : document.getElementById('login-password').value;
    // Simulate login
    currentUser = { email: email, name: email.split('@')[0] };
    localStorage.setItem('currentUser', JSON.stringify(currentUser));
    alert('Thank you for logging in! 😊');
    updateUserInfo();
    $('#loginModal').modal('hide');
});

// Sign up form
if (document.getElementById('signup-form')) {
    document.getElementById('signup-form').addEventListener('submit', function(e) {
        e.preventDefault();
        const name = document.getElementById('name').value;
        const email = document.getElementById('email').value;
        const password = document.getElementById('password').value;
        const dob = document.getElementById('dob').value;
        // Simulate sign up
        currentUser = { name: name, email: email, dob: dob };
        localStorage.setItem('currentUser', JSON.stringify(currentUser));
        alert('Account created successfully! Welcome! 😊');
        window.location.href = 'index.html';
    });
}

// Checkout form
document.getElementById('checkout-form').addEventListener('submit', function(e) {
    e.preventDefault();
    const address = document.getElementById('address').value;
    const payment = document.getElementById('payment').value;
    // Simulate order placement
    alert(`Order placed! Delivering to ${address} via ${payment}`);
    cart = [];
    localStorage.setItem('cart', JSON.stringify(cart));
    updateCartCount();
    displayCart();
    $('#checkoutModal').modal('hide');
});

// Initialize
document.addEventListener('DOMContentLoaded', function() {
    displayMenu('indian');
    updateCartCount();
    updateUserInfo();
    if (window.location.pathname.includes('cart.html')) {
        displayCart();
    }
    if (window.location.pathname.includes('profile.html')) {
        displayProfile();
    }
    if (window.location.pathname.includes('index.html') || window.location.pathname.endsWith('/')) {
        displayTempCart();
        displayRecentlyViewed();
        displayWishlist();
    }
});