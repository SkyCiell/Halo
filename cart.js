// Expose functions globally for easier access from HTML or other scripts
// This helps bridge between modules if they aren't fully modularized (e.g., using ES modules)
window.addToCart = addToCart;
window.removeFromCart = removeFromCart;
window.updateQuantity = updateQuantity;
window.displayCartItems = displayCartItems; // Primarily for cart.html itself
window.updateCartCount = updateCartCount; // Exposed for general use, e.g., on page load

// Fungsi untuk menambahkan produk ke keranjang
// 'product' expected to be an object with { id, title, price, image }
function addToCart(product) {
  try {
    let cart = JSON.parse(localStorage.getItem("cart")) || [];

    const existingProductIndex = cart.findIndex(
      (item) => item.id == product.id
    ); // Use == for comparison

    if (existingProductIndex !== -1) {
      cart[existingProductIndex].quantity += 1;
    } else {
      cart.push({
        id: product.id,
        title: product.title,
        price: product.price,
        image: product.image,
        quantity: 1,
      });
    }

    localStorage.setItem("cart", JSON.stringify(cart));
    updateCartCount(); // Update the header cart count
    showNotification("Produk berhasil ditambahkan ke keranjang!");
    console.log("Produk ditambahkan ke keranjang:", product);
  } catch (error) {
    console.error("Error adding to cart:", error);
    showNotification("Gagal menambahkan produk ke keranjang", "error");
  }
}

// Fungsi untuk menghapus produk dari keranjang
function removeFromCart(productId) {
  try {
    let cart = JSON.parse(localStorage.getItem("cart")) || [];
    cart = cart.filter((item) => item.id != productId); // Use != for comparison
    localStorage.setItem("cart", JSON.stringify(cart));
    // Check if on cart.html before trying to displayCartItems
    if (document.getElementById("cart-items")) {
      displayCartItems(); // Re-render cart display if on cart page
    }
    updateCartCount(); // Update the header cart count
    showNotification("Produk berhasil dihapus dari keranjang!");
  } catch (error) {
    console.error("Error removing from cart:", error);
    showNotification("Gagal menghapus produk dari keranjang", "error");
  }
}

// Fungsi untuk mengupdate quantity produk
function updateQuantity(productId, newQuantity) {
  try {
    let cart = JSON.parse(localStorage.getItem("cart")) || [];
    const productIndex = cart.findIndex((item) => item.id == productId); // Use == for comparison

    if (productIndex !== -1) {
      if (newQuantity > 0) {
        cart[productIndex].quantity = newQuantity;
      } else {
        cart.splice(productIndex, 1); // Remove if quantity is 0 or less
      }
      localStorage.setItem("cart", JSON.stringify(cart));
      // Check if on cart.html before trying to displayCartItems
      if (document.getElementById("cart-items")) {
        displayCartItems(); // Re-render cart display if on cart page
      }
      updateCartCount(); // Update the header cart count
      showNotification("Jumlah produk berhasil diperbarui!");
    }
  } catch (error) {
    console.error("Error updating quantity:", error);
    showNotification("Gagal mengupdate jumlah produk", "error");
  }
}

// Fungsi untuk mengupdate tampilan jumlah item di keranjang di header
function updateCartCount() {
  const cart = JSON.parse(localStorage.getItem("cart")) || [];
  const totalItems = cart.reduce((total, item) => total + item.quantity, 0);
  const cartCountElement = document.querySelector(".cart-count");
  if (cartCountElement) {
    cartCountElement.textContent = totalItems;
  }
}

// Fungsi untuk menampilkan notifikasi (common for success/error)
function showNotification(message, type = "success") {
  const notification = document.createElement("div");
  notification.className = `fixed top-4 right-4 px-6 py-4 rounded-lg shadow-lg z-50 flex items-center gap-3 animate-slide-in ${
    type === "success" ? "bg-green-500" : "bg-red-500"
  } text-white`;
  notification.innerHTML = `
    <i class="ri-${
      type === "success" ? "checkbox-circle-fill" : "error-warning-fill"
    } text-2xl"></i>
    <span class="text-base">${message}</span>
  `;

  document.body.appendChild(notification);

  setTimeout(() => {
    notification.classList.add("animate-fade-out");
    setTimeout(() => {
      notification.remove();
    }, 300);
  }, 2000);
}

// Tambahkan style untuk animasi notifikasi (pastikan hanya ada sekali di proyek)
// This should ideally be in a CSS file. Keeping it here as it was found in original cart.js
const style = document.createElement("style");
style.textContent = `
  @keyframes slideIn {
    from { transform: translateX(100%); opacity: 0; }
    to { transform: translateX(0); opacity: 1; }
  }
  @keyframes fadeOut {
    from { transform: translateX(0); opacity: 1; }
    to { transform: translateX(100%); opacity: 0; }
  }
  .animate-slide-in { animation: slideIn 0.3s ease-out forwards; }
  .animate-fade-out { animation: fadeOut 0.3s ease-out forwards; }
`;
document.head.appendChild(style);

// Fungsi untuk mengkonversi format harga (for parsing text from HTML)
function parsePrice(priceString) {
  // Remove "$" and convert to number
  return parseFloat(priceString.replace("$", ""));
}

// Fungsi untuk mendapatkan total harga keranjang (used by cart.html display)
function getCartTotal() {
  const cart = JSON.parse(localStorage.getItem("cart")) || [];
  return cart.reduce((total, item) => total + item.price * item.quantity, 0);
}

// Fungsi untuk menampilkan item keranjang di halaman keranjang (cart.html)
function displayCartItems() {
  const cartItems = JSON.parse(localStorage.getItem("cart")) || [];
  const cartContainer = document.getElementById("cart-items");
  const subtotalElement = document.getElementById("subtotal");
  const totalElement = document.getElementById("total");

  if (!cartContainer || !subtotalElement || !totalElement) {
    console.warn(
      "Cart display elements not found. This function is likely for cart.html."
    );
    return;
  }

  cartContainer.innerHTML = "";

  if (cartItems.length === 0) {
    cartContainer.innerHTML = `
      <div class="text-center py-8">
        <i class="ri-shopping-cart-line text-6xl text-gray-400 mb-4"></i>
        <p class="text-gray-500">Keranjang belanja Anda kosong</p>
      </div>
    `;
    subtotalElement.textContent = "Rp 0";
    totalElement.textContent = "Rp 0";
    return;
  }

  let subtotal = 0;

  cartItems.forEach((item) => {
    const itemTotal = item.price * item.quantity;
    subtotal += itemTotal;

    cartContainer.innerHTML += `
      <div class="flex items-center bg-white rounded-lg shadow-sm p-4 mb-4">
        <!-- Product Image -->
        <div class="w-16 h-16 flex-shrink-0 mr-4">
          <img src="${item.image}" alt="${
      item.title
    }" class="w-full h-full object-contain">
        </div>

        <!-- Product Title -->
        <div class="flex-grow mr-4">
          <h3 class="font-semibold text-md">${item.title}</h3>
        </div>

        <!-- Quantity Control -->
        <div class="flex items-center border border-gray-300 rounded px-0.5 mr-4 flex-shrink-0">
          <button class="quantity-btn text-gray-600 w-5 h-5 flex items-center justify-center" onclick="updateQuantity('${
            item.id
          }', ${item.quantity + 1})">+</button>
          <input class="w-8 text-center outline-none bg-transparent text-sm" type="text" value="${
            item.quantity
          }" readonly>
          <button class="quantity-btn text-gray-600 w-5 h-5 flex items-center justify-center" onclick="updateQuantity('${
            item.id
          }', ${item.quantity - 1})">-</button>
        </div>

        <!-- Total Price per Item -->
        <div class="text-right mr-4 flex-shrink-0 w-24">
          <p class="text-gray-600 text-sm">Total harga:</p>
          <p class="font-bold text-md">$${itemTotal.toFixed(2)}</p>
        </div>

        <!-- Remove Button -->
        <button
          class="text-red-500 hover:text-red-600 text-lg flex-shrink-0 w-8 h-8 flex items-center justify-center rounded-full hover:bg-gray-200"
          onclick="removeFromCart('${item.id}')"
          title="Hapus"
        >
          <i class="ri-delete-bin-line"></i>
        </button>
      </div>
    `;
  });

  const shipping = 2.0; // Fixed shipping cost in dollars
  const total = subtotal + shipping;

  subtotalElement.textContent = `$${subtotal.toFixed(2)}`;
  totalElement.textContent = `$${total.toFixed(2)}`;
}

// Main DOMContentLoaded listener for cart.js
document.addEventListener("DOMContentLoaded", () => {
  // Update cart count on initial load (header icon)
  updateCartCount();

  // If on the cart page, display cart items
  if (document.getElementById("cart-items")) {
    displayCartItems();
  }
  // Other event listeners specific to cart.js (like add to cart buttons)
  // are expected to be handled by api.js or other page-specific scripts
  // that call the global `window.addToCart` function.
});
