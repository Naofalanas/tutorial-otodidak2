document.addEventListener("alpine:init", () => {
  // GANTI BAGIAN STORE CATALOG SAJA
  Alpine.store("catalog", {
    categories: ["All", "Robusta", "Arabica", "Blend"],
    selectedCategory: "All",
    items: [
      {
        id: 1,
        name: "Robusta Brazil",
        img: "1.jpg",
        price: 24000,
        category: "Robusta",
        desc: "Kopi dengan karakter body yang tebal dan rasa pahit cokelat yang dominan. Cocok untuk Anda yang butuh asupan kafein tinggi dan rasa yang nendang.",
      },
      {
        id: 2,
        name: "Arabica Blend",
        img: "2.jpg",
        price: 25000,
        category: "Arabica",
        desc: "Perpaduan biji pilihan dengan tingkat keasaman medium dan aroma floral yang menenangkan. Rasa seimbang yang pas untuk dinikmati kapan saja.",
      },
      {
        id: 3,
        name: "Primo Passo",
        img: "3.jpg",
        price: 26000,
        category: "Blend",
        desc: "Signature blend kami untuk pecinta Espresso. Menghasilkan crema yang tebal, tekstur creamy, dengan aftertaste kacang-kacangan yang manis.",
      },
      {
        id: 4,
        name: "Aceh Gayo",
        img: "3.jpg",
        price: 25000,
        category: "Arabica",
        desc: "Kopi legendaris Indonesia. Memiliki aroma bumi (earthy) yang khas, body yang berat, dan tingkat keasaman rendah. Favorit pecinta kopi hitam.",
      },
      {
        id: 5,
        name: "Sumatra Mandheling",
        img: "3.jpg",
        price: 28000,
        category: "Arabica",
        desc: "Kopi premium dengan tekstur syrupy yang kental. Kompleksitas rasa herbal dan rempah eksotis yang tidak bisa Anda temukan di kopi lain.",
      },
    ],
    search: "",
    get filteredItems() {
      return this.items.filter((item) => {
        const matchesSearch = item.name
          .toLowerCase()
          .includes(this.search.toLowerCase());
        const matchesCategory =
          this.selectedCategory === "All" ||
          item.category === this.selectedCategory;
        return matchesSearch && matchesCategory;
      });
    },
    filterCategory(category) {
      this.selectedCategory = category;
    },
  });

  // STORE UI (NEW: Mengatur Tampilan Sidebar/Modal)
  Alpine.store("ui", {
    isNavbarOpen: false,
    isSearchOpen: false,
    isCartOpen: false,

    toggleNavbar() {
      this.isNavbarOpen = !this.isNavbarOpen;
      if (this.isNavbarOpen) {
        this.isSearchOpen = false;
        this.isCartOpen = false;
      }
    },
    toggleSearch() {
      this.isSearchOpen = !this.isSearchOpen;
      if (this.isSearchOpen) {
        this.isNavbarOpen = false;
        this.isCartOpen = false;
        // Focus logic will be handled in HTML x-effect or $nextTick
      }
    },
    toggleCart() {
      this.isCartOpen = !this.isCartOpen;
      if (this.isCartOpen) {
        this.isNavbarOpen = false;
        this.isSearchOpen = false;
      }
    },
    closeAll() {
      this.isNavbarOpen = false;
      this.isSearchOpen = false;
      this.isCartOpen = false;
    }
  });

  // 2. STORE CART (Keranjang Belanja)
  Alpine.store("cart", {
    items: [],
    total: 0,
    quantity: 0,
    init() {
      const storedCart = localStorage.getItem("cart");
      if (storedCart) {
        this.items = JSON.parse(storedCart);
        this.quantity = this.items.reduce(
          (acc, item) => acc + item.quantity,
          0
        );
        this.total = this.items.reduce((acc, item) => acc + item.total, 0);
      }
    },
    add(newItem) {
      const cartItem = this.items.find((item) => item.id === newItem.id);
      if (!cartItem) {
        this.items.push({ ...newItem, quantity: 1, total: newItem.price });
        this.quantity++;
        this.total += newItem.price;
      } else {
        this.items = this.items.map((item) => {
          if (item.id !== newItem.id) return item;
          item.quantity++;
          item.total = item.price * item.quantity;
          this.quantity++;
          this.total += item.price;
          return item;
        });
      }
      this.save();
      // Panggil Notifikasi
      Alpine.store("notification").notify(`${newItem.name} masuk keranjang!`);
    },
    remove(id) {
      const cartItem = this.items.find((item) => item.id === id);
      if (cartItem.quantity > 1) {
        this.items = this.items.map((item) => {
          if (item.id !== id) return item;
          item.quantity--;
          item.total = item.price * item.quantity;
          this.quantity--;
          this.total -= item.price;
          return item;
        });
      } else if (cartItem.quantity === 1) {
        this.items = this.items.filter((item) => item.id !== id);
        this.quantity--;
        this.total -= cartItem.price;
      }
      this.save();
    },
    save() {
      localStorage.setItem("cart", JSON.stringify(this.items));
    },
    checkout(customerData) {
      if (
        !customerData.name.trim() ||
        !customerData.email.trim() ||
        !customerData.phone.trim()
      ) {
        Alpine.store("notification").notify(
          "Data pelanggan tidak boleh kosong!"
        );
        return;
      }
      // 1. Validasi Input Kosong
      if (
        !customerData.name.trim() ||
        !customerData.email.trim() ||
        !customerData.phone.trim()
      ) {
        Alpine.store("notification").notify(
          "Data pelanggan tidak boleh kosong!"
        );
        return;
      }

      // 2. [BARU] Validasi Format Nomor HP
      // Cek apakah panjang nomor kurang dari 10 digit?
      if (customerData.phone.length < 10) {
        Alpine.store("notification").notify(
          "Nomor WhatsApp tidak valid (min. 10 angka)!"
        );
        return;
      }
      if (this.items.length === 0) return;
      const itemsList = this.items
        .map(
          (item) => `${item.name} (${item.quantity} x ${rupiah(item.price)})`
        )
        .join("\n");
      const message = `Halo Kopi Senja, saya mau pesan:\n\n${itemsList}\n\nTotal: ${rupiah(
        this.total
      )}\n\n-- Data Pemesan --\nNama: ${customerData.name}\nEmail: ${
        customerData.email
      }\nNo HP: ${customerData.phone}`;
      window.open(
        `https://wa.me/6285777136377?text=${encodeURIComponent(message)}`
      );
    },
  });

  // 3. STORE DETAIL (Untuk Modal Popup)
  Alpine.store("detail", {
    isOpen: false,
    item: {}, // Awalnya kosong, ini yang bikin error kalau gak di-handle di HTML
    show(newItem) {
      this.item = newItem;
      this.isOpen = true;
    },
    close() {
      this.isOpen = false;
    },
  });

  // 4. STORE NOTIFICATION (Toast)
  Alpine.store("notification", {
    show: false,
    message: "",
    timeout: null,
    notify(msg) {
      this.message = msg;
      this.show = true;
      clearTimeout(this.timeout);
      this.timeout = setTimeout(() => {
        this.show = false;
      }, 3000);
    },
  });
});

// Helper Rupiah
const rupiah = (number) => {
  return new Intl.NumberFormat("id-ID", {
    style: "currency",
    currency: "IDR",
    minimumFractionDigits: 0,
  }).format(number);
};
