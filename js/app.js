// Placeholder JavaScript for Sakr Store
console.log('Sakr Store app.js loaded');

// Fetch products.json and log (keep for debugging)
fetch('products.json')
  .then(res => res.json())
  .then(data => console.log('Products loaded', data))
  .catch(err => console.error('Failed to load products', err));

// Render products into the main products container
function renderProducts(products, container) {
  if (!Array.isArray(products) || !container) return;

  // Clear existing
  container.innerHTML = '';

  const grid = document.createElement('div');
  grid.className = 'product-grid';

  products.forEach(p => {
    const card = document.createElement('article');
    card.className = 'product-card';

    const img = document.createElement('img');
    img.src = p.image || '';
    img.alt = p.name || 'Product image';
    img.className = 'product-image';

    const title = document.createElement('h3');
    title.textContent = p.name || 'Untitled';

    const desc = document.createElement('p');
    desc.className = 'product-desc';
    desc.textContent = p.description || '';

    const price = document.createElement('div');
    price.className = 'product-price';
    price.textContent = `$${(Number(p.price) || 0).toFixed(2)}`;

    const btn = document.createElement('button');
    btn.className = 'add-to-cart';
    btn.setAttribute('data-product-id', String(p.id));
    btn.type = 'button';
    btn.textContent = 'Add to cart';

    card.appendChild(img);
    card.appendChild(title);
    card.appendChild(desc);
    card.appendChild(price);
    card.appendChild(btn);

    grid.appendChild(card);
  });

  container.appendChild(grid);
}

// Add to Cart implementation using localStorage
document.addEventListener('DOMContentLoaded', () => {
  const container = document.getElementById('product-list-container');
  if (!container) return; // nothing to do if container isn't present

  container.addEventListener('click', (e) => {
    const target = e.target;
    if (!(target instanceof HTMLElement)) return;

    // Look for a button with data-product-id attribute (or a child of it)
    const btn = target.closest('button[data-product-id]');
    if (!btn) return; // not an Add to Cart click

    const productIdAttr = btn.getAttribute('data-product-id');
    if (!productIdAttr) return;

    // Store product IDs as numbers if possible
    const productId = isNaN(Number(productIdAttr)) ? productIdAttr : Number(productIdAttr);

    // Retrieve current cart from localStorage (array of product ids)
    const raw = localStorage.getItem('cart');
    let cart = [];
    try {
      cart = raw ? JSON.parse(raw) : [];
      if (!Array.isArray(cart)) cart = [];
    } catch (err) {
      cart = [];
    }

    // Add the product id to the cart array
    cart.push(productId);

    // Save updated cart back to localStorage
    try {
      localStorage.setItem('cart', JSON.stringify(cart));
    } catch (err) {
      console.error('Failed to save cart to localStorage', err);
      return;
    }

    // Confirm to user
    alert('Product added to cart!');
  });
});

// Cart page rendering
document.addEventListener('DOMContentLoaded', () => {
  const cartContainer = document.getElementById('cart-items-container');
  if (!cartContainer) return; // not on cart page

  // Retrieve cart (array of product IDs) from localStorage
  const raw = localStorage.getItem('cart');
  let cart = [];
  try {
    cart = raw ? JSON.parse(raw) : [];
    if (!Array.isArray(cart)) cart = [];
  } catch (err) {
    cart = [];
  }

  // If cart is empty, show a message
  if (cart.length === 0) {
    cartContainer.textContent = 'Your cart is empty.';
    // Ensure total is zero
    const totalSpan = document.getElementById('total-price');
    if (totalSpan) totalSpan.textContent = '0.00';
    return;
  }

  // Fetch products.json and map IDs to full product objects
  fetch('products.json')
    .then(res => res.json())
    .then(products => {
      // products is an array of product objects
      let total = 0;

      // Clear container
      cartContainer.innerHTML = '';

      cart.forEach(id => {
        const product = products.find(p => p.id === id || String(p.id) === String(id));
        if (!product) return; // skip if product not found

        // Create an element to display name and price
        const itemEl = document.createElement('div');
        itemEl.className = 'cart-item';
        itemEl.innerHTML = `<strong>${product.name}</strong> - $${product.price.toFixed(2)}`;
        cartContainer.appendChild(itemEl);

        total += Number(product.price) || 0;
      });

      // Update total price span
      const totalSpan = document.getElementById('total-price');
      if (totalSpan) totalSpan.textContent = total.toFixed(2);
    })
    .catch(err => {
      console.error('Failed to load products for cart', err);
      cartContainer.textContent = 'Failed to load cart items.';
    });
});

// Checkout: handle customer form submission and send order via WhatsApp
document.addEventListener('DOMContentLoaded', () => {
  const form = document.getElementById('customer-form');
  if (!form) return; // not on cart page or form missing

  form.addEventListener('submit', (event) => {
    event.preventDefault();

    // Get customer details
    const formData = new FormData(form);
    const name = (formData.get('name') || '').toString().trim();
    const address = (formData.get('address') || '').toString().trim();
    const phone = (formData.get('phone') || '').toString().trim();

    // Retrieve cart
    const raw = localStorage.getItem('cart');
    let cart = [];
    try {
      cart = raw ? JSON.parse(raw) : [];
      if (!Array.isArray(cart)) cart = [];
    } catch (err) {
      cart = [];
    }

    if (cart.length === 0) {
      alert('Your cart is empty. Add products before placing an order.');
      return;
    }

    // Fetch product details to build the order summary
    fetch('products.json')
      .then(res => res.json())
      .then(products => {
        // Build a map of id -> product for quick lookup
        const map = new Map();
        products.forEach(p => map.set(String(p.id), p));

        // Count quantities
        const qtyMap = new Map();
        cart.forEach(id => {
          const key = String(id);
          qtyMap.set(key, (qtyMap.get(key) || 0) + 1);
        });

        let total = 0;
        let lines = [];
        for (const [id, qty] of qtyMap.entries()) {
          const product = map.get(id);
          if (!product) continue;
          const price = Number(product.price) || 0;
          total += price * qty;
          lines.push(`- ${qty}x ${product.name} - $${(price * qty).toFixed(2)}`);
        }

        // Build full message
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

        // WhatsApp number (placeholder)
        const waNumber = '201024496178';

        // URL encode message
        const encoded = encodeURIComponent(message);

        const waUrl = `https://wa.me/${waNumber}?text=${encoded}`;

        // Clear cart
        localStorage.removeItem('cart');

        // Redirect to WhatsApp
        window.location.href = waUrl;
      })
      .catch(err => {
        console.error('Failed to build order summary', err);
        alert('Failed to prepare order. Please try again later.');
      });
  });
});

// When on the main page, fetch and render products
document.addEventListener('DOMContentLoaded', () => {
  const container = document.getElementById('product-list-container');
  if (!container) return;

  fetch('products.json')
    .then(res => {
      if (!res.ok) throw new Error('Network response was not ok');
      return res.json();
    })
    .then(products => {
      renderProducts(products, container);
    })
    .catch(err => {
      console.error('Failed to load products for main page', err);
      container.textContent = 'Failed to load products.';
    });
});