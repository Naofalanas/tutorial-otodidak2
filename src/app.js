document.addEventListener("alpine:init", () => {
  Alpine.store("catalog", {
    categories: ["All", "Robusta", "Arabica", "Blend"],
    selectedCategory: "All",
    items: [], // Perhatikan : Array ini sekarang kosong dulu
    search: "",
    // Fungsi ini otomatis jalan saat Alpine ngeload
    async init() {
      try {
        const response = await fetch("products.json"); // Ambil data dari products.json
        this.items = await response.json(); // Simpan data ke variable items
      } catch (error) {
        console.error("Gagal memuat data produk:", error);
        // Fallback kalau error (Opsional)
        Alpine.store("notification").notify("Gagal mengambil data produk!");
      }
    },
    get filteredItems() {
      return this.items.filter((item) => {
        const matchesSearch = item.name
          .toLowerCase()
          .includes(this.search.toLowerCase());
        const mathcesCategory =
          this.selectedCategory === "All" ||
          item.category === this.selectedCategory;
        return matchesSearch && mathcesCategory;
      });
    },

    filterCategory(category) {
      this.selectedCategory = category;
    },
  });

  // STORE UI (Mengatur Tampilan Sidebar/Modal)
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
    },
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
      // 1. Validasi input kosong (trim spasi)
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

      // 2. Validasi format email (pakai regex)
      // untuk ngecek apakah ada @ dan titik (.) yang wajar
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(customerData.email)) {
        Alpine.store("notification").notify("Format email tidak valid!");
        return;
      }

      // 3. Validasi no hp (hanya angka dan minimal 10 digit)
      const phoneRegex = /^[0-9]{10,}$/;
      if (!phoneRegex.test(customerData.phone)) {
        Alpine.store("notification").notify(
          "Nomor HP harus angka & minimal 10 digit"
        );
        return;
      }

      // Jika lolos validasi
      if (this.items.length === 0) return;

      // Format list barang
      const itemList = this.items
        .map(
          (item) => `${item.name} (${item.quantity} x ${rupiah(item.price)})`
        )
        .join("\n");

      // Susun Pesan ke WA
      const message = `Halo kopi senja, saya mau memesan:\n\n${itemList}\n\nTotal: ${rupiah(
        this.total
      )}\n\n-- Data Pemesan --\nNama: ${customerData.name}\nEmail: ${
        customerData.email
      }\nNo HP: ${customerData.phone}`;

      // Buka WA
      window.open(
        `https://wa.me/6285777136377?text=${encodeURIComponent(message)}`
      );
    },
  });

  // 3. STORE DETAIL (Untuk Modal Popup)
  Alpine.store("detail", {
    isOpen: false,
    item: {},
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
