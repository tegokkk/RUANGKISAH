# Keputusan produk dan teknis - 19 November 2026

| ID  | Keputusan                                               | Dasar/implikasi                                                                                          |
| --- | ------------------------------------------------------- | -------------------------------------------------------------------------------------------------------- |
| D01 | Pengguna siswa/siswi lintas sekolah                     | Klarifikasi langsung pengguna; tidak ada sekolah wajib pada pendaftaran atau pemisahan tenant sekolah    |
| D02 | Akun dan Admin/Superadmin masuk cakupan aktif           | Permintaan akun/admin dan instruksi menyelesaikan temuan audit                                           |
| D03 | Digantikan D14 pada versi 1.2                           | Kebijakan akun opsional tidak lagi berlaku untuk fitur                                                   |
| D04 | Akun server, jurnal lokal                               | Express + Better Auth + SQLite; pengelola tidak memiliki API untuk isi jurnal                            |
| D05 | Email verifikasi/reset nyata melalui SMTP saat produksi | Outbox privat untuk pengembangan; tidak ada bypass verifikasi di UI                                      |
| D06 | Tidak ada credential pengelola bawaan                   | CLI bootstrap satu kali; credential ditentukan pengelola                                                 |
| D07 | Web Locks atau koordinasi transaksi IDB                 | Store koordinasi kosong; bila koordinasi gagal, penulisan ditolak; draf tidak dimasukkan ke IDB          |
| D08 | Kontak satu sekolah tidak diperlukan                    | Fallback bantuan universal; kanal platform tambahan hanya setelah terverifikasi                          |
| D09 | Deployment satu instance dengan volume SQLite           | Docker/Compose + Caddy disiapkan; hosting/domain/SMTP belum disediakan                                   |
| D10 | Validasi manusia tidak dipalsukan                       | Review ahli, uji siswa dan perangkat fisik dicatat terpisah dari tes otomatis                            |
| D11 | Sinkronisasi jurnal/chat tidak otomatis ditambahkan     | Tetap roadmap; bukan bagian yang diaktifkan hanya karena akun sudah ada                                  |
| D12 | Audit account 180 hari                                  | Pembersihan pada startup/permintaan; sesi/token kedaluwarsa dibersihkan; kebijakan dijelaskan di Privasi |
| D13 | Filter metadata dipilih                                 | Jenis/tanggal tanpa cuplikan isi atau pencarian jurnal                                                   |

Pemilik produk adalah penggagas/pengguna yang memberikan instruksi proyek. Nama pengelola operasional, reviewer BK, dan peserta uji belum diberikan; tidak dicatat sebagai orang nyata yang sudah menyetujui produk. Materi awal tetap draft.

## Keputusan versi 1.2

- D14: Login dengan akun terverifikasi wajib untuk memakai aktivitas, catatan, contoh fiktif dan kelola data lokal; halaman informasi tetap publik.
- D15: Penyimpanan lokal dipisahkan berdasarkan ID akun; tidak ada unggah jurnal otomatis. Pergantian sesi membersihkan state fitur.
- D16: Catatan versi lama tetap dipertahankan sampai pengguna mengonfirmasi pemindahan ke akun kosong. Sumber dihapus hanya setelah salinan baru berhasil; tidak overwrite otomatis.
- D17: Pertahankan taman interaktif dan Slide Tabs. Gunakan token judul/kontrol/selected/motion, PageHeader bersama, kartu riwayat mobile, serta orientasi fokus antarstate.
- D18: Pengguna memilih Vercel + Supabase sebagai target hosting. Digantikan D19 untuk status implementasi. Pemilihan Supabase belum menetapkan pergantian autentikasi ke Supabase Auth atau unggah jurnal. Rancangan dan status mengikuti docs/deployment/README.md.

## Keputusan versi 1.3

- D19: Supabase digunakan sebagai PostgreSQL untuk Better Auth, bukan mengganti ke Supabase Auth. API tetap same-origin pada Vercel, tanpa API key database di frontend. SQLite hanya lokal; produksi menolak SQLite.
- D20: Schema privat ruangkisah dengan RLS dan role runtime terbatas; migrasi menggunakan credential admin terpisah dan tidak dijalankan pada build/request.
- D21: Rate limit disimpan atomik di database agar konsisten antar-instance. Pool runtime default satu koneksi, TLS terverifikasi dan lifecycle Vercel.
- D22: Import akun SQLite opsional mempertahankan ID/hash dan membaca sumber tanpa perubahan; tujuan harus kosong, sesi/token lama tidak dipindahkan.
- D23: Target Supabase dari pengguna veinqenogcvmxdbefhzm. Akses MCP belum mengizinkan proyek ini. Pengguna meminta deployment Vercel berupa langkah manual saja; tidak dilakukan deployment atau mutasi database cloud otomatis.

## Keputusan versi 1.4

- D24: Setiap pendaftaran publik pending; login memerlukan email verified, status enabled dan persetujuan manual Admin/Superadmin. Persetujuan akun tidak menggantikan verifikasi email atau memberi akses jurnal.
- D25: Admin menyetujui siswa; Superadmin sesuai kewenangannya. Keputusan memakai transaksi dan audit; approve ulang ditolak, aktivasi/reset/promosi bukan bypass.
- D26: Upgrade schema 2 mempertahankan akses pengelola lama; siswa lama tanpa persetujuan menjadi pending dan sesinya dicabut. ID/catatan tetap ada; migrasi ulang tidak menyetujui pendaftaran baru.
- D27: Persetujuan di panel dengan antrean, pencarian, pagination, refresh dan dialog. Tidak ditambahkan unggah identitas atau notifikasi email persetujuan otomatis.
