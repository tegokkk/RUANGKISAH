# Slide Tabs pada navigation bar

## Integrasi saat ini

Komponen berada di frontend/src/components/ui/slide-tabs.jsx; gaya di slide-tabs.module.css. Folder frontend/src/components/ui sudah menjadi tempat komponen bersama proyek, dengan alias @/components/ui. Header memasok items berisi to, label, dan end. Komponen membutuhkan React Router serta framer-motion; dependency dan lockfile telah diperbarui. Ikon, gambar, context baru dan asset eksternal tidak diperlukan.

Efek mengikuti referensi: outline pill terang dengan indikator dark ink yang bergeser dan menyesuaikan lebar label. Hover/fokus memindahkan indikator; saat keluar kembali ke link halaman aktif. URL menentukan pilihan, termasuk refresh dan back/forward. Pada halaman pendukung yang tidak ada di menu utama, tidak ada indikator aktif palsu. Navigasi memakai link semantik dan aria-current; reduced motion menggunakan transisi seketika.

Referensi awal memakai callback ref tetapi membacanya sebagai object ref, sehingga hover dapat gagal. Implementasi memakai array elemen DOM, pengukuran terhadap list, ResizeObserver dan penyesuaian setelah font siap. Motion memakai LazyMotion dengan fitur yang dimuat terpisah, mengikuti [panduan bundle Motion](https://motion.dev/docs/react-reduce-bundle-size).

Stack aplikasi tetap React JavaScript dan CSS Modules sesuai rancangan proyek. Efek referensi tidak memerlukan migrasi seluruh aplikasi ke TypeScript/Tailwind/shadcn. Pada layar kecil, menu mobile dan pengelolaan fokus yang sudah ada tetap tersedia.

## Jika menyiapkan varian TypeScript/Tailwind/shadcn

Panduan ini disediakan karena template referensi menyebut stack tersebut; langkah berikut merupakan setup alternatif, bukan status yang sudah diinstal pada proyek.

1. Pasang TypeScript dan tipe React: npm install -D typescript @types/react @types/react-dom. Siapkan tsconfig untuk bundler, JSX react-jsx dan alias @/* ke src/*. Migrasikan berkas bertahap ke .ts/.tsx serta periksa tsc --noEmit.
2. Untuk Tailwind pada Vite, jalankan npm install tailwindcss @tailwindcss/vite, tambahkan plugin tailwindcss() pada Vite dan import CSS Tailwind sesuai [panduan resmi](https://tailwindcss.com/docs/installation/using-vite). Tinjau reset/preflight terhadap gaya aplikasi sebelum mengaktifkannya.
3. Setelah alias dan Tailwind siap, jalankan npx shadcn@latest init dari folder frontend, lalu petakan components.ui ke @/components/ui dan CSS entry yang dipakai. Ikuti [panduan shadcn Vite](https://ui.shadcn.com/docs/installation/vite).
4. Jika membuat aplikasi baru sepenuhnya, gunakan template react-ts Vite terlebih dahulu. Folder src/components/ui menjaga komponen reusable terpusat dan sesuai alias generator; bukan folder di root backend.

Perintah instalasi varian tersebut belum dijalankan. Integrasi navbar aktif menggunakan dependency framer-motion dan file JSX/CSS Modules yang telah diuji.


## Pemakaian pada footer

Footer memakai komponen yang sama melalui wrap=true. Item link memakai to/label, sedangkan aksi Lihat contoh fiktif memakai id/label/onClick agar tetap berupa button semantik. Item aksi tersebut dihilangkan ketika mode demo aktif. Pada lebar <=767 px, kelompok berubah menjadi grid dua kolom; indikator mengukur x/y/width/height sehingga mengikuti tombol lintas baris. Navbar desktop tetap satu baris.
