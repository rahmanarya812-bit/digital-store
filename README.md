# ⚡ Arya Store — Premium Digital Products E-Commerce

Arya Store adalah aplikasi web e-commerce premium modern yang dirancang khusus untuk menjual produk digital seperti software, ebook, tema UI/UX, plugin, dan materi pembelajaran online. Dibangun menggunakan **Vite + React** untuk frontend, **Zustand** untuk state management, dan **Vercel Serverless Functions** untuk API backend.

Desain visual aplikasi ini menggunakan tema **Dark Mode** kelas premium dengan aksen neon gradient (purple ke cyan), glassmorphism, dan transisi/animasi mikro yang halus untuk menjamin user experience yang luar biasa.

---

## ✨ Fitur Utama

- **Catalog & AJAX Filtering**: Pencarian, pengurutan (paling populer, terbaru, harga, rating), serta penyaringan kategori produk berbasis AJAX yang sangat responsif.
- **Multirole Access (Customer & Admin)**:
  - **Customer**: Menambahkan produk ke wishlist/keranjang, simulasi aktivasi lisensi instan melalui halaman checkout, serta riwayat lisensi & file download di halaman "My Orders".
  - **Admin**: Dashboard interaktif yang memuat telemetry total produk/download/revenue/order, grafik penjualan bulanan, produk terlaris, dan activation requests terkini.
- **ProtectedRoute Guards**: Middleware router guard yang kokoh membedakan Guest route (hanya untuk belum login), Protected route (untuk customer yang sudah login), dan Admin route (khusus role admin).
- **Zustand Stores**: State management global yang cepat dengan sinkronisasi otomatis ke `localStorage` untuk keranjang belanja, wishlist, dan session user login.
- **Local Serverless API execution**: Konfigurasi dev server Vite kustom yang dapat memproses serverless handlers `/api` secara lokal tanpa perlu menyalakan emulator external.

---

## 📂 Struktur Direktori

```
digital-store/
├── api/                    # Serverless Functions Backend
│   ├── _data/              # Mock Database (products & users)
│   ├── _utils/             # Token/Auth utils
│   ├── auth/               # Endpoint Login & Register
│   ├── products/           # Endpoint List & Detail Produk
│   ├── orders/             # Endpoint Simpan & Ambil Order
│   └── admin/              # Endpoint Stats & Telemetry Admin
├── public/                 # Assets Publik & Gambar Produk (generated)
├── src/
│   ├── components/         # Reusable UI Components
│   │   ├── Navbar.jsx & Navbar.css
│   │   ├── Footer.jsx & Footer.css
│   │   ├── ProductCard.jsx & ProductCard.css
│   │   ├── CartDrawer.jsx & CartDrawer.css
│   │   ├── SearchBar.jsx & SearchBar.css
│   │   └── FilterSidebar.jsx & FilterSidebar.css
│   ├── middleware/         # Middleware Route Guards
│   │   └── ProtectedRoute.jsx
│   ├── pages/              # Halaman-halaman Utama
│   │   ├── Home.jsx & Home.css
│   │   ├── Products.jsx & Products.css
│   │   ├── ProductDetail.jsx & ProductDetail.css
│   │   ├── Cart.jsx & Cart.css
│   │   ├── Checkout.jsx & Checkout.css
│   │   ├── Wishlist.jsx & Wishlist.css
│   │   ├── Orders.jsx & Orders.css
│   │   ├── Login.jsx, Register.jsx & Auth.css
│   │   └── AdminDashboard.jsx & AdminDashboard.css
│   ├── services/           # AJAX Service Layer (api.js, auth, order, etc.)
│   ├── store/              # Zustand Stores (auth, cart, wishlist)
│   ├── App.jsx & App.css
│   ├── index.css           # Design System & Token CSS Utama
│   └── main.jsx
├── vercel.json             # Konfigurasi rewrite & routing Vercel
├── vite.config.js          # Vite config + local serverless runner
└── package.json
```

---

## 🚀 Memulai

### Prasyarat
Pastikan Anda sudah menginstal **Node.js** di perangkat Anda.

### Langkah-langkah Menjalankan Lokal

1. **Clone & Buka Folder Proyek**:
   ```bash
   cd digital-store
   ```

2. **Instal Dependensi**:
   ```bash
   npm install
   ```

3. **Jalankan Development Server**:
   ```bash
   npm run dev
   ```
   Aplikasi akan berjalan di **[http://localhost:5173/](http://localhost:5173/)**. Dev server ini secara otomatis merutekan semua endpoint `/api/*` ke serverless handler di dalam folder `api/` secara dinamis.

---

## 🔑 Demo Kredensial

Gunakan akun demo berikut untuk memverifikasi fitur multi-role dan middleware pengaman route:

### 👤 Customer Account
- **Email**: `user@store.com`
- **Password**: `user123`
- *Fungsi*: Browsing, tambah wishlist, keranjang, simulasi pembayaran, generate license key, dan history order.

### 🛡️ Administrator Account
- **Email**: `admin@store.com`
- **Password**: `admin123`
- *Fungsi*: Akses penuh ke dashboard `/admin` berisi grafik penjualan dan telemetry toko.

---

## ☁️ Deployment ke Vercel

Proyek ini siap di-deploy secara instan ke Vercel. Jalankan perintah berikut menggunakan Vercel CLI di root folder proyek:

```bash
vercel
```

Vercel akan mendeteksi setup build Vite untuk frontend dan secara otomatis meluncurkan file di dalam `/api` sebagai Vercel Serverless Functions.
