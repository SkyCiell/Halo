// Global array to store all products fetched from API
let allProducts = [];
let currentPage = 1;
const productsPerPage = 6; // Adjust as needed

// Utility function to generate star rating HTML
function generateStarRating(rating) {
  rating = Math.min(rating, 5); // Ensure max 5 stars
  const fullStars = Math.floor(rating);
  const hasHalfStar = rating % 1 >= 0.5;
  let stars = "";

  for (let i = 0; i < fullStars; i++) {
    stars += '<i class="ri-star-fill text-yellow-400"></i>';
  }
  if (hasHalfStar) {
    stars += '<i class="ri-star-half-fill text-yellow-400"></i>';
  }
  const emptyStars = 5 - fullStars - (hasHalfStar ? 1 : 0);
  for (let i = 0; i < emptyStars; i++) {
    stars += '<i class="ri-star-line text-yellow-400"></i>';
  }
  return stars;
}

// Function to format price
function formatPrice(price) {
  return `$${price.toFixed(2)}`;
}

// Function to fetch products from FakeStoreAPI
async function fetchProductsFromAPI() {
  try {
    const response = await fetch("https://fakestoreapi.com/products");
    allProducts = await response.json(); // Store fetched products globally
    return allProducts;
  } catch (error) {
    console.error("Error fetching products:", error);
    return [];
  }
}

// Function to display products in the grid
function displayProducts(productsToDisplay) {
  const productGrid = document.getElementById("productsGrid");
  if (!productGrid) {
    console.error("productsGrid element not found!");
    return;
  }
  productGrid.innerHTML = ""; // Clear existing content

  productsToDisplay.forEach((product) => {
    const productCard = `
      <div class="product-card bg-white rounded-lg shadow-md overflow-hidden transition-transform hover:shadow-lg hover:-translate-y-1 cursor-pointer" data-id="${
        product.id
      }">
        <div class="h-64 overflow-hidden">
          <img src="${product.image}" alt="${
      product.title
    }" class="w-full h-full object-contain"/>
        </div>
        <div class="p-5">
          <div class="flex items-center mb-2">
            <div class="flex">
              ${generateStarRating(product.rating?.rate || 0)}
            </div>
            <span class="text-gray-500 text-sm ml-2">(${
              product.rating?.count || 0
            })</span>
          </div>
          <h3 class="text-lg font-semibold mb-1 line-clamp-2">${
            product.title
          }</h3>
          <p class="text-gray-500 text-sm mb-3">${product.category}</p>
          <div class="flex justify-between items-center">
            <span class="text-xl font-bold text-gray-900 product-price">${formatPrice(
              product.price
            )}</span>
            <button onclick="event.stopPropagation(); window.addToCartFromProductCard(${
              product.id
            });" class="add-to-cart-btn bg-blue-500 text-white px-4 py-2 rounded-button text-sm font-medium hover:bg-blue-600 transition-colors cursor-pointer">
              Tambah ke Keranjang
            </button>
          </div>
        </div>
      </div>
    `;
    productGrid.innerHTML += productCard;
  });
}

// Function to load products, either paginated or all
async function loadProducts(loadAll = false) {
  if (allProducts.length === 0) {
    await fetchProductsFromAPI(); // Fetch all products once
  }

  const startIndex = 0;
  const endIndex = loadAll ? allProducts.length : currentPage * productsPerPage;
  const productsToDisplay = allProducts.slice(startIndex, endIndex);

  displayProducts(productsToDisplay);

  const loadMoreBtn = document.getElementById("loadMoreBtn");
  if (loadMoreBtn) {
    if (endIndex >= allProducts.length) {
      loadMoreBtn.style.display = "none";
    } else {
      loadMoreBtn.style.display = "inline-block";
    }
  }
}

// Function to handle click on a product card
function handleProductClick(productId) {
  // On homepage, direct to detail page without login check
  window.location.href = `detail.html?id=${productId}`;
}

// Function to handle search input
function handleSearchInput(query) {
  const filteredProducts = allProducts.filter(
    (product) =>
      product.title.toLowerCase().includes(query.toLowerCase()) ||
      product.category.toLowerCase().includes(query.toLowerCase()) ||
      (product.description &&
        product.description.toLowerCase().includes(query.toLowerCase()))
  );
  displayProducts(filteredProducts);
}

// Function to update cart count
function updateCartCount() {
  const cart = JSON.parse(localStorage.getItem("cart")) || [];
  const totalItems = cart.reduce((total, item) => total + item.quantity, 0);
  const cartCountElements = document.querySelectorAll(".cart-count");
  cartCountElements.forEach((element) => {
    element.textContent = totalItems;
  });
}

document.addEventListener("DOMContentLoaded", async function () {
  // Load products when page loads
  await loadProducts(); // Ensure products are loaded before setting up listeners that depend on them

  // --- UI Interactions ---

  // Back to Top Button
  const backToTopButton = document.getElementById("backToTop");
  if (backToTopButton) {
    window.addEventListener("scroll", function () {
      if (window.pageYOffset > 300) {
        backToTopButton.classList.remove("opacity-0", "invisible");
        backToTopButton.classList.add("opacity-100", "visible");
      } else {
        backToTopButton.classList.remove("opacity-100", "visible");
        backToTopButton.classList.add("opacity-0", "invisible");
      }
    });
    backToTopButton.addEventListener("click", function () {
      window.scrollTo({ top: 0, behavior: "smooth" });
    });
  }

  // Load More Button
  const loadMoreBtn = document.getElementById("loadMoreBtn");
  if (loadMoreBtn) {
    loadMoreBtn.addEventListener("click", () => {
      currentPage++;
      loadProducts();
    });
  }

  // Show All Button
  const showAllBtn = document.getElementById("showAllBtn");
  if (showAllBtn) {
    showAllBtn.addEventListener("click", () => {
      loadProducts(true);
    });
  }

  // Search Input
  const searchInput = document.getElementById("searchInput");
  if (searchInput) {
    searchInput.addEventListener("input", (e) => {
      handleSearchInput(e.target.value);
    });
  }

  // Product Card Clicks (for detail page navigation)
  // Using event delegation as product cards are dynamically loaded
  document.addEventListener("click", function (event) {
    const productCard = event.target.closest(".product-card");
    // Ensure click is on the card itself, not on the "Add to Cart" button within it
    if (productCard && !event.target.closest(".add-to-cart-btn")) {
      const productId = productCard.getAttribute("data-id");
      handleProductClick(productId);
    }
  });

  // Handle Login/Register/Profile buttons in header for homepage
  const loginBtn = document.querySelector('a[href="login.html"]');
  const registerBtn = document.querySelector('a[href="register.html"]');
  const userIconPopup = document.getElementById("userPopup");
  const userIcon = document.getElementById("userIcon");

  // Toggle user popup
  if (userIcon) {
    userIcon.addEventListener("click", function () {
      userIconPopup.classList.toggle("hidden");
    });
    // Close popup if clicked outside
    document.addEventListener("click", function (event) {
      if (
        !userIcon.contains(event.target) &&
        !userIconPopup.contains(event.target)
      ) {
        userIconPopup.classList.add("hidden");
      }
    });
  }

  const isLoggedIn = localStorage.getItem("isLoggedIn");
  if (isLoggedIn) {
    if (loginBtn) {
      loginBtn.innerHTML = '<i class="ri-user-line"></i><span>Profil</span>';
      loginBtn.href = "profile.html";
      loginBtn.classList.remove("hidden");
      loginBtn.classList.add("flex");
    }
    if (registerBtn) {
      registerBtn.style.display = "none";
    }
  } else {
    if (loginBtn) {
      loginBtn.innerHTML =
        '<i class="ri-login-box-line"></i><span>Login</span>';
      loginBtn.href = "login.html";
      loginBtn.classList.remove("hidden");
      loginBtn.classList.add("flex");
    }
    if (registerBtn) {
      registerBtn.style.display = ""; // Show register button
      registerBtn.classList.remove("hidden");
      registerBtn.classList.add("flex");
    }
  }

  // Update cart count when page loads
  updateCartCount();
});

// Expose addToCartFromProductCard globally so product cards can call it.
// This function finds the product object from the globally available allProducts array
// and then calls the actual addToCart function which resides in cart.js.
window.addToCartFromProductCard = function (productId) {
  const product = allProducts.find((p) => p.id == productId);
  if (product) {
    // Check if addToCart function from cart.js is available globally
    if (typeof window.addToCart === "function") {
      window.addToCart(product);
      // Update cart count
      updateCartCount();
      // Tampilkan alert sukses
      alert("Produk berhasil ditambahkan ke keranjang!");
    } else {
      console.error(
        "addToCart function not found in window object. Make sure cart.js is loaded BEFORE api.js if addToCart is defined within its DOMContentLoaded, or expose it globally."
      );
      // Fallback for debugging - directly add to localStorage if cart.js function is not found
      let cartItems = JSON.parse(localStorage.getItem("cart")) || [];
      const existingItemIndex = cartItems.findIndex(
        (item) => item.id == product.id
      );
      if (existingItemIndex !== -1) {
        cartItems[existingItemIndex].quantity += 1;
      } else {
        cartItems.push({ ...product, quantity: 1 });
      }
      localStorage.setItem("cart", JSON.stringify(cartItems));
      // Update cart count
      updateCartCount();
      // Tampilkan alert sukses untuk fallback
      alert("Produk berhasil ditambahkan ke keranjang!");
      console.warn(
        "Product added via fallback (addToCart from cart.js not found or exposed):",
        product.title
      );
    }
  } else {
    console.error("Product not found in allProducts for ID:", productId);
  }
};
