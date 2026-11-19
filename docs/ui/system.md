# Aturan UI aktif — versi 1.2

Sumber implementasi: frontend/src/styles/tokens.css, komponen UI bersama dan frontend/src/config/motionConfig.js. Aturan ini melengkapi design.md dan menggantikan ukuran halaman setara yang berbeda pada ekspor Stitch lama.

| Peran                 | Desktop        | Mobile         |
| --------------------- | -------------- | -------------- |
| Hero                  | 80 px          | 44 px          |
| Judul halaman         | 36 px          | 30 px          |
| Judul form/akun       | 32 px          | 28 px          |
| Judul bagian          | 24 px          | 22 px          |
| Padding panel         | 32 px          | 24 px          |
| Field/select/password | minimum 56 px  | minimum 56 px  |
| Tombol utama          | minimum 48 px  | minimum 48 px  |
| Aksi ringkas          | minimum 44 px  | minimum 44 px  |
| Textarea awal         | minimum 128 px | minimum 112 px |

Kontainer autentikasi 520 px, konten 840 px dan overview 960 px. Halaman menulis dan hero mempunyai lebar khusus. Breakpoint CSS memakai nilai literal; custom property tidak dipakai langsung sebagai kondisi media query.

Navigasi aktif ink/putih; pilihan input frost dengan border action. Hover mempertahankan selected dan focus-visible tetap terlihat. Primary biru, secondary/keluar netral, danger untuk hapus/nonaktif. Pistachio/ink pada hero/panel warna sesuai kontrasnya.

Gunakan PageHeader pada halaman informasi dan daftar/detail catatan; EmptyState untuk kosong/404/tidak-diizinkan, varian compact pada hasil filter. Pergantian form/rangkuman/detail memfokuskan judul tanpa menghapus draf. Mobile Admin menyediakan kartu data tabel termasuk semua field riwayat.

Motion interaksi 160 ms, transisi dasar 240 ms, reveal 360 ms dan overlay 180 ms memakai token bersama. Slide Tabs memakai spring bersama. Elemen noninteraktif tanpa hover lift. Hormati prefers-reduced-motion; taman memiliki jeda dan interaksi tidak menghalangi CTA atau scroll.

Copy akses: login wajib sebelum beraktivitas; informasi umum publik. Catatan lokal per akun tidak menjanjikan enkripsi, sinkronisasi atau akses jurnal oleh Admin.
