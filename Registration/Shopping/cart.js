let cart = [];

function loadCart() {
    try {
        const stored = localStorage.getItem('cart');
        cart = stored ? JSON.parse(stored) : [];
    } catch (e) {
        console.error('Failed to load cart from localStorage', e);
        cart = [];
    }
    updateCartCount();
}

function saveCart() {
    try {
        localStorage.setItem('cart', JSON.stringify(cart));
    } catch (e) {
        console.error('Failed to save cart to localStorage', e);
    }
    updateCartCount();
}

function updateCartCount() {
    const countEl = document.getElementById('cart-count');
    const totalQty = cart.reduce((sum, item) => sum + (Number(item.quantity) || 0), 0);
    if (countEl) countEl.innerText = totalQty;
}

function updateCartUI() {
    // If there's a container with id `cart-items`, render a minimal list.
    const container = document.getElementById('cart-items');
    if (!container) return;
    container.innerHTML = '';
    if (cart.length === 0) {
        container.innerHTML = '<p>Your cart is empty.</p>';
        return;
    }

    cart.forEach(item => {
        const row = document.createElement('div');
        row.className = 'cart-item';
        row.innerHTML = `
            <div class="flex items-center">
                <img src="${escapeHtml(item.image || '')}" alt="" class="w-12 h-12 object-cover rounded mr-3" onerror="this.style.display='none'">
                <div>
                    <div class="cart-item-name font-medium">${escapeHtml(item.name)}</div>
                    <div class="text-sm text-gray-500">Qty: <input type="number" min="0" value="${Number(item.quantity) || 1}" data-id="${escapeHtml(item.id)}" class="cart-qty-input w-16 border rounded px-1"></div>
                </div>
            </div>
            <div class="mt-2 text-sm">Price: ₹${Number(item.price).toFixed(2)}</div>
            <div class="text-sm">Subtotal: ₹${(Number(item.price) * Number(item.quantity || 1)).toFixed(2)}</div>
            <button class="cart-remove mt-2 bg-red-500 text-white px-2 py-1 rounded" data-id="${escapeHtml(item.id)}">Remove</button>
        `;
        container.appendChild(row);
    });

    // wire remove buttons and quantity inputs
    container.querySelectorAll('.cart-remove').forEach(btn => {
        btn.addEventListener('click', () => removeFromCart(btn.dataset.id));
    });

    container.querySelectorAll('.cart-qty-input').forEach(input => {
        input.addEventListener('change', () => {
            const id = input.dataset.id;
            const qty = Number(input.value) || 0;
            changeQuantity(id, qty);
        });
    });
}

function escapeHtml(str) {
    if (!str && str !== 0) return '';
    return String(str).replace(/[&<>"]/g, function (s) {
        return ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;'}[s]);
    });
}

function addToCart(productId, productName, productPrice, quantity = 1, productImage = '') {
    productPrice = Number(productPrice) || 0;
    quantity = Number(quantity) || 1;
    const idStr = String(productId);
    const existing = cart.find(p => String(p.id) === idStr);
    if (existing) {
        existing.quantity = (Number(existing.quantity) || 0) + quantity;
        // update image/name/price if provided
        if (productImage) existing.image = productImage;
        if (productName) existing.name = productName;
        if (!isNaN(productPrice)) existing.price = productPrice;
    } else {
        cart.push({ id: productId, name: productName, price: productPrice, quantity, image: productImage });
    }
    saveCart();
    updateCartUI();
    // Use non-blocking feedback if available
    if (typeof showToast === 'function') {
        showToast(`${productName} added to cart`);
    } else {
        // fallback alert
        alert(`${productName} has been added to your cart.`);
    }
}

function removeFromCart(productId) {
    const idStr = String(productId);
    cart = cart.filter(p => String(p.id) !== idStr);
    saveCart();
    updateCartUI();
}

function changeQuantity(productId, quantity) {
    quantity = Number(quantity) || 0;
    const idStr = String(productId);
    const item = cart.find(p => String(p.id) === idStr);
    if (!item) return;
    if (quantity <= 0) {
        removeFromCart(productId);
        return;
    }
    item.quantity = quantity;
    saveCart();
    updateCartUI();
}

function getCart() {
    return cart.slice(); // return shallow copy
}

// Expose utility functions to global scope so HTML can call them inline if needed
window.addToCart = addToCart;
window.removeFromCart = removeFromCart;
window.changeQuantity = changeQuantity;
window.getCart = getCart;

// Wire automatic behavior on DOM ready: load saved cart and bind buttons that have data-add-to-cart attribute
document.addEventListener('DOMContentLoaded', () => {
    loadCart();
    updateCartUI();

    // Buttons or links with attribute data-add-to-cart will be auto-wired.
    // Expected attributes on the element: data-id, data-name, data-price, optional data-qty
    document.querySelectorAll('[data-add-to-cart]').forEach(el => {
        el.addEventListener('click', (e) => {
            e.preventDefault();
            const id = el.getAttribute('data-id');
            const name = el.getAttribute('data-name') || el.getAttribute('data-product-name') || '';
            const price = el.getAttribute('data-price') || el.getAttribute('data-product-price') || 0;
            const qty = el.getAttribute('data-qty') || 1;
            const image = el.getAttribute('data-image') || el.getAttribute('data-product-image') || '';
            addToCart(id, name, price, qty, image);
        });
    });

    // Cart dropdown toggle (if markup exists)
    const cartButton = document.getElementById('cart-button');
    const cartDropdown = document.getElementById('cart-dropdown');
    if (cartButton && cartDropdown) {
        // Only attach dropdown toggle behavior when the cart button is not a direct link.
        // If it's an <a href="cart.php"> link, we want the click to navigate instead.
        const isLink = cartButton.tagName === 'A' && cartButton.hasAttribute('href');
        if (!isLink) {
            // toggle dropdown on button click
            cartButton.addEventListener('click', (e) => {
                e.stopPropagation();
                cartDropdown.classList.toggle('hidden');
                updateCartUI();
            });

            // close when clicking outside
            document.addEventListener('click', (e) => {
                if (!cartDropdown.contains(e.target) && !cartButton.contains(e.target)) {
                    cartDropdown.classList.add('hidden');
                }
            });

            // prevent clicks inside dropdown from closing it
            cartDropdown.addEventListener('click', (e) => {
                e.stopPropagation();
            });
        }
    }
});
