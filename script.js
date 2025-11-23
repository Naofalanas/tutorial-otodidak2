// Toggle Class Active untuk Hamburger Menu
const navbarNav = document.querySelector(".navbar-nav");
document.querySelector("#hamburger-menu").onclick = (e) => {
  e.preventDefault();
  navbarNav.classList.toggle("active");
};

// Toggle Class Active untuk Search Form
const searchForm = document.querySelector(".search-form");
const searchBox = document.querySelector("#search-box");
document.querySelector("#search-btn").onclick = (e) => {
  e.preventDefault();
  searchForm.classList.toggle("active");
  searchBox.focus();
};

// Toggle Shopping Cart (Sidebar)
const shoppingCart = document.querySelector(".shopping-cart");
document.querySelector("#shopping-cart-btn").onclick = (e) => {
  e.preventDefault();
  shoppingCart.classList.toggle("active");
};

// Close Cart Button
document.querySelector("#close-cart").onclick = (e) => {
  e.preventDefault();
  shoppingCart.classList.remove("active");
};

// Klik di Luar Elemen untuk Menutup
const hm = document.querySelector("#hamburger-menu");
const sb = document.querySelector("#search-btn");
const sc = document.querySelector("#shopping-cart-btn");

document.addEventListener("click", function (e) {
  // Jika klik di luar hamburger & navbar, tutup navbar
  if (!hm.contains(e.target) && !navbarNav.contains(e.target)) {
    navbarNav.classList.remove("active");
  }
  // Jika klik di luar search btn & form, tutup form
  if (!sb.contains(e.target) && !searchForm.contains(e.target)) {
    searchForm.classList.remove("active");
  }
  // Jika klik di luar cart btn & cart sidebar, tutup cart
  if (!sc.contains(e.target) && !shoppingCart.contains(e.target)) {
    shoppingCart.classList.remove("active");
  }
});

// --- ANIMASI SCROLL (Scroll Reveal) ---
const observer = new IntersectionObserver(
  (entries) => {
    entries.forEach((entry) => {
      if (entry.isIntersecting) {
        entry.target.classList.add("active");
      }
    });
  },
  { threshold: 0.1 }
);

const hiddenElements = document.querySelectorAll(
  ".reveal-text, .reveal-left, .reveal-right, .reveal-bottom"
);
hiddenElements.forEach((el) => observer.observe(el));
