# Tasklist Pembangunan RUANGKISAH.ID

> **Aturan aktif versi 1.4 — persetujuan pengelola:** setiap pendaftaran publik masuk status menunggu persetujuan. Email harus diverifikasi sendiri oleh pengguna, lalu Admin/Superadmin menyetujui akun sebelum login dan aktivitas diizinkan. Persetujuan tidak mengubah verifikasi email atau memberi akses jurnal. Akun siswa lama tanpa persetujuan juga menunggu tinjauan setelah migrasi schema 2; akun pengelola lama dipertahankan agar dapat memproses antrean.

> **Target produksi versi 1.3 — 19 November 2026:** Vercel untuk frontend/API dan PostgreSQL Supabase (ref veinqenogcvmxdbefhzm) untuk akun/sesi/audit. Autentikasi tetap Better Auth dan catatan tetap lokal per akun. SQLite hanya pengembangan lokal. Migrasi dan deploy cloud dilakukan manual mengikuti [DEPLOY_VERCEL.md](./DEPLOY_VERCEL.md); hasil tes lokal tidak menyatakan cloud telah aktif.

> **Ketentuan aktif versi 1.2 — 19 November 2026:** login dengan email terverifikasi diwajibkan sebelum menggunakan Kenali Diriku, Jurnal Perasaan, Langkah Berani, Catatan Saya, contoh fiktif, atau pengelolaan data lokal. Beranda, Bantuan, Tentang, Privasi dan halaman autentikasi tetap publik. Ketentuan ini menggantikan aturan akun opsional pada versi sebelumnya. Catatan tetap lokal, dipisahkan menurut akun; tidak diunggah ke server. Catatan lama dipindahkan hanya melalui konfirmasi di Privasi.

**Versi:** 1.1 — pembaruan 19 November 2026  
**Tanggal awal:** 18 November 2026  
**Acuan:** [PRD.md](./PRD.md), [design.md](./design.md), dan [structure.md](./structure.md).  
**Stack:** React + JavaScript + Vite + React Router + CSS Modules; Express + Better Auth + PostgreSQL Supabase untuk akun server.  
**Folder aplikasi:** frontend dan backend; backend akun sudah aktif; isi refleksi tetap lokal.

## 1. Cara menggunakan tasklist

- [x] berarti ada hasil yang sudah dapat diperiksa. [ ] berarti belum selesai atau belum diverifikasi.
- Centang tugas implementasi setelah perilakunya diperiksa, bukan hanya setelah file atau tampilan tersedia.
- ID tugas dibuat tetap, misalnya T06-03; gunakan ID tersebut pada catatan revisi atau commit bila membantu.
- Jika terhambat, biarkan checkbox kosong dan catat penyebab/ketergantungannya pada bagian 22. Tugas lain yang independen tetap dapat dikerjakan.
- Bukti pengujian disimpan di docs/testing. Catat tanggal, perangkat/browser, hasil aktual, dan temuan yang belum selesai.
- P0 wajib untuk rilis awal; P1 adalah penyempurnaan opsional; P2 adalah pengembangan lanjutan. P1/P2 tidak menghalangi rilis P0.
- Dokumen ini adalah daftar pekerjaan; pembuatan tasklist tidak menjalankan instalasi, implementasi, atau deployment.

### Batas rilis awal

Siswa/siswi lintas sekolah wajib masuk untuk memakai fitur. Akun, Admin dan Superadmin termasuk cakupan aktif sesuai permintaan pengguna. Tidak ada diagnosis, skor psikologis, chat, AI, dashboard isi jurnal Guru BK, database jurnal di server, atau sinkronisasi jurnal cloud. Draf berada di memori; simpan lokal hanya atas pilihan dan konfirmasi siswa. Tidak ada pengiriman otomatis jurnal ke Guru BK.

## 2. Status awal yang terverifikasi

- [x] **T00-01** PRD.md tersedia dan menetapkan kebutuhan produk.
- [x] **T00-02** design.md tersedia dan menjabarkan arah visual, S01-S17, komponen, dialog, serta prompt Stitch.
- [x] **T00-03** structure.md tersedia dan menetapkan React berbasis JavaScript serta dua folder aplikasi utama.
- [x] **T00-04** Berkas ekspor Stitch untuk Beranda dan S02-S11 ditemukan di folder stitch_ruangkisah_platform_ui_design.
- [x] **T00-05** TASKLIST.md disusun sebagai acuan urutan pekerjaan.

Status T00-04 hanya memverifikasi keberadaan file ekspor, bukan kesesuaian desain, kelengkapan mobile, atau fungsi aplikasi. Catatan ini bersifat historis. Implementasi dan bukti terbaru tercantum pada AUDIT.md serta docs/testing/2026-11-19-verification.md.

## 3. P0 - Konfirmasi kebutuhan dan materi

**Ketergantungan:** dokumen acuan tersedia. Pekerjaan teknis boleh memakai materi draf dan data fiktif sambil menunggu review; pelibatan siswa menunggu prasyarat pilot.

- [ ] **T01-01** Tetapkan penanggung jawab produk, pengembang, penelaah materi BK, penelaah media, dan pengelola operasional platform lintas sekolah.
- [ ] **T01-02** Tinjau kebutuhan PRD dan catat keputusan terbuka Q-01 sampai Q-10 beserta pemiliknya.
- [x] **T01-03** Susun enam pertanyaan Kenali Diriku, empat prompt teks jurnal, tujuh pilihan perasaan, dan minimal enam contoh Langkah Berani dalam format konten terstruktur.
- [x] **T01-04** Tetapkan label, petunjuk, batas layanan, isi FAQ, serta naskah simpan/hapus/bantuan sesuai design.md.
- [ ] **T01-05** Minta telaah ahli materi BK; catat versi, reviewer, tanggal, temuan, dan revisi. Materi belum ditelaah tetap berlabel draf.
- [x] **T01-06** Tetapkan bantuan universal lintas sekolah: siswa dapat menemui BK masing-masing/orang dewasa tepercaya; kontak platform opsional dan tidak direkayasa.

**Selesai ketika:** materi dapat diimplementasikan tanpa mengarang identitas, kontak, instrumen skoring, atau klaim efektivitas.

## 4. P0 - Tinjau dan lengkapi hasil Stitch

**Ketergantungan:** design.md dan ekspor yang sudah tersedia. Review ini tidak mengubah ekspor asli secara diam-diam.

- [x] **T02-01** Inventarisasi seluruh screen.png, code.html, aset, dan DESIGN.md ekspor; petakan ke S01-S17 serta tandai desktop/mobile.
- [x] **T02-02** Bandingkan Beranda dan S02-S11 yang ditemukan terhadap PRD/design.md; catat perbedaan, bukan menganggap seluruhnya sudah sesuai.
- [x] **T02-03** Lengkapi layar/varian yang belum ditemukan atau belum sesuai: S12 detail/edit, S13 bantuan, S14 privasi, S15 tentang, S16 demo, dan S17 404.
- [x] **T02-04** Lengkapi versi mobile setiap komposisi unik dan menu mobile terbuka; periksa reflow pada 320 px.
- [x] **T02-05** Lengkapi dialog O01-O06 serta varian ST-01 sampai ST-14 yang relevan.
- [x] **T02-06** Koreksi fitur rekaan, cuplikan catatan di daftar, kontak palsu, klaim diagnosis, dan teks putih kecil pada denim/pistachio jika muncul.
- [x] **T02-07** Inventarisasi asal/lisensi font, ikon, dan ilustrasi; tentukan aset produksi serta pengganti untuk aset yang belum layak.
- [x] **T02-08** Catat hasil review desain dan layar yang siap diterjemahkan menjadi React. HTML hasil Stitch tetap diperlakukan sebagai bahan UI, bukan aplikasi yang sudah selesai.

**Selesai ketika:** layar/state memiliki acuan yang jelas dan perbedaan terhadap kebutuhan produk tercatat.

## 5. P0 - Siapkan proyek

**Ketergantungan:** keputusan stack dalam structure.md. Tidak perlu menunggu seluruh desain selesai.

- [x] **T03-01** Buat dua folder utama frontend dan backend sesuai structure.md.
- [x] **T03-02** Inisialisasi frontend menggunakan React + JavaScript + Vite; gunakan .jsx untuk komponen dan .js untuk logika.
- [x] **T03-03** Bangun backend akun Express + Better Auth + SQLite, middleware keamanan, API admin, bootstrap pengelola, dan dokumentasi.
- [x] **T03-04** Pasang dependency dan simpan lockfile; Node >=24.15.0. Folder belum berupa repositori Git sehingga tidak mengklaim commit telah dibuat.
- [x] **T03-05** Siapkan struktur app, components, features, pages, content, config, data, styles, assets, dan tests.
- [x] **T03-06** Atur alias @, ESLint, Prettier, Vitest/jsdom, React Testing Library, dan Playwright; pisahkan penemuan tes unit/integration dari e2e.
- [x] **T03-07** Siapkan script dev, build, preview, lint, format:check, test, test:run, dan test:e2e.
- [x] **T03-08** Siapkan README, .gitignore, .node-version, dan .env.example jika konfigurasi publik diperlukan; jangan memasukkan secret ke frontend.

**Selesai ketika:** frontend dapat dijalankan dan dibuild, konfigurasi dasar bekerja, dan folder backend memiliki status yang jelas.

## 6. P0 - Bangun sistem visual dan komponen bersama

**Ketergantungan:** T03 dan acuan visual yang telah ditinjau pada T02.

- [x] **T04-01** Buat token warna, tipografi Manrope lokal, spacing, radius, breakpoint, dan gaya global dari design.md.
- [x] **T04-02** Buat Header, MobileMenu, Footer, PageContainer, dan pola navigasi aktif; bantuan selalu dapat ditemukan.
- [x] **T04-03** Buat Button, Field/Textarea, TextLink, Chip, Notice, dan EmptyState dengan state default/focus/invalid/disabled/pending.
- [x] **T04-04** Buat Dialog bersama dengan pengelolaan fokus, tombol tutup berlabel, pembatalan, dan pengembalian fokus ke pemicu.
- [x] **T04-05** Buat ActivityCard, StepIndicator, SummaryBlock, StorageNotice, RecordRow, GoalStatus, FAQAccordion, dan DemoBanner.
- [x] **T04-06** Periksa C-01 sampai C-16 terhadap design.md; pastikan gaya terisolasi melalui CSS Modules dan token dipakai konsisten.
- [x] **T04-07** Terapkan reduced motion, area sentuh, kontras, label persisten, dan gaya fokus sebelum komponen dipakai di semua modul.

**Selesai ketika:** komponen dapat digunakan ulang tanpa menggandakan perilaku dasar atau menyisipkan akses storage langsung.

## 7. P0 - Routing dan halaman umum

**Ketergantungan:** shell dan navigasi T04.

- [x] **T05-01** Daftarkan delapan route PRD dan fallback 404 menggunakan React Router.
- [x] **T05-02** Bangun Beranda S01: pemberitahuan login wajib, hero, tiga aktivitas, cara pakai, panel data, dan bantuan.
- [x] **T05-03** Bangun Tentang & Cara Pakai S15 dan halaman tidak ditemukan S17.
- [x] **T05-04** Hubungkan CTA/menu/footer ke tujuan yang benar; jangan membuat tombol inti yang tidak berfungsi.
- [x] **T05-05** Atur judul tab generik, fokus setelah navigasi, dan posisi scroll tanpa membawa isi/ID catatan ke URL.
- [x] **T05-06** Siapkan pemberitahuan bahwa draf sementara dapat hilang saat refresh; akses bantuan tidak diblokir popup awal.

**Selesai ketika:** pengguna dapat menavigasi halaman umum tanpa login dan seluruh jalur utama tersedia.

## 8. P0 - Lapisan data dan penyimpanan lokal

**Ketergantungan:** struktur proyek T03; harus siap sebelum tombol simpan modul dihubungkan.

- [x] **T06-01** Definisikan LocalDocument, metadata record, SelfReflection, FeelingJournal, CourageGoal, serta versi skema mengikuti PRD.
- [x] **T06-02** Implementasikan validasi baca/tulis: bentuk data, enum, tanggal, batas karakter, maksimal 50 item per jenis, dan ukuran serialisasi maksimal 1 MiB.
- [x] **T06-03** Implementasikan localStorageAdapter untuk key akun ruangkisah:account:<id>:data:v1; key lama hanya untuk pemindahan terkonfirmasi; tangani storage ditolak/penuh dan kegagalan hapus.
- [x] **T06-04** Implementasikan memoryAdapter terpisah untuk contoh fiktif dan simulasi demo.
- [x] **T06-05** Implementasikan recordsRepository untuk baca, buat, edit ID yang sama, hapus satu, dan hapus semua key milik aplikasi.
- [x] **T06-06** Terapkan metadata persetujuan lokal, versi konten, revisi, dan waktu perubahan; simpan hanya setelah konfirmasi.
- [x] **T06-07** Pastikan draf baru hanya berada di memori dan tidak menggunakan penyimpanan browser persisten, URL, atau server.
- [x] **T06-08** Serialisasikan penulisan melalui Web Locks atau transaksi readwrite IndexedDB kosong; bila keduanya tidak tersedia, tolak penulisan sambil mempertahankan draf. Uji dua tab nyata tersedia.
- [x] **T06-09** Tangani JSON rusak/versi tidak didukung tanpa overwrite otomatis; reset membutuhkan konfirmasi.
- [x] **T06-10** Sinkronkan perubahan/hapus antar tab dan bersihkan state detail terkait; cegah pemulihan item terhapus secara tidak sengaja.
- [x] **T06-11** Uji perilaku data berisiko sebelum integrasi form: simpan gagal, batal simpan, klik berulang, edit, hapus, konflik, dan isolasi adapter.

**Selesai ketika:** satu jalur data tervalidasi dapat dipakai semua modul dan kegagalan tidak menghasilkan status sukses palsu.

## 9. P0 - Kenali Diriku

**Acuan:** FR-02; S02-S04. **Ketergantungan:** T01, T04, T06.

- [x] **T07-01** Bangun pengantar, enam langkah pertanyaan, estimasi durasi, dan petunjuk boleh melewati.
- [x] **T07-02** Implementasikan input opsional maksimal 1.000 karakter per jawaban serta counter dan error tanpa memotong isi diam-diam.
- [x] **T07-03** Hubungkan Sebelumnya/Berikutnya/Lewati; pertahankan draf selama aktivitas masih aktif.
- [x] **T07-04** Bangun rangkuman dari jawaban sendiri; kosong menjadi Belum diisi; seluruh jawaban kosong tidak menghasilkan profil atau rangkuman rekaan.
- [x] **T07-05** Hubungkan Ubah jawaban, Simpan di perangkat ini, dan Akhiri tanpa menyimpan; pilihan tanpa simpan tetap jelas.
- [x] **T07-06** Verifikasi tidak ada skor, tipe kepribadian, diagnosis, atau interpretasi AI.

**Selesai ketika:** siswa dapat mengisi sebagian pertanyaan, melihat rangkuman, lalu memilih menyimpan atau mengakhiri tanpa data persisten.

## 10. P0 - Jurnal Perasaan

**Acuan:** FR-03; S05-S06. **Ketergantungan:** T01, T04, T06.

- [x] **T08-01** Buat tanggal jurnal lokal, tujuh chip perasaan multi-select, dan empat field refleksi opsional.
- [x] **T08-02** Terapkan validasi: tanggal masa depan ditolak, minimal satu perasaan/teks untuk rangkuman, total teks maksimal 5.000 karakter.
- [x] **T08-03** Buat rangkuman tanggal, perasaan, dan jawaban tanpa skoring atau analisis emosi.
- [x] **T08-04** Hubungkan edit, konfirmasi simpan lokal, pembatalan, dan akhiri tanpa menyimpan.
- [x] **T08-05** Verifikasi chip selected dengan aria-pressed/indikator centang, bahasa emosi netral, reflow dan alur jurnal pada emulasi mobile. Kenyamanan perangkat fisik tetap T14-04.

**Selesai ketika:** jurnal dapat digunakan tanpa penyimpanan maupun disimpan secara eksplisit tanpa kehilangan isi saat validasi gagal.

## 11. P0 - Langkah Berani

**Acuan:** FR-04; S07-S09. **Ketergantungan:** T01, T04, T06.

- [x] **T09-01** Buat halaman pengantar dan minimal enam contoh latihan dengan aksi Pakai contoh ini serta Buat target sendiri.
- [x] **T09-02** Bangun form: judul wajib 1-120 karakter, langkah pertama wajib maksimal 500, alasan/dukungan opsional maksimal 500, tanggal target opsional.
- [x] **T09-03** Implementasikan Tinjau target sebagai state sementara; memilih contoh/tinjau tidak otomatis menyimpan.
- [x] **T09-04** Buat detail target dengan status Direncanakan, Sedang dicoba, Selesai dicoba, dan Ditunda yang dipilih pengguna.
- [x] **T09-05** Tambahkan refleksi setelah mencoba maksimal 1.000 karakter; pesan telah mencoba hanya mengikuti status yang dipilih.
- [x] **T09-06** Hubungkan simpan, simpan perubahan, batal mengubah, penjadwalan ulang, dan hapus dengan ID yang sama.
- [x] **T09-07** Pastikan tanggal lewat/target ditunda tidak memunculkan label gagal, hukuman, streak, atau peringkat.

**Selesai ketika:** target dapat dibuat, ditinjau, disimpan, dibuka kembali, diperbarui, dan dihapus sesuai pilihan siswa.

## 12. P0 - Catatan Saya

**Acuan:** FR-07; S10-S12. **Ketergantungan:** T06 dan integrasi record T07-T09.

- [x] **T10-01** Buat state kosong dan daftar tiga jenis catatan, diurutkan berdasarkan perubahan terbaru.
- [x] **T10-02** Batasi isi daftar pada jenis modul, tanggal, dan Buka catatan; sembunyikan cuplikan, perasaan, judul/status target, serta identitas.
- [x] **T10-03** Bangun detail dan edit menggunakan komponen modul terkait; tampilkan status lokal serta perubahan belum disimpan dengan benar.
- [x] **T10-04** Hubungkan batal edit ke versi tersimpan, simpan perubahan melalui konfirmasi, dan hapus satu melalui O03.
- [x] **T10-05** Pastikan reload membuka daftar aman, item tidak diduplikasi saat edit, dan tidak ada janji sinkronisasi/pemulihan cloud.

**Selesai ketika:** catatan yang sengaja disimpan dapat dikendalikan pengguna tanpa mengekspos isinya pada daftar.

## 13. P0 - Pusat Bantuan dan Privasi

**Acuan:** FR-05, FR-06, FR-08; S13-S14.

- [x] **T11-01** Bangun Pusat Bantuan, FAQ, batas layanan, dan penjelasan bahwa Guru BK tidak otomatis membaca jurnal.
- [x] **T11-02** Hubungkan helpConfig.js untuk kanal opsional; default menampilkan bantuan universal lintas sekolah tanpa kontak palsu.
- [x] **T11-03** Terapkan O05 sebelum membuka WhatsApp/email; jelaskan pengungkapan nomor/alamat email dan kebijakan kanal luar.
- [x] **T11-04** Pastikan kanal luar tidak menerima jurnal, perasaan, ID catatan, atau identitas otomatis; klik tidak mengirim pesan.
- [x] **T11-05** Bangun Privasi & Data: sementara/lokal, akses perangkat bersama, retensi, hapus, kanal luar, dan log teknis hosting.
- [x] **T11-06** Hubungkan hapus semua melalui O04; hapus hanya data aplikasi, verifikasi hasil, dan sediakan state tidak ada data/gagal hapus.
- [x] **T11-07** Verifikasi semua halaman utama menyediakan jalan ke Bantuan dan Privasi, serta tidak menjanjikan layanan 24 jam/anonim lintas kanal.

**Selesai ketika:** siswa memahami pilihan data dan memiliki rujukan bantuan yang jujur serta dapat digunakan.

## 14. P0 - Mode demonstrasi

**Acuan:** FR-09; S16. **Ketergantungan:** memoryAdapter T06 dan komponen modul.

- [x] **T12-01** Buat fixture fiktif, DemoProvider, akses Lihat contoh fiktif, dan banner Contoh fiktif - bukan data siswa.
- [x] **T12-02** Pisahkan demo dari repository pribadi; alur simpan berlabel simulasi dan tidak menulis/membaca catatan lokal.
- [x] **T12-03** Nonaktifkan kontak demo dan pastikan keluar contoh membersihkan state demo tanpa mengubah data pribadi.
- [x] **T12-04** Verifikasi membuka Catatan Saya pribadi memerlukan aksi eksplisit setelah keluar demo.

**Selesai ketika:** demonstrasi dapat dilakukan tanpa menggunakan atau mengubah catatan siswa nyata.

## 15. P0 - Integrasi alur, dialog, dan kegagalan

**Ketergantungan:** seluruh modul terkait.

- [x] **T13-01** Hubungkan O01 simpan awal/perubahan dan pastikan pembatalan tidak menulis data.
- [x] **T13-02** Hubungkan O02 saat meninggalkan draf/edit; pilihan tetap mengisi menjaga draf, keluar membuang hanya perubahan yang sesuai.
- [x] **T13-03** Hubungkan O03-O06 dan state berhasil/gagal sesuai hasil operasi nyata.
- [x] **T13-04** Lengkapi ST-01 sampai ST-14: kosong, sementara, invalid, pending, sukses, gagal storage/hapus, konflik tab, satu tab penulis, hapus lintas tab, kontak kosong, jaringan kanal luar, akhiri, batas data.
- [x] **T13-05** Cegah data yang sudah diakhiri/dihapus muncul lagi lewat browser back/forward atau cache state halaman.
- [x] **T13-06** Tinjau alur error penuh menuju Catatan Saya agar navigasi tidak membuang draf tanpa peringatan.
- [x] **T13-07** Bersihkan dependency/skrip eksternal yang tidak perlu; tidak ada telemetry, error log, URL, atau request yang membawa isian.
- [x] **T13-08** Pastikan input HTML/skrip ditampilkan sebagai teks; sediakan fallback informasi statis bila JavaScript gagal/tidak aktif.

**Selesai ketika:** seluruh alur terhubung, batas data sesuai janji UI, dan kegagalan tidak menghilangkan data diam-diam.

## 16. P0 - Checklist penerimaan dan kualitas

Setiap butir AT merujuk kasus lengkap pada PRD bagian 19.1. Gunakan data fiktif; catat hasil dan bukti aktual. Checkbox pengujian tetap kosong sampai pemeriksaan dilaksanakan.

- [x] **AT-01** URL seluruh modul memerlukan sesi valid; login kembali ke fitur tujuan; informasi umum tetap publik.
- [x] **AT-02** Jawaban sebagian/dilewati menghasilkan rangkuman yang benar; seluruhnya kosong ditangani.
- [x] **AT-03** Draf tanpa simpan tidak masuk storage/jaringan dan bersih setelah akhiri/refresh.
- [x] **AT-04** Simpan terkonfirmasi bertahan setelah reload dengan satu ID/item.
- [x] **AT-05** Batal simpan tidak menulis; klik berulang tidak membuat duplikat.
- [x] **AT-06** Siklus target buat/buka/edit/status/tunda bekerja memakai ID sama.
- [x] **AT-07** Hapus satu dan hapus semua tetap berlaku setelah reload.
- [x] **AT-08** Storage ditolak/penuh mempertahankan draf dan tidak mengaku berhasil.
- [x] **AT-09** JSON rusak/versi asing tidak crash/ditimpa; reset dikonfirmasi.
- [x] **AT-10** Uji kontak kosong/demo dan konfigurasi fiktif kanal email: O05 batal/lanjut tanpa lampiran jurnal. Kontak platform nyata belum disediakan dan tidak dinyatakan terverifikasi.
- [x] **AT-11** Kanal luar bebas isian/ID catatan dan tidak mengirim pesan otomatis.
- [x] **AT-12** Uji keyboard, fokus dialog/menu, label, kontras otomatis Axe dan layout 320–1440 px. Pembaca layar/perangkat fisik tetap T14-03/04.
- [x] **AT-13** Input HTML/skrip tidak dieksekusi.
- [x] **AT-14** Demo terisolasi dari catatan lokal pribadi.
- [x] **AT-15** Konflik edit/hapus pada dua tab ditangani tanpa overwrite diam-diam.
- [ ] **AT-16** Route langsung dan refresh lulus pada server Express lokal. Verifikasi ulang origin hosting publik menunggu domain/hosting.
- [x] **AT-17** Navigasi dengan draf menampilkan pilihan dan mempertahankan/membuang draf sesuai aksi.
- [x] **AT-18** Back/forward setelah hapus/akhiri tidak memunculkan ulang isi yang dibersihkan.
- [x] **AT-19** Performa build produksi diukur pada profil perangkat/jaringan yang dicatat.
- [x] **AT-20** Spasi kosong, batas karakter/tanggal/jumlah/ukuran data ditangani tanpa pemotongan diam-diam.

### Pemeriksaan pendukung

- [x] **T14-01** Jalankan lint, format:check, test:run, build, dan test:e2e yang relevan; catat hasil tanpa menganggap perintah belum dijalankan sebagai lulus.
- [ ] **T14-02** Reflow 320, 375/390, 768, 1024, 1440 px teruji otomatis. Perilaku keyboard virtual perangkat fisik belum diverifikasi.
- [ ] **T14-03** Periksa keyboard, screen reader, zoom 200%, reflow 320 px, reduced motion, serta area sentuh dan kontras.
- [ ] **T14-04** Uji Chrome Android, Safari iOS, serta Chrome/Edge desktop yang tersedia; catat versi dan pisahkan hasil emulasi dari perangkat nyata.
- [x] **T14-05** Ukur performa minimal tiga kali pada profil tercatat; bandingkan target PRD, termasuk LCP <= 2,5 detik dan CLS <= 0,1.
- [x] **T14-06** Periksa request jaringan memakai marker fiktif unik; pastikan jawaban/ID catatan tidak keluar.
- [x] **T14-07** Dokumentasikan temuan dan perbaikannya pada AUDIT.md; pisahkan hasil teknis dari verifikasi manusia dan publikasi yang belum tersedia.

**Selesai ketika:** seluruh kasus P0 yang berlaku lulus dan bukti pengujian beserta keterbatasannya tersedia.

## 17. P0 - Validasi ahli dan uji pengguna terbatas

**Prasyarat:** materi ditelaah, fungsi teknis siap, dan izin/persetujuan peserta dan wali/institusi yang relevan dipenuhi. Jika belum, lanjutkan demonstrasi fiktif dan pekerjaan teknis yang independen.

- [ ] **T15-01** Tetapkan peserta lintas sekolah, jumlah peserta, jadwal, perangkat, fasilitator, serta izin/persetujuan yang diperlukan.
- [ ] **T15-02** Tetapkan instrumen dan ambang kelayakan bersama dosen/Guru BK sebelum pengambilan data; gunakan usulan PRD sebagai dasar diskusi.
- [ ] **T15-03** Laksanakan analisis kebutuhan dan review ahli materi/media sesuai rencana; jangan menyatakan hasil yang belum dikumpulkan.
- [ ] **T15-04** Laksanakan tugas uji terbatas PRD: refleksi sebagian, tanpa simpan, jurnal simpan/buka/hapus, status target, bantuan, dan pemahaman privasi.
- [ ] **T15-05** Catat keberhasilan tugas, waktu, respons angket, dan komentar tanpa mengambil isi jurnal pribadi; laporkan n/N, respons valid, dan keterbatasan sampel.
- [ ] **T15-06** Revisi berdasarkan temuan, uji ulang, dan rangkum penilaian kelayakan awal tanpa klaim peningkatan psikologis yang belum terbukti.

**Selesai ketika:** hasil evaluasi dan revisi dapat ditinjau, atau keterbatasan tahap evaluasi didokumentasikan secara jujur. Rilis pilot tetap mengikuti seluruh prasyaratnya.

## 18. P0 - Persiapan publikasi dan serah terima

**Ketergantungan:** fitur dan uji teknis siap; penggunaan oleh siswa mengikuti prasyarat T15. Preview demonstrasi fiktif dapat disiapkan lebih awal.

- [ ] **T16-01** Tetapkan penyedia hosting, domain bila diperlukan, biaya, akses pengelola, dan penanggung jawab pemeliharaan.
- [ ] **T16-02** Periksa kebijakan log teknis hosting dan sesuaikan informasi privasi; tidak memasang analitik pengumpulan isian.
- [ ] **T16-03** Build produksi, SPA fallback, header keamanan dan Docker/Compose/Caddy telah disiapkan. Build container serta HTTPS domain publik belum dijalankan.
- [ ] **T16-04** Publikasikan preview berlabel demonstrasi dengan data fiktif; verifikasi tampilan, route langsung, storage, dan penghapusan pada origin target.
- [ ] **T16-05** Verifikasi materi final dan identitas pengelola sebelum penggunaan publik yang diklaim tervalidasi; kontak satu sekolah tidak menjadi syarat platform. Kanal opsional harus diperiksa bila diaktifkan.
- [x] **T16-06** Dokumentasikan versi aplikasi/konten/skema, catatan rilis, keterbatasan dan rollback kompatibel pada docs/CHANGELOG.md dan panduan deployment.
- [x] **T16-07** Lengkapi README root/frontend/backend, cara menjalankan, bootstrap, email lokal, panduan siswa/pendamping dan deployment.
- [ ] **T16-08** Tetapkan jadwal pemeriksaan kontak/materi dan penanganan bug; backup kode/konten tidak disebut sebagai backup jurnal siswa.
- [ ] **T16-09** Cocokkan seluruh Definition of Done PRD sebelum menyatakan rilis awal/pilot siap.

**Selesai ketika:** build yang dipublikasikan sudah diperiksa pada lingkungan target dan pengelola memahami penggunaan serta batas produknya.

## 19. Milestone dan urutan lima minggu

Minggu adalah rencana relatif, mengikuti PRD; bukan tanggal tenggat yang sudah disepakati. Satu penanggung jawab dapat merangkap peran.

| Minggu | Fokus                                                     | Kelompok tugas              | Bukti keluar tahap                                                      |
| ------ | --------------------------------------------------------- | --------------------------- | ----------------------------------------------------------------------- |
| 1      | Kebutuhan, materi, izin, dan persiapan                    | T01; awal T02/T03           | Keputusan tercatat, draf konten, instrumen/izin disiapkan               |
| 2      | Review desain, struktur, komponen, dan data               | T02-T06                     | UI terpetakan, shell siap, kontrak serta operasi data dasar teruji      |
| 3      | Fitur inti dan integrasi                                  | T07-T13                     | Refleksi, jurnal, target, catatan, bantuan, privasi, dan demo berfungsi |
| 4      | Pengujian dan evaluasi terbatas                           | AT-01 sampai AT-20; T14-T15 | Hasil uji, temuan, dan prioritas revisi                                 |
| 5      | Revisi, uji ulang, dokumentasi, dan rilis sesuai kesiapan | Sisa T14-T16                | Prototipe revisi, laporan, panduan, dan keputusan kelayakan             |

Urutan dependensi utama:

```text
T01 materi --------> T07/T08/T09 modul
T02 desain --------> T04 komponen -> T05 halaman/routing
T03 setup ---------> T04 komponen + T06 lapisan data
T06 data ----------> simpan/edit/hapus T07-T12
Modul + halaman ---> T13 integrasi -> AT/T14 verifikasi
Izin + materi + verifikasi --------> T15 uji terbatas
Kesiapan rilis + hasil evaluasi ---> T16 pilot/serah terima
```

Prasyarat kontak, izin peserta, dan materi tidak boleh dianggap selesai karena waktu berlalu. Keterlambatan tersebut tidak menghalangi pembangunan dengan data fiktif.

## 20. P1 - Penyempurnaan opsional

Kerjakan setelah P0 dan perbaikan hasil uji selesai; bukan syarat rilis awal.

- [x] **P1-01** Tambahkan filter metadata jenis/tanggal pada Catatan Saya tanpa menampilkan cuplikan pribadi; edit target mempertahankan ID teruji.
- [ ] **P1-02** Tambahkan materi pendek yang relevan jika sudah ditelaah ahli materi.
- [ ] **P1-03** Sempurnakan bahasa, navigasi, dan keterbacaan berdasarkan temuan penggunaan yang nyata.

## 21. Backend aktif dan roadmap lanjutan

P2-01 sampai P2-04 dipromosikan menjadi cakupan aktif dan selesai secara lokal. P2-05/06 tetap roadmap; akun tidak otomatis mengaktifkan unggah jurnal atau konsultasi.

- [x] **P2-01** Pilih backend akun dan pengelolaan akun sebagai cakupan aktif. Konsultasi tetap roadmap terpisah; lihat docs/DECISIONS.md.
- [x] **P2-02** Implementasikan Node.js + Express berbasis JavaScript, konfigurasi, middleware, API dan tes backend.
- [x] **P2-03** Sediakan GET /api/health tanpa data pribadi; refleksi mandiri tetap dapat dipakai tanpa sesi.
- [x] **P2-04** Implementasikan database akun, autentikasi, otorisasi, sesi HttpOnly, retensi audit 180 hari, pencabutan sesi dan penghapusan akun.
- [ ] **P2-05** Rancang akun/sinkronisasi hanya jika dipilih; migrasi catatan lokal memerlukan pilihan eksplisit, tanpa unggah otomatis.
- [ ] **P2-06** Rancang konsultasi/dashboard Guru BK hanya setelah tata kelola dan izin akses per data ditetapkan.

## 22. Catatan pekerjaan dan hambatan

Entri 18 November adalah riwayat awal. Status terbaru dan batas verifikasi mengikuti entri 19 November serta AUDIT.md.

| Tanggal    | ID tugas                                    | Penanggung jawab    | Status aktual                                                            | Bukti/hasil                                                                                                              | Hambatan atau langkah berikutnya                                                                                                                                                                                                 |
| ---------- | ------------------------------------------- | ------------------- | ------------------------------------------------------------------------ | ------------------------------------------------------------------------------------------------------------------------ | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| 2026-11-18 | T01-03..04, T02-01..03/05..08, T03..T13     | Pengembang          | Implementasi frontend P0 selesai & terverifikasi lokal                   | `npm run lint` (0 error), `npm run format:check` lulus, `npm run test:run` (3 file, 10 tes lulus), `npm run build` lulus | `npm run test:e2e` belum jalan karena browser Playwright belum terpasang (`npx playwright install`); T01-01/02/05/06, AT-01..20, T14, T15, dan T16 menunggu uji E2E/perangkat nyata, telaah ahli BK, kontak sekolah, dan hosting |
| 2026-11-19 | T03/T06/AT, AUTH/UI/QA/OPS, P1-01/P2-01..04 | Implementasi teknis | Lulus lokal: 18 tes frontend, 4 backend, 22 E2E; lint/format/build lulus | docs/testing/2026-11-19-verification.md; AUDIT.md                                                                        | Review BK, uji siswa/perangkat fisik, SMTP/domain/hosting dan penanggung jawab operasional masih memerlukan pihak/data nyata                                                                                                     |

### Syarat menyatakan proyek selesai untuk rilis awal

- [ ] **DONE-01** Seluruh tugas P0 untuk rilis awal selesai; preview demonstrasi yang belum memenuhi prasyarat pilot tetap diberi label demonstrasi dan tidak dinyatakan sebagai rilis pilot.
- [ ] **DONE-02** Semua AT yang berlaku lulus dan tidak ada temuan kritis/tinggi terbuka.
- [x] **DONE-03** Alur tanpa simpan, simpan, edit ID sama, hapus satu/semua, konflik tab dan isolasi demo teruji lokal.
- [x] **DONE-04** Pengujian marker jaringan dan privasi lokal lulus; kontak tidak direkayasa dan kanal tidak mengirim pesan otomatis.
- [ ] **DONE-05** Materi, izin penggunaan, evaluasi, dokumentasi, dan penanggung jawab memenuhi tahap rilis yang dinyatakan.
- [x] **DONE-06** Implementasi React berbasis JavaScript; cakupan akun diselaraskan dengan PRD 1.2, jurnal cloud/chat tetap roadmap.

## 23. Akun server dan penyempurnaan aktif — 19 November 2026

- [x] **AUTH-01** Pendaftaran email dan persetujuan; verifikasi bertoken tanpa bypass UI; role siswa ditentukan server.
- [x] **AUTH-02** Login/logout, cookie HttpOnly, sesi kedaluwarsa, guard aktif/terverifikasi, origin/CSRF dan pembatasan request.
- [x] **AUTH-03** Reset email netral, token sekali pakai, perubahan kata sandi dan pencabutan sesi lama.
- [x] **AUTH-04** Admin mengelola siswa; Superadmin mengelola siswa/Admin; lindungi diri dan Superadmin dari penghapusan/perubahan role.
- [x] **AUTH-05** Audit pengelolaan, retensi 180 hari, bootstrap privat tanpa credential bawaan.
- [x] **AUTH-06** Outbox privat pengembangan dan adaptor SMTP produksi; tes tautan email nyata dari outbox lokal.
- [ ] **AUTH-07** Konfigurasikan SMTP milik pengelola dan verifikasi pengiriman email produksi ke kotak masuk nyata.
- [x] **UI-01** Transisi halaman, reveal, tombol, FAQ, langkah refleksi, menu dan dialog dengan animasi masuk/keluar serta reduced motion.
- [x] **UI-02** Pisahkan context/provider dan layout/router; lint tanpa warning; optimalkan font Latin lokal.
- [x] **QA-01** Tes API server, tes React, E2E Chromium, Firefox dan WebKit mobile; hasil aktual di laporan verifikasi.
- [x] **OPS-01** Siapkan Dockerfile, Compose, Caddy dan workflow CI. Artefak tersedia; eksekusi container/CI remote belum diverifikasi.

Yang masih kosong memerlukan pengelola, layanan eksternal, reviewer atau peserta/perangkat nyata. Tugas roadmap P2-05/06 bukan kekurangan implementasi cakupan aktif.

## 24. Penyelarasan UI dan login wajib — versi 1.2

Implementasi dan hasil aktual tiap temuan UI-01..UI-13 mengikuti UI_AUDIT.md. Kebijakan AT-01 sekarang memverifikasi bahwa guest dibatasi dan login melanjutkan ke fitur tujuan. Akun tidak lagi opsional untuk aktivitas. Prasyarat eksternal seperti SMTP/domain/hosting, penelaah materi serta perangkat fisik tetap mengikuti status sebelumnya.

- [x] **V12-01** Lindungi empat route aktivitas; lanjutkan tujuan login dan demo fiktif; informasi umum tetap publik.
- [x] **V12-02** Pisahkan catatan per akun; bersihkan draf saat ganti akun/keluar; validasi sesi ulang dan respons sesi terlambat.
- [x] **V12-03** Pemindahan catatan lama dengan konfirmasi, validasi, tanpa overwrite dan tanpa kehilangan sumber bila storage penuh.
- [x] **V12-04** Selesaikan UI-01..UI-13: kartu riwayat mobile, fokus, selected, tipe, jarak, kontrol, warna, form, notice, empty, copy, status dan motion.
- [x] **V12-05** Perbaiki breakpoint WebKit dan muat halaman sesuai kebutuhan untuk mengurangi kode awal.
- [x] **V12-06** Lint/format/build lulus; 22 tes frontend, 4 backend, 39 E2E lulus; 52 snapshot ulang tanpa error/overflow dokumen.
- [x] **V12-07** Tiga cold load lab: median LCP 1.944 ms dan CLS 0,00074; perangkat fisik tetap belum terverifikasi.
- [x] **V12-08** Perbarui kebutuhan/desain/struktur/tasklist/audit/README/keputusan/rilis dan arsip bukti sebelum/sesudah.

Bukti: [verifikasi versi 1.2](./docs/testing/2026-11-19-ui-login-verification.md), [penyelesaian audit UI](./UI_AUDIT.md).

## 25. Penyesuaian Vercel + Supabase — versi 1.3

- [x] **DEP-01** Adapter async Kysely/pg dengan schema privat, TLS terverifikasi, pool kecil dan siklus koneksi Vercel; SQLite tetap lokal.
- [x] **DEP-02** Migrasi eksplisit dan idempotent, indeks cleanup, RLS/revoke browser dan role runtime terbatas.
- [x] **DEP-03** API entry Vercel dan inisialisasi bersama; routing SPA/API, cache/header keamanan, template environment produksi.
- [x] **DEP-04** Rate limit UPSERT atomik untuk auth/API dibagikan antar-instance; transaksi admin mengunci ulang actor/target.
- [x] **DEP-05** Import SQLite opsional tanpa overwrite, ID/hash dipertahankan, sumber read-only, sesi/token tidak dipindah.
- [x] **DEP-06** Script bootstrap/runtime, panduan deploy manual dan CI PostgreSQL/E2E.
- [ ] **DEP-07** Jalankan migrasi pada Supabase veinqenogcvmxdbefhzm dengan akses administratif yang benar.
- [ ] **DEP-08** Konfigurasi SMTP/credential/domain, deploy manual Vercel dan smoke test HTTPS nyata.

Pengguna meminta langkah deployment Vercel saja, tanpa deployment otomatis. Koneksi MCP saat pengerjaan tidak memiliki izin terhadap proyek yang diberikan; database cloud tidak diubah. Bukti tes lokal terbaru di docs/testing/2026-11-19-vercel-supabase-verification.md.

## 26. Persetujuan akun oleh pengelola — versi 1.4

- [x] **APP-01** Status persetujuan terpisah dari email dan status aktif; paksa pending pada signup serta larang pengubahan dari client.
- [x] **APP-02** Guard sesi/API/client memerlukan akun aktif, email terverifikasi dan persetujuan. Reset, aktivasi atau role tidak melewati gate.
- [x] **APP-03** Endpoint persetujuan dengan batas Admin/Superadmin, pemeriksaan transaksi, konfirmasi UI dan audit tepat satu kali.
- [x] **APP-04** Antrean pengelola, jumlah permintaan, pencarian/pagination/refresh, detail dan hapus; pesan pendaftaran/Login/FAQ/Privasi diselaraskan.
- [x] **APP-05** Migrasi schema 2: pengelola lama tetap dapat masuk; siswa tanpa persetujuan menunggu, sesi dicabut tanpa menghapus akun/jurnal; migrasi ulang aman.
- [x] **APP-06** Sesuaikan bootstrap/import/fixture dan dokumentasi deploy manual. Backend lokal diperbarui setelah backup privat.
- [ ] **APP-07** Terapkan db:migrate schema 2 pada Supabase dan deploy Vercel secara manual, lalu periksa alur email/persetujuan pada domain nyata.

Bukti lokal mengikuti docs/testing/2026-11-19-account-approval-verification.md. Penerapan cloud tetap dilakukan manual; tes lokal tidak menggantikannya.
