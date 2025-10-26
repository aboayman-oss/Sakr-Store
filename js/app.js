// Sakr Store App Logic

// --- Configuration ---
const config = {
  whatsappNumber: '201024496178',
};

// --- Mobile Menu Management ---
function initMobileMenu() {
  const menuToggle = document.getElementById('menu-toggle');
  const menuOverlay = document.getElementById('menu-overlay');
  const sidebar = document.getElementById('category-sidebar');
  const sidebarInner = sidebar ? sidebar.querySelector('.sidebar-inner') : null;
  const closeButton = sidebar ? sidebar.querySelector('.close-menu') : null;

  if (!menuToggle || !menuOverlay || !sidebar) return; // safety

  function openMenu() {
    document.body.classList.add('menu-open');
    menuToggle.setAttribute('aria-expanded', 'true');
    sidebar.setAttribute('aria-hidden', 'false');
    // move focus into sidebar for accessibility
    const focusable = sidebar.querySelector('button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])');
    if (focusable) focusable.focus();
  }

  function closeMenu() {
    document.body.classList.remove('menu-open');
    menuToggle.setAttribute('aria-expanded', 'false');
    sidebar.setAttribute('aria-hidden', 'true');
    menuToggle.focus();
  }

  function toggleMenu() {
    if (document.body.classList.contains('menu-open')) {
      closeMenu();
    } else {
      openMenu();
    }
  }

  menuToggle.addEventListener('click', toggleMenu);
  menuOverlay.addEventListener('click', closeMenu);
  if (closeButton) closeButton.addEventListener('click', closeMenu);

  // Close menu when a category is selected (on mobile)
  const categoryList = document.getElementById('category-list');
  if (categoryList) {
    categoryList.addEventListener('click', () => {
      if (window.innerWidth <= 768) closeMenu();
    });
  }

  // Close on Escape key
  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape') closeMenu();
  });

  // Ensure menu is closed when resizing to desktop
  window.addEventListener('resize', () => {
    if (window.innerWidth > 768 && document.body.classList.contains('menu-open')) {
      closeMenu();
    }
  });
}

// --- Mobile Search Expansion ---
function initMobileSearch() {
  const searchBar = document.getElementById('search-bar');
  if (!searchBar) return;

  // Expand search on mobile when clicked
  searchBar.addEventListener('click', function() {
    if (window.innerWidth <= 768) {
      this.classList.add('expanded');
    }
  });

  // Collapse when clicking outside on mobile
  document.addEventListener('click', function(e) {
    if (window.innerWidth <= 768 && searchBar && !searchBar.contains(e.target) && !searchBar.value) {
      searchBar.classList.remove('expanded');
    }
  });

  // Remove expanded class when window is resized to desktop
  window.addEventListener('resize', () => {
    if (window.innerWidth > 768) {
      searchBar.classList.remove('expanded');
    }
  });
}

// --- Mobile Filter Sheet Management ---
function initMobileFilterSheet() {
  const filterBtn = document.getElementById('mobile-filter-btn');
  const filterSheet = document.getElementById('filter-sheet');
  const filterOverlay = document.getElementById('filter-sheet-overlay');
  const closeBtn = document.getElementById('close-filter-sheet');
  const applyBtn = document.getElementById('apply-filters-btn');
  const mobileSortRadios = document.querySelectorAll('input[name="mobile-sort-radio"]');
  const mobilePriceSlider = document.getElementById('mobile-price-slider');
  const mobilePriceInput = document.getElementById('mobile-price-input');

  if (!filterBtn || !filterSheet || !filterOverlay) return;

  // Temporary state for the sheet (applied only when user clicks "Apply")
  let tempSortOrder = currentSortOrder;
  let tempPriceMax = currentPriceMax;

  function openFilterSheet() {
    // Sync temporary state with current state
    tempSortOrder = currentSortOrder;
    tempPriceMax = currentPriceMax;

    // Update UI to reflect current state
    mobileSortRadios.forEach(radio => {
      radio.checked = radio.value === currentSortOrder;
    });

    if (mobilePriceSlider && mobilePriceInput) {
      const maxPrice = mobilePriceSlider.max;
      const value = currentPriceMax !== null ? currentPriceMax : maxPrice;
      mobilePriceSlider.value = value;
      mobilePriceInput.value = value;
    }

    // Show sheet with animation
    filterOverlay.classList.add('active');
    filterSheet.classList.add('active');
    document.body.style.overflow = 'hidden'; // Prevent background scroll
  }

  function closeFilterSheet() {
    filterOverlay.classList.remove('active');
    filterSheet.classList.remove('active');
    document.body.style.overflow = ''; // Restore scroll
  }

  function applyFilters() {
    // Apply temporary state to actual state
    currentSortOrder = tempSortOrder;
    currentPriceMax = tempPriceMax;

    // Update desktop UI if present
    const sortOptionsEl = document.getElementById('sort-options');
    if (sortOptionsEl) {
      sortOptionsEl.querySelectorAll('button').forEach(btn => btn.classList.remove('active'));
      const btn = sortOptionsEl.querySelector(`button[data-sort="${currentSortOrder}"]`);
      if (btn) btn.classList.add('active');
    }

    const desktopPriceSlider = document.getElementById('price-slider');
    const desktopPriceInput = document.getElementById('price-range-input');
    if (desktopPriceSlider && desktopPriceInput) {
      desktopPriceSlider.value = currentPriceMax;
      desktopPriceInput.value = currentPriceMax;
    }

    // Render products with new filters
    const productListContainer = document.getElementById('product-list-container');
    if (productListContainer) {
      renderProducts(productListContainer, currentSearchTerm, currentCategoryFilter, currentSortOrder, currentPriceMax);
    }

    closeFilterSheet();
  }

  // Event listeners
  if (filterBtn) {
    filterBtn.addEventListener('click', openFilterSheet);
  }

  if (closeBtn) {
    closeBtn.addEventListener('click', closeFilterSheet);
  }

  if (filterOverlay) {
    filterOverlay.addEventListener('click', closeFilterSheet);
  }

  if (applyBtn) {
    applyBtn.addEventListener('click', applyFilters);
  }

  // Sort radio change
  mobileSortRadios.forEach(radio => {
    radio.addEventListener('change', (e) => {
      if (e.target.checked) {
        tempSortOrder = e.target.value;
      }
    });
  });

  // Price slider change - sync with input
  if (mobilePriceSlider && mobilePriceInput) {
    mobilePriceSlider.addEventListener('input', (e) => {
      const value = Number(e.target.value);
      tempPriceMax = value;
      mobilePriceInput.value = value;
    });
    
    // Price input change - sync with slider
    mobilePriceInput.addEventListener('input', (e) => {
      let value = Number(e.target.value);
      const min = Number(mobilePriceSlider.min);
      const max = Number(mobilePriceSlider.max);
      
      // Clamp value between min and max
      if (value < min) value = min;
      if (value > max) value = max;
      
      tempPriceMax = value;
      mobilePriceSlider.value = value;
      mobilePriceInput.value = value;
    });
  }

  // Close on Escape key
  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape' && filterSheet.classList.contains('active')) {
      closeFilterSheet();
    }
  });

  // Update mobile slider when category changes
  window.updateMobilePriceSlider = function(maxPrice) {
    if (mobilePriceSlider && mobilePriceInput) {
      mobilePriceSlider.max = maxPrice;
      mobilePriceSlider.value = maxPrice;
      mobilePriceInput.max = maxPrice;
      mobilePriceInput.value = maxPrice;
      tempPriceMax = maxPrice;
    }
  };
}

// --- State ---
let products = []; // Cache for product data

let currentSearchTerm = ''; // New: For live search
let currentCategoryFilter = 'All'; // New: Default to showing all products
let currentSortOrder = 'default'; // 'default', 'price-asc', 'price-desc'
let currentPriceMax = null; // Max price from the slider

/**
 * Simple debounce helper
 * @param {Function} fn
 * @param {number} wait
 */
const debounce = (fn, wait = 250) => {
  let timeout;
  return (...args) => {
    clearTimeout(timeout);
    timeout = setTimeout(() => fn(...args), wait);
  };
};

// --- Images helpers (primary/gallery) ---
/**
 * Returns the primary image URL for a product, supporting the new images schema
 * with graceful fallback to legacy `image` field.
 * @param {object} product
 * @returns {string}
 */
function getPrimaryImage(product) {
  if (!product) return '';
  // New schema preferred
  if (product.images && typeof product.images === 'object') {
    if (product.images.primary) return product.images.primary;
    // If only gallery provided, pick the first item
    if (Array.isArray(product.images.gallery) && product.images.gallery.length > 0) {
      return product.images.gallery[0];
    }
  }
  // Legacy fallback
  return product.image || '';
}

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
  // Show the modern notification card
  showToast(productId + ' added to cart');
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
 * Truncates text to a maximum length and adds ellipsis if needed.
 * @param {string} text - The text to truncate.
 * @param {number} maxLength - The maximum length of the text.
 * @returns {string} The truncated text with ellipsis if needed.
 */
function truncateText(text, maxLength = 50) {
  if (!text) return '';
  if (text.length <= maxLength) return text;
  return text.substring(0, maxLength).trim() + '...';
}

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
 * @param {string} [searchTerm=''] - The search term to filter by.
 * @param {string} [categoryFilter='All'] - The category to filter by.
 * @param {string} [sortOrder='default'] - The sort order.
 * @param {number|null} [priceMax=null] - The maximum price.
 */
function renderProducts(container, searchTerm = '', categoryFilter = 'All', sortOrder = 'default', priceMax = null) {
  if (!container) return;
  container.innerHTML = '';
  const grid = document.createElement('div');
  grid.className = 'product-grid';

  // 1. Filter by search term (name and description)
  const lowerCaseSearchTerm = searchTerm.toLowerCase().trim();
  let filteredProducts = products;
  if (lowerCaseSearchTerm) {
    filteredProducts = products.filter(p =>
      (p.name && p.name.toLowerCase().includes(lowerCaseSearchTerm)) ||
      (p.description && p.description.toLowerCase().includes(lowerCaseSearchTerm))
    );
  }

  // 2. Filter by category or discounts
  filteredProducts = filteredProducts.filter(p => {
    if (categoryFilter === 'All') return true;
    if (categoryFilter === 'Discounts') return !!p.discount;
    return p.category && p.category.toLowerCase() === categoryFilter.toLowerCase();
  });

  // 3. Filter by price (if a max price is set)
  if (priceMax !== null) {
    filteredProducts = filteredProducts.filter(p => (Number(p.price) || 0) <= priceMax);
  }

  // 4. Sort the products
  if (sortOrder === 'price-asc') {
    filteredProducts.sort((a, b) => (Number(a.price) || 0) - (Number(b.price) || 0));
  } else if (sortOrder === 'price-desc') {
    filteredProducts.sort((a, b) => (Number(b.price) || 0) - (Number(a.price) || 0));
  }
  // 'default' order doesn't require sorting

  if (filteredProducts.length === 0) {
    container.innerHTML = `<p>No products found matching your criteria.</p>`;
    return;
  }

  filteredProducts.forEach(p => {
    const card = document.createElement('article');
    card.className = 'product-card';
    let priceHtml = '';
    if (p.discount) {
      priceHtml = `
        <span class="product-original-price no-break">EGP ${(Number(p.price) || 0).toFixed(2)}</span>
        <span class="product-discounted-price no-break">EGP ${(Number(p.discountedPrice) || 0).toFixed(2)}</span>
      `;
    } else {
      priceHtml = `<span class="product-price no-break">EGP ${(Number(p.price) || 0).toFixed(2)}</span>`;
    }
    card.innerHTML = `
      <a href="product.html?id=${p.id}" class="product-link product-card-link" aria-label="${p.name || 'View product'}">
        <div class="product-media">
          <img src="${getPrimaryImage(p)}" alt="${p.name || 'Product image'}" loading="lazy">
        </div>
        <h3>${p.name || 'Untitled'}</h3>
        <p class="product-desc">${truncateText(p.description)}</p>
      </a>
      <div class="product-card-footer">
        <div class="product-price-block vertical-price-block">${priceHtml}</div>
        <button class="CartBtn add-to-cart" data-product-id="${p.id}" type="button">
          <span class="IconContainer"> 
            <svg xmlns="http://www.w3.org/2000/svg" height="1em" viewBox="0 0 576 512" fill="rgb(17, 17, 17)" class="cart"><path d="M0 24C0 10.7 10.7 0 24 0H69.5c22 0 41.5 12.8 50.6 32h411c26.3 0 45.5 25 38.6 50.4l-41 152.3c-8.5 31.4-37 53.3-69.5 53.3H170.7l5.4 28.5c2.2 11.3 12.1 19.5 23.6 19.5H488c13.3 0 24 10.7 24 24s-10.7 24-24 24H199.7c-34.6 0-64.3-24.6-70.7-58.5L77.4 54.5c-.7-3.8-4-6.5-7.9-6.5H24C10.7 48 0 37.3 0 24zM128 464a48 48 0 1 1 96 0 48 48 0 1 1 -96 0zm336-48a48 48 0 1 1 0 96 48 48 0 1 1 0-96z"></path></svg>
          </span>
          <p class="text">Add to Cart</p>
        </button>
      </div>
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

  // Empty cart state
  const emptyCartActions = document.getElementById('empty-cart-actions');
  if (cart.size === 0) {
    container.innerHTML = '<p>Your cart is empty.</p>';
    if (emptyCartActions) emptyCartActions.style.display = 'block';
    if (totalSpan) totalSpan.textContent = '0.00';
    return;
  } else {
    if (emptyCartActions) emptyCartActions.style.display = 'none';
  }

  container.innerHTML = ''; // Clear previous content
  let total = 0;

  for (const [id, qty] of cart.entries()) {
    const product = allProducts.find(p => String(p.id) === id);
    if (!product) continue;

    let itemTotal = 0;
    let priceHtml = '';
    if (product.discount) {
      itemTotal = (Number(product.discountedPrice) || 0) * qty;
      priceHtml = `<span class='product-original-price'>EGP ${(Number(product.price) || 0).toFixed(2)}</span> <span class='product-discounted-price'>EGP ${(Number(product.discountedPrice) || 0).toFixed(2)}</span> x ${qty} = <span class='product-discounted-price'>EGP ${itemTotal.toFixed(2)}</span>`;
    } else {
      itemTotal = (Number(product.price) || 0) * qty;
      priceHtml = `EGP ${((Number(product.price) || 0).toFixed(2))} x ${qty} = EGP ${itemTotal.toFixed(2)}`;
    }
    total += itemTotal;

    const itemEl = document.createElement('div');
    itemEl.className = 'cart-item';
    itemEl.innerHTML = `
      <span><strong>${product.name}</strong></span>
      <span>
        <button class="quantity-change" data-id="${id}" data-change="-1">-</button>
        ${qty}
        <button class="quantity-change" data-id="${id}" data-change="1">+</button>
      </span>
      <span>${priceHtml}</span>
      <button class="remove-item" data-id="${id}">&times;</button>
    `;
    container.appendChild(itemEl);
  }

  if (totalSpan) totalSpan.textContent = total.toFixed(2);
}

/**
 * Shows a modern slide-in notification card.
 * @param {string} message The message to display.
 */
function showToast(message) {
  const product = products.find(p => p.id === parseInt(message.split(' ')[0]));
  
  const toast = document.createElement('div');
  toast.className = 'notification-card';
  toast.innerHTML = `
    <div class="notification-wrapper">
      <div class="notification-icon">
        <div class="icon-cart-box">
          <svg xmlns="http://www.w3.org/2000/svg" height="20" width="20" viewBox="0 0 576 512">
            <path fill="currentColor" d="M0 24C0 10.7 10.7 0 24 0H69.5c22 0 41.5 12.8 50.6 32h411c26.3 0 45.5 25 38.6 50.4l-41 152.3c-8.5 31.4-37 53.3-69.5 53.3H170.7l5.4 28.5c2.2 11.3 12.1 19.5 23.6 19.5H488c13.3 0 24 10.7 24 24s-10.7 24-24 24H199.7c-34.6 0-64.3-24.6-70.7-58.5L77.4 54.5c-.7-3.8-4-6.5-7.9-6.5H24C10.7 48 0 37.3 0 24zM128 464a48 48 0 1 1 96 0 48 48 0 1 1 -96 0zm336-48a48 48 0 1 1 0 96 48 48 0 1 1 0-96z"></path>
          </svg>
        </div>
      </div>

      <div class="notification-content">
        <div class="notification-title-wrapper">
          <span class="notification-title">Added to cart!</span>
          <span class="notification-close">
            <svg xmlns="http://www.w3.org/2000/svg" height="15" width="15" viewBox="0 0 384 512">
              <path d="M342.6 150.6c12.5-12.5 12.5-32.8 0-45.3s-32.8-12.5-45.3 0L192 210.7 86.6 105.4c-12.5-12.5-32.8-12.5-45.3 0s-12.5 32.8 0 45.3L146.7 256 41.4 361.4c-12.5 12.5-12.5 32.8 0 45.3s32.8 12.5 45.3 0L192 301.3 297.4 406.6c12.5 12.5 32.8 12.5 45.3 0s12.5-32.8 0-45.3L237.3 256 342.6 150.6z"></path>
            </svg>
          </span>
        </div>
        <div class="notification-product">${product ? product.name : 'Product'}</div>
        <div class="notification-price">${product ? `EGP ${product.price.toFixed(2)}` : ''}</div>
        <button class="notification-button" onclick="window.location.href='cart.html'">
          View cart
          <svg class="icon" viewBox="0 0 24 24" fill="currentColor" width="20" height="20">
            <path fill-rule="evenodd" d="M12 2.25c-5.385 0-9.75 4.365-9.75 9.75s4.365 9.75 9.75 9.75 9.75-4.365 9.75-9.75S17.385 2.25 12 2.25zm4.28 10.28a.75.75 0 000-1.06l-3-3a.75.75 0 10-1.06 1.06l1.72 1.72H8.25a.75.75 0 000 1.5h5.69l-1.72 1.72a.75.75 0 101.06 1.06l3-3z" clip-rule="evenodd"></path>
          </svg>
        </button>
      </div>
    </div>
  `;
  
  document.body.appendChild(toast);

  // Function to handle notification dismissal with animation
  const dismissNotification = () => {
    toast.classList.add('slideOut');
    toast.addEventListener('animationend', () => {
      if (document.body.contains(toast)) {
        toast.remove();
      }
    });
  };

  // Set up close button functionality
  const closeBtn = toast.querySelector('.notification-close');
  closeBtn.addEventListener('click', dismissNotification);

  // Remove after 5 seconds if not closed manually
  setTimeout(() => {
    if (document.body.contains(toast)) {
      dismissNotification();
    }
  }, 5000);
}

/**
 * Updates the cart counter in the header.
 */
function updateCartCounter() {
  const counter = document.querySelector('.cart-count');
  if (!counter) return;

  const cart = getCart();
  const totalItems = Array.from(cart.values()).reduce((sum, qty) => sum + qty, 0);

  counter.textContent = `${totalItems}`;
  counter.style.display = totalItems > 0 ? 'inline' : 'none';
}

// --- Event Handlers & Page Initializers ---

/**
 * Initializes the main product listing page.
 */
async function initMainPage() {
      const searchBarEl = document.getElementById('search-bar');
      const productListContainer = document.getElementById('product-list-container');
      const categoryListEl = document.getElementById('category-list');
      const sortOptionsEl = document.getElementById('sort-options');
      const priceSliderEl = document.getElementById('price-slider');
      const priceInputEl = document.getElementById('price-range-input');
    
      if (!productListContainer || !categoryListEl) return;
    
      // Initial loading state for products
      productListContainer.innerHTML = '<p>Loading products...</p>';    
    
      await fetchProducts(); // Populate the global 'products' array
    
      // Populate categories sidebar
      // Build categories: All, Discounts, then the rest
      const categories = ['All', 'Discounts'];
      const categorySet = new Set();
      products.forEach(p => {
        if (p.category) {
          categorySet.add(p.category);
        }
      });
      categories.push(...Array.from(categorySet));

      categoryListEl.innerHTML = '';
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
    
      // Function to update the price slider's range and value
      const updatePriceSlider = () => {
        // Guard clause: If slider elements don't exist, do nothing.
        if (!priceSliderEl || !priceInputEl) return;

        const relevantProducts = products.filter(p => {
          if (currentCategoryFilter === 'All') return true;
          if (currentCategoryFilter === 'Discounts') return !!p.discount;
          return p.category && p.category.toLowerCase() === currentCategoryFilter.toLowerCase();
        });
        
        if (relevantProducts.length === 0) {
          priceSliderEl.min = 0;
          priceSliderEl.max = 0;
          priceSliderEl.value = 0;
          priceInputEl.min = 0;
          priceInputEl.max = 0;
          priceInputEl.value = 0;
          currentPriceMax = 0;
          currentPriceMax = null; // Reset price filter
          // Update mobile slider
          if (window.updateMobilePriceSlider) window.updateMobilePriceSlider(0);
        } else {
          const maxPrice = Math.ceil(Math.max(0, ...relevantProducts.map(p => Number(p.price) || 0)));
          priceSliderEl.max = maxPrice;
          priceSliderEl.value = maxPrice; // Set slider to max initially
          priceInputEl.max = maxPrice;
          priceInputEl.value = maxPrice;
          currentPriceMax = maxPrice; // Update state
          // Update mobile slider
          if (window.updateMobilePriceSlider) window.updateMobilePriceSlider(maxPrice);
        }
      };

      // Initial setup
      updatePriceSlider();
      renderProducts(productListContainer, currentSearchTerm, currentCategoryFilter, currentSortOrder, currentPriceMax);
    
      // Event listener for category clicks
      categoryListEl.addEventListener('click', (e) => {
        const target = e.target;
        if (target.matches('button[data-category]')) {
          const selectedCategory = target.getAttribute('data-category');
          currentCategoryFilter = selectedCategory;
    
          categoryListEl.querySelectorAll('button').forEach(btn => btn.classList.remove('active'));
          target.classList.add('active');
    
          // Update slider and re-render products
          updatePriceSlider();
          renderProducts(productListContainer, currentSearchTerm, currentCategoryFilter, currentSortOrder, currentPriceMax);
        }
      });

      // Event listener for sort buttons (desktop)
      if (sortOptionsEl) {
        sortOptionsEl.addEventListener('click', (e) => {
          const target = e.target;
          if (target.matches('button[data-sort]')) {
            currentSortOrder = target.getAttribute('data-sort');

            sortOptionsEl.querySelectorAll('button').forEach(btn => btn.classList.remove('active'));
            target.classList.add('active');

            // Keep mobile select in sync (if present)
            const mobileSortEl = document.getElementById('mobile-sort');
            if (mobileSortEl) mobileSortEl.value = currentSortOrder;

            renderProducts(productListContainer, currentSearchTerm, currentCategoryFilter, currentSortOrder, currentPriceMax);
          }
        });
      }

      // Mobile compact sort control (select) — visible only on small screens via CSS
      const mobileSortEl = document.getElementById('mobile-sort');
      if (mobileSortEl) {
        // Initialize from current state
        mobileSortEl.value = currentSortOrder || 'default';
        mobileSortEl.addEventListener('change', (e) => {
          const val = e.target.value;
          currentSortOrder = val;

          // Update desktop buttons active state if present
          if (sortOptionsEl) {
            sortOptionsEl.querySelectorAll('button').forEach(btn => btn.classList.remove('active'));
            const btn = sortOptionsEl.querySelector(`button[data-sort="${val}"]`);
            if (btn) btn.classList.add('active');
          }

          renderProducts(productListContainer, currentSearchTerm, currentCategoryFilter, currentSortOrder, currentPriceMax);
        });
      }

      // Event listener for price slider - sync with input
      if (priceSliderEl && priceInputEl) {
        priceSliderEl.addEventListener('input', (e) => {
          const value = Number(e.target.value);
          currentPriceMax = value;
          priceInputEl.value = value;
        });
        priceSliderEl.addEventListener('change', () => {
          renderProducts(productListContainer, currentSearchTerm, currentCategoryFilter, currentSortOrder, currentPriceMax);
        });
        
        // Event listener for price input - sync with slider
        priceInputEl.addEventListener('input', (e) => {
          let value = Number(e.target.value);
          const min = Number(priceSliderEl.min);
          const max = Number(priceSliderEl.max);
          
          // Clamp value between min and max
          if (value < min) value = min;
          if (value > max) value = max;
          
          currentPriceMax = value;
          priceSliderEl.value = value;
          priceInputEl.value = value;
        });
        priceInputEl.addEventListener('change', () => {
          renderProducts(productListContainer, currentSearchTerm, currentCategoryFilter, currentSortOrder, currentPriceMax);
        });
      }

      // Event listener for the search bar (debounced)
      if (searchBarEl) {
        const handleSearchInput = (e) => {
          currentSearchTerm = e.target.value;
          renderProducts(productListContainer, currentSearchTerm, currentCategoryFilter, currentSortOrder, currentPriceMax);
        };
        const debouncedSearch = debounce(handleSearchInput, 250); // 250ms debounce
        searchBarEl.addEventListener('input', debouncedSearch);
      }
    
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
      lines.push(`- ${qty}x ${product.name} - EGP ${(price * qty).toFixed(2)}`);
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
      `*Total: EGP ${total.toFixed(2)}*`,
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

// --- Theme Management ---

/**
 * Applies the saved theme from localStorage or the user's system preference.
 */
function applyInitialTheme() {
  const savedTheme = localStorage.getItem('theme') || 'light';
  document.documentElement.setAttribute('data-theme', savedTheme);

  const toggleBtn = document.getElementById('theme-toggle-btn');
  if (toggleBtn) {
    // Keep the inline SVGs and just update accessible label
    toggleBtn.setAttribute('aria-label', savedTheme === 'dark' ? 'Switch to light mode' : 'Switch to dark mode');
  }
}

/**
 * Sets up the event listener for the theme toggle button.
 */
function initThemeToggle() {
  const toggleBtn = document.getElementById('theme-toggle-btn');
  if (!toggleBtn) return;

  toggleBtn.addEventListener('click', () => {
    const currentTheme = document.documentElement.getAttribute('data-theme');
    const newTheme = currentTheme === 'dark' ? 'light' : 'dark';
    document.documentElement.setAttribute('data-theme', newTheme);
    localStorage.setItem('theme', newTheme);
    // Icons are toggled by CSS; only update the accessible label
    toggleBtn.setAttribute('aria-label', newTheme === 'dark' ? 'Switch to light mode' : 'Switch to dark mode');
  });
}

// --- App Initialization ---
document.addEventListener('DOMContentLoaded', () => {
  applyInitialTheme(); // Apply theme as soon as the DOM is ready
  initThemeToggle(); // Set up the toggle button
  updateCartCounter(); // Update counter on every page load
  initMobileMenu(); // Initialize mobile menu functionality
  initMobileSearch(); // Initialize mobile search expansion
  initMobileFilterSheet(); // Initialize mobile filter sheet

  // Run the logic for the current page
  router();

  // --- Sort filter logic ---
  const sortRadios = document.querySelectorAll('.mydict input[type="radio"]');
  const sortDropdown = document.getElementById('mobile-sort');
  const productListContainer = document.getElementById('product-list-container');

  function updateSort(order) {
    currentSortOrder = order;
    renderProducts(productListContainer, currentSearchTerm, currentCategoryFilter, currentSortOrder, currentPriceMax);
    // Update radio checked state
    sortRadios.forEach(r => { r.checked = r.value === order; });
    // Update dropdown value
    if (sortDropdown) sortDropdown.value = order;
  }

  // Desktop radio buttons
  sortRadios.forEach(radio => {
    radio.addEventListener('change', e => {
      if (radio.checked) updateSort(radio.value);
    });
  });

  // Mobile dropdown
  if (sortDropdown) {
    sortDropdown.addEventListener('change', e => {
      updateSort(sortDropdown.value);
    });
  }

  // Initial sync
  updateSort(currentSortOrder);
});
