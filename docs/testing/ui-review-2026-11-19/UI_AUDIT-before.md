# Audit konsistensi UI RUANGKISAH.ID

**Tanggal:** 19 November 2026  
**Jenis:** analisis visual, perilaku antarmuka dan pemeriksaan source.  
**Status:** temuan dan rancangan perbaikan; UI aplikasi belum diubah dalam pekerjaan audit ini.

## Kesimpulan

Identitas dasarnya sudah menyatu: Manrope, pistachio/frost/denim/dark ink, permukaan terang, ikon garis, rounded card, dan simpan lokal yang dijelaskan kepada pengguna. Yang belum seirama terutama adalah aturan antar-komponen: navigasi aktif, ukuran kontrol, hierarki judul, ritme jarak, warna untuk aksi yang sama, dan orientasi pengguna saat berpindah state.

Dua temuan perlu didahulukan karena mengganggu penggunaan: riwayat tindakan tidak terlihat pada mobile, dan rangkuman jurnal terbuka dengan posisi scroll masih di bagian bawah.

## Cakupan dan bukti

Ditinjau **26 halaman/state pada dua viewport**, total **52 tangkapan tampilan**: desktop 1440×1000 dan ponsel emulasi 390×844. Area mencakup Beranda; Kenali Diriku/pengantar/pertanyaan; Jurnal Perasaan/form/rangkuman/dialog simpan; Langkah Berani/pengantar/form; Catatan Saya/kosong/demo/detail; Bantuan; Privasi; Tentang; Masuk; Daftar; Lupa Sandi; reset tidak valid; tidak diizinkan; 404; Akun; serta Admin/Superadmin termasuk daftar siswa, daftar pengelola dan riwayat.

- [Papan perbandingan desktop](./overview-1440.png).
- [Papan perbandingan ponsel](./overview-390.png).
- [Pengukuran DOM](./measurements.json).

Halaman akun/pengelola memakai fixture API sintetis di browser terisolasi. Tidak mengubah akun nyata. Aktivitas memakai teks fiktif dan mode demo; tidak mengonfirmasi penyimpanan jurnal. Snapshot memakai reduced motion agar perbandingan statis stabil. Analisis motion didasarkan pada konfigurasi source dan pola interaksi, bukan pengukuran frame rate/perangkat fisik.

Tidak tercatat pageerror pada 52 tampilan. Tidak terdeteksi overflow tingkat dokumen pada dua viewport tersebut. Ini bukan bukti bahwa semua konten tersedia: UI-01 menunjukkan konten dapat hilang walaupun tidak ada overflow/error JavaScript. Audit ini tidak menjalankan ulang seluruh tes otomatis, sertifikasi aksesibilitas, atau uji pengguna.

Prioritas: **P1** mengganggu fungsi/orientasi; **P2** konsistensi dan kemudahan; **P3** penyempurnaan sistem desain.

## UI-01 — P1: Riwayat tindakan hilang di mobile

**Teramati:** pada desktop, Riwayat Tindakan Pengelola menampilkan satu entri fixture. Pada ponsel dengan data yang sama, hanya judul/deskripsi terlihat; daftar riwayat tidak muncul.

**Penyebab:** blok riwayat hanya memakai tableWrap. CSS menyembunyikan tableWrap pada <=767 px. Daftar siswa/pengelola mempunyai mobileCards, tetapi riwayat tidak mempunyai pengganti tersebut.

**Bukti:** [mobile](./superadmin-audit-390-full.png), [desktop](./superadmin-audit-1440-full.png); [render riwayat](D:/PEOJECTTTTTTT/RUANGKISAH/frontend/src/features/admin/AdminPanelPage.jsx:584), [aturan mobile](D:/PEOJECTTTTTTT/RUANGKISAH/frontend/src/features/admin/AdminPanel.module.css:390).

**Perbaikan yang disarankan:** sediakan kartu riwayat pada mobile, atau pertahankan tabel khusus ini dalam area scroll yang jelas. Waktu, pelaku, tindakan, sasaran, hasil harus tetap tersedia.

**Diterima bila:** entri yang sama dapat dibaca pada desktop dan 320/390 px; kondisi kosong berbeda dari kondisi data tersembunyi.

## UI-02 — P1: Pergantian form ke rangkuman belum mengarahkan pengguna

**Teramati:** setelah menekan Lihat rangkuman di bagian bawah form jurnal, viewport tetap di bawah. Pada audit, judul rangkuman berada di y=-238 px pada desktop dan y=-690 px pada ponsel. Pengguna langsung melihat akhir rangkuman/tombol simpan, melewati judul dan bagian awal.

Kenali Diriku sudah mempunyai fokus/scroll ke heading saat phase/step berubah. Jurnal Perasaan hanya mengganti phase, sehingga kedua modul memberikan orientasi berbeda.

**Bukti:** [viewport yang diterima pengguna](./journal-summary-390.png), [rangkuman lengkap](./journal-summary-390-full.png); [pergantian phase jurnal](D:/PEOJECTTTTTTT/RUANGKISAH/frontend/src/features/feeling-journal/FeelingJournalPage.jsx:115), [pola fokus Kenali Diriku](D:/PEOJECTTTTTTT/RUANGKISAH/frontend/src/features/self-reflection/SelfReflectionPage.jsx:41).

**Perbaikan yang disarankan:** gunakan pola fokus heading dan scroll yang sama untuk perpindahan form/rangkuman/detail. Periksa juga memilih contoh Langkah Berani dari bagian bawah dan kembali mengedit catatan.

**Diterima bila:** judul state baru terlihat dan menerima fokus yang tepat, draf tetap utuh, reduced motion dihormati.

## UI-03 — P2: Gaya selected/active belum punya satu aturan

Header/footer memakai pill dark ink dengan teks terang. Menu mobile memakai frost dengan teks biru dan radius field. Sidebar Admin memakai pola frost/biru; pada hover aktif, background dapat berubah menjadi canvas karena aturan navButton:hover lebih spesifik. GoalStatus juga mempunyai hover dan selected yang perlu diselaraskan. Chip perasaan sudah memiliki selected:hover yang mempertahankan warna.

Perbedaan orientasi horizontal/vertikal wajar, tetapi arti selected harus tetap mudah dikenali dan tidak melemah ketika kursor masuk.

**Bukti:** [sidebar mobile](./admin-students-390-full.png); [sidebar](D:/PEOJECTTTTTTT/RUANGKISAH/frontend/src/features/admin/AdminPanel.module.css:67), [mobile menu](D:/PEOJECTTTTTTT/RUANGKISAH/frontend/src/components/layout/MobileMenu.module.css:70), [status target](D:/PEOJECTTTTTTT/RUANGKISAH/frontend/src/components/reflection/GoalStatus.module.css:1).

**Arah perbaikan:** tetapkan token untuk nav-active, choice-selected, hover-on-selected dan focus. Pertahankan Slide Tabs sebagai pola navigasi yang sudah diminta; sesuaikan bahasa visual menu vertikal dan kontrol pilihan dengan perannya.

## UI-04 — P2: Skala tipografi belum terkonsolidasi

| Area                         | H1 desktop | H1 ponsel |
| ---------------------------- | ---------: | --------: |
| Beranda                      |      80 px |     44 px |
| Kenali Diriku, pengantar     |      36 px |     30 px |
| Jurnal Perasaan              |      34 px |     30 px |
| Langkah Berani, pengantar    |      36 px |     30 px |
| Bantuan/Privasi/Catatan Saya |      36 px |     30 px |
| Tentang                      |      40 px |     32 px |
| Akun/autentikasi             |      32 px |     28 px |
| Panel Admin                  |      32 px |     32 px |
| 404                          |      28 px |     28 px |

Hero boleh dominan dan formulir boleh lebih ringkas. Yang belum jelas adalah pengecualian antarhalaman setara, seperti 34 vs 36 px pada modul, atau judul Admin yang tidak mengecil di mobile sementara halaman lain mengecil.

**Bukti:** pengukuran DOM; [judul jurnal](D:/PEOJECTTTTTTT/RUANGKISAH/frontend/src/features/feeling-journal/FeelingJournalPage.module.css:30), [judul Tentang](D:/PEOJECTTTTTTT/RUANGKISAH/frontend/src/pages/AboutPage.module.css:24).

**Arah perbaikan:** token hero-title, page-title, form-title, section-title dan label. Sebagai rancangan awal: halaman biasa 36/30, form 32/28, section 24/22; pertahankan hero khusus. Terapkan peran yang sama pada weight, line-height dan letter-spacing.

## UI-05 — P2: Ritme header halaman, padding dan jarak belum seragam

Pada ponsel, judul Bantuan/refleksi berada sekitar x=45 px karena dibungkus kartu, sedangkan Privasi/Catatan langsung x=20 px. Pengantar Langkah Berani menggunakan panel berwarna; Tentang memakai eyebrow dan judul bebas; login mempunyai margin atas tambahan. Pergantian halaman terasa mengubah titik awal dan struktur.

Desktop memakai kontainer 520 px untuk auth, 720 untuk menulis, 840 untuk halaman informasi, 960 untuk pengantar target dan 1120 untuk shell. Variasi ini masuk akal menurut fungsi; yang kurang adalah aturan kapan masing-masing layout dipakai dan bagaimana header/toolbar konsisten di dalamnya.

**Arah perbaikan:** buat PageHeader dan pola layout writing/content/dashboard/auth. Gunakan skala padding yang jelas, misalnya 24/32/40 px sesuai jenis panel, dan gap 16/24/32 px. Spacing 1.35rem atau 1.125rem yang berulang perlu mempunyai nama/peran jika tetap dipakai.

## UI-06 — P2: Ukuran kontrol sejenis belum sama

Pengukuran menunjukkan input teks 56 px, input sandi 54 px, tanggal jurnal 58 px, select filter 48 px; tombol umum 48 px, navigasi/chip 44 px, aksi Admin 38 px, toggle sandi 36 px. Beberapa ukuran kecil mempunyai fungsi berbeda, tetapi standar sentuhan dan perataan form belum ditetapkan secara konsisten.

Pada mobile, label Opsional juga bisa pindah ke baris baru di kiri sementara field lain tetap di kanan. Empat textarea jurnal tetap berukuran 160 px pada snapshot walaupun CSS mobile menyediakan minimum lebih kecil; rows/intrinsic size ikut menentukan hasil.

**Bukti:** [form jurnal](./journal-390-full.png), [masuk](./login-390-full.png); [Field](D:/PEOJECTTTTTTT/RUANGKISAH/frontend/src/components/ui/Field.module.css:1), [toggle sandi](D:/PEOJECTTTTTTT/RUANGKISAH/frontend/src/features/auth/AuthPages.module.css:109), [aksi Admin](D:/PEOJECTTTTTTT/RUANGKISAH/frontend/src/features/admin/AdminPanel.module.css:304).

**Arah perbaikan:** tentukan control-height dan compact-height; gunakan target internal minimal 44 px untuk kontrol sentuh mandiri. Selaraskan tinggi input/select/sandi dan penempatan helper/opsional. Ini rekomendasi konsistensi proyek, bukan klaim bahwa semua kontrol di bawah 44 px otomatis melanggar standar aksesibilitas.

## UI-07 — P2: Warna aksi yang sama berbeda antarhalaman

Keluar pada header memakai outline netral, di profil memakai dangerOutline, di sidebar Admin juga merah. Sementara itu Hapus memakai merah yang sama. Pengguna menerima kesan risiko berbeda untuk aksi keluar akun yang sama.

CTA hero pistachio, kartu modul ink/biru dan form biru sudah cocok dengan variasi surface, tetapi belum ada kebijakan terdokumentasi untuk kapan kontras permukaan menjadi pengecualian warna primary.

**Bukti:** [aksi akun](D:/PEOJECTTTTTTT/RUANGKISAH/frontend/src/features/auth/AccountPage.jsx:102), [header](D:/PEOJECTTTTTTT/RUANGKISAH/frontend/src/components/layout/Header.module.css:143), [sidebar Admin](D:/PEOJECTTTTTTT/RUANGKISAH/frontend/src/features/admin/AdminPanel.module.css:77).

**Arah perbaikan:** buat hierarki primary/secondary/tertiary/danger. Seragamkan keluar akun sebagai aksi netral; tetapkan merah untuk aksi destruktif. Dokumentasikan primary-on-dark/colored-surface agar CTA tidak dipilih secara ad hoc.

## UI-08 — P2: Form mobile terlalu panjang dibanding aktivitas lain

Jurnal mobile mencapai sekitar 2856 px untuk halaman lengkap, termasuk footer. Tombol Lihat rangkuman berada jauh setelah empat textarea, helper, placeholder berulang dan penghitung total. Kenali Diriku memakai satu pertanyaan per langkah; kesan beban kedua aktivitas berbeda cukup besar.

**Arah perbaikan:** rapikan pengulangan teks, pilih tinggi awal textarea menurut kebutuhan, dan kelompokkan bagian agar mudah dipindai. Pertahankan label opsional, izin melewati, kontrol tanpa simpan dan konfirmasi simpan. Sticky action hanya dipertimbangkan setelah diuji agar tidak menutup field/keyboard.

## UI-09 — P2: Pemberitahuan dan navigasi mengambil ruang besar di ponsel

Header global sekitar 161 px pada viewport 844 px, sekitar 19% tinggi layar. Mode demo menambah banner di atasnya. Pada Admin mobile, menu akun dan Notice tampil sebelum judul sehingga judul Ringkasan Superadmin baru berada sekitar y=633 px.

Bantuan juga memiliki intro, Notice batas layanan dan Notice kontak kosong di dalam kartu. Isi benar, tetapi terlalu banyak panel berprioritas visual sama.

**Arah perbaikan:** ringkas notice global menjadi pesan pendek + satu link; tetapkan informasi wajib vs informasi pendukung; buat navigasi pengelola lebih ringkas di mobile dan kurangi pengulangan penjelasan. Label demo harus tetap jelas.

## UI-10 — P2: Pola empty/error/hasil filter belum satu keluarga

Catatan kosong dan 404 memakai EmptyState dengan ikon/CTA, tidak diizinkan memakai kartu auth dengan Notice, sedangkan hasil filter kosong hanya paragraf biasa. Pengguna belum mendapatkan isyarat yang seragam untuk kondisi informasi yang berbeda.

**Bukti:** [Catatan kosong](./records-empty-390-full.png), [404](./404-390-full.png), [hasil filter kosong](D:/PEOJECTTTTTTT/RUANGKISAH/frontend/src/features/saved-records/SavedRecordsPage.jsx:671).

**Arah perbaikan:** definisikan state page/section/inline dengan urutan ikon opsional, judul, satu penjelasan, satu aksi utama. Untuk hasil filter kosong, tampilkan alasan ringkas dan Reset filter secara kontekstual. Form invalid tetap menggunakan error field yang spesifik.

## UI-11 — P2: Bahasa tentang akun belum konsisten

Header sudah berbunyi Refleksi bisa tanpa akun. Footer masih berbunyi Tanpa akun, termasuk ketika pengguna sudah masuk dan halaman Akun/panel tampil. Pengantar Privasi juga memakai frasa bekerja tanpa akun. Makna akun opsional perlu sama di seluruh halaman.

**Bukti:** [footer](D:/PEOJECTTTTTTT/RUANGKISAH/frontend/src/components/layout/Footer.jsx:44), [header](D:/PEOJECTTTTTTT/RUANGKISAH/frontend/src/components/layout/Header.jsx:29), [Privasi](D:/PEOJECTTTTTTT/RUANGKISAH/frontend/src/features/privacy/PrivacyPage.jsx:64).

**Arah perbaikan:** gunakan Refleksi bisa tanpa akun. Akun opsional. Catatan tetap lokal. untuk pesan yang relevan; ringkas menurut ruang. Tetapkan istilah baku rangkuman, catatan, target, simpan di perangkat ini dan contoh fiktif.

## UI-12 — P2: Label aksi akun belum membedakan nonaktif dan belum verifikasi

Pada daftar siswa, Dinonaktifkan dan Menunggu verifikasi sama-sama memperoleh tombol Aktifkan. Status aktif dan verifikasi email merupakan kondisi berbeda pada sistem. Label tersebut dapat menimbulkan ekspektasi bahwa mengaktifkan akun menyelesaikan verifikasi.

**Bukti:** kartu Siswa Contoh 3 pada [daftar siswa mobile](./admin-students-390-full.png); kondisi label berdasarkan active/non-active di [AdminPanelPage](D:/PEOJECTTTTTTT/RUANGKISAH/frontend/src/features/admin/AdminPanelPage.jsx:373).

**Arah perbaikan:** tetapkan aksi berdasarkan gabungan status dan verifikasi. Jelaskan Menunggu verifikasi email dan tampilkan aksi yang sesuai kemampuan server. Temuan ini mengenai label/affordance UI; bukan klaim bahwa verifikasi dapat dilewati.

## UI-13 — P3: Motion belum mempunyai pembagian tujuan yang jelas

Token tersedia 160/240/360 ms; sebagian komponen memakai angka literal 180/240/260 ms, Slide Tabs memakai spring, dan taman memakai animasi ambient. Jenis motion berbeda itu sesuai konteks, tetapi belum mempunyai panduan bersama.

Kartu statistik Admin yang bersifat informatif ikut terangkat pada hover, seperti kartu yang dapat diklik. Ini dapat memberi kesan tindakan yang tidak tersedia pada seluruh kartu.

**Bukti:** [token](D:/PEOJECTTTTTTT/RUANGKISAH/frontend/src/styles/tokens.css:77), [perpindahan halaman](D:/PEOJECTTTTTTT/RUANGKISAH/frontend/src/components/layout/PageContainer.jsx:48), [hover statistik](D:/PEOJECTTTTTTT/RUANGKISAH/frontend/src/features/admin/AdminPanel.module.css:157).

**Arah perbaikan:** pisahkan motion navigasi, kontrol, state transition, overlay dan ambient. Gunakan hover lift pada target interaktif; kartu informasi cukup perubahan border/surface bila diperlukan. Pertahankan kontrol jeda, penghentian offscreen, dan reduced motion taman.

## Rancangan penyelarasan

| Area      | Aturan yang disarankan                                                                     |
| --------- | ------------------------------------------------------------------------------------------ |
| Identitas | Manrope dan palet saat ini tetap menjadi dasar; gradient hangat dipakai terukur            |
| Judul     | Token hero/page/form/section; perubahan ukuran mobile ditetapkan per peran                 |
| Navigasi  | Slide Tabs untuk kelompok horizontal; active/focus/hover selaras pada menu vertikal        |
| Aksi      | Primary jelas; secondary netral; danger khusus aksi destruktif                             |
| Kontrol   | Ukuran reguler dan compact yang terdefinisi; target sentuh mobile konsisten                |
| Layout    | Varian writing/content/auth/dashboard dengan PageHeader/toolbar yang seragam               |
| Informasi | Notice ringkas; empty/error/filtered-state mempunyai pola yang dapat dikenali              |
| Motion    | Spring untuk indikator navigasi; easing pendek untuk kontrol/state; ambient hanya dekorasi |

## Urutan pengerjaan yang disarankan

1. Perbaiki UI-01 dan UI-02. Uji konten audit mobile serta fokus/scroll pada perpindahan state.
2. Konsolidasikan token tipografi, ukuran kontrol, state selected dan hierarki warna aksi.
3. Terapkan pada komponen bersama sebelum memoles tiap halaman.
4. Rapikan form/mobile chrome, empty state, copy akun, serta label status pengelola.
5. Uji ulang desktop/mobile, keyboard, reduced motion, data panjang, dan draf; bandingkan dengan tangkapan baseline audit ini.

Pill navbar/footer dan taman interaktif tetap dipertahankan sesuai arahan pengguna. Kontainer dengan lebar berbeda menurut fungsi, warna surface per modul, dan tombol yang menjadi dua baris di mobile dapat tetap dipakai bila aturannya jelas. Tidak semua perbedaan visual merupakan masalah.
