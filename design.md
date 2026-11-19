# Design Specification - RUANGKISAH.ID

> **Aturan aktif versi 1.4 — persetujuan pengelola:** setiap pendaftaran publik masuk status menunggu persetujuan. Email harus diverifikasi sendiri oleh pengguna, lalu Admin/Superadmin menyetujui akun sebelum login dan aktivitas diizinkan. Persetujuan tidak mengubah verifikasi email atau memberi akses jurnal. Akun siswa lama tanpa persetujuan juga menunggu tinjauan setelah migrasi schema 2; akun pengelola lama dipertahankan agar dapat memproses antrean.

> **Target produksi versi 1.3 — 19 November 2026:** Vercel untuk frontend/API dan PostgreSQL Supabase (ref veinqenogcvmxdbefhzm) untuk akun/sesi/audit. Autentikasi tetap Better Auth dan catatan tetap lokal per akun. SQLite hanya pengembangan lokal. Migrasi dan deploy cloud dilakukan manual mengikuti [DEPLOY_VERCEL.md](./DEPLOY_VERCEL.md); hasil tes lokal tidak menyatakan cloud telah aktif.

> **Ketentuan aktif versi 1.2 — 19 November 2026:** login dengan email terverifikasi diwajibkan sebelum menggunakan Kenali Diriku, Jurnal Perasaan, Langkah Berani, Catatan Saya, contoh fiktif, atau pengelolaan data lokal. Beranda, Bantuan, Tentang, Privasi dan halaman autentikasi tetap publik. Ketentuan ini menggantikan aturan akun opsional pada versi sebelumnya. Catatan tetap lokal, dipisahkan menurut akun; tidak diunggah ke server. Catatan lama dipindahkan hanya melalui konfirmasi di Privasi.

**Versi:** 1.1  
**Tanggal:** 19 November 2026  
**Dasar kebutuhan:** [PRD.md](./PRD.md), versi 1.0.  
**Tujuan:** Pedoman visual, UX, dan generasi UI melalui Google Stitch.  
**Status:** Rancangan desain; belum merupakan UI yang telah digenerasikan, implementasi fungsional, atau hasil validasi siswa.

## Perubahan kebutuhan aktif - 19 November 2026

Arahan pengguna terbaru berlaku untuk implementasi saat ini:

- Platform untuk siswa/siswi lintas sekolah; tidak terikat satu institusi dan tidak meminta sekolah saat mendaftar.
- Akun, verifikasi email, login, pemulihan, Admin dan Superadmin merupakan cakupan aktif; login wajib sebelum memakai fitur.
- Akun/sesi dikelola backend Express + Better Auth + SQLite. Simulasi akun localStorage dihentikan; tidak ada akun produksi dengan kata sandi bawaan.
- Jurnal, jawaban, dan target tetap lokal; tidak diunggah atau dapat dibaca pengelola platform.
- Email lokal memakai outbox privat server; produksi memerlukan SMTP. Tidak ada tombol verifikasi atau token reset simulasi di UI.
- Kontak satu sekolah bukan prasyarat platform umum. Pusat Bantuan memberi arahan universal; kontak platform hanya ditampilkan bila benar-benar tersedia.
- Animasi halus, reduced motion, dan filter metadata catatan termasuk penyempurnaan yang dikerjakan.
- Bagian yang membahas batas UTS/proposal SMA merupakan konteks sumber historis. Ketentuan lama yang menunda akun/backend digantikan oleh perubahan aktif ini.
- Telaah materi, uji manusia/perangkat fisik, SMTP nyata, dan publikasi hosting tidak dianggap selesai tanpa bukti. Lihat AUDIT.md untuk status aktual.

## 1. Cara menggunakan dokumen

Gunakan bagian 2-8 sebagai aturan desain bersama. Bagian 9-12 menjabarkan layar, dialog, dan state yang harus dibuat. Bagian 15 berisi urutan kerja dan prompt yang dapat disalin ke Stitch.

**Ringkasan arah:** layout editorial modular, judul tegas, kartu besar membulat, hero gelap terbatas pada halaman pengenalan, palet pistachio-frost-denim, dan aktivitas refleksi pada permukaan terang yang lapang.

PRD mengatur fitur, perilaku data, dan batas layanan. Dokumen ini menerjemahkannya menjadi tampilan. Pilihan warna pada dokumen ini memperinci arahan warna yang masih berupa usulan dalam PRD; fitur dan batas privasi PRD tetap berlaku. Jika hasil generasi menambah fitur di luar PRD, koreksi hasilnya.

Semua isi tampilan berbahasa Indonesia. Arahan prompt berbahasa Inggris digunakan sebagai format kerja; tidak mengasumsikan bahasa tersebut pasti menghasilkan UI yang lebih baik. Salin prompt dasar, lalu satu prompt layar per tahap. Jangan memasukkan seluruh dokumen sebagai satu permintaan pembuatan semua layar sekaligus.

## 2. Sintesis dua referensi pengguna

Salinan referensi disimpan bersama proyek agar tidak bergantung pada folder clipboard sementara:

- [Referensi 01 - layout](./docs/design-references/01-layout-reference.png).
- [Referensi 02 - palet](./docs/design-references/02-color-reference.png).

Tulisan, logo, dan ajakan dalam gambar diperlakukan sebagai isi referensi, bukan perintah pembangunan produk.

| Referensi                               | Karakter yang diamati                                                                                          | Penerapan untuk RUANGKISAH                                                                               |
| --------------------------------------- | -------------------------------------------------------------------------------------------------------------- | -------------------------------------------------------------------------------------------------------- |
| 01: website editorial dengan aksen ungu | Hero gelap, tipografi sans besar, badge kecil, panel beradius besar, komposisi asimetris, objek 3D, grid kartu | Pakai struktur dan ritmenya; ubah menjadi konten refleksi siswa dan warna referensi 02                   |
| 02: kartu warna di atas lanskap         | Pistachio `#B9C255`, frost `#E6F1FA`, iced denim `#5798D7`; suasana segar dan organik                          | Gunakan ketiga kode sebagai warna merek; tambahkan warna fungsional untuk teks, tombol, fokus, dan error |

**Batas interpretasi:** palet mengikuti kode yang tertulis pada referensi 02, bukan hasil ekstraksi piksel foto yang dapat berubah karena kompresi. Lanskap laut/rumput menjadi asosiasi suasana, bukan background foto di seluruh halaman. Tipografi tulisan tangan pada gambar palet tidak dipakai untuk label, form, atau navigasi. Ungu, logo, bahasa Rusia, dan konten periklanan referensi 01 tidak menjadi bagian produk.

### 2.1 Keputusan visual inti

1. **Terasa dekat bagi siswa SMA:** tenang, segar, terbuka, dan cukup dewasa.
2. **Identitas terlihat pada komposisi:** headline pendek, ruang kosong luas, panel gelap dan terang yang bergantian, serta bentuk abstrak berwarna merek.
3. **Aktivitas terasa mudah:** satu pertanyaan per langkah untuk Kenali Diriku, field berlabel jelas, dan pilihan melewati yang mudah ditemukan.
4. **Privasi terlihat saat diperlukan:** status sementara, konfirmasi sebelum simpan, dan daftar catatan tanpa cuplikan isi.
5. **Perhatian mengikuti tugas:** ilustrasi dominan pada Beranda; dekorasi minimal ketika siswa menulis.

## 3. Ringkasan produk yang harus dipahami generator UI

RUANGKISAH.ID adalah media pendamping BK untuk siswa kelas X-XI SMA. Lima menu utamanya: **Beranda**, **Kenali Diriku**, **Jurnal Perasaan**, **Langkah Berani**, dan **Pusat Bantuan**. Halaman pendukung: **Catatan Saya**, **Privasi & Data**, **Tentang & Cara Pakai**.

### 3.1 Aturan produk yang wajib tercermin pada layar

- Aktivitas refleksi memerlukan login. Pendaftaran memakai nama tampilan/email; UI login dan pengelola mengikuti bagian 17.
- Default isian baru adalah **sementara**. Menekan Mulai atau melihat rangkuman tidak berarti data tersimpan.
- Simpan hanya setelah tindakan eksplisit dan konfirmasi; tidak ada autosave atau sinkronisasi cloud.
- Catatan tersimpan berada pada browser/perangkat yang sama. Orang lain pada profil browser yang sama mungkin dapat membukanya.
- Guru BK tidak otomatis membaca jurnal. Pusat Bantuan mengarahkan ke kontak luar atau pertemuan langsung.
- Tidak ada diagnosis, skor psikologis, tingkat kepercayaan diri, analisis AI, grafik emosi, ranking, streak, atau dashboard pemantauan.
- Rangkuman menyusun kembali jawaban pengguna; jangan menambahkan interpretasi kondisi.
- Demo memakai contoh fiktif dan label yang terlihat; tidak menampilkan catatan pribadi.
- Angka langkah, seperti **Langkah 2 dari 6**, hanya navigasi aktivitas, bukan skor atau penilaian.

UI yang dihasilkan adalah spesifikasi visual/prototipe. Penyimpanan, penghapusan, konflik tab, dan keamanan tetap perlu diimplementasikan serta diuji sesuai PRD; tulisan sukses pada mockup bukan bukti operasi benar-benar berjalan.

## 4. Sistem warna

### 4.1 Token warna

| Token                  | Nilai     | Penggunaan                                                          |
| ---------------------- | --------- | ------------------------------------------------------------------- |
| `color.canvas`         | `#F7F8F2` | Latar halaman utama; putih hangat sangat ringan                     |
| `color.surface`        | `#FFFFFF` | Form, kartu baca, dialog                                            |
| `color.pistachio`      | `#B9C255` | Aksen identitas, CTA pada hero gelap, panel langkah kecil           |
| `color.frost`          | `#E6F1FA` | Panel informasi, latar Jurnal Perasaan, selected tint               |
| `color.denim`          | `#5798D7` | Ilustrasi, panel aksen, dekorasi dan kartu dengan teks gelap        |
| `color.ink`            | `#182420` | Teks utama, ikon utama, hero gelap                                  |
| `color.textMuted`      | `#52645C` | Deskripsi, petunjuk, metadata                                       |
| `color.action`         | `#245F94` | Tombol utama pada halaman terang, link teks, selected border        |
| `color.actionHover`    | `#1B4C78` | Hover/pressed tombol utama terang                                   |
| `color.borderSubtle`   | `#DCE4DE` | Pemisah dan batas dekoratif kartu, bukan satu-satunya penanda input |
| `color.borderControl`  | `#718178` | Batas input dan kontrol interaktif                                  |
| `color.danger`         | `#A93232` | Pesan error, aksi hapus, ikon error                                 |
| `color.dangerSurface`  | `#FBEDEC` | Latar error ringan                                                  |
| `color.success`        | `#285A42` | Pesan operasi berhasil, ikon status sukses                          |
| `color.successSurface` | `#EAF3EB` | Latar status sukses                                                 |
| `color.warning`        | `#72581A` | Pesan penyimpanan/konflik yang memerlukan perhatian                 |
| `color.warningSurface` | `#FBF4DD` | Latar warning                                                       |

Pistachio, frost, dan denim tetap merupakan warna merek. Biru action adalah warna pendukung fungsional, bukan pengganti denim di ilustrasi.

### 4.2 Pasangan teks dan latar

Rasio berikut dihitung dari kode HEX solid dengan rumus luminans relatif sRGB; dibulatkan dua desimal. Angka ini bukan audit seluruh UI. Transparansi, foto, gradasi, ukuran huruf, serta state komponen tetap diperiksa pada hasil akhir.

| Teks / latar           | Rasio perkiraan | Keputusan                                           |
| ---------------------- | --------------- | --------------------------------------------------- |
| Ink / putih            | 16,01:1         | Teks utama                                          |
| Ink / pistachio        | 8,32:1          | Tombol/panel pistachio                              |
| Ink / frost            | 13,97:1         | Panel informasi                                     |
| Ink / denim            | 5,24:1          | Teks pada panel denim                               |
| Putih / action blue    | 6,69:1          | Tombol utama halaman terang                         |
| Muted / putih          | 6,29:1          | Petunjuk dan metadata                               |
| Muted / canvas         | 5,89:1          | Deskripsi di luar kartu                             |
| Putih / denim          | 3,05:1          | Tidak dipakai untuk teks ukuran normal; gunakan ink |
| Border control / putih | 4,11:1          | Input pada permukaan putih                          |
| Border control / frost | 3,58:1          | Kontrol pada panel frost                            |

Target aksesibilitas mengikuti PRD: teks normal minimal 4,5:1 dan teks besar minimal 3:1. Jangan memakai teks putih kecil pada pistachio atau denim. Teks link memakai action blue pada putih/frost, dengan underline; pada hero gelap gunakan putih atau pistachio.

### 4.3 Proporsi dan pemetaan halaman

- Mayoritas area halaman berupa canvas/putih; aksen warna mengarahkan perhatian, bukan mewarnai setiap komponen.
- Beranda: hero ink, kartu pistachio/frost/denim, panel penutup pistachio.
- Kenali Diriku: putih/canvas dengan aksen pistachio kecil.
- Jurnal Perasaan: putih dan frost; perasaan tidak diberi warna berdasarkan penilaian baik/buruk.
- Langkah Berani: putih/canvas, panel motivasi pistachio, tombol action blue.
- Catatan, Bantuan, Privasi: permukaan terang dengan panel frost seperlunya.
- Tidak ada varian dark mode rilis awal. Hero gelap adalah satu bagian halaman, bukan tema aplikasi.

## 5. Tipografi dan naskah

### 5.1 Font

**Font utama:** Manrope, dengan fallback `Arial, sans-serif`. Pakai satu keluarga untuk heading, body, label, dan navigasi; bobot 400, 500, 600, dan 700. Saat implementasi, gunakan font yang di-host sendiri sesuai arahan privasi PRD. Jika font belum tersedia di generator, gunakan sans geometris yang dekat tanpa mengubah hierarki; tandai penggantian untuk review.

Jangan menambahkan font tulisan tangan pada navigasi/form. Kesan organik datang dari bentuk dekoratif dan warna, sementara isi refleksi tetap mudah dibaca.

### 5.2 Skala

| Peran                       | Desktop    | Mobile                  | Bobot / catatan                |
| --------------------------- | ---------- | ----------------------- | ------------------------------ |
| Hero display                | 80 / 84 px | 44 / 48 px              | 600; tracking sekitar -0,04 em |
| Judul halaman               | 48 / 54 px | 32 / 38 px              | 600; tracking -0,03 em         |
| Judul seksi                 | 36 / 42 px | 28 / 34 px              | 600                            |
| Pertanyaan aktif            | 28 / 36 px | 24 / 32 px              | 600                            |
| Judul kartu                 | 24 / 30 px | 22 / 28 px              | 600                            |
| Body besar                  | 18 / 28 px | 18 / 28 px              | 400                            |
| Body / input                | 16 / 26 px | 16 / 26 px              | 400                            |
| Button / label              | 14 / 20 px | 14 / 20 px              | 600; area sentuh tetap besar   |
| Metadata / petunjuk singkat | 14 / 21 px | 14 / 21 px              | 400/500                        |
| Navigasi desktop            | 13 / 20 px | Gunakan menu 16 / 24 px | 600                            |

Ukuran adalah titik awal desain, bukan tinggi konten terkunci. Teks panjang harus wrap; heading hero dapat turun ke 64 px pada lebar menengah. Body refleksi tidak diperkecil untuk memaksakan satu layar.

### 5.3 Nada bahasa

Gunakan “kamu” untuk siswa, singkat, suportif, dan konkret. Label menjelaskan aksi: **Lihat rangkuman**, **Simpan di perangkat ini**, **Akhiri tanpa menyimpan**. Hindari label samar seperti **Submit**, **Proses**, atau **Analisis diriku**.

- Headline Beranda: **Kenali diri. Tumbuh berani.**
- Subheadline: **Ruang untuk memahami perasaan, mengenali kekuatan, dan mencoba langkah kecil sesuai kesiapanmu.**
- Pengantar aktivitas: **Tidak ada jawaban benar atau salah. Kamu boleh melewati pertanyaan yang belum ingin dijawab.**
- Status sementara: **Belum disimpan**.
- Status lokal: **Tersimpan di browser ini**.
- Batas layanan: **Media pendamping BK, bukan pengganti konseling.**

Jangan menambahkan testimoni, jumlah siswa, angka keberhasilan, nama sekolah, atau label “tervalidasi” yang belum tersedia. Durasi Kenali Diriku **sekitar 5-10 menit** adalah estimasi PRD yang perlu diuji. Modul lain tidak diberi estimasi menit rekaan; gunakan **Sesuai waktumu**.

## 6. Layout, ukuran, dan navigasi

### 6.1 Kanvas dan grid

| Parameter           | Desktop                    | Tablet                       | Mobile                                   |
| ------------------- | -------------------------- | ---------------------------- | ---------------------------------------- |
| Frame acuan         | 1440 px lebar              | 768 px lebar                 | 390 px lebar                             |
| Container           | Maksimal 1120 px, terpusat | Lebar tersedia, margin 32 px | Margin 20 px; 16 px pada 320 px          |
| Grid halaman        | 12 kolom, gap 24 px        | 8 kolom, gap 20 px           | 4 kolom, gap 16 px; isi utama satu kolom |
| Lebar area menulis  | Maksimal 720 px            | Maksimal 680 px              | Lebar tersedia                           |
| Jarak antar seksi   | 64-80 px                   | 48-64 px                     | 40-48 px                                 |
| Padding kartu utama | 32 px; hero 48 px          | 28-32 px                     | 20-24 px                                 |

Gunakan skala jarak 4, 8, 12, 16, 20, 24, 32, 40, 48, 64, 80 px. Beranda boleh asimetris; form dan isi bantuan mengikuti sumbu baca stabil. Halaman adalah website dengan scroll vertikal normal, bukan poster dalam mockup perangkat.

### 6.2 Radius, border, dan kedalaman

- Hero/panel besar: radius 32 px desktop, 24 px mobile.
- Kartu: radius 24 px desktop, 20 px mobile.
- Field dan panel kecil: radius 16 px.
- Tombol/badge: pill; dialog radius 24 px.
- Border input 1 px `borderControl`; selected/focus dapat 2-3 px tanpa menggeser layout.
- Kartu memakai shadow sangat ringan atau border; jangan memakai shadow tebal di seluruh halaman.
- Dialog memakai shadow lebih jelas dan overlay ink dengan opacity sekitar 40%; seluruh teks dialog berada pada putih solid.

### 6.3 Shell desktop

Header setinggi acuan 80 px, lebar mengikuti container, latar canvas/putih. Kiri: simbol sederhana dan wordmark **ruangkisah.**; teks resmi RUANGKISAH.ID muncul di Tentang/footer. Tengah: lima menu utama. Kanan: **Catatan Saya** sebagai tautan utilitas bergaya outline/pill. Tombol Masuk/Daftar dan Akun/Keluar mengikuti status sesi. Tidak ada lonceng atau avatar identitas siswa.

Header penuh dipakai pada lebar >= 1200 px. Pada 768-1199 px gunakan header ringkas agar nama menu tidak terpotong. Untuk halaman aktivitas, shell tetap konsisten; item aktif diberi label/garis pendek yang tidak hanya bergantung warna.

### 6.4 Shell mobile dan menu

Header acuan 64 px: wordmark ringkas di kiri, tombol teks **Bantuan** dan tombol **Menu** di kanan. Semua kontrol memiliki area sentuh minimal 44 x 44 px. Pada 320 px, kurangi gap/ukuran wordmark seperlunya tanpa memotong label.

Menu membuka panel navigasi berlabel **Menu RUANGKISAH**, berisi lima menu utama, Catatan Saya, Privasi & Data, Tentang & Cara Pakai, serta aksi **Tutup menu**. Fokus dipindahkan ke panel dan dikembalikan saat ditutup. Tidak ada navigasi bawah permanen pada rancangan ini; ruang vertikal diprioritaskan untuk menulis.

Tidak memakai bubble bantuan mengambang yang menutupi form. Header bantuan boleh sticky dengan kompensasi ruang/fokus; pada tinggi layar terbatas, header dapat ikut scroll. Tombol form mobile mengikuti aliran dokumen dan tidak terkunci di bawah keyboard virtual.

### 6.5 Footer

Footer ringkas: wordmark, satu kalimat tujuan, Privasi & Data, Tentang & Cara Pakai, Pusat Bantuan, dan **Lihat contoh fiktif**. Teks batas layanan ditampilkan dengan kontras memadai, bukan ukuran sangat kecil. Saat sedang mengisi pertanyaan, footer dibuat ringkas agar fokus tetap pada aktivitas.

## 7. Komponen bersama

| ID   | Komponen           | Spesifikasi dan state                                                                                         |
| ---- | ------------------ | ------------------------------------------------------------------------------------------------------------- |
| C-01 | Header/menu/footer | Desktop dan compact; default, active, focus, mobile open                                                      |
| C-02 | Button             | Tinggi minimal 48 px, padding horizontal 20 px, label teks; default, hover, focus, pressed, disabled, pending |
| C-03 | Text link          | Action blue + underline pada terang; focus terlihat; external icon hanya untuk kanal luar                     |
| C-04 | Activity card      | Nomor 01/02/03, judul, deskripsi, ikon/bentuk abstrak, durasi/petunjuk; satu tujuan klik yang jelas           |
| C-05 | Field              | Label persisten, helper, input putih, counter, error; kosong, terisi, focus, invalid, read-only               |
| C-06 | Feeling chip       | Label perasaan + simbol sederhana, multi-select; selected memakai border/centang dan teks, bukan hanya warna  |
| C-07 | Step indicator     | **Langkah n dari 6**, bar pendek tersegmentasi; bukan skor; langkah terlewati tidak diberi error              |
| C-08 | Storage notice     | Ikon perangkat + **Belum disimpan** atau **Tersimpan di browser ini** + link penjelasan                       |
| C-09 | Summary block      | Tema sebagai heading kecil, jawaban sebagai body; kosong: **Belum diisi**                                     |
| C-10 | Record row         | Ikon jenis, nama modul, tanggal, **Buka catatan**; tanpa cuplikan jawaban/judul target                        |
| C-11 | Goal status        | Label lengkap dari empat status; kontrol status berlabel pada detail, bukan warna saja                        |
| C-12 | Notice/banner      | Info frost, success hijau muda, warning krem, error merah muda; ikon + teks + aksi bila ada                   |
| C-13 | Dialog             | Maksimal lebar 480 px, judul/deskripsi/tombol, close jelas, focus dikelola; mobile margin 16 px               |
| C-14 | Empty state        | Simbol sederhana, judul, deskripsi, satu CTA relevan; bukan data palsu                                        |
| C-15 | FAQ accordion      | Pertanyaan sebagai button; expand/collapse icon, jawaban terbaca; state terbuka/tutup                         |
| C-16 | Demo banner        | **Contoh fiktif - bukan data siswa** + **Keluar contoh**; terlihat pada seluruh state demo                    |

### 7.1 Hirarki tombol

- Pada hero gelap, primary adalah pistachio dengan teks ink.
- Pada halaman terang, primary adalah action blue dengan teks putih; secondary putih/transparan dengan teks ink dan border control.
- Aksi destruktif memakai teks danger/outline; tombol danger solid dipakai hanya pada konfirmasi penghapusan.
- Dalam rangkuman, **Simpan di perangkat ini** dan **Akhiri tanpa menyimpan** memiliki area sentuh dan ukuran teks setara. Pilihan tidak menyimpan tidak disembunyikan di menu kecil.
- Pending menampilkan teks **Menyimpan...** atau **Menghapus...**; sukses hanya setelah operasi nyata berhasil.
- Arrow di CTA adalah pelengkap label, bukan pengganti teks. Ikon dekoratif pada tombol tidak menjadi kontrol tambahan.

### 7.2 Input dan keterbacaan

Textarea pertanyaan minimal sekitar 160 px tinggi pada desktop dan 144 px mobile, dapat bertambah sesuai teks. Form jurnal memakai satu kolom dengan label di atas. Placeholder hanya contoh pendek; tidak menggantikan label. Jawaban contoh tidak boleh sudah terisi pada form pribadi.

Tandai **Opsional** pada field yang boleh dilewati. Target baru hanya mewajibkan **Judul target** dan **Langkah pertama**. Batas karakter dan aturan tanggal mengikuti PRD; error dekat field mempertahankan isi pengguna.

## 8. Ilustrasi, ikon, dan motion

### 8.1 Bahasa bentuk

Gunakan objek abstrak lembut: pita melengkung, loop terbuka, bidang seperti halaman terlipat, dan bentuk tunas geometris. Material matte dengan sedikit kedalaman, cahaya lembut, warna pistachio/denim/frost. Komposisi terasa ringan; hindari chrome, tekstur ungu marmer, dan kilau berlebihan.

- Hero: satu komposisi loop/halaman terbuka di area kanan, tanpa menimpa headline.
- Kartu Kenali Diriku: bentuk halaman/lapisan atau cermin abstrak.
- Kartu Jurnal: gelombang/lembar melengkung, bukan grafik emosi.
- Kartu Langkah Berani: tiga bidang kecil bertingkat, tanpa podium atau medali.
- Form: cukup ikon kecil; tidak ada animasi 3D yang bersaing dengan isi tulisan.

Jika aset 3D belum tersedia, gunakan bentuk vektor/CSS sederhana sebagai fallback dengan ruang yang sama. Bentuk dekoratif tidak memuat teks penting dan diberi perlakuan dekoratif untuk aksesibilitas. Dokumen ini belum menghasilkan aset gambar baru.

### 8.2 Ikon

Satu gaya outline dengan stroke sekitar 1,75-2 px, ukuran 20-24 px. Label tetap terlihat. Ikon perasaan tidak boleh menampilkan wajah ekstrem, memberi stigma, atau menjadi satu-satunya informasi. Semua chip perasaan memiliki bobot visual yang setara; tidak ada emosi “baik” berwarna hijau dan emosi “buruk” berwarna merah.

### 8.3 Motion

Hover/focus transition sekitar 150-200 ms; dialog fade singkat; kartu boleh bergerak maksimal 2 px saat hover. Tidak ada auto-rotate 3D, parallax wajib, scroll hijacking, confetti, atau hitung mundur. Respect reduced motion dan hilangkan gerakan dekoratif bila diaktifkan. Progress hanya bergerak ketika pengguna berpindah langkah.

## 9. Inventaris layar dan hubungan dengan PRD

Kode layar adalah nama frame desain, bukan route tambahan. Gunakan akhiran `-D` untuk desktop dan `-M` untuk mobile, misalnya `S03-M Kenali Diriku - pertanyaan`. State pada route yang sama tidak boleh berubah menjadi fitur/menu baru.

| ID  | Layar/state                                    | Route                       | PRD          |
| --- | ---------------------------------------------- | --------------------------- | ------------ |
| S01 | Beranda, pemberitahuan awal                    | `/`                         | FR-00, FR-01 |
| S02 | Kenali Diriku - pengantar                      | `/kenali-diriku`            | FR-02, FR-08 |
| S03 | Kenali Diriku - pertanyaan, terisi/dilewati    | `/kenali-diriku`            | FR-02        |
| S04 | Kenali Diriku - rangkuman                      | `/kenali-diriku`            | FR-02, FR-06 |
| S05 | Jurnal Perasaan - form kosong/terisi           | `/jurnal-perasaan`          | FR-03        |
| S06 | Jurnal Perasaan - rangkuman                    | `/jurnal-perasaan`          | FR-03, FR-06 |
| S07 | Langkah Berani - pengantar dan contoh          | `/langkah-berani`           | FR-04        |
| S08 | Langkah Berani - target baru                   | `/langkah-berani`           | FR-04, FR-06 |
| S09 | Langkah Berani - detail dan status             | `/langkah-berani`           | FR-04, FR-07 |
| S10 | Catatan Saya - kosong                          | `/catatan-saya`             | FR-07        |
| S11 | Catatan Saya - daftar tersimpan                | `/catatan-saya`             | FR-07        |
| S12 | Catatan Saya - detail/edit                     | `/catatan-saya`             | FR-06, FR-07 |
| S13 | Pusat Bantuan - kontak tersedia/belum tersedia | `/pusat-bantuan`            | FR-05, FR-08 |
| S14 | Privasi & Data                                 | `/privasi`                  | FR-06, FR-08 |
| S15 | Tentang & Cara Pakai                           | `/tentang`                  | FR-08        |
| S16 | Contoh fiktif - banner dan modul contoh        | State demo, bukan menu akun | FR-09        |
| S17 | Halaman tidak ditemukan                        | Route tidak dikenal         | FR-01        |

Buat desktop/mobile untuk setiap komposisi unik. S04/S06/S12 berbagi komponen rangkuman, tetapi isi, mode baca/edit, status simpan, dan aksinya tetap perlu didokumentasikan. Form yang panjang boleh berupa frame dengan scroll; tidak harus memuat semua field dalam satu viewport.

## 10. Spesifikasi layar

### S01 - Beranda

**Tujuan:** pengguna memahami produk, lalu masuk sebelum menggunakan aktivitas.

Urutan dari atas ke bawah:

1. Header bersama; Beranda aktif.
2. Pemberitahuan ringkas di area atas: **Masuk untuk mulai berefleksi.** Link **Pelajari pilihan penyimpanan** menuju Privasi. Bukan popup cookie atau persetujuan wajib.
3. Hero ink, radius 32 px, dua kolom sekitar 7:5, padding 48 px. Kiri: badge **SELFCARE-BK**, headline **Kenali diri. / Tumbuh berani.**, subheadline, tombol pistachio **Mulai refleksi** dan link putih **Lihat cara pakai**. Kanan: komposisi abstrak 3D denim-pistachio dengan negative space.
4. Teks kecil di bawah CTA: **Masuk untuk mulai. Kamu yang memilih apakah ingin menyimpan catatan.** Hindari ikon gembok dengan klaim keamanan mutlak.
5. Seksi **Mulai dari yang kamu butuhkan.** Tiga kartu sejajar pada desktop: **01 Kenali Diriku** (pistachio), **02 Jurnal Perasaan** (frost), **03 Langkah Berani** (denim dengan teks ink). Tinggi visual seimbang, ilustrasi kecil, satu aksi berlabel per kartu.
6. Seksi cara pakai pada putih, tiga langkah: **Pilih ruangmu**, **Isi sesuai kesiapanmu**, **Tinjau dan tentukan pilihanmu**. Ini petunjuk, bukan statistik.
7. Panel dua kolom: kiri **Cerita ini tetap dalam kendalimu.**; kanan penjelasan sementara/lokal dan link **Kenali pilihan data**. Gunakan frost dengan ornamen kecil yang tenang.
8. Panel pistachio **Butuh teman bicara?** dengan teks tentang Guru BK dan tombol **Buka Pusat Bantuan**.
9. Footer.

**Aksi:** Mulai refleksi menuju pengantar Kenali Diriku (S02); kartu menuju masing-masing modul. Tiga fitur tidak diwajibkan diselesaikan berurutan.

**Mobile:** teks hero lebih dulu, CTA selebar tersedia, lalu ilustrasi maksimal sekitar 180 px tinggi. Tiga kartu tersusun satu kolom; gunakan ikon/bentuk lebih ringkas agar tidak menjadi tiga poster panjang. Hero tidak memiliki tinggi fixed yang memotong headline.

**Tidak ditambahkan:** angka pengguna, logo sekolah rekaan, testimoni, panel analitik, pricing, dan gambar manusia sebagai profil siswa.

### S02-S04 - Kenali Diriku

**S02 pengantar:** heading **Pelan-pelan, kenali dirimu.**; deskripsi potensi, minat, nilai, dan tujuan; badge **6 pertanyaan**, **Sekitar 5-10 menit**, **Boleh dilewati**. Panel putih maksimal 720 px dengan aksen pistachio kecil. Tampilkan aturan sementara dan tombol **Mulai Kenali Diriku**. Tautan bantuan tetap tersedia.

**S03 pertanyaan:**

- Sumbu baca terpusat, satu pertanyaan per layar. Header judul modul tidak mengulang hero besar.
- Bagian atas: link **Kembali ke pengantar**, status **Belum disimpan**, serta **Langkah 2 dari 6**. Mengubah ke pengantar ketika ada draf memakai O02.
- Pertanyaan aktif contoh: **Kekuatan apa yang membantumu dalam pengalaman itu?**
- Helper: **Boleh hal sederhana yang kamu rasakan dalam keseharian.** Tidak menyarankan jawaban psikologis tertentu.
- Textarea berlabel **Jawabanmu - opsional**, counter `0/1.000`, dan catatan **Hindari menuliskan identitas pribadi.**
- Aksi: **Sebelumnya**, **Lewati**, **Berikutnya**. Lewati adalah teks link/button berukuran sentuh memadai, bukan tulisan pucat. Pada langkah terakhir, ganti Berikutnya dengan **Lihat rangkuman**.
- Navigasi mempertahankan draf dalam sesi. Jawaban yang dilewati tidak terlihat sebagai kegagalan.
- Bila semua jawaban kosong, tampilkan pesan **Isi setidaknya satu jawaban untuk melihat rangkuman, atau akhiri tanpa menyimpan.** Opsi keluar tetap tersedia.

**S04 rangkuman:** heading **Yang kamu temukan tentang dirimu.**; subteks **Rangkuman ini berasal dari jawabanmu sendiri.** Enam blok tema: Pengalaman berhasil, Kekuatan, Minat, Nilai pribadi, Area berkembang, Tujuan. Blok belum dijawab menampilkan **Belum diisi**.

Di bawah, tampilkan **Ubah jawaban**, **Simpan di perangkat ini**, dan **Akhiri tanpa menyimpan**. Pisahkan aksi revisi dari dua pilihan akhir. Setelah berhasil simpan, banner persisten **Tersimpan di browser perangkat ini** dan aksi **Buka Catatan Saya** menggantikan CTA simpan baru agar tidak menggandakan item. Tidak menampilkan skor atau kesimpulan tipe kepribadian.

**Mobile:** konten satu kolom; dua CTA akhir disusun vertikal dengan tinggi setara. Konten rangkuman panjang tetap scroll, tanpa accordion yang menyembunyikan semua jawaban secara default.

### S05-S06 - Jurnal Perasaan

**Tujuan:** mengungkapkan perasaan dan kebutuhan secara mandiri tanpa penilaian.

**S05 form:** heading **Bagaimana perasaanmu hari ini?**; subteks **Kamu boleh bercerita sedikit, banyak, atau melewati bagian yang belum ingin diisi.** Latar utama canvas dengan panel frost di bagian pengantar; form di putih.

Urutan input:

1. **Tanggal jurnal**, default tanggal lokal hari ini; contoh tampilan **18 November 2026**. Bukan metadata identitas dan tidak ditulis dalam URL. Tanggal masa depan menampilkan error.
2. **Perasaan yang paling dekat denganmu - opsional**, helper **Boleh pilih lebih dari satu.** Chip: Senang, Sedih, Cemas, Marah, Tenang, Bingung, Lainnya. State selected memakai border action, latar frost, dan centang; gaya sama untuk seluruh perasaan.
3. **Apa yang terjadi? - opsional**.
4. **Bagaimana kamu menanggapinya? - opsional**.
5. **Apa yang kamu butuhkan saat ini? - opsional**.
6. **Satu hal baik untuk dirimu - opsional**.

Tampilkan counter gabungan **0/5.000 karakter** pada area form dengan helper yang menjelaskan batas berlaku untuk seluruh catatan teks. Field individu boleh memiliki counter bantu, tetapi jangan memperkenalkan batas baru yang bertentangan dengan total PRD. Tidak ada kolom nama, nomor siswa, atau judul wajib.

CTA **Lihat rangkuman**; opsi **Akhiri tanpa menyimpan** terlihat. Minimal satu perasaan atau satu teks nonkosong diperlukan untuk rangkuman; tanggal saja tidak cukup. Error tidak menghapus isi.

**S06 rangkuman:** heading **Ruang untuk memahami perasaanmu.**; tanggal, perasaan yang dipilih, dan empat blok jawaban. Satu kalimat penutup edukatif: **Kamu boleh kembali ke catatan ini untuk mengenali pengalamanmu.** Tampilkan status belum disimpan dan pola tiga aksi S04. Jangan menghasilkan analisis suasana hati, grafik, rekomendasi terapi, atau prediksi.

**Mobile:** chip wrap dalam dua/tiga kolom sesuai teks; tidak menjadi carousel horizontal. Field berurutan dalam satu kolom; label tidak terpotong saat keyboard muncul.

### S07-S09 - Langkah Berani

**S07 pengantar dan contoh:** heading **Keberanian dimulai dari satu langkah.**; subteks **Pilih langkah kecil yang sesuai kesiapanmu. Kamu boleh menyesuaikannya kapan saja.** Panel pengantar pistachio ringan, bukan hero gelap kedua.

Tampilkan enam contoh PRD sebagai kartu putih; satu CTA per kartu **Pakai contoh ini**. Dua kolom pada desktop, satu pada mobile. Sertakan tombol **Buat target sendiri**. Pilihan contoh hanya mengisi draf target setelah dipilih, tidak menyimpan otomatis. Semua contoh setara; tidak diberi tingkat siswa atau label “lemah”.

Bagian **Target yang kamu simpan** memakai ringkasan aman berupa jenis/tanggal dan tautan buka detail; judul target pribadi tidak ditampilkan pada ringkasan daftar. Keadaan kosong: **Belum ada target tersimpan di browser ini.** Jangan menampilkan progress cloud/akun.

**S08 form target baru:** heading **Satu langkah yang ingin kamu coba.**; field:

| Label UI                    | Wajib | Batas / ketentuan                                    |
| --------------------------- | ----- | ---------------------------------------------------- |
| Judul target                | Ya    | 1-120 karakter nonkosong                             |
| Langkah pertama             | Ya    | Maksimal 500 karakter                                |
| Kenapa ini berarti buatmu?  | Tidak | Maksimal 500 karakter                                |
| Tanggal target              | Tidak | Bisa diubah; lewat tanggal tidak memberi label gagal |
| Dukungan yang kamu butuhkan | Tidak | Maksimal 500 karakter                                |

CTA **Tinjau target** membuka S09 dalam status sementara; simpan terjadi setelah siswa memilih simpan pada detail. Pada pembatalan yang membuang draf, tampilkan O02.

**S09 detail target:** tampilkan judul dan isi lengkap hanya setelah dibuka. Status awal **Direncanakan**. Kontrol **Status langkahmu** memberi empat pilihan berlabel: Direncanakan, Sedang dicoba, Selesai dicoba, Ditunda. Selalu beri keterangan **Status ini kamu tentukan sendiri.**

Refleksi setelah mencoba adalah field opsional maksimal 1.000 karakter, dapat ditampilkan saat siswa ingin merefleksikan pengalaman. Pesan **Kamu sudah mencoba satu langkah.** hanya muncul ketika status Selesai dicoba dipilih; tanpa confetti/skor.

Aksi pada target sementara: **Ubah target**, **Simpan di perangkat ini**, **Akhiri tanpa menyimpan**. Pada target tersimpan yang sedang diedit: **Simpan perubahan**, **Batal mengubah**; aksi **Hapus target** terpisah di bagian bawah. Status yang diubah belum dipersistenkan sampai simpan perubahan dikonfirmasi.

### S10-S12 - Catatan Saya

**Tujuan:** membuka dan mengendalikan catatan yang sengaja disimpan pada browser ini.

Header halaman **Catatan di browser ini.**; paragraf **Catatan ini tersimpan pada browser dan perangkat yang kamu pakai. Perhatikan orang di sekitarmu sebelum membuka isinya.** Tautan **Kelola privasi & data** tersedia.

**S10 kosong:** ikon lembar terbuka kecil, heading **Belum ada catatan tersimpan di browser ini.**, penjelasan bahwa tidak semua aktivitas harus disimpan, CTA **Mulai refleksi**. Tidak ada placeholder jawaban atau catatan contoh di area pribadi.

**S11 daftar:** gunakan baris/kartu ringkas, urut terbaru. Tampilkan hanya ikon modul, **Jurnal Perasaan / Kenali Diriku / Langkah Berani**, tanggal, dan **Buka catatan**. Jangan menampilkan perasaan, isi, jawaban pertama, judul target, status target pribadi, nama siswa, atau tag diagnosis. Contoh frame daftar berisi tiga baris fiktif dengan jenis dan tanggal saja; label **Contoh data untuk desain** berada di anotasi frame, bukan menjadi data pribadi aplikasi.

Filter jenis/tanggal dipilih sebagai penyempurnaan metadata; jangan menambahkan pencarian isi pribadi. Filter jenis/tanggal adalah P1 dalam PRD, ditambahkan hanya jika dipilih kemudian.

**S12 detail:** gunakan komponen rangkuman modul terkait dengan label **Tersimpan di browser ini**, tanggal, aksi **Ubah catatan**, **Kembali ke daftar**, dan **Hapus catatan** terpisah. Untuk target, gunakan detail S09. Teks isi tidak menjadi judul tab.

**Mode edit:** status **Perubahan belum disimpan**; **Simpan perubahan** membuka konfirmasi penyimpanan; **Batal mengubah** mempertahankan versi tersimpan. Hapus hanya menghilangkan item terkait setelah konfirmasi berhasil.

**Mobile:** daftar satu kolom dengan target sentuh lebar. Jangan menyembunyikan Hapus dalam gesture swipe yang sulit ditemukan; aksi hapus tersedia jelas di detail.

### S13 - Pusat Bantuan

Heading **Kamu boleh mencari dukungan.**; subteks **Guru BK dapat mendampingimu ketika kamu ingin berbicara lebih lanjut.** Panel frost, ilustrasi kecil berupa dua bidang bertemu, tanpa foto petugas rekaan.

Urutan isi:

1. Ringkasan batas layanan: **Website ini membantu refleksi mandiri dan tidak menyediakan percakapan langsung atau pemantauan jurnal.**
2. Kartu kontak Guru BK. Buat dua varian:
   - **Belum tersedia** sebagai default jika konfigurasi belum diberikan: **Kontak sekolah belum tersedia. Kamu dapat menemui Guru BK secara langsung di sekolah.** Tidak ada nomor/email palsu atau tombol WhatsApp aktif.
   - **Tersedia**: slot nama/peran, sekolah, kanal, jam layanan dengan zona waktu, tanggal verifikasi. Konten nyata diisi dari konfigurasi yang disetujui; pada file desain tulis placeholder berlabel, jangan mengarang identitas.
3. Kanal tersedia memiliki tombol **Lanjut ke WhatsApp** / **Lanjut ke email**, membuka O05 terlebih dahulu. Jangan menyatakan pengguna sudah berkonsultasi hanya setelah klik.
4. FAQ: Apakah harus membuat akun? Apakah catatan otomatis tersimpan? Apakah Guru BK membaca jurnal saya? Bagaimana menghapus catatan? Apa yang terjadi saat membuka WhatsApp/email?
5. Arahan singkat menemui Guru BK atau orang dewasa tepercaya bila membutuhkan pendampingan; naskah final ditelaah Guru BK.

Tampilkan jam layanan apa adanya; jangan memakai indikator “Online”, “Siap 24/7”, badge respons instan, kotak chat, atau formulir kirim masalah.

### S14 - Privasi & Data

Heading **Kamu yang menentukan pilihan data.**; penjelasan ringkas di atas, lalu dua panel berdampingan pada desktop dan bertumpuk pada mobile:

- **Tanpa menyimpan:** isian sementara, tidak tersedia lagi setelah refresh/akhiri, dan tidak dikirim sebagai catatan ke server aplikasi.
- **Simpan di perangkat ini:** tetap di browser/perangkat yang sama, tidak tersinkron, tidak terenkripsi secara khusus oleh aplikasi, dan mungkin dapat dibuka orang lain pada profil browser yang sama.

Bagian lanjutan memakai heading pendek dan paragraf mudah dipindai: **Apa yang disimpan**, **Siapa yang bisa mengakses**, **Berapa lama**, **Cara menghapus**, **Saat membuka kanal luar**, **Log teknis situs**. Tegaskan penyimpanan lokal tidak memiliki kedaluwarsa otomatis dan bukan backup; browser dapat menghapus data. Log hosting dapat mencakup IP/waktu/route sesuai penyedia tanpa mengirim isi aktivitas.

Di bawah, panel penghapusan dengan border danger ringan, heading **Hapus data RUANGKISAH di browser ini**, penjelasan cakupan lokal, tombol outline danger **Hapus semua data di browser ini**. O04 mengonfirmasi sebelum operasi. Ketika tidak ada data, tampilkan **Tidak ada data tersimpan untuk dihapus** dan nonaktifkan aksi dengan penjelasan terlihat.

Tidak ada toggle “Izinkan membaca jurnal saya”, pengaturan cloud, atau tombol hapus akun.

### S15 - Tentang & Cara Pakai

Heading **Ruang kecil untuk mengenali diri.**; deskripsi program Selfcare-BK dan sasaran siswa kelas X-XI SMA. Gunakan layout editorial terang dengan satu ilustrasi kecil, bukan hero ink penuh lagi.

Isi: alasan produk, tiga modul, empat langkah penggunaan (**Pilih aktivitas**, **Isi sesuai kesiapanmu**, **Tinjau rangkuman**, **Pilih simpan atau akhiri**), peran Guru BK, dan batas layanan. CTA **Mulai Kenali Diriku** serta link ke Pusat Bantuan/Privasi.

Tidak ada foto tim, nama reviewer, logo institusi, sertifikat, atau hasil penelitian yang belum disediakan. Identitas akademik dari proposal dapat ditambahkan pada bagian kredit setelah pemilik produk menentukan konten publiknya; tidak perlu dijadikan fokus layar.

### S16 - Contoh fiktif

Banner C-16 selalu terlihat saat mode contoh aktif: **Contoh fiktif - bukan data siswa** dan **Keluar contoh**. Gunakan desain modul yang sama, dengan isi contoh yang ditulis jelas sebagai fiktif.

Masuk melalui **Lihat contoh fiktif** pada footer/Tentang, bukan otomatis masuk ke daftar catatan pribadi. Dalam demo, aksi persistensi tidak menulis data: ganti tombol menjadi **Coba alur simpan (simulasi)**; hasilnya berlabel **Simulasi selesai. Tidak ada data disimpan.** Kontak demo tidak mengarah ke nomor nyata maupun rekaan. Perbedaan tombol ini hanya berlaku dalam mode demo dan dijelaskan lewat banner.

Keluar contoh membersihkan state demo dan kembali ke halaman publik; Catatan Saya pribadi hanya dibuka setelah pilihan eksplisit. Tidak menyatakan simulasi sama dengan bukti fungsi penyimpanan produksi.

### S17 - Halaman tidak ditemukan

Panel putih, ikon sederhana, heading **Halaman ini belum ditemukan.**, teks **Kamu bisa kembali ke Beranda untuk memilih ruang yang ingin dibuka.**, CTA **Kembali ke Beranda**, link **Pusat Bantuan**. Tidak memakai ilustrasi sedih atau pesan yang menyalahkan siswa.

## 11. Dialog, notifikasi, dan state kegagalan

### 11.1 Dialog wajib

| ID  | Pemicu dan isi                                                                                                                                                                               | Aksi                                                                                               |
| --- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | -------------------------------------------------------------------------------------------------- |
| O01 | **Simpan di browser perangkat ini?** Jelaskan lokal, dapat dibuka profil browser sama, tidak tersinkron, tersimpan sampai dihapus/dibersihkan browser, dan cara hapus. Link Privasi tersedia | **Batal**, **Ya, simpan di perangkat ini**; tidak ada checkbox tercentang otomatis                 |
| O02 | **Tinggalkan isian sementara?** “Isian yang belum disimpan akan dibuang jika kamu meninggalkan aktivitas ini.” Untuk edit tersimpan, jelaskan hanya perubahan baru yang dibuang              | **Tetap mengisi**, **Tinggalkan tanpa menyimpan**; tidak menghapus versi lama yang sudah tersimpan |
| O03 | **Hapus catatan ini?** “Catatan ini akan dihapus dari browser perangkat ini dan tidak dapat dikembalikan melalui aplikasi.” Tidak menampilkan cuplikan isi pada dialog                       | **Batal**, **Hapus catatan**                                                                       |
| O04 | **Hapus semua data RUANGKISAH di browser ini?** Sebutkan seluruh catatan/target lokal aplikasi; data situs lain dan kanal luar tidak termasuk                                                | **Batal**, **Hapus semua data**; primary danger                                                    |
| O05 | **Lanjut ke kanal luar?** “WhatsApp/email dapat menampilkan nomor telepon atau alamat emailmu. Isi jurnal tidak dilampirkan otomatis. Kanal tersebut memiliki kebijakannya sendiri.”         | **Tetap di RUANGKISAH**, **Lanjut ke WhatsApp/email** sesuai pemicu                                |
| O06 | **Data tersimpan tidak dapat dibaca.** Jelaskan sebagian data/versinya tidak didukung; reset akan menghapus data aplikasi di browser ini                                                     | **Kembali**, **Tinjau pilihan hapus data**; reset tidak langsung terjadi dan memakai O04           |

O01 juga berlaku pada simpan perubahan, dengan judul **Simpan perubahan di browser ini?** dan penjelasan yang konsisten. Tidak ada tombol silang tanpa nama aksesibel. Dialog tidak menampilkan animasi keberhasilan sebelum operasi selesai.

Pada mobile, dialog berada dalam viewport dengan margin 16 px, tinggi maksimum mengikuti viewport dan isi dapat scroll. Tombol panjang bertumpuk; teks tidak diperkecil untuk memaksakan dua kolom. Batal/Tetap terlihat dan mudah dipilih.

### 11.2 Keadaan wajib yang digambar sebagai varian

| ID state | Kondisi                                     | Tampilan dan naskah                                                                                                                                             |
| -------- | ------------------------------------------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| ST-01    | Kosong                                      | Form kosong atau empty state; tidak ada isi contoh di area pribadi                                                                                              |
| ST-02    | Terisi sementara                            | Label **Belum disimpan**; CTA rangkuman/simpan sesuai modul                                                                                                     |
| ST-03    | Input tidak valid                           | Error inline, ikon, fokus field, counter; isi dipertahankan                                                                                                     |
| ST-04    | Menyimpan/menghapus                         | Label pending pada tombol; nonaktif sementara untuk mencegah duplikat; jangan memasang skeleton seluruh halaman                                                 |
| ST-05    | Simpan berhasil                             | Banner **Tersimpan di browser perangkat ini**, link Catatan Saya; tanpa toast saja yang cepat hilang                                                            |
| ST-06    | Penyimpanan ditolak/penuh                   | Warning dekat aksi: **Belum tersimpan. Penyimpanan browser tidak tersedia atau penuh.** Aksi **Coba lagi** / **Lanjut tanpa menyimpan**; draf tetap ada         |
| ST-07    | Hapus gagal                                 | Error **Data belum berhasil dihapus. Coba lagi.** Jangan menghilangkan item atau menampilkan sukses                                                             |
| ST-08    | Konflik tab                                 | Warning **Catatan berubah di tab lain.** Aksi **Muat versi terbaru** / **Batalkan perubahan**; jelaskan draf edit akan diganti jika memuat ulang                |
| ST-09    | Penulisan dibatasi satu tab                 | Info **Lanjutkan penyimpanan di tab utama, atau tutup tab lainnya.** Tidak membiarkan tombol menyimpan tampak berhasil                                          |
| ST-10    | Dihapus pada tab lain                       | Detail dibersihkan, pesan **Catatan ini sudah dihapus dari browser ini.**, CTA kembali ke daftar                                                                |
| ST-11    | Kontak belum tersedia                       | Fallback S13; jangan memakai disabled WhatsApp sebagai satu-satunya informasi                                                                                   |
| ST-12    | Tidak ada respons jaringan untuk kanal luar | Alamat kontak terverifikasi tetap terbaca; jelaskan perlu jaringan. Tidak menyatakan seluruh website tersedia offline                                           |
| ST-13    | Aktivitas diakhiri tanpa simpan             | Panel ringan **Isian sementara telah dibersihkan dari aplikasi.** Aksi pilih aktivitas/Beranda                                                                  |
| ST-14    | Batas jumlah/ukuran data tercapai           | **Penyimpanan aplikasi mencapai batas. Hapus catatan yang tidak diperlukan sebelum menyimpan lagi.** Aksi buka Catatan Saya; draf tidak hilang tanpa peringatan |

Saat link Catatan Saya akan meninggalkan draf akibat error penuh, jelaskan konsekuensi dan berikan pilihan kembali. Jangan membuat jalan keluar error yang diam-diam membuang tulisan.

## 12. Alur interaksi dan navigasi

### 12.1 Alur utama yang perlu dihubungkan

```text
S01 Beranda -> S02 Pengantar -> S03 Pertanyaan -> S04 Rangkuman
S01 Beranda -> S05 Jurnal -> S06 Rangkuman
S01 Beranda -> S07 Contoh langkah -> S08 Target baru -> S09 Detail

Rangkuman/detail sementara -> O01 Konfirmasi simpan
  -> berhasil: ST-05 -> S11 Catatan Saya -> S12 Detail / S09 Target
  -> gagal: ST-06 -> draf tetap tersedia
  -> batal: kembali ke rangkuman/detail sementara

S12 Edit -> Simpan perubahan -> O01 -> versi lokal diperbarui jika berhasil
S12/S09 -> Hapus -> O03 -> S11 atau S10 jika kosong
S14 -> Hapus semua -> O04 -> S10 jika berhasil

Semua halaman -> S13 Bantuan -> O05 -> kanal luar
Pindah halaman saat ada perubahan belum disimpan -> O02
S01/S15 -> S16 Demo -> Keluar contoh -> halaman publik
```

### 12.2 Perbedaan klik dan operasi nyata

- **Lihat rangkuman** hanya mengubah tampilan, tidak menyimpan.
- **Tinjau target** hanya membuka detail sementara, tidak membuat target persisten.
- **Ya, simpan...** baru memicu penulisan; banner sukses muncul setelah hasil penulisan dikonfirmasi.
- **Batal mengubah** mengembalikan data tersimpan sebelumnya; bukan menghapus item.
- **Lanjut ke WhatsApp/email** membuka kanal; bukan mengirim pesan.
- **Akhiri tanpa menyimpan** membersihkan draf baru; tidak menghapus seluruh catatan yang sudah tersimpan.

State detail tidak membawa isi/ID catatan ke URL. Refresh menghilangkan draf sementara; UI harus memberi informasi ini sebelum pengguna bergantung pada draf. Browser back/forward setelah hapus/akhiri tidak boleh memperlihatkan isi yang sudah dibersihkan melalui state halaman lama, sesuai pengujian PRD.

## 13. Aksesibilitas dan responsif

Persyaratan mengikuti PRD, dengan keputusan visual berikut:

- Target sentuh utama minimal 44 x 44 px; tombol form minimal tinggi 48 px.
- Body dan input 16 px; metadata minimal 14 px dengan kontras memadai. Tidak menonaktifkan zoom.
- Focus pada permukaan terang memakai outline action 3 px dengan offset 3 px. Pada panel denim/gelap gunakan ring putih pemisah dan ring ink/pistachio yang kontras dengan permukaan setempat; periksa tiap pasangan aktual.
- Chip selected memiliki centang dan nama; status target memiliki teks. Warna bukan satu-satunya pembeda.
- Keyboard dapat mencapai seluruh kontrol, termasuk Lewati, Batal, detail catatan, dan FAQ. Focus tidak tertutup header atau dialog.
- Pada dialog, focus masuk ke konten yang tepat, tidak keluar ke belakang, dan kembali ke pemicu ketika ditutup. Error/notifikasi memiliki pengumuman screen reader yang sesuai.
- Urutan heading logis; ikon dekoratif tidak dibacakan sebagai informasi penting.
- Reflow diuji pada 320 px dan zoom 200%; tidak ada tabel/kartu yang memaksa scroll horizontal. Tabel spesifikasi dalam dokumen ini bukan tabel wajib di UI.
- Reduced motion menghilangkan perpindahan dekoratif. Tidak memakai batas waktu dalam mengisi refleksi.
- Jangan memotong teks panjang dengan ellipsis pada petunjuk penting, status data, atau dialog.

### 13.1 Adaptasi yang wajib diperiksa

| Elemen         | Desktop                           | Mobile                                 |
| -------------- | --------------------------------- | -------------------------------------- |
| Hero           | Teks + ilustrasi dua kolom        | Teks/CTA lalu ilustrasi ringkas        |
| Tiga aktivitas | Tiga kartu sejajar                | Satu kolom, ilustrasi ringkas          |
| Form           | Area 720 px, terpusat             | Lebar tersedia, satu kolom             |
| CTA rangkuman  | Bisa dua tombol sejajar jika muat | Bertumpuk, teks tidak dipotong         |
| Catatan Saya   | Baris lebar, tanpa preview        | Kartu/baris vertikal dengan aksi jelas |
| Kontak dan FAQ | Dua area jika muat                | Kontak lebih dulu, FAQ di bawah        |
| Dialog         | Lebar maksimal 480 px             | Margin 16 px, isi dapat scroll         |

## 14. Checklist hasil generasi

- [ ] Delapan halaman utama/pendukung PRD tersedia beserta 404 dan mode demo.
- [ ] Semua S01-S17 dan O01-O06 tercakup; state terkait memiliki anotasi/varian.
- [ ] Desktop/mobile memakai warna, tipografi, radius, dan komponen yang sama.
- [ ] Referensi 01 tercermin melalui komposisi, hero, tipografi, dan panel; palet utama mengikuti referensi 02.
- [ ] Teks putih kecil tidak diletakkan pada denim/pistachio; semua pasangan aktual diperiksa.
- [ ] Area menulis terang dan tenang, tanpa artwork di belakang input.
- [ ] Login wajib dan panel pengelola mengikuti bagian 17; tidak ada chat, AI, skor, grafik emosi, atau statistik rekaan.
- [ ] Beranda menyebut login wajib dan pilihan simpan lokal dengan jujur.
- [ ] Form dapat dilewati sesuai aturan PRD; target hanya mewajibkan judul dan langkah pertama.
- [ ] Pilihan tidak menyimpan sama-sama mudah dilihat dan disentuh.
- [ ] Catatan Saya tidak menampilkan isi/judul target/perasaan pada daftar.
- [ ] Kontak belum tersedia memakai fallback; tidak ada nomor, email, sekolah, atau jam layanan rekaan yang terlihat nyata.
- [ ] Mode demo berlabel fiktif dan tidak menyiratkan penyimpanan sungguhan.
- [ ] State storage gagal, konflik tab, hapus gagal, dan input tidak valid tidak menghilangkan tulisan diam-diam.
- [ ] Menu, dialog, focus, keyboard, screen reader, layout 320 px, dan reduced motion memiliki spesifikasi.
- [ ] Hasil UI diperiksa terhadap PRD sebelum diterjemahkan menjadi aplikasi; fungsi data tidak diasumsikan sudah benar karena tampilannya tersedia.

## 15. Paket kerja dan prompt Google Stitch

### 15.1 Urutan penggunaan

1. Gunakan design.md sebagai konteks aturan desain dan dua gambar pada folder docs/design-references sebagai referensi visual. Jika antarmuka yang dipakai tidak menerima file Markdown, salin ringkasan bagian 2-8 atau prompt dasar di bawah sebagai konteks.
2. Jelaskan peran gambar: **gambar 01 untuk struktur dan komposisi; gambar 02 untuk warna**. Jangan meminta salinan utuh gambar 01.
3. Mulai dengan prompt dasar, lalu P01 untuk Beranda desktop. Periksa arah visual sebelum membuat halaman lain.
4. Buat Beranda mobile memakai P18. Setelah sistem visual sesuai, gunakan P02-P17 untuk layar berikutnya, satu per tahap.
5. Buat dialog O01-O06 dan state kegagalan sebagai varian tersendiri. Pilih satu state setiap permintaan; jangan menggabungkan seluruh dialog pada satu layar produksi.
6. Hubungkan layar memakai alur bagian 12. Bedakan state kosong, terisi, tersimpan, dan gagal.
7. Cocokkan dengan checklist bagian 14. Gunakan koreksi terarah jika ada masalah, lalu periksa hasil perubahan.

Pendekatan per layar dan revisi spesifik ini sejalan dengan [Stitch Prompt Guide pada Google AI Developers Forum](https://discuss.ai.google.dev/t/stitch-prompt-guide/83844). Google juga mendeskripsikan dukungan konteks gambar/teks dan aturan desain Markdown dalam [pengenalan Stitch dan DESIGN.md](https://blog.google/innovation-and-ai/models-and-research/google-labs/stitch-ai-ui-design/). Dokumen ini tidak mengasumsikan nama menu, kuota, atau mekanisme impor tertentu pada akun pengguna.

### 15.2 Prompt dasar - tetapkan konteks terlebih dahulu

```text
Design a responsive Indonesian website called RUANGKISAH.ID, program Selfcare-BK, for grade X-XI high-school students. It supports guided self-reflection, a feelings journal, small courage goals, and school counselor contact information. All visible UI copy must be natural Bahasa Indonesia.

Use reference 01 for editorial composition: oversized geometric sans headlines, generous whitespace, modular rounded panels, a dark introductory hero, asymmetrical bento cards, small numbered labels, and restrained soft 3D objects. Use reference 02 for colors: pistachio #B9C255, frost #E6F1FA, iced denim #5798D7. Replace the purple from reference 01 with these colors. Canvas #F7F8F2, surfaces #FFFFFF, ink #182420, muted text #52645C, action blue #245F94, input borders #718178. Use dark text on pistachio and denim; white text on dark surfaces/action blue.

Use Manrope or a close geometric sans fallback. Max content width 1120px. Desktop reference 1440px; mobile 390px. Large panels radius 32px, cards 24px, fields 16px, pill buttons at least 48px high. Hero headline 80/84px desktop and 44/48px mobile; body/input 16/26px. Writing screens are bright and quiet. Main navigation: Beranda, Kenali Diriku, Jurnal Perasaan, Langkah Berani, Pusat Bantuan. Catatan Saya is a utility link. Compact mobile header includes Bantuan and Menu.

Optional account and role-based administration follow section 17. No diagnosis or psychological score, AI analysis, emotion chart, chat, streak, ranking, fabricated testimonials, or invented school contacts. New inputs are temporary. Saving is explicit after confirmation, only in the same browser/device. No autosave/cloud. Saved lists show module type and date only. No journal is automatically shared with counselors. These rules apply to all subsequent screens. Generate only the screen requested next.
```

### 15.3 Prompt per layar

Gunakan setelah prompt dasar. Pada sesi/proyek baru, sertakan ulang konteks yang sama. Isi contoh pada frame adalah fiktif; jangan memakai catatan siswa nyata untuk generasi.

#### P01 - S01 Beranda desktop

```text
Create S01: full-page desktop homepage at 1440px, max content width 1120px. Build a real website layout, not a device mockup. Order: shared header; short notice “Masuk untuk mulai berefleksi.”; rounded dark-ink hero; three activity cards; usage section; privacy explainer; counselor-help callout; footer.

Hero: two columns, headline “Kenali diri.” / “Tumbuh berani.” Supporting copy “Ruang untuk memahami perasaan, mengenali kekuatan, dan mencoba langkah kecil sesuai kesiapanmu.” Pistachio button “Mulai refleksi”; secondary link “Lihat cara pakai”. Right: one soft matte 3D loop/folded-page composition in denim, pistachio, and frost, separated from text.

Section “Mulai dari yang kamu butuhkan.” Cards: “01 Kenali Diriku” on pistachio, “02 Jurnal Perasaan” on frost, “03 Langkah Berani” on denim with dark text. Privacy panel “Cerita ini tetap dalam kendalimu.” Help panel “Butuh teman bicara?” with “Buka Pusat Bantuan”. Keep the editorial composition spacious. No fabricated stats, testimonials, charts, or chat. Keep optional Masuk and Daftar.
```

#### P02 - S02 Pengantar Kenali Diriku

```text
Create S02 desktop: Kenali Diriku introduction. Shared header, active module. Bright canvas, centered white panel max 720px, small pistachio accent. Heading “Pelan-pelan, kenali dirimu.” Explain strengths, interests, values, and goals. Labels “6 pertanyaan”, “Sekitar 5-10 menit”, “Boleh dilewati”. Include “Tidak ada jawaban benar atau salah.”, a temporary-data notice, and “Mulai Kenali Diriku”. Starting does not imply consent to save. No dark hero, profile, score, or assessment result.
```

#### P03 - S03 Pertanyaan Kenali Diriku

```text
Create S03 desktop: one reflection question in a centered 720px writing area. Show module name, “Langkah 2 dari 6”, six-segment navigation progress, and “Belum disimpan”. Question “Kekuatan apa yang membantumu dalam pengalaman itu?” Textarea label “Jawabanmu - opsional”, short helper, counter “0/1.000”, reminder to avoid personal identifiers. Actions “Sebelumnya”, “Lewati”, “Berikutnya”. White surface, small pistachio accents. Progress is navigation only; every question may be skipped. No autosave, score, or AI feedback.
```

#### P04 - S04 Rangkuman Kenali Diriku

```text
Create S04 desktop: “Yang kamu temukan tentang dirimu.” Add “Rangkuman ini berasal dari jawabanmu sendiri.” Six plain-text theme blocks: Pengalaman berhasil, Kekuatan, Minat, Nilai pribadi, Area berkembang, Tujuan. Use short fictional answers for design only and one “Belum diisi” block. Status “Belum disimpan”. Actions “Ubah jawaban”, “Simpan di perangkat ini”, “Akhiri tanpa menyimpan”. The last two choices have equal text/touch-target size. White surface, restrained pistachio. No psychological interpretation or score.
```

#### P05 - S05 Form Jurnal Perasaan

```text
Create S05 desktop: “Bagaimana perasaanmu hari ini?” Frost intro and white single-column form max 720px. Include date, multi-select chips “Senang, Sedih, Cemas, Marah, Tenang, Bingung, Lainnya”, and four optional text areas: “Apa yang terjadi?”, “Bagaimana kamu menanggapinya?”, “Apa yang kamu butuhkan saat ini?”, “Satu hal baik untuk dirimu”. Total text counter “0/5.000 karakter”; status “Belum disimpan”. Selected chips use a checkmark/blue border/frost fill, equally for every feeling. Actions “Lihat rangkuman” and “Akhiri tanpa menyimpan”. No name, required title, mood score, chart, AI, or autosave. A summary needs at least one feeling or nonempty answer.
```

#### P06 - S06 Rangkuman Jurnal Perasaan

```text
Create S06 desktop: “Ruang untuk memahami perasaanmu.” Reuse summary components with date, selected feeling labels, and four journal-answer blocks. Use fictional content, preserving the student's own wording rather than interpreting it. Status “Belum disimpan”. Actions “Ubah catatan”, “Simpan di perangkat ini”, “Akhiri tanpa menyimpan”. Calm white/frost panels and a small Pusat Bantuan link. No mood trend, diagnosis, score, advice engine, automatic sharing, or implication that journals are monitored.
```

#### P07 - S07 Pilihan Langkah Berani

```text
Create S07 desktop: “Keberanian dimulai dari satu langkah.” Pistachio intro, small stepped abstract shape. Say targets can be adjusted to readiness. Six white example cards in two columns: asking a lesson question, sharing an opinion in a small group, greeting a known friend, asking for task help, trying a suitable school activity, acknowledging one's effort. Each has “Pakai contoh ini”. Include “Buat target sendiri”. A saved-target section has empty state or module-type/date rows only; no private target titles in the list. No levels, streaks, ranking, or punitive progress.
```

#### P08 - S08 Target baru

```text
Create S08 desktop: bright centered form “Satu langkah yang ingin kamu coba.” Required “Judul target” (120 characters), required “Langkah pertama” (500), optional “Kenapa ini berarti buatmu?” (500), optional “Tanggal target”, optional “Dukungan yang kamu butuhkan” (500). Status “Belum disimpan”; helper says the target can be adjusted. Main action “Tinjau target” opens a temporary review without saving. Accessible cancel/back action. No automatic saving, difficulty score, or identity fields.
```

#### P09 - S09 Detail/status target

```text
Create S09 desktop: opened courage-goal detail with a fictional target, first step, and optional reason/date/support. Labeled status selector: “Direncanakan”, “Sedang dicoba”, “Selesai dicoba”, “Ditunda”. Add “Status ini kamu tentukan sendiri.” Optional reflection max 1.000 characters. Show an unsaved-edit variant: “Perubahan belum disimpan”, “Simpan perubahan”, “Batal mengubah”; “Hapus target” separately below. Changes persist only after confirmation. No automatic failure for past dates, confetti, points, charts, or sharing.
```

#### P10 - S10 Catatan kosong

```text
Create S10 desktop: empty saved-records page “Catatan di browser ini.” Explain records are local to this browser/device and others using the same browser profile may read them. Empty state “Belum ada catatan tersimpan di browser ini.” Small open-page icon, “Mulai refleksi”, and “Kelola privasi & data”. Saving is optional. Do not fill the personal list with sample records, cloud content, search, filters, or an account avatar.
```

#### P11 - S11 Daftar catatan

```text
Create S11 desktop: populated list on the same saved-records page. Three fictional design-only rows show ONLY module type and date: Kenali Diriku, Jurnal Perasaan, Langkah Berani. Each has “Buka catatan”. No journal excerpt, feeling, target title, target status, or personal identifier. Include privacy reminder and “Kelola privasi & data”. Newest first. Allow metadata-only type/date filters; no private-content search. Clean, light, restrained layout.
```

#### P12 - S12 Detail/edit catatan

```text
Create S12 desktop: a saved journal opened from Catatan Saya. Private content appears only in this explicit detail. Reuse summary blocks and status “Tersimpan di browser ini”. Actions “Ubah catatan”, “Kembali ke daftar”, and separately “Hapus catatan”. Then make an edit variant as a separate frame: same fields, “Perubahan belum disimpan”, “Simpan perubahan”, “Batal mengubah”. Saving opens confirmation; cancel restores the saved version. No autosave/cloud controls.
```

#### P13 - S13 Pusat Bantuan

```text
Create S13 desktop: “Kamu boleh mencari dukungan.” Calm frost intro, counselor-contact card, FAQ. Default: “Kontak sekolah belum tersedia. Kamu dapat menemui Guru BK secara langsung di sekolah.” No fabricated number, email, school, staff identity, or working contact button. Explain there is no in-app conversation or journal monitoring. FAQ: accounts, optional local saving, journal access, deletion, external channels. Also make an annotated contact-available variant with clearly labeled configuration slots for approved contact/hours/time zone, without inventing real-looking details. No live chat or 24/7 claim.
```

#### P14 - S14 Privasi & Data

```text
Create S14 desktop: “Kamu yang menentukan pilihan data.” Two readable panels “Tanpa menyimpan” and “Simpan di perangkat ini”. Explain temporary drafts, same-browser persistence, shared-browser access, no cloud sync, no automatic expiry, and deletion. Short sections: stored data, access, retention, external channels, technical hosting logs. Bottom deletion panel with outline-danger “Hapus semua data di browser ini”; confirmation required. Separate no-data variant explains why delete is unavailable. No account/cloud/counselor-access toggle.
```

#### P15 - S15 Tentang & Cara Pakai

```text
Create S15 desktop: “Ruang kecil untuk mengenali diri.” Explain Selfcare-BK for grade X-XI students. Bright editorial layout, one small abstract illustration. Three modules and four usage steps: “Pilih aktivitas”, “Isi sesuai kesiapanmu”, “Tinjau rangkuman”, “Pilih simpan atau akhiri”. Explain counselor support and service limits. Actions “Mulai Kenali Diriku”, Pusat Bantuan, Privasi & Data, “Lihat contoh fiktif”. No invented team portraits, validation badges, testimonials, or effectiveness stats.
```

#### P16 - S16 Demo

```text
Create S16: journal-summary layout in demo mode. Persistent banner “Contoh fiktif - bukan data siswa” with “Keluar contoh”. Answers are obviously fictional. Replace real persistence with “Coba alur simpan (simulasi)”; feedback “Simulasi selesai. Tidak ada data disimpan.” Do not read or mix personal saved records. No active counselor contact in demo. Keep the same design system; make the mode explicit.
```

#### P17 - S17 Halaman tidak ditemukan

```text
Create S17: responsive RUANGKISAH 404. Bright canvas, white rounded panel, small abstract open-page shape. Heading “Halaman ini belum ditemukan.” Copy “Kamu bisa kembali ke Beranda untuk memilih ruang yang ingin dibuka.” Actions “Kembali ke Beranda” and “Pusat Bantuan”. Shared visual language. No sad mascot or blaming language.
```

### 15.4 Prompt adaptasi mobile

#### P18 - Beranda mobile

```text
Adapt approved S01 to a 390px mobile viewport, also allowing 320px without horizontal overflow. Preserve colors, copy, identity, and section order. 64px compact header: wordmark, Bantuan, Menu. Hero headline 44/48px; text/CTA first, then an abstract illustration no taller than about 180px. Stack activity cards with smaller artwork, body 16px, buttons at least 48px. No bottom navigation, floating help bubble, clipped headlines, or device mockup. Make the open navigation menu a separate state.
```

#### P19 - Satu aktivitas/dialog mobile

Terapkan pada **satu layar yang dipilih** setiap kali; sebutkan ID-nya pada kalimat pertama agar perubahan terarah.

```text
Adapt the currently selected RUANGKISAH activity screen to 390px mobile, retaining exact content, product rules, and component style. Single-column writing area, 20px margins, 16px inputs, visible labels, wrapped feeling chips, readable counters, normal vertical scroll. Stack long summary actions; saving and ending without saving have equal touch-target sizes. Do not pin buttons behind the virtual keyboard. Keep Bantuan accessible. Dialog: 16px viewport margins, scrollable body if needed, stacked buttons. Check 320px reflow and 200% zoom; do not shrink text to force one viewport.
```

### 15.5 Prompt dialog dan kegagalan

Pakai satu blok untuk satu dialog/state. Pertahankan layar latar yang sedang dipilih.

#### P20 - O01 Simpan

```text
Create save dialog O01 over the selected summary. Title “Simpan di browser perangkat ini?” Explain same browser/device only, no cloud, possible access by others on the same browser profile, retention until deleted/browser data cleared, and deletion in Catatan Saya or Privasi. Link Privasi. Buttons “Batal” and “Ya, simpan di perangkat ini”. No preselected consent or security guarantee. White modal max 480px, radius 24px, managed focus, labeled close control, mobile stacked buttons.
```

#### P21 - O02 Tinggalkan draf

```text
Create O02: “Tinggalkan isian sementara?” Text “Isian yang belum disimpan akan dibuang jika kamu meninggalkan aktivitas ini.” Buttons “Tetap mengisi” and “Tinggalkan tanpa menyimpan”. If editing a saved record, say only unsaved edits are discarded, preserving the saved version. Leaving does not erase all records. Shared accessible dialog style.
```

#### P22 - O03 Hapus satu

```text
Create O03 over record detail. Title “Hapus catatan ini?” Text “Catatan ini akan dihapus dari browser perangkat ini dan tidak dapat dikembalikan melalui aplikasi.” Buttons “Batal” and danger “Hapus catatan”. Do not repeat private content inside the dialog. A failed deletion must keep the record visible. Shared modal style.
```

#### P23 - O04 Hapus semua

```text
Create O04 on Privasi & Data. Title “Hapus semua data RUANGKISAH di browser ini?” Explain all local RUANGKISAH notes/targets are included, it cannot be undone through the app, and other websites/external messages are excluded. Buttons “Batal” and danger “Hapus semua data”. No account-deletion wording. Calm readable warning.
```

#### P24 - O05 Kanal luar

```text
Create O05 before an approved WhatsApp contact. Title “Lanjut ke kanal luar?” Text “WhatsApp dapat menampilkan nomor teleponmu. Isi jurnal tidak dilampirkan otomatis. Kanal tersebut memiliki kebijakannya sendiri.” Buttons “Tetap di RUANGKISAH” and “Lanjut ke WhatsApp”. No anonymous-consultation claim or sent-message state. Email has its own wording variant mentioning email address. Shared accessible dialog style.
```

#### P25 - O06 Data tidak terbaca

```text
Create O06: “Data tersimpan tidak dapat dibaca.” Explain the local data format may be damaged/unsupported; do not overwrite automatically. Buttons “Kembali” and “Tinjau pilihan hapus data”. Reset requires the separate O04 confirmation. Calm student-readable language, no stack trace or raw JSON.
```

#### P26 - Storage gagal

```text
Create ST-06 on the current summary. Keep all fictional input unchanged. Warning near save: “Belum tersimpan. Penyimpanan browser tidak tersedia atau penuh.” Actions “Coba lagi” and “Lanjut tanpa menyimpan”. Retain “Belum disimpan”. No success checkmark, draft removal, or redirect. Warning surface #FBF4DD, readable dark text, icon plus wording; color is not the only indication.
```

Untuk ST-01 sampai ST-14 lainnya, gunakan baris spesifikasi bagian 11.2 sebagai permintaan varian pada layar terkait. Sebutkan ID layar, satu kondisi, pesan, dan aksi; jangan memperkenalkan menu baru.

### 15.6 Prompt koreksi terarah

**Jika komposisi terlalu generik:**

```text
Refine only the selected screen's composition. Keep content, navigation, and product rules. Strengthen reference-01 headline hierarchy, generous spacing, large rounded modular panels, small numbered labels, and one soft abstract 3D composition. Retain the reference-02 pistachio/frost/denim palette. Keep forms quiet. No charts, stats, extra features, purple branding, or decorative card overload.
```

**Jika teks kurang terbaca:**

```text
Change only text/background pairings and focus visibility. Ink #182420 on pistachio #B9C255, frost #E6F1FA, denim #5798D7. White on action blue #245F94 or dark ink. No normal-size white text on denim/pistachio. Preserve layout/content/behavior. Make links recognizable and controls clearly outlined.
```

**Jika ada fitur rekaan:**

```text
Preserve approved login and account management. Remove invented chat, AI, psychological score, emotion chart, streak, ranking, cloud sync, and fabricated stats from the selected screen. Keep only its defined RUANGKISAH reflection/local-record/help task. Restore temporary-input wording and explicit save choice. Do not redesign unrelated sections.
```

**Jika daftar catatan menampilkan isi pribadi:**

```text
Change only the saved-record list. Rows show module type, date, and “Buka catatan”. Remove journal excerpts, feelings, target titles/statuses, and identity details. Private content appears only in an explicitly opened detail. Preserve layout, spacing, and design system.
```

## 16. Handoff desain ke pembangunan

Hasil yang diharapkan setelah proses Stitch:

1. Frame desktop/mobile bernama S01-S17 secara konsisten.
2. Komponen C-01 sampai C-16 beserta state utama.
3. Dialog O01-O06, menu mobile terbuka, dan varian input/storage/konflik terkait.
4. Alur yang dapat ditinjau: mulai, rangkuman, simpan, buka kembali, ubah, hapus, dan bantuan.
5. Daftar token warna, tipografi, spacing, radius, dan aset.
6. Daftar perbedaan hasil generasi terhadap PRD/design.md dan revisinya.

Sebelum membangun, periksa label, urutan field, privasi daftar, kontak bantuan, serta pilihan tanpa simpan. Kode/prototipe hasil generator perlu ditinjau terhadap seluruh aturan data PRD. Font, ikon, dan aset 3D memerlukan asal/lisensi yang jelas; tangkapan referensi tidak dipakai sebagai konten website produksi.

**Rujukan produk:** [PRD.md](./PRD.md).  
**Rujukan visual:** [Layout 01](./docs/design-references/01-layout-reference.png) dan [Palet 02](./docs/design-references/02-color-reference.png).  
**Panduan Stitch yang ditinjau:** [Prompt Guide](https://discuss.ai.google.dev/t/stitch-prompt-guide/83844) dan [pengenalan Stitch/DESIGN.md](https://blog.google/innovation-and-ai/models-and-research/google-labs/stitch-ai-ui-design/), diakses 18 November 2026.

## 17. Tambahan UI akun, platform lintas sekolah, dan motion

| ID  | Route             | Komposisi                                                                                              |
| --- | ----------------- | ------------------------------------------------------------------------------------------------------ |
| A01 | /masuk            | Email/password, pending/error, link daftar/reset; kembali ke tujuan internal/peran                     |
| A02 | /daftar           | Nama tampilan/email/password/konfirmasi/consent; instruksi verifikasi lewat email, bukan tombol bypass |
| A03 | /lupa-kata-sandi  | Respons netral untuk email terdaftar maupun tidak; tidak menampilkan token/link simulasi               |
| A04 | /reset-kata-sandi | Token dari email, password baru, state invalid/berhasil; parameter token dibersihkan dari address bar  |
| A05 | /akun             | Identitas dasar, ubah nama, peran/status, keluar; catatan lokal tetap terpisah                         |
| A06 | /admin            | Ringkasan nyata, daftar/filter/pagination siswa, detail, konfirmasi aktif/nonaktif/hapus               |
| A07 | /superadmin       | Fitur Admin, kelola Admin/peran, audit; akun Superadmin dilindungi                                     |
| A08 | /tidak-diizinkan  | Penjelasan singkat dan navigasi aman                                                                   |

Header publik menampilkan Masuk/Daftar; pengguna masuk mendapat Akun/Keluar dan tautan panel sesuai peran. Semua status berasal dari API server. Admin tidak memperoleh isi jurnal. UI kontak memakai istilah pendamping lintas sekolah dan fallback universal.

Motion: 180 ms feedback kecil, 220-260 ms dialog/langkah/halaman, reveal pendek sekali ketika terlihat. Gunakan opacity/transform; animasi exit tidak menahan operasi data. Reduced motion meniadakan reveal/gerak. Tidak ada auto-rotate atau efek menghukum.

S11 kini dapat memuat filter jenis/tanggal tanpa cuplikan isi. Detail target dapat mengubah rincian dan mempertahankan ID. Desain auth/admin dan varian interaksi diimplementasikan langsung dengan komponen React yang konsisten; tidak harus menunggu ekspor Stitch baru.

## 18. Latar taman pada slide pertama — 19 November 2026

Hero Beranda menggunakan komponen Ember Petal sebagai latar seluruh section. Judul, deskripsi dan CTA berada di atas gradient gelap agar tetap terbaca. Taman tampil sudah mekar sebagai dekorasi, tanpa gate pemuatan, persentase atau aksi yang menahan navigasi. Pilihan tiga suasana warna dan tombol Jeda/Lanjutkan animasi tersedia pada hero.

Implementasi mempertahankan React + JavaScript dan CSS Modules. Komponen dimuat dalam chunk tersendiri; animasi ambient dibatasi 30 fps, berhenti saat section di luar viewport/tab tersembunyi, dan menjadi gambar statis ketika reduced motion aktif. Latar disembunyikan dari pembaca layar dan tidak masuk urutan Tab. Tampilan mobile mengalir vertikal dengan kontrol yang dapat membungkus.

### Interaksi taman pada latar hero

Gerakan kursor memberikan dorongan angin pada bunga. Klik/ketuk area hero menghasilkan gelombang angin dan partikel tanpa menutup atau mengganti latar. Event diteruskan dari section hero; klik tombol, tautan dan kontrol form dikecualikan. Jeda dan reduced motion tetap menghentikan interaksi. Koordinat mengikuti skala/letterbox SVG pada mobile. Dekorasi tetap tidak menambah fokus keyboard atau status pemuatan.

## 19. Navigation bar Slide Tabs — 19 November 2026

Navigasi utama desktop menggunakan outline pill terang dan indikator dark ink yang bergeser mengikuti hover/fokus lalu kembali ke halaman aktif. Label mengikuti menu RUANGKISAH, bukan label dummy referensi. Pengukuran menyesuaikan font dan ukuran layar; reduced motion memindahkan indikator seketika. Link, aria-current, konfirmasi draf serta akses akun/panel tetap bekerja. Pada mobile, gunakan menu yang sudah tersedia agar label tidak dipaksakan ke layar sempit. Implementasi dan panduan setup alternatif ada di docs/ui/slide-tabs.md.

### Slide Tabs pada footer

Privasi & Data, Tentang & Cara Pakai, Pusat Bantuan dan Lihat contoh fiktif menggunakan outline pill serta indikator bergeser yang sama dengan navbar. Link tetap mengikuti route aktif; contoh fiktif tetap aksi button yang memasuki demo. Pada ponsel gunakan dua kolom dalam kontainer rounded dengan indikator yang menyesuaikan posisi dan tinggi setiap tombol. Fokus keyboard, reduced motion serta identitas/deskripsi footer dipertahankan.

## Penyelarasan UI versi 1.2

Skala, kontrol, selected state dan motion mengikuti [aturan UI aktif](./docs/ui/system.md). Hasil dan bukti sebelum/sesudah mengikuti [UI_AUDIT.md](./UI_AUDIT.md). Ekspor Stitch lama adalah referensi; copy akun opsional dan ukuran halaman setara yang berbeda digantikan oleh aturan aktif.

## Persetujuan akun — versi 1.4

Alur: Daftar → verifikasi email → menunggu Admin → Setujui akun → login/fitur tujuan. Tampilkan pesan menunggu yang informatif pada Login dan instruksi yang sama sesudah pendaftaran/verifikasi. Jangan menjanjikan waktu persetujuan atau menganggap tautan email sebagai keputusan Admin.

Navigasi panel menambah Persetujuan Akun (jumlah). Overview menyediakan pintasan antrean; antrean berisi kartu identitas dasar dengan pencarian, pagination dan refresh eksplisit. Gunakan primary untuk Setujui akun, secondary untuk Detail/Batal, danger outline untuk Hapus. Tombol setujui disabled sampai email terverifikasi dan akun enabled. Dialog menyebut nama/email sasaran serta akibat persetujuan; status menunggu memakai token warning yang sudah ada. Desktop dua kolom kartu, mobile satu kolom. Jurnal tidak ditampilkan.

Filter akun memisahkan Menunggu verifikasi email dan Menunggu persetujuan Admin. Aktifkan kembali tidak berarti persetujuan; notifikasi harus memakai status efektif dari server. Aksi Jadikan Admin hanya untuk akun aktif yang telah disetujui.
