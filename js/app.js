// Sakr Store App Logic

// --- Configuration ---
const config = {
  whatsappNumber: '201024496178',
};

// --- State ---
let products = []; // Cache for product data

let currentCategoryFilter = 'All'; // New: Default to showing all products
// --- Cart Management ---

/**
 * Retrieves the cart from localStorage.
 * @returns {Map<string, number>} A map of product IDs to quantities.
 */
function getCart() {
  const raw = localStorage.getItem('cart');
  try {
    // Attempt to parse as a Map-like object, or an array for backward compatibility
    const data = raw ? JSON.parse(raw) : {};
    if (Array.isArray(data)) {
      // Convert old array format [1, 1, 2] to new map format {'1': 2, '2': 1}
      const newCart = new Map();
      data.forEach(id => {
        const key = String(id);
        newCart.set(key, (newCart.get(key) || 0) + 1);
      });
      return newCart;
    }
    // If it's an object, convert to a Map
    return new Map(Object.entries(data));
  } catch (err) {
    return new Map();
  }
}

/**
 * Saves the cart to localStorage.
 * @param {Map<string, number>} cart - A map of product IDs to quantities.
 */
function saveCart(cart) {
  try {
    // Convert Map to a plain object for JSON serialization
    const obj = Object.fromEntries(cart);
    localStorage.setItem('cart', JSON.stringify(obj));
  } catch (err) {
    console.error('Failed to save cart to localStorage', err);
  }
}

/**
 * Adds a product to the cart or increments its quantity.
 * @param {string | number} productId - The ID of the product to add.
 */
function addToCart(productId) {
  const cart = getCart();
  const key = String(productId);
  cart.set(key, (cart.get(key) || 0) + 1);
  saveCart(cart);
  // A simple, non-blocking notification instead of an alert
  showToast('Product added to cart!');
  updateCartCounter();
}

/**
 * Removes a product from the cart entirely.
 * @param {string | number} productId - The ID of the product to remove.
 */
function removeFromCart(productId) {
  const cart = getCart();
  cart.delete(String(productId));
  saveCart(cart);
  updateCartCounter();
}

/**
 * Updates the quantity of a product in the cart.
 * @param {string | number} productId - The ID of the product to update.
 * @param {number} quantity - The new quantity. If 0, removes the item.
 */
function updateCartQuantity(productId, quantity) {
  if (quantity <= 0) {
    removeFromCart(productId);
  } else {
    const cart = getCart();
    cart.set(String(productId), quantity);
    saveCart(cart);
    updateCartCounter();
  }
}

/**
 * Clears all items from the cart.
 */
function clearCart() {
  localStorage.removeItem('cart');
  updateCartCounter();
}

// --- Product & UI Rendering ---

/**
 * Fetches products from the server.
 * @returns {Promise<Array<object>>} A promise that resolves to the products array.
 */
async function fetchProducts() {
  if (products.length > 0) {
    return products; // Return from cache
  }
  try {
    const res = await fetch('products.json');
    if (!res.ok) throw new Error('Network response was not ok');
    products = await res.json();
    return products;
  } catch (err) {
    console.error('Failed to load products', err);
    return []; // Return empty on error
  }
}

/**
 * Renders product cards into a container, optionally filtered by category.
 * @param {HTMLElement} container - The element to render into.
 * @param {string} [categoryFilter='All'] - The category to filter by.
 */
function renderProducts(container, categoryFilter = 'All') {
  if (!container) return;
  container.innerHTML = '';
  const grid = document.createElement('div');
  grid.className = 'product-grid';

  const filteredProducts = products.filter(p =>
    categoryFilter === 'All' || (p.category && p.category.toLowerCase() === categoryFilter.toLowerCase())
  );

  if (filteredProducts.length === 0) {
    container.innerHTML = `<p>No products found in the "${categoryFilter}" category.</p>`;
    return;
  }

  filteredProducts.forEach(p => {
    const card = document.createElement('article');
    card.className = 'product-card';
    card.innerHTML = `
      <img src="${p.image || ''}" alt="${p.name || 'Product image'}" class="product-image">
      <h3>${p.name || 'Untitled'}</h3>
      <p class="product-desc">${p.description || ''}</p>
      <div class="product-price">$${(Number(p.price) || 0).toFixed(2)}</div>
      <button class="add-to-cart" data-product-id="${p.id}" type="button">Add to cart</button>
    `;
    grid.appendChild(card);
  });

  container.appendChild(grid);
}

/**
 * Renders the items in the shopping cart.
 * @param {HTMLElement} container - The cart items container.
 * @param {HTMLElement} totalSpan - The span for the total price.
 */
async function renderCart(container, totalSpan) {
  const cart = getCart();
  const allProducts = await fetchProducts();

  if (cart.size === 0) {
    container.innerHTML = '<p>Your cart is empty.</p>';
    if (totalSpan) totalSpan.textContent = '0.00';
    return;
  }

  container.innerHTML = ''; // Clear previous content
  let total = 0;

  for (const [id, qty] of cart.entries()) {
    const product = allProducts.find(p => String(p.id) === id);
    if (!product) continue;

    total += (Number(product.price) || 0) * qty;

    const itemEl = document.createElement('div');
    itemEl.className = 'cart-item';
    itemEl.innerHTML = `
      <span><strong>${product.name}</strong></span>
      <span>
        <button class="quantity-change" data-id="${id}" data-change="-1">-</button>
        ${qty}
        <button class="quantity-change" data-id="${id}" data-change="1">+</button>
      </span>
      <span>$${((Number(product.price) || 0) * qty).toFixed(2)}</span>
      <button class="remove-item" data-id="${id}">&times;</button>
    `;
    container.appendChild(itemEl);
  }

  if (totalSpan) totalSpan.textContent = total.toFixed(2);
}

/**
 * Shows a simple toast notification.
 * @param {string} message The message to display.
 */
function showToast(message) {
  const toast = document.createElement('div');
  toast.className = 'toast-notification';
  toast.textContent = message;
  document.body.appendChild(toast);

  // Animate in
  setTimeout(() => toast.classList.add('show'), 10);
  // Remove after 3 seconds
  setTimeout(() => {
    toast.classList.remove('show');
    toast.addEventListener('transitionend', () => toast.remove());
  }, 3000);
}

/**
 * Updates the cart counter in the header.
 */
function updateCartCounter() {
  const counter = document.querySelector('.cart-count');
  if (!counter) return;

  const cart = getCart();
  const totalItems = Array.from(cart.values()).reduce((sum, qty) => sum + qty, 0);

  counter.textContent = `(${totalItems})`;
  counter.style.display = totalItems > 0 ? 'inline' : 'none';
}

// --- Event Handlers & Page Initializers ---

/**
 * Initializes the main product listing page.
 */
async function initMainPage() {
      const productListContainer = document.getElementById('product-list-container');
      const categoryListEl = document.getElementById('category-list');
    
      if (!productListContainer || !categoryListEl) return;
    
      // Initial loading state for products
      productListContainer.innerHTML = '<p>Loading products...</p>';
    
      await fetchProducts(); // Populate the global 'products' array
    
      // Populate categories sidebar
      const categories = new Set(['All']); // Start with 'All' category
      products.forEach(p => {
        if (p.category) {
          categories.add(p.category);
        }
      });
    
      categoryListEl.innerHTML = ''; // Clear existing categories
      categories.forEach(category => {
        const li = document.createElement('li');
        const button = document.createElement('button');
        button.textContent = category;
        button.setAttribute('data-category', category);
        if (category === currentCategoryFilter) {
          button.classList.add('active');
        }
        li.appendChild(button);
        categoryListEl.appendChild(li);
      });
    
      // Initial render of products based on current filter (default 'All')
      renderProducts(productListContainer, currentCategoryFilter);
    
      // Event listener for category clicks
      categoryListEl.addEventListener('click', (e) => {
        const target = e.target;
        if (target.matches('button[data-category]')) {
          const selectedCategory = target.getAttribute('data-category');
          currentCategoryFilter = selectedCategory; // Update filter state
    
          // Remove active class from all buttons
          categoryListEl.querySelectorAll('button').forEach(btn => btn.classList.remove('active'));
          // Add active class to the clicked button
          target.classList.add('active');
    
          renderProducts(productListContainer, currentCategoryFilter);
        }
      });
    
      // Event listener for add to cart buttons
      productListContainer.addEventListener('click', (e) => {
        const btn = e.target.closest('.add-to-cart');
        if (btn) {
          const productId = btn.getAttribute('data-product-id');
          addToCart(productId);
        }
      });
}

/**
 * Initializes the shopping cart page.
 */
async function initCartPage() {
  const cartContainer = document.getElementById('cart-items-container');
  const totalSpan = document.getElementById('total-price');
  if (!cartContainer) return;

  await renderCart(cartContainer, totalSpan);

  cartContainer.addEventListener('click', (e) => {
    const target = e.target;
    const productId = target.getAttribute('data-id');

    if (target.matches('.remove-item')) {
      removeFromCart(productId);
      renderCart(cartContainer, totalSpan); // Re-render
    } else if (target.matches('.quantity-change')) {
      const change = parseInt(target.getAttribute('data-change'), 10);
      const cart = getCart();
      const currentQty = cart.get(productId) || 0;
      updateCartQuantity(productId, currentQty + change);
      renderCart(cartContainer, totalSpan); // Re-render
    }
  });
}

/**
 * Initializes the checkout form.
 */
async function initCheckoutForm() {
  const form = document.getElementById('customer-form');
  if (!form) return;

  form.addEventListener('submit', async (event) => {
    event.preventDefault();

    const cart = getCart();
    if (cart.size === 0) {
      alert('Your cart is empty. Add products before placing an order.');
      return;
    }

    const formData = new FormData(form);
    const name = (formData.get('name') || '').toString().trim();
    const address = (formData.get('address') || '').toString().trim();
    const phone = (formData.get('phone') || '').toString().trim();

    const allProducts = await fetchProducts();
    const productMap = new Map(allProducts.map(p => [String(p.id), p]));

    let total = 0;
    const lines = [];
    for (const [id, qty] of cart.entries()) {
      const product = productMap.get(id);
      if (!product) continue;
      const price = Number(product.price) || 0;
      total += price * qty;
      lines.push(`- ${qty}x ${product.name} - $${(price * qty).toFixed(2)}`);
    }

    const message = [
      "Hello! I'd like to place an order.",
      '',
      '*My Details:*',
      `Name: ${name}`,
      `Address: ${address}`,
      `Phone: ${phone}`,
      '',
      '*Order Summary:*',
      ...lines,
      '---------------------',
      `*Total: $${total.toFixed(2)}*`,
      '',
      'Thank you!'
    ].join('\n');

    const encoded = encodeURIComponent(message);
    const waUrl = `https://wa.me/${config.whatsappNumber}?text=${encoded}`;

    // IMPORTANT UX CHANGE: Do not clear the cart automatically.
    // The user might close the WhatsApp tab without sending.
    // Let them keep their cart. You can add a "Order Sent! Clear Cart?" button on the page.
    // clearCart(); 
    window.location.href = waUrl;
  });
}

/**
 * Simple router to initialize the correct page logic.
 */
function router() {
  const path = window.location.pathname;

  if (path.endsWith('/') || path.endsWith('/index.html')) {
    initMainPage();
  } else if (path.endsWith('/cart.html')) {
    initCartPage();
    initCheckoutForm(); // Assuming checkout is on the cart page
  }
}

// --- App Initialization ---
document.addEventListener('DOMContentLoaded', () => {
  updateCartCounter(); // Update counter on every page load

  // Run the logic for the current page
  router();
});
