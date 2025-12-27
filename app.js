// =========================
// Pehchaan — Cart + Products (localStorage)
// =========================

const CART_KEY = "pehchaan_cart_v1";

// Product catalog (used for product detail pages)
const PRODUCTS = {
  "jacket-1": {
    id: "jacket-1",
    name: "Adaptive Jacket",
    price: 6500,
    image: "images/product-1.png",
    desc: "Easy closures + relaxed fit for daily comfort.",
    long:
      "Comfortable layers with accessible closures. Designed to support independence and everyday wear.",
    badges: ["Accessible closures", "Comfort-first", "Everyday wear"]
  },
  "pants-1": {
    id: "pants-1",
    name: "Seated Comfort Pants",
    price: 5200,
    image: "images/product-2.png",
    desc: "Higher back rise + side access for easier dressing.",
    long:
      "Designed for wheelchair users with pressure-free seams and thoughtful openings that support easy dressing.",
    badges: ["Wheelchair-friendly", "Pressure-free seams", "Side access"]
  },
  "kurta-1": {
    id: "kurta-1",
    name: "Easy-Open Kurta",
    price: 4800,
    image: "images/product-3.png",
    desc: "Low-effort dressing with breathable fabric.",
    long:
      "Adaptive openings with breathable fabric to make dressing simpler while keeping the look clean and stylish.",
    badges: ["Easy-open", "Breathable", "Minimal effort"]
  },
  "shirt-1": {
    id: "shirt-1",
    name: "Magnetic Closure Shirt",
    price: 4300,
    image: "images/product-4.png",
    desc: "Hidden magnets for quick, low-effort dressing.",
    long:
      "Hidden magnetic snaps support independent dressing—fast, neat, and low-effort without compromising style.",
    badges: ["Hidden magnets", "Independent dressing", "Clean look"]
  }
};

function readCart() {
  try {
    return JSON.parse(localStorage.getItem(CART_KEY)) || [];
  } catch {
    return [];
  }
}

function saveCart(cart) {
  localStorage.setItem(CART_KEY, JSON.stringify(cart));
  updateCartCount();
}

function cartCount(cart) {
  return cart.reduce((sum, item) => sum + item.qty, 0);
}

function updateCartCount() {
  const cart = readCart();
  document.querySelectorAll("[data-cart-count]").forEach((el) => {
    el.textContent = String(cartCount(cart));
  });
}

function addToCart(product) {
  const cart = readCart();
  const existing = cart.find((x) => x.id === product.id);
  if (existing) existing.qty += 1;
  else cart.push({ ...product, qty: 1 });
  saveCart(cart);
}

function removeFromCart(id) {
  const cart = readCart().filter((x) => x.id !== id);
  saveCart(cart);
}

function changeQty(id, delta) {
  const cart = readCart();
  const item = cart.find((x) => x.id === id);
  if (!item) return;

  item.qty += delta;
  if (item.qty <= 0) {
    saveCart(cart.filter((x) => x.id !== id));
  } else {
    saveCart(cart);
  }
}

function formatPKR(n) {
  return `PKR ${Number(n).toLocaleString("en-PK")}`;
}

// Hook buttons (products + product detail page)
function wireAddButtons() {
  document.querySelectorAll("[data-add-to-cart]").forEach((btn) => {
    btn.addEventListener("click", () => {
      const product = {
        id: btn.dataset.id,
        name: btn.dataset.name,
        price: Number(btn.dataset.price),
        image: btn.dataset.image
      };
      addToCart(product);

      const old = btn.textContent;
      btn.textContent = "Added ✓";
      setTimeout(() => (btn.textContent = old), 900);
    });
  });
}

// Render cart page if exists
function renderCartPage() {
  const mount = document.getElementById("cart-items");
  const empty = document.getElementById("cart-empty");
  if (!mount) return;

  const cart = readCart();

  if (cart.length === 0) {
    empty.style.display = "block";
    mount.innerHTML = "";
    document.getElementById("cart-subtotal").textContent = formatPKR(0);
    document.getElementById("cart-total").textContent = formatPKR(0);
    return;
  }

  empty.style.display = "none";

  let subtotal = 0;

  mount.innerHTML = cart
    .map((item) => {
      const line = item.price * item.qty;
      subtotal += line;

      return `
        <div class="cart-item" style="margin-bottom: .9rem;">
          <img src="${item.image}" alt="${item.name}">
          <div>
            <h4 style="margin:0;">${item.name}</h4>
            <div class="cart-meta">${formatPKR(item.price)} × ${item.qty} = <strong>${formatPKR(line)}</strong></div>

            <div class="cart-actions">
              <div class="qty" style="margin:0;">
                <button aria-label="Decrease" data-qty-minus="${item.id}">−</button>
                <span>${item.qty}</span>
                <button aria-label="Increase" data-qty-plus="${item.id}">+</button>
              </div>

              <button class="small-btn" data-remove="${item.id}">Remove</button>
            </div>
          </div>
        </div>
      `;
    })
    .join("");

  document.getElementById("cart-subtotal").textContent = formatPKR(subtotal);
  document.getElementById("cart-total").textContent = formatPKR(subtotal);

  mount.querySelectorAll("[data-remove]").forEach((b) => {
    b.addEventListener("click", () => {
      removeFromCart(b.dataset.remove);
      renderCartPage();
    });
  });

  mount.querySelectorAll("[data-qty-minus]").forEach((b) => {
    b.addEventListener("click", () => {
      changeQty(b.dataset.qtyMinus, -1);
      renderCartPage();
    });
  });

  mount.querySelectorAll("[data-qty-plus]").forEach((b) => {
    b.addEventListener("click", () => {
      changeQty(b.dataset.qtyPlus, +1);
      renderCartPage();
    });
  });
}

// Product detail page rendering
function renderProductDetailPage() {
  const mount = document.getElementById("product-detail");
  if (!mount) return;

  const params = new URLSearchParams(window.location.search);
  const id = params.get("id");
  const p = PRODUCTS[id];

  if (!p) {
    mount.innerHTML = `
      <div class="paper">
        <h2 class="h2">Product not found</h2>
        <p class="p">Please go back to Products and select an item.</p>
        <div style="margin-top:16px;">
          <a class="btn dark" href="products.html">Back to Products</a>
        </div>
      </div>
    `;
    return;
  }

  mount.innerHTML = `
    <div class="image-frame">
      <img src="${p.image}" alt="${p.name}">
    </div>

    <div class="paper">
      <div class="kicker" style="color: rgba(31,26,22,.65)">Product</div>
      <h1 class="h2" style="margin-top:10px;">${p.name}</h1>
      <p class="p" style="margin-top:8px;">${p.long}</p>

      <div class="detail-meta">
        ${p.badges.map(b => `<span class="badge">${b}</span>`).join("")}
      </div>

      <div style="margin-top:18px; display:flex; align-items:center; justify-content:space-between; gap:12px; flex-wrap:wrap;">
        <div style="font-weight:900; font-size:1.2rem; color: var(--brown-800)">${formatPKR(p.price)}</div>
        <button class="btn dark"
          data-add-to-cart
          data-id="${p.id}"
          data-name="${p.name}"
          data-price="${p.price}"
          data-image="${p.image}">
          Add to Cart
        </button>
      </div>

      <div style="margin-top:18px;">
        <a class="btn outline" href="products.html">← Back to Products</a>
      </div>
    </div>
  `;

  wireAddButtons();
}

// Init
document.addEventListener("DOMContentLoaded", () => {
  updateCartCount();
  wireAddButtons();
  renderCartPage();
  renderProductDetailPage();
});
